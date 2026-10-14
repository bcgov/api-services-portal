import type { FastifyBaseLogger } from 'fastify';
import type {
  ConnectionClientGrant,
  ConnectionClientGrantInput,
  ConnectionRequest,
} from '../clients/feed/types.js';

type DatafixLogger = Pick<FastifyBaseLogger, 'error' | 'info' | 'warn'>;

export interface Aps4992DatafixDependencies {
  listConnections(): Promise<ConnectionRequest[]>;
  listGrants(): Promise<ConnectionClientGrant[]>;
  applyGrant(grant: ConnectionClientGrantInput): Promise<unknown>;
  apply: boolean;
  logger?: DatafixLogger;
}

export interface Aps4992DatafixIssue {
  connectionId?: string;
  reason: string;
}

export interface Aps4992DatafixSummary {
  connections: number;
  candidates: number;
  existing: number;
  planned: number;
  applied: number;
  failed: number;
  dryRun: boolean;
  issues: Aps4992DatafixIssue[];
}

interface LegacyRequesterDetails {
  submissionId?: unknown;
  requester?: unknown;
  scopes?: unknown;
  client?: {
    integrationId?: unknown;
    clientId?: unknown;
  };
}

export async function runAps4992Datafix(
  dependencies: Aps4992DatafixDependencies
): Promise<Aps4992DatafixSummary> {
  const connections = uniqueConnections(await dependencies.listConnections());
  const existingGrants = await dependencies.listGrants();
  const existingByKey = new Map<string, ConnectionClientGrant[]>();
  for (const grant of existingGrants) {
    const connectionId =
      typeof grant.connection === 'string'
        ? grant.connection
        : grant.connection?.id;
    if (!connectionId) continue;
    const key = grantKey(
      connectionId,
      grant.integrationId,
      grant.oauthClientId
    );
    existingByKey.set(key, [...(existingByKey.get(key) || []), grant]);
  }

  const candidates = connections.filter(
    (connection) => connection.policyVersion === 'SDX.R1.00'
  );
  const summary: Aps4992DatafixSummary = {
    connections: connections.length,
    candidates: candidates.length,
    existing: existingGrants.length,
    planned: 0,
    applied: 0,
    failed: 0,
    dryRun: !dependencies.apply,
    issues: [],
  };

  for (const connection of candidates) {
    const planned = planLegacyGrant(connection);
    if ('reason' in planned) {
      recordIssue(summary, dependencies.logger, connection.id, planned.reason);
      continue;
    }

    const key = grantKey(
      planned.connection,
      planned.integrationId,
      planned.oauthClientId
    );
    const matching = existingByKey.get(key) || [];
    if (matching.length > 1) {
      recordIssue(
        summary,
        dependencies.logger,
        connection.id,
        `duplicate client grants found for ${planned.integrationId}/${planned.oauthClientId}`
      );
      continue;
    }
    if (matching.length === 1) {
      continue;
    }

    summary.planned++;
    if (!dependencies.apply) continue;

    try {
      await dependencies.applyGrant(planned);
      summary.applied++;
      existingByKey.set(key, [planned]);
    } catch (err) {
      summary.failed++;
      summary.issues.push({
        connectionId: connection.id,
        reason: err instanceof Error ? err.message : String(err),
      });
      dependencies.logger?.error(
        { err, connectionId: connection.id },
        'APS-4992 failed to backfill a client grant'
      );
    }
  }

  dependencies.logger?.info(summary, 'APS-4992 migration audit completed');
  return summary;
}

export function planLegacyGrant(
  connection: ConnectionRequest
): ConnectionClientGrantInput | Aps4992DatafixIssue {
  if (!connection.id) {
    return { reason: 'connection has no id' };
  }

  let details: LegacyRequesterDetails;
  try {
    details =
      typeof connection.requesterDetails === 'string'
        ? JSON.parse(connection.requesterDetails)
        : connection.requesterDetails;
  } catch {
    return {
      connectionId: connection.id,
      reason: 'requesterDetails is not valid JSON',
    };
  }
  if (!details || typeof details !== 'object') {
    return {
      connectionId: connection.id,
      reason: 'requesterDetails is missing',
    };
  }

  const integrationId = nonBlank(details.client?.integrationId);
  const oauthClientId = nonBlank(details.client?.clientId);
  if (!integrationId || !oauthClientId) {
    return {
      connectionId: connection.id,
      reason:
        'requesterDetails does not identify an integration and OAuth client',
    };
  }

  if (!Array.isArray(details.scopes)) {
    return {
      connectionId: connection.id,
      reason: 'requesterDetails.scopes is not an array',
    };
  }
  const scopes: string[] = [];
  for (const scope of details.scopes) {
    const normalized = nonBlank(scope);
    if (!normalized) {
      return {
        connectionId: connection.id,
        reason: 'requesterDetails.scopes contains a non-string or blank scope',
      };
    }
    scopes.push(normalized);
  }

  const submissionId = nonBlank(details.submissionId);
  return {
    connection: connection.id,
    integrationId,
    oauthClientId,
    ...(submissionId ? { submissionId } : {}),
    requesterDetails: details as Record<string, unknown>,
    scopes: Array.from(new Set(scopes)).sort(),
    status: connection.isApproved ? 'approved' : 'pending',
  };
}

function uniqueConnections(connections: ConnectionRequest[]) {
  const unique = new Map<string, ConnectionRequest>();
  for (const connection of connections) {
    const key =
      connection.id ||
      `${connection.clientId || ''}\u0000${connection.serviceId || ''}`;
    if (!unique.has(key)) unique.set(key, connection);
  }
  return [...unique.values()];
}

function grantKey(
  connectionId: string,
  integrationId: string,
  oauthClientId: string
) {
  return `${connectionId}\u0000${integrationId}\u0000${oauthClientId}`;
}

function nonBlank(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function recordIssue(
  summary: Aps4992DatafixSummary,
  logger: DatafixLogger | undefined,
  connectionId: string | undefined,
  reason: string
) {
  summary.failed++;
  summary.issues.push({ connectionId, reason });
  logger?.warn(
    { connectionId, reason },
    'APS-4992 migration audit found a malformed legacy connection'
  );
}
