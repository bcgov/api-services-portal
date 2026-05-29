import { strict as assert } from 'assert';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import { Logger } from '../../logger';
import { format, recordActivity } from '../keystone/activity';
import { KeycloakUserService } from '../keycloak/user-service';

const logger = Logger('wf.OrgActivity');

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
      accessAction: 'granted' | 'revoked' | 'updated';
    }
  ): Promise<void> {
    const action = data.accessAction === 'revoked' ? 'revoke' : 'grant';
    return this.recordOrgActivity(
      success,
      '{actor} {accessAction} organization access for {subject} ({roles}) on {organization}',
      {
        action,
        entity: 'OrganizationAccess',
        actor: this.getActorName(),
        organization: this.orgName,
        subject_email: data.subject_email,
        subject: data.subject,
        roles: data.roles,
        accessAction: data.accessAction,
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
    return this.recordOrgActivity(
      success,
      '{actor} {keyAction} organization key {keyName} on {organization}',
      {
        action: keyAction,
        entity: 'OrganizationKey',
        actor: this.getActorName(),
        organization: this.orgName,
        keyName,
        keyAction,
      },
      [`org:${this.orgName}`, `key:${keyName}`]
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

export async function logOrganizationAccessChanges(
  orgActivity: OrgActivityService,
  changes: {
    granted: Record<string, string[]>;
    revoked: Record<string, string[]>;
  },
  newRolesByEmail: Map<string, string[]>,
  resolveDisplayName: (email: string) => Promise<string>
): Promise<void> {
  const grantedEmails = new Set(Object.keys(changes.granted || {}));
  const revokedEmails = new Set(Object.keys(changes.revoked || {}));
  const updatedEmails = new Set(
    [...grantedEmails].filter((email) => revokedEmails.has(email))
  );

  for (const email of updatedEmails) {
    const roles = (newRolesByEmail.get(email) ?? []).join(',');
    await orgActivity.logUpdateOrganizationAccess(true, {
      subject_email: email,
      subject: await resolveDisplayName(email),
      roles,
      accessAction: 'updated',
    });
  }

  for (const email of grantedEmails) {
    if (updatedEmails.has(email)) continue;
    const roles = (
      newRolesByEmail.get(email) ??
      changes.granted[email] ??
      []
    ).join(',');
    await orgActivity.logUpdateOrganizationAccess(true, {
      subject_email: email,
      subject: await resolveDisplayName(email),
      roles,
      accessAction: 'granted',
    });
  }

  for (const email of revokedEmails) {
    if (updatedEmails.has(email)) continue;
    const roles = (changes.revoked[email] ?? []).join(',');
    await orgActivity.logUpdateOrganizationAccess(true, {
      subject_email: email,
      subject: await resolveDisplayName(email),
      roles,
      accessAction: 'revoked',
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
