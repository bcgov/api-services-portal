import { strict as assert } from 'assert';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import { Logger } from '../../logger';
import {
  format,
  getActivity,
  getOrgActivity,
  recordActivity,
  recordActivityWithBlob,
} from '../keystone/activity';
import { Activity } from '../keystone/types';
import { NamespaceService } from '../org-groups';
import { getGwaProductEnvironment } from './get-namespaces';
import { getOrganizationUnit } from '../keystone/organization';
import { KeycloakUserService } from '../keycloak/user-service';

const logger = Logger('wf.OrgActivity');

const SUBSYSTEM_PROFILE_SNAPSHOT_FIELDS = ['name', 'description'] as const;

/** Prefix for org-activity refId and filter keys (except bare gateway key names). */
export enum OrgActivityResourceKind {
  Organization = 'org',
  OrgUnit = 'orgUnit',
  Subsystem = 'subsystem',
  Service = 'service',
  CSR = 'csr',
  /** Kong GatewayKey name — refId is the bare name (no prefix). */
  GatewayKey = 'gatewayKey',
  Pattern = 'pattern',
  User = 'user',
  Scope = 'scope',
  Client = 'client',
  RuntimeGroup = 'runtimeGroup',
}

export type OrgActivityResource = {
  kind: OrgActivityResourceKind;
  value: string;
};

export function resourceRefId(resource: OrgActivityResource): string {
  if (resource.kind === OrgActivityResourceKind.GatewayKey) {
    return resource.value;
  }
  return `${resource.kind}:${resource.value}`;
}

export function buildOrgActivityFilterKeys(
  orgName: string,
  filterResources: OrgActivityResource[] = []
): string[] {
  const keys = [
    resourceRefId({
      kind: OrgActivityResourceKind.Organization,
      value: orgName,
    }),
  ];
  for (const resource of filterResources) {
    keys.push(resourceRefId(resource));
  }
  return keys;
}

type OrgActivityRecordInput = {
  success: boolean;
  message: string;
  params: { [key: string]: string };
  resource: OrgActivityResource;
  filterResources?: OrgActivityResource[];
  blob?: Record<string, unknown> | string;
  productNamespace?: string | null;
};

function buildSubsystemProfileSnapshot(
  record: Record<string, any>
): Record<string, unknown> {
  return pickProfileSnapshot(record, SUBSYSTEM_PROFILE_SNAPSHOT_FIELDS);
}

async function lookupOrganizationNameById(
  context: any,
  orgId: string
): Promise<string | undefined> {
  const result = await context.executeGraphQL({
    query: `query OrganizationNameById($id: ID!) {
      allOrganizations(where: { id: $id }, first: 1) { name }
    }`,
    variables: { id: orgId },
  });
  return result.data?.allOrganizations?.[0]?.name;
}

/** Matches Organization.sync in data-rules (orgUnits excluded — logged separately). */
const ORG_PROFILE_SNAPSHOT_FIELDS = [
  'name',
  'sector',
  'title',
  'tags',
  'description',
  'publicBodyId',
  'extSource',
  'extRecordHash',
] as const;

export const CKAN_EXT_SOURCE = 'ckan';

/** Matches OrganizationUnit.sync in data-rules. */
const ORG_UNIT_PROFILE_SNAPSHOT_FIELDS = [
  'name',
  'sector',
  'title',
  'tags',
  'description',
  'extSource',
  'extRecordHash',
] as const;

export type OrgHierarchyKeys = {
  filterOrg: string;
  resource: OrgActivityResource;
  orgUnit?: string;
};

