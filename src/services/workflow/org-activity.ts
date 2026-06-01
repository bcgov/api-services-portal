import { strict as assert } from 'assert';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import { Logger } from '../../logger';
import { format, getActivity, getOrgActivity, recordActivity } from '../keystone/activity';
import { Activity } from '../keystone/types';
import { KeycloakUserService } from '../keycloak/user-service';
import { NamespaceService } from '../org-groups';
import { getGwaProductEnvironment } from './get-namespaces';

const logger = Logger('wf.OrgActivity');

const KEY_ACTION_PAST: Record<'add' | 'rotate' | 'delete', string> = {
  add: 'added',
  rotate: 'rotated',
  delete: 'deleted',
};

const SUBSYSTEM_PROFILE_FIELDS = ['description'] as const;

const ORG_PROFILE_FIELDS = [
  'title',
  'description',
  'tags',
  'sector',
  'publicBodyId',
  'orgUnits',
] as const;

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).sort();
  }
  if (typeof value === 'string' && value.length > 0) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(String).sort();
      }
    } catch {
      return [value];
    }
  }
  return [];
}

function normalizeOrgUnits(value: unknown): string[] {
  let units: unknown = value;
  if (typeof value === 'string' && value.length > 0) {
    try {
      units = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(units)) {
    return [];
  }
  return units
    .map((unit: any) => {
      if (!unit || typeof unit !== 'object') {
        return '';
      }
      return String(unit.name ?? unit.extForeignKey ?? unit.id ?? '');
    })
    .filter((name) => name.length > 0)
    .sort();
}

function normalizeOptionalScalar(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return String(value);
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

export function diffSubsystemProfileFields(
  before: Record<string, any>,
  after: Record<string, any>
): string[] {
  return SUBSYSTEM_PROFILE_FIELDS.filter((field) => {
    return normalizeOptionalScalar(before[field]) !==
      normalizeOptionalScalar(after[field]);
  });
}

export function diffOrganizationProfileFields(
  before: Record<string, any>,
  after: Record<string, any>
): string[] {
  return ORG_PROFILE_FIELDS.filter((field) => {
    if (field === 'tags') {
      return (
        JSON.stringify(normalizeTags(before[field])) !==
        JSON.stringify(normalizeTags(after[field]))
      );
    }
    if (field === 'orgUnits') {
      return (
        JSON.stringify(normalizeOrgUnits(before[field])) !==
        JSON.stringify(normalizeOrgUnits(after[field]))
      );
    }
    if (field === 'publicBodyId' || field === 'sector' || field === 'description') {
      return (
        normalizeOptionalScalar(before[field]) !==
        normalizeOptionalScalar(after[field])
      );
    }
    return before[field] !== after[field];
  });
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

  async logOrganizationEstablished(success: boolean): Promise<void> {
    return this.recordOrgActivity(
      success,
      '{actor} established organization {organization}',
      {
        action: 'register',
        entity: 'Organization',
        actor: this.getActorName(),
        organization: this.orgName,
      },
      [`org:${this.orgName}`]
    );
  }

  async logOrganizationProfileChange(
    success: boolean,
    data: { changedFields: string }
  ): Promise<void> {
    return this.recordOrgActivity(
      success,
      '{actor} updated organization profile ({changedFields}) for {organization}',
      {
        action: 'update',
        entity: 'OrganizationProfile',
        actor: this.getActorName(),
        organization: this.orgName,
        changedFields: data.changedFields,
      },
      [`org:${this.orgName}`]
    );
  }

  async logUpdateOrganizationAccess(
    success: boolean,
    data: {
      subject_email: string;
      subject: string;
      roles: string;
    }
  ): Promise<void> {
    return this.recordOrgActivity(
      success,
      '{actor} {action} {subject} organization access on {organization}: {roles}',
      {
        action: 'updated',
        entity: 'OrganizationAccess',
        actor: this.getActorName(),
        organization: this.orgName,
        subject_email: data.subject_email,
        subject: data.subject,
        roles: data.roles,
      },
      [`org:${this.orgName}`, `user:${data.subject_email}`]
    );
  }

  async logOrganizationCSR(
    success: boolean,
    data: { keyName: string }
  ): Promise<void> {
    return this.recordOrgActivity(
      success,
      '{actor} requested organization certificate for {keyName} on {organization}',
      {
        action: 'request',
        entity: 'OrganizationCertificate',
        actor: this.getActorName(),
        organization: this.orgName,
        keyName: data.keyName,
      },
      [`org:${this.orgName}`, `key:${data.keyName}`]
    );
  }

  async logOrganizationPatternPublish(
    success: boolean,
    data: {
      keysAdded?: string[];
      keysRotated?: string[];
      keysRemoved?: string[];
    }
  ): Promise<void> {
    for (const keyName of data.keysAdded ?? []) {
      await this.logOrganizationKey(success, 'add', keyName);
    }
    for (const keyName of data.keysRotated ?? []) {
      await this.logOrganizationKey(success, 'rotate', keyName);
    }
    for (const keyName of data.keysRemoved ?? []) {
      await this.logOrganizationKey(success, 'delete', keyName);
    }
  }

  async logOrganizationKey(
    success: boolean,
    keyAction: 'add' | 'rotate' | 'delete',
    keyName: string
  ): Promise<void> {
    const keyActionPast = KEY_ACTION_PAST[keyAction];
    return this.recordOrgActivity(
      success,
      '{actor} {keyAction} organization key {keyName} on {organization}',
      {
        action: keyActionPast,
        entity: 'OrganizationKey',
        actor: this.getActorName(),
        organization: this.orgName,
        keyName,
        keyAction: keyActionPast,
      },
      [`org:${this.orgName}`, `key:${keyName}`]
    );
  }

  async logSubsystemCreated(
    success: boolean,
    data: { subsystemName: string }
  ): Promise<void> {
    return this.recordOrgActivity(
      success,
      '{actor} created subsystem {subsystemName} on {organization}',
      {
        action: 'created',
        entity: 'Subsystem',
        actor: this.getActorName(),
        organization: this.orgName,
        subsystemName: data.subsystemName,
      },
      [`org:${this.orgName}`, `subsystem:${data.subsystemName}`]
    );
  }

  async logSubsystemDeleted(
    success: boolean,
    data: { subsystemName: string }
  ): Promise<void> {
    return this.recordOrgActivity(
      success,
      '{actor} deleted subsystem {subsystemName} on {organization}',
      {
        action: 'deleted',
        entity: 'Subsystem',
        actor: this.getActorName(),
        organization: this.orgName,
        subsystemName: data.subsystemName,
      },
      [`org:${this.orgName}`, `subsystem:${data.subsystemName}`]
    );
  }

  async logSubsystemProfileChange(
    success: boolean,
    data: { subsystemName: string; changedFields: string }
  ): Promise<void> {
    return this.recordOrgActivity(
      success,
      '{actor} updated subsystem profile ({changedFields}) for {subsystemName} on {organization}',
      {
        action: 'updated',
        entity: 'Subsystem',
        actor: this.getActorName(),
        organization: this.orgName,
        subsystemName: data.subsystemName,
        changedFields: data.changedFields,
      },
      [`org:${this.orgName}`, `subsystem:${data.subsystemName}`]
    );
  }

  private async recordOrgActivity(
    success: boolean,
    message: string,
    params: { [key: string]: string },
    ids: string[]
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
    logger.info('[OrgActivity] %s (%j)', formattedMessage, ids);

    const result = await recordActivity(
      this.context,
      params.action,
      params.entity,
      `org:${this.orgName}`,
      formattedMessage,
      success ? 'success' : 'failed',
      activityContext,
      null,
      ids.concat(`actor:${params.actor}`)
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
  orgActivity: OrgActivityService,
  changes: {
    granted: Record<string, string[]>;
    revoked: Record<string, string[]>;
  },
  resolveDisplayName: (email: string) => Promise<string>
): Promise<void> {
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
    });
  }
}

export async function logOrganizationProfileChangeFromRecords(
  context: any,
  orgName: string,
  before: Record<string, any>,
  after: Record<string, any>
): Promise<void> {
  const changedFields = diffOrganizationProfileFields(before, after);
  if (changedFields.length === 0) {
    return;
  }
  await new OrgActivityService(context, orgName)
    .logOrganizationProfileChange(true, {
      changedFields: changedFields.join(','),
    })
    .catch((e) => logger.error('[OrgActivity] profile change %s', e));
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
  const orgName = await lookupOrganizationNameById(context, String(orgId));
  assert.strictEqual(
    typeof orgName === 'string' && orgName.length > 0,
    true,
    `Unable to resolve organization name for subsystem ${subsystemName}`
  );
  const orgActivity = new OrgActivityService(context, orgName);

  if (operation === 'delete') {
    await orgActivity.logSubsystemDeleted(true, { subsystemName });
    return;
  }
  if (operation === 'create') {
    await orgActivity.logSubsystemCreated(true, { subsystemName });
    return;
  }

  const changedFields = diffSubsystemProfileFields(existingItem ?? {}, updatedItem);
  if (changedFields.length === 0) {
    return;
  }
  await orgActivity.logSubsystemProfileChange(true, {
    subsystemName,
    changedFields: changedFields.join(','),
  });
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

  return [...orgRecords, ...gatewayRecords]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(skip, skip + cappedFirst);
}
