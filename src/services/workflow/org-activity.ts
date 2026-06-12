import { strict as assert } from 'assert';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import { Logger } from '../../logger';
import { format, recordActivity, recordActivityWithBlob } from '../keystone/activity';
import { getOrganizationUnit } from '../keystone/organization';
import { KeycloakUserService } from '../keycloak/user-service';

const logger = Logger('wf.OrgActivity');

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
  refId: string;
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
    return { filterOrg: segments[0], refId: segments[0] };
  }

  // Ministry-level organization
  if (segments.length === 2) {
    return { filterOrg: segments[1], refId: segments[1] };
  }

  // Org unit
  return {
    filterOrg: segments[1],
    refId: segments[2],
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

function gatewayPatternPublishMessage(
  targetName: string | undefined,
  removed: boolean
): string {
  const includeTarget = Boolean(targetName);
  if (removed) {
    return includeTarget
      ? '{actor} removed {pattern} for {targetName}: {detail}'
      : '{actor} removed {pattern}: {detail}';
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
    return this.recordOrgActivity(
      success,
      '{actor} established organization {organization}',
      {
        action: 'registered',
        entity: 'Organization',
        actor: this.getActorName(),
        organization: this.orgName,
      },
      this.orgName,
      [`org:${this.orgName}`],
      profile
    );
  }

  async logOrganizationUnitEstablished(
    success: boolean,
    data: {
      orgUnit: string;
      profile: Record<string, unknown>;
    }
  ): Promise<void> {
    return this.recordOrgActivity(
      success,
      '{actor} established organization unit {orgUnit}',
      {
        action: 'registered',
        entity: 'OrganizationUnit',
        actor: this.getActorName(),
        organization: this.orgName,
        orgUnit: data.orgUnit,
      },
      data.orgUnit,
      [`org:${this.orgName}`, `orgUnit:${data.orgUnit}`],
      data.profile
    );
  }

  async logOrganizationProfileChange(
    success: boolean,
    data: {
      refId?: string;
      orgUnit?: string;
      profile: Record<string, unknown>;
    }
  ): Promise<void> {
    const refId = data.refId ?? (data.orgUnit ?? this.orgName);
    const ids = [`org:${this.orgName}`];
    if (data.orgUnit) {
      ids.push(`orgUnit:${data.orgUnit}`);
    }

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

    return this.recordOrgActivity(
      success,
      message,
      params,
      refId,
      ids,
      data.profile
    );
  }

  async logUpdateOrganizationAccess(
    success: boolean,
    data: {
      subject_email: string;
      subject: string;
      roles: string;
      refId: string;
      orgUnit?: string;
    }
  ): Promise<void> {
    const ids = [`org:${this.orgName}`];
    if (data.orgUnit) {
      ids.push(`orgUnit:${data.orgUnit}`);
    }
    ids.push(`user:${data.subject_email}`);

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

    return this.recordOrgActivity(success, message, params, data.refId, ids);
  }

  async logOrganizationCSR(
    success: boolean,
    data: { keyName: string }
  ): Promise<void> {
    return this.recordOrgActivity(
      success,
      '{actor} requested organization certificate for {keyName} on {organization}',
      {
        action: 'requested',
        entity: 'OrganizationCertificate',
        actor: this.getActorName(),
        organization: this.orgName,
        keyName: data.keyName,
      },
      data.keyName,
      [`org:${this.orgName}`, `key:${data.keyName}`]
    );
  }

  async logGatewayPatternPublish(
    success: boolean,
    data: {
      pattern: string;
      /** Remove-only summary; deck output is stored in blob on apply. */
      detail?: string;
      removed?: boolean;
      scope?: 'organization' | 'subsystem' | 'runtime-group';
      targetName?: string;
      deckBlob?: string;
    }
  ): Promise<void> {
    const isRemove = data.removed === true;
    const message = gatewayPatternPublishMessage(data.targetName, isRemove);

    const entity = gatewayPatternPublishEntity(data.pattern, data.scope);

    const params: { [key: string]: string } = {
      action: isRemove ? 'removed' : 'published',
      entity,
      actor: this.getActorName(),
      organization: this.orgName,
      pattern: data.pattern,
    };
    if (isRemove && data.detail) {
      params.detail = data.detail;
    }
    if (data.scope) {
      params.scope = data.scope;
    }
    if (data.targetName) {
      params.targetName = data.targetName;
    }

    const ids = [`org:${this.orgName}`];
    if (data.scope) {
      ids.push(`scope:${data.scope}`);
    }
    if (data.targetName) {
      ids.push(`target:${data.targetName}`);
    }

    const refId = data.targetName ?? this.orgName;
    return this.recordOrgActivity(
      success,
      message,
      params,
      refId,
      ids,
      data.deckBlob
    );
  }

  private async recordOrgActivity(
    success: boolean,
    message: string,
    params: { [key: string]: string },
    refId: string,
    ids: string[],
    blob?: Record<string, unknown> | string
  ): Promise<void> {
    assert.strictEqual(
      ids.length > 0 && ids.length < 5,
      true,
      'Must be at least one id and no more than 4'
    );
    assert.strictEqual(
      ids[0],
      `org:${this.orgName}`,
      'First id must be org:{orgName} (stored as filterKey1 for org activity queries)'
    );

    const activityContext = JSON.stringify({
      message,
      params,
    });

    const formattedMessage = format(message, params);
    const actorIds = ids.concat(`actor:${params.actor}`);
    logger.info('[OrgActivity] %s (%j)', formattedMessage, actorIds);

    const result = blob
      ? await recordActivityWithBlob(
          this.context,
          params.action,
          params.entity,
          refId,
          formattedMessage,
          success ? 'success' : 'failed',
          activityContext,
          blob,
          actorIds,
          null
        )
      : await recordActivity(
          this.context,
          params.action,
          params.entity,
          refId,
          formattedMessage,
          success ? 'success' : 'failed',
          activityContext,
          null,
          actorIds
        );
    if (result.errors) {
      logger.error('[OrgActivity] %s %j %j', message, params, result);
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
  const { filterOrg, refId, orgUnit } = resolveOrgHierarchyKeys(
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
      refId,
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
      refId: orgName,
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
      refId: unitName,
      orgUnit: unitName,
      profile: buildOrganizationUnitProfileSnapshot(record),
    })
    .catch((e) => logger.error('[OrgActivity] unit profile change %s', e));
}