export function resolveOrgHierarchyKeys(
  parent: string | undefined,
  name: string
): OrgHierarchyKeys {
  const fullPath = parent ? `${parent}/${name}` : name;
  const segments = fullPath.split('/').filter((part) => part.length > 0);

  // Root organization
  if (segments.length === 1) {
    return {
      filterOrg: segments[0],
      resource: {
        kind: OrgActivityResourceKind.Organization,
        value: segments[0],
      },
    };
  }

  // Ministry-level organization
  if (segments.length === 2) {
    return {
      filterOrg: segments[1],
      resource: {
        kind: OrgActivityResourceKind.Organization,
        value: segments[1],
      },
    };
  }

  // Org unit
  return {
    filterOrg: segments[1],
    resource: {
      kind: OrgActivityResourceKind.OrgUnit,
      value: segments[2],
    },
    orgUnit: segments[2],
  };
}

function pickProfileSnapshot(
  record: Record<string, any>,
  fields: readonly string[]
): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {};
  for (const field of fields) {
    if (record[field] !== undefined) {
      snapshot[field] = record[field];
    }
  }
  return snapshot;
}

export function buildOrganizationProfileSnapshot(
  record: Record<string, any>
): Record<string, unknown> {
  return pickProfileSnapshot(record, ORG_PROFILE_SNAPSHOT_FIELDS);
}

export function buildOrganizationUnitProfileSnapshot(
  record: Record<string, any>
): Record<string, unknown> {
  return pickProfileSnapshot(record, ORG_UNIT_PROFILE_SNAPSHOT_FIELDS);
}

export function shouldLogOrgUnitEstablishment(
  record: Record<string, any>
): boolean {
  return record.extSource !== CKAN_EXT_SOURCE;
}

const SDX_KEYS_PATTERN = 'sdx-keys.r1';

type SdxKeyActivityScope = 'organization' | 'subsystem' | 'runtime-group';

/** Interpret a GWA publish response for activity result logging. */
export function isGatewayPatternPublishSuccessful(gwaResult: unknown): boolean {
  if (!gwaResult || typeof gwaResult !== 'object') {
    return true;
  }

  const result = gwaResult as {
    failed?: number;
    results?: Array<{ status?: string }>;
  };

  if (typeof result.failed === 'number') {
    return result.failed === 0;
  }

  if (Array.isArray(result.results)) {
    return result.results.every((item) => item.status !== 'failed');
  }

  return true;
}

function gatewayPatternPublishEntity(
  pattern: string,
  scope?: SdxKeyActivityScope
): string {
  if (pattern !== SDX_KEYS_PATTERN) {
    return 'GatewayPatternPublish';
  }

  switch (scope) {
    case 'organization':
      return 'OrganizationKey';
    case 'subsystem':
      return 'SubsystemKey';
    case 'runtime-group':
      return 'RuntimeGroupKey';
    default:
      return 'GatewayPatternPublish';
  }
}

function gatewayKeyFilterResources(
  orgName: string,
  scope: SdxKeyActivityScope | undefined,
  holderName: string | undefined
): OrgActivityResource[] {
  const resources: OrgActivityResource[] = [];
  if (scope) {
    resources.push({ kind: OrgActivityResourceKind.Scope, value: scope });
  }
  if (!holderName || !scope) {
    return resources;
  }
  if (scope === 'organization') {
    if (holderName !== orgName) {
      resources.push({
        kind: OrgActivityResourceKind.Organization,
        value: holderName,
      });
    }
  } else if (scope === 'subsystem') {
    resources.push({ kind: OrgActivityResourceKind.Client, value: holderName });
  } else {
    resources.push({
      kind: OrgActivityResourceKind.RuntimeGroup,
      value: holderName,
    });
  }
  return resources;
}

function gatewayPatternPublishMessage(
  targetName: string | undefined,
  removed: boolean,
  detail?: string
): string {
  const includeTarget = Boolean(targetName);
  const includeDetail = Boolean(detail);
  if (removed) {
    return includeTarget
      ? '{actor} removed {pattern} for {targetName}: {detail}'
      : '{actor} removed {pattern}: {detail}';
  }
  if (includeDetail) {
    return includeTarget
      ? '{actor} published {pattern} for {targetName}: {detail}'
      : '{actor} published {pattern}: {detail}';
  }
  return includeTarget
    ? '{actor} published {pattern} for {targetName}'
    : '{actor} published {pattern}';
}

