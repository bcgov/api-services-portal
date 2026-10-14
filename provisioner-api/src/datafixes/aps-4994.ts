import type { FastifyBaseLogger } from 'fastify';
import type { ConnectionRequest } from '../clients/feed/types.js';
import type { ConnectionRequestInput } from '../clients/sdx-member/types.js';
import type { TConnectionChangeResponse } from '../schemas/resources.js';

type DatafixLogger = Pick<FastifyBaseLogger, 'error' | 'info' | 'warn'>;

export interface Aps4994DatafixDependencies {
  listConnections(): Promise<ConnectionRequest[]>;
  previewConnection(
    id: string,
    connection: ConnectionRequestInput
  ): Promise<TConnectionChangeResponse>;
  applyConnection(
    id: string,
    connection: ConnectionRequestInput
  ): Promise<TConnectionChangeResponse>;
  apply: boolean;
  logger?: DatafixLogger;
}

export interface Aps4994DatafixIssue {
  clientId: string;
  environment: string;
  reason: string;
}

export interface Aps4994DatafixSummary {
  connections: number;
  candidates: number;
  consumers: number;
  planned: number;
  applied: number;
  failed: number;
  dryRun: boolean;
  issues: Aps4994DatafixIssue[];
}

export async function runAps4994Datafix(
  dependencies: Aps4994DatafixDependencies
): Promise<Aps4994DatafixSummary> {
  const connections = (await dependencies.listConnections()).filter(
    (connection) =>
      connection.id &&
      connection.clientId &&
      connection.serviceId &&
      connection.environment &&
      connection.policyVersion === 'SDX.R1.00' &&
      connection.isApproved === true &&
      connection.isActive === true
  );
  const groups = new Map<string, ConnectionRequest[]>();

  for (const connection of connections) {
    const key = groupKey(connection.clientId!, connection.environment!);
    groups.set(key, [...(groups.get(key) || []), connection]);
  }

  const candidates = [...groups.values()]
    .map((group) => group.slice().sort(compareConnectionRecency).at(-1)!)
    .sort((left, right) =>
      groupKey(left.clientId!, left.environment!).localeCompare(
        groupKey(right.clientId!, right.environment!)
      )
    );
  const summary: Aps4994DatafixSummary = {
    connections: connections.length,
    candidates: candidates.length,
    consumers: candidates.length,
    planned: 0,
    applied: 0,
    failed: 0,
    dryRun: !dependencies.apply,
    issues: [],
  };

  for (const representative of candidates) {
    const candidate = {
      clientId: representative.clientId!,
      environment: representative.environment!,
    };
    const expectedClientId = connectionOAuthClientId(representative);
    if (!expectedClientId) {
      recordIssue(
        summary,
        dependencies.logger,
        candidate,
        `latest connection '${representative.id}' does not identify an OAuth client`
      );
      continue;
    }

    const group =
      groups.get(groupKey(candidate.clientId, candidate.environment)) || [];
    const ignoredRecords = group.filter(
      (connection) =>
        connection.id !== representative.id &&
        connectionOAuthClientId(connection) !== expectedClientId
    );
    if (ignoredRecords.length > 0) {
      dependencies.logger?.warn(
        {
          subsystemId: candidate.clientId,
          environment: candidate.environment,
          selectedRecordId: representative.id,
          ignoredRecordIds: ignoredRecords.map((connection) => connection.id),
          selection: selectionMethod(group),
        },
        'Multiple OAuth clients found for one subsystem and environment; reprovisioning the latest record'
      );
    }

    const input = connectionInput(representative);
    try {
      const preview = await dependencies.previewConnection(
        representative.id!,
        input
      );
      const generated = (
        (preview.preview || []) as Array<Record<string, any>>
      ).filter(
        (resource) =>
          resource.kind === 'GatewayConsumer' && resource._action !== 'delete'
      );

      if (
        generated.length !== 1 ||
        generated[0].username !== expectedClientId ||
        generated[0].custom_id !== expectedClientId ||
        !Array.isArray(generated[0].acls) ||
        !generated[0].acls.some((acl: any) => acl.group === candidate.clientId)
      ) {
        recordIssue(
          summary,
          dependencies.logger,
          candidate,
          `generated consumer does not match latest OAuth client '${expectedClientId}'`
        );
        continue;
      }

      summary.planned++;
      if (!dependencies.apply) continue;

      const result = await dependencies.applyConnection(
        representative.id!,
        input
      );
      if (result.failed > 0 || result.skipped > 0) {
        recordIssue(
          summary,
          dependencies.logger,
          candidate,
          `reprovision failed=${result.failed} skipped=${result.skipped}`
        );
        continue;
      }
      summary.applied++;
    } catch (err) {
      recordIssue(
        summary,
        dependencies.logger,
        candidate,
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  dependencies.logger?.info(summary, 'APS-4994 consumer migration completed');
  return summary;
}

function connectionInput(
  connection: ConnectionRequest
): ConnectionRequestInput {
  return {
    clientId: connection.clientId!,
    serviceId: connection.serviceId!,
    isApproved: connection.isApproved,
    isActive: connection.isActive,
    environment: connection.environment,
    policyVersion: connection.policyVersion,
    requesterDetails: parseObject(connection.requesterDetails),
    clientResources: parseObject(connection.clientResources),
    serviceResources: parseObject(connection.serviceResources),
  };
}

function connectionOAuthClientId(
  connection: ConnectionRequest
): string | undefined {
  const details = parseObject(connection.requesterDetails);
  const client = parseObject(details.client);
  const clientId = client.clientId;
  return typeof clientId === 'string' && clientId.trim().length > 0
    ? clientId.trim()
    : undefined;
}

function parseObject(value: unknown): Record<string, any> {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return value && typeof value === 'object'
    ? (value as Record<string, any>)
    : {};
}

function compareConnectionRecency(
  left: ConnectionRequest,
  right: ConnectionRequest
): number {
  const leftTimestamp = connectionTimestamp(left);
  const rightTimestamp = connectionTimestamp(right);
  if (leftTimestamp !== rightTimestamp) {
    return leftTimestamp - rightTimestamp;
  }
  return (left.id || '').localeCompare(right.id || '');
}

function connectionTimestamp(connection: ConnectionRequest): number {
  const tracked = connection as ConnectionRequest & {
    updatedAt?: unknown;
    createdAt?: unknown;
  };
  for (const value of [tracked.updatedAt, tracked.createdAt]) {
    if (typeof value === 'string' && value.length > 0) {
      const parsed = Date.parse(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return Number.NEGATIVE_INFINITY;
}

function selectionMethod(connections: ConnectionRequest[]): string {
  return connections.some(
    (connection) => connectionTimestamp(connection) !== Number.NEGATIVE_INFINITY
  )
    ? 'updatedAt-createdAt-id'
    : 'deterministic-id-no-timestamp';
}

function groupKey(clientId: string, environment: string): string {
  return `${clientId}\u0000${environment}`;
}

function recordIssue(
  summary: Aps4994DatafixSummary,
  logger: DatafixLogger | undefined,
  candidate: { clientId: string; environment: string },
  reason: string
) {
  summary.failed++;
  summary.issues.push({
    clientId: candidate.clientId,
    environment: candidate.environment,
    reason,
  });
  logger?.warn(
    {
      clientId: candidate.clientId,
      environment: candidate.environment,
      reason,
    },
    'APS-4994 consumer migration audit failed'
  );
}