export class OrgActivityService {
  context: any;
  orgName: string;

  constructor(context: any, orgName: string) {
    this.context = context;
    this.orgName = orgName;
  }

  private getActorName(): string {
    return (
      this.context?.authedItem?.name ||
      this.context?.req?.user?.name ||
      'system'
    );
  }

  async logOrganizationEstablished(
    success: boolean,
    profile?: Record<string, unknown>
  ): Promise<void> {
    return this.recordOrgActivity({
      success,
      message: '{actor} established organization {organization}',
      params: {
        action: 'registered',
        entity: 'Organization',
        actor: this.getActorName(),
        organization: this.orgName,
      },
      resource: {
        kind: OrgActivityResourceKind.Organization,
        value: this.orgName,
      },
      blob: profile,
    });
  }

  async logOrganizationUnitEstablished(
    success: boolean,
    data: {
      orgUnit: string;
      profile: Record<string, unknown>;
    }
  ): Promise<void> {
    const resource = {
      kind: OrgActivityResourceKind.OrgUnit,
      value: data.orgUnit,
    };
    return this.recordOrgActivity({
      success,
      message: '{actor} established organization unit {orgUnit}',
      params: {
        action: 'registered',
        entity: 'OrganizationUnit',
        actor: this.getActorName(),
        organization: this.orgName,
        orgUnit: data.orgUnit,
      },
      resource,
      filterResources: [resource],
      blob: data.profile,
    });
  }

  async logOrganizationProfileChange(
    success: boolean,
    data: {
      orgUnit?: string;
      profile: Record<string, unknown>;
    }
  ): Promise<void> {
    const resource = data.orgUnit
      ? { kind: OrgActivityResourceKind.OrgUnit, value: data.orgUnit }
      : {
          kind: OrgActivityResourceKind.Organization,
          value: this.orgName,
        };

    const message = data.orgUnit
      ? '{actor} updated organization unit profile for {orgUnit}'
      : '{actor} updated organization profile for {organization}';

    const params: { [key: string]: string } = {
      action: 'updated',
      entity: 'OrganizationProfile',
      actor: this.getActorName(),
      organization: this.orgName,
    };
    if (data.orgUnit) {
      params.orgUnit = data.orgUnit;
    }

    return this.recordOrgActivity({
      success,
      message,
      params,
      resource,
      filterResources: data.orgUnit ? [resource] : [],
      blob: data.profile,
    });
  }

  async logUpdateOrganizationAccess(
    success: boolean,
    data: {
      subject_email: string;
      subject: string;
      roles: string;
      resource: OrgActivityResource;
      orgUnit?: string;
    }
  ): Promise<void> {
    const filterResources: OrgActivityResource[] = [];
    if (data.orgUnit) {
      filterResources.push({
        kind: OrgActivityResourceKind.OrgUnit,
        value: data.orgUnit,
      });
    }
    filterResources.push({
      kind: OrgActivityResourceKind.User,
      value: data.subject_email,
    });

    const message = data.orgUnit
      ? '{actor} {action} {subject} organization unit access on {orgUnit}: {roles}'
      : '{actor} {action} {subject} organization access on {organization}: {roles}';

    const params: { [key: string]: string } = {
      action: 'updated',
      entity: 'OrganizationAccess',
      actor: this.getActorName(),
      organization: this.orgName,
      subject_email: data.subject_email,
      subject: data.subject,
      roles: data.roles,
    };
    if (data.orgUnit) {
      params.orgUnit = data.orgUnit;
    }

    return this.recordOrgActivity({
      success,
      message,
      params,
      resource: data.resource,
      filterResources,
    });
  }

  async logOrganizationCSR(
    success: boolean,
    data: { runtimeGroupName: string }
  ): Promise<void> {
    const resource = {
      kind: OrgActivityResourceKind.CSR,
      value: data.runtimeGroupName,
    };
    return this.recordOrgActivity({
      success,
      message:
        '{actor} requested organization certificate for {runtimeGroupName} on {organization}',
      params: {
        action: 'requested',
        entity: 'OrganizationCertificate',
        actor: this.getActorName(),
        organization: this.orgName,
        runtimeGroupName: data.runtimeGroupName,
      },
      resource,
      filterResources: [resource],
    });
  }

  async logGatewayPatternPublish(
    success: boolean,
    data: {
      pattern: string;
      /** Key or pattern summary appended to publish/remove messages. */
      detail?: string;
      removed?: boolean;
      scope?: 'organization' | 'subsystem' | 'runtime-group';
      /** Holder identity for messages (org name, client_id, or runtime group). */
      targetName?: string;
      /** Kong GatewayKey name when pattern is sdx-keys.r1. */
      gatewayKeyName?: string;
      /** Deck/GWA output stored on apply for audit. */
      deckBlob?: string;
    }
  ): Promise<void> {
    const isRemove = data.removed === true;
    const message = gatewayPatternPublishMessage(
      data.targetName,
      isRemove,
      data.detail
    );

    const entity = gatewayPatternPublishEntity(data.pattern, data.scope);

    const params: { [key: string]: string } = {
      action: isRemove ? 'removed' : 'published',
      entity,
      actor: this.getActorName(),
      organization: this.orgName,
      pattern: data.pattern,
    };
    if (data.detail) {
      params.detail = data.detail;
    }
    if (data.scope) {
      params.scope = data.scope;
    }
    if (data.targetName) {
      params.targetName = data.targetName;
    }

    const resource = data.gatewayKeyName
      ? {
          kind: OrgActivityResourceKind.GatewayKey,
          value: data.gatewayKeyName,
        }
      : {
          kind: OrgActivityResourceKind.Pattern,
          value: data.pattern,
        };

    return this.recordOrgActivity({
      success,
      message,
      params,
      resource,
      filterResources: gatewayKeyFilterResources(
        this.orgName,
        data.scope,
        data.targetName
      ),
      blob: data.deckBlob,
    });
  }

  async logSubsystemCreated(
    success: boolean,
    data: { subsystemName: string; productNamespace: string }
  ): Promise<void> {
    const resource = {
      kind: OrgActivityResourceKind.Subsystem,
      value: data.subsystemName,
    };
    return this.recordOrgActivity({
      success,
      message: '{actor} created subsystem {subsystemName} on {organization}',
      params: {
        action: 'created',
        entity: 'Subsystem',
        actor: this.getActorName(),
        organization: this.orgName,
        subsystemName: data.subsystemName,
      },
      resource,
      filterResources: [resource],
      productNamespace: data.productNamespace,
    });
  }

  async logSubsystemDeleted(
    success: boolean,
    data: { subsystemName: string; productNamespace: string }
  ): Promise<void> {
    const resource = {
      kind: OrgActivityResourceKind.Subsystem,
      value: data.subsystemName,
    };
    return this.recordOrgActivity({
      success,
      message: '{actor} deleted subsystem {subsystemName} on {organization}',
      params: {
        action: 'deleted',
        entity: 'Subsystem',
        actor: this.getActorName(),
        organization: this.orgName,
        subsystemName: data.subsystemName,
      },
      resource,
      filterResources: [resource],
      productNamespace: data.productNamespace,
    });
  }

  async logSubsystemProfileChange(
    success: boolean,
    data: {
      subsystemName: string;
      productNamespace: string;
      profile: Record<string, unknown>;
    }
  ): Promise<void> {
    const resource = {
      kind: OrgActivityResourceKind.Subsystem,
      value: data.subsystemName,
    };
    return this.recordOrgActivity({
      success,
      message:
        '{actor} updated subsystem profile for {subsystemName} on {organization}',
      params: {
        action: 'updated',
        entity: 'Subsystem',
        actor: this.getActorName(),
        organization: this.orgName,
        subsystemName: data.subsystemName,
      },
      resource,
      filterResources: [resource],
      blob: data.profile,
      productNamespace: data.productNamespace,
    });
  }

  async logServicePublished(
    success: boolean,
    data: { serviceName: string; subsystemName: string }
  ): Promise<void> {
    const resource = {
      kind: OrgActivityResourceKind.Service,
      value: data.serviceName,
    };
    return this.recordOrgActivity({
      success,
      message:
        '{actor} published service {serviceName} on subsystem {subsystemName} in {organization}',
      params: {
        action: 'published',
        entity: 'Service',
        actor: this.getActorName(),
        organization: this.orgName,
        subsystemName: data.subsystemName,
        serviceName: data.serviceName,
      },
      resource,
      filterResources: [
        {
          kind: OrgActivityResourceKind.Subsystem,
          value: data.subsystemName,
        },
        resource,
      ],
    });
  }

  async logServiceRemoved(
    success: boolean,
    data: { serviceName: string; subsystemName: string }
  ): Promise<void> {
    const resource = {
      kind: OrgActivityResourceKind.Service,
      value: data.serviceName,
    };
    return this.recordOrgActivity({
      success,
      message:
        '{actor} removed service {serviceName} from subsystem {subsystemName} in {organization}',
      params: {
        action: 'removed',
        entity: 'Service',
        actor: this.getActorName(),
        organization: this.orgName,
        subsystemName: data.subsystemName,
        serviceName: data.serviceName,
      },
      resource,
      filterResources: [
        {
          kind: OrgActivityResourceKind.Subsystem,
          value: data.subsystemName,
        },
        resource,
      ],
    });
  }

  private async recordOrgActivity(input: OrgActivityRecordInput): Promise<void> {
    const refId = resourceRefId(input.resource);
    const ids = buildOrgActivityFilterKeys(this.orgName, input.filterResources);

    assert.strictEqual(
      ids.length > 0 && ids.length < 5,
      true,
      'Must be at least one id and no more than 4'
    );
    assert.strictEqual(
      ids[0],
      resourceRefId({
        kind: OrgActivityResourceKind.Organization,
        value: this.orgName,
      }),
      'First id must be org:{orgName} (stored as filterKey1 for org activity queries)'
    );

    const activityContext = JSON.stringify({
      message: input.message,
      params: input.params,
    });

    const formattedMessage = format(input.message, input.params);
    const actorIds = ids.concat(`actor:${input.params.actor}`);
    logger.info('[OrgActivity] %s (%j)', formattedMessage, actorIds);

    const productNamespace = input.productNamespace ?? null;
    const result = input.blob
      ? await recordActivityWithBlob(
          this.context,
          input.params.action,
          input.params.entity,
          refId,
          formattedMessage,
          input.success ? 'success' : 'failed',
          activityContext,
          input.blob,
          actorIds,
          productNamespace
        )
      : await recordActivity(
          this.context,
          input.params.action,
          input.params.entity,
          refId,
          formattedMessage,
          input.success ? 'success' : 'failed',
          activityContext,
          productNamespace,
          actorIds
        );
    if (result.errors) {
      logger.error(
        '[OrgActivity] %s %j %j',
        input.message,
        input.params,
        result
      );
    }
  }
}

export function keycloakUserDisplayName(user: UserRepresentation): string {
  const fromAttr = user.attributes?.display_name?.[0];
  if (fromAttr) {
    return fromAttr;
  }
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  if (fullName) {
    return fullName;
  }
  return user.email || 'unknown';
}

export async function buildOrgAccessDisplayNameResolver(
  issuerUrl: string,
  clientId: string,
  clientSecret: string,
  identityProviders: string[] = ['idir']
): Promise<(email: string) => Promise<string>> {
  const userApi = new KeycloakUserService(issuerUrl);
  await userApi.login(clientId, clientSecret);
  const cache = new Map<string, string>();

  return async (email: string) => {
    if (cache.has(email)) {
      return cache.get(email)!;
    }
    try {
      const user = await userApi.lookupUserByEmail(
        email,
        false,
        identityProviders
      );
      const displayName = keycloakUserDisplayName(user);
      cache.set(email, displayName);
      return displayName;
    } catch (e) {
      logger.warn(
        '[OrgActivity] display name lookup failed for %s: %s',
        email,
        e
      );
      cache.set(email, email);
      return email;
    }
  };
}

function signRoleDelta(added: string[], removed: string[]): string {
  return [
    ...added.map((role) => `[+] ${role}`),
    ...removed.map((role) => `[-] ${role}`),
  ].join(', ');
}

export async function logOrganizationAccessChanges(
  context: any,
  membership: { parent?: string; name: string },
  changes: {
    granted: Record<string, string[]>;
    revoked: Record<string, string[]>;
  },
  resolveDisplayName: (email: string) => Promise<string>
): Promise<void> {
  const { filterOrg, resource, orgUnit } = resolveOrgHierarchyKeys(
    membership.parent,
    membership.name
  );
  const orgActivity = new OrgActivityService(context, filterOrg);
  const emails = new Set([
    ...Object.keys(changes.granted || {}),
    ...Object.keys(changes.revoked || {}),
  ]);

  for (const email of emails) {
    await orgActivity.logUpdateOrganizationAccess(true, {
      subject_email: email,
      subject: await resolveDisplayName(email),
      roles: signRoleDelta(
        changes.granted[email] ?? [],
        changes.revoked[email] ?? []
      ),
      resource,
      orgUnit,
    });
  }
}

export async function logOrganizationProfileChangeFromRecords(
  context: any,
  orgName: string,
  record: Record<string, any>
): Promise<void> {
  await new OrgActivityService(context, orgName)
    .logOrganizationProfileChange(true, {
      profile: buildOrganizationProfileSnapshot(record),
    })
    .catch((e) => logger.error('[OrgActivity] profile change %s', e));
}

export async function logOrganizationUnitsFromChildSync(
  context: any,
  units: Array<Record<string, any>>,
  childResults: Array<{ result?: string }>,
  parentOrgName: string
): Promise<void> {
  for (let i = 0; i < childResults.length; i++) {
    const childResult = childResults[i];
    const unitRecord = units[i];
    if (!unitRecord?.name) {
      continue;
    }
    if (childResult.result === 'created') {
      await logOrganizationUnitEstablishedFromRecords(
        context,
        unitRecord.name,
        unitRecord,
        parentOrgName
      );
    } else if (childResult.result === 'updated') {
      await logOrganizationUnitProfileChangeFromRecords(
        context,
        unitRecord.name,
        unitRecord,
        parentOrgName
      );
    }
  }
}

export async function logOrganizationUnitEstablishedFromRecords(
  context: any,
  unitName: string,
  record: Record<string, any>,
  parentOrgName?: string
): Promise<void> {
  if (!shouldLogOrgUnitEstablishment(record)) {
    return;
  }

  let ministryName = parentOrgName;
  if (!ministryName) {
    const org = await getOrganizationUnit(context, unitName);
    if (!org?.name) {
      logger.error(
        '[OrgActivity] unit establishment - parent org not found for %s',
        unitName
      );
      return;
    }
    ministryName = org.name;
  }

  await new OrgActivityService(context, ministryName)
    .logOrganizationUnitEstablished(true, {
      orgUnit: unitName,
      profile: buildOrganizationUnitProfileSnapshot(record),
    })
    .catch((e) => logger.error('[OrgActivity] unit establishment %s', e));
}

export async function logOrganizationUnitProfileChangeFromRecords(
  context: any,
  unitName: string,
  record: Record<string, any>,
  parentOrgName?: string
): Promise<void> {
  let ministryName = parentOrgName;
  if (!ministryName) {
    const org = await getOrganizationUnit(context, unitName);
    if (!org?.name) {
      logger.error(
        '[OrgActivity] unit profile change - parent org not found for %s',
        unitName
      );
      return;
    }
    ministryName = org.name;
  }

  await new OrgActivityService(context, ministryName)
    .logOrganizationProfileChange(true, {
      orgUnit: unitName,
      profile: buildOrganizationUnitProfileSnapshot(record),
    })
    .catch((e) => logger.error('[OrgActivity] unit profile change %s', e));
}

export async function logSubsystemActivityFromHook(
  context: any,
  operation: 'create' | 'update' | 'delete',
  existingItem: Record<string, any> | null | undefined,
  updatedItem: Record<string, any>
): Promise<void> {
  const item = updatedItem ?? existingItem;
  const subsystemName = item?.name;
  assert.strictEqual(
    typeof subsystemName === 'string' && subsystemName.length > 0,
    true,
    'Subsystem name is required for activity logging'
  );

  const orgId = item?.organization;
  assert.strictEqual(
    orgId != null && orgId !== '',
    true,
    'Subsystem organization id is required for activity logging'
  );

  const productNamespace = item?.namespace;
  assert.strictEqual(
    typeof productNamespace === 'string' && productNamespace.length > 0,
    true,
    'Subsystem product namespace is required for activity logging'
  );

  const orgName = await lookupOrganizationNameById(context, String(orgId));
  assert.strictEqual(
    typeof orgName === 'string' && orgName.length > 0,
    true,
    `Unable to resolve organization name for subsystem ${subsystemName}`
  );
  const orgActivity = new OrgActivityService(context, orgName);

  const subsystemData = { subsystemName, productNamespace };

  if (operation === 'delete') {
    await orgActivity.logSubsystemDeleted(true, subsystemData);
    return;
  }
  if (operation === 'create') {
    await orgActivity.logSubsystemCreated(true, subsystemData);
    return;
  }

  await orgActivity.logSubsystemProfileChange(true, {
    ...subsystemData,
    profile: buildSubsystemProfileSnapshot(updatedItem),
  });
}

export async function logServiceRemovedForOrg(
  context: any,
  orgName: string,
  serviceName: string,
  subsystemName: string
): Promise<void> {
  await new OrgActivityService(context, orgName)
    .logServiceRemoved(true, { serviceName, subsystemName })
    .catch((e) => logger.error('[OrgActivity] service remove %s', e));
}

export async function getCombinedOrganizationActivity(
  context: any,
  org: string,
  first: number = 20,
  skip: number = 0
): Promise<Activity[]> {
  const cappedFirst = first > 100 ? 100 : first;
  const fetchLimit = Math.min(cappedFirst + skip, 100);

  const orgRecords = await getOrgActivity(
    context,
    org,
    fetchLimit,
    0,
    false
  );

  const prodEnv = await getGwaProductEnvironment(context, false);
  const envConfig = prodEnv.issuerEnvConfig;
  const svc = new NamespaceService(envConfig.issuerUrl);
  await svc.login(envConfig.clientId, envConfig.clientSecret);
  const assignedNamespaces = await svc.listAssignedNamespacesByOrg(org);
  const gatewayRecords =
    assignedNamespaces.length > 0
      ? await getActivity(
          context,
          assignedNamespaces.map((n) => n.name),
          undefined,
          fetchLimit,
          0
        )
      : [];

  const seen = new Set<string>();
  const combined = [...orgRecords, ...gatewayRecords].filter((record) => {
    if (seen.has(record.id)) {
      return false;
    }
    seen.add(record.id);
    return true;
  });

  return combined
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(skip, skip + cappedFirst);
}
