import type { FastifyBaseLogger } from 'fastify';
import type { ConnectionRequest } from '../clients/feed/types.js';
import type { ConnectionRequestInput } from '../clients/sdx-member/types.js';
import type { TConnectionChangeResponse } from '../schemas/resources.js';

type DatafixLogger = Pick<FastifyBaseLogger, 'error' | 'info'>;

export interface Aps4790DatafixDependencies {
  listConnections(): Promise<ConnectionRequest[]>;
  applyConnection(
    id: string,
    connection: ConnectionRequestInput
  ): Promise<TConnectionChangeResponse>;
  logger?: DatafixLogger;
}

export interface Aps4790DatafixSummary {
  connections: number;
  candidates: number;
  provisioned: number;
  failed: number;
}

const PROVISIONER_STATUSES = new Set(['pending', 'provisioned', 'failed']);

export function hasProvisionerStatus(value: unknown): boolean {
  if (typeof value === 'string') {
    try {
      return hasProvisionerStatus(JSON.parse(value));
    } catch {
      return false;
    }
  }

  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return PROVISIONER_STATUSES.has(
    (value as { status?: unknown }).status as string
  );
}

export async function runAps4790Datafix(
  dependencies: Aps4790DatafixDependencies
): Promise<Aps4790DatafixSummary> {
  const connections = new Map<string, ConnectionRequest>();
  for (const connection of await dependencies.listConnections()) {
    const key =
      connection.id ??
      `${connection.clientId ?? ''}::${connection.serviceId ?? ''}`;
    if (!connections.has(key)) {
      connections.set(key, connection);
    }
  }

  const candidates = [...connections.values()].filter(
    (connection) =>
      connection.isActive === true &&
      !hasProvisionerStatus(connection.provisionerStatus)
  );

  const summary: Aps4790DatafixSummary = {
    connections: connections.size,
    candidates: candidates.length,
    provisioned: 0,
    failed: 0,
  };

  for (const connection of candidates) {
    if (!connection.id || !connection.clientId || !connection.serviceId) {
      summary.failed++;
      dependencies.logger?.error(
        {
          connectionId: connection.id,
          clientId: connection.clientId,
          serviceId: connection.serviceId,
        },
        'APS-4790 datafix cannot process an incomplete connection request'
      );
      continue;
    }

    const input: ConnectionRequestInput = {
      clientId: connection.clientId,
      serviceId: connection.serviceId,
      isApproved: connection.isApproved,
      isActive: connection.isActive,
      environment: connection.environment,
      policyVersion: connection.policyVersion,
      requesterDetails: connection.requesterDetails,
      clientResources: connection.clientResources,
      serviceResources: connection.serviceResources,
    };

    try {
      const response = await dependencies.applyConnection(connection.id, input);
      if (response.failed + response.skipped > 0) {
        summary.failed++;
        dependencies.logger?.error(
          {
            connectionId: connection.id,
            clientId: connection.clientId,
            serviceId: connection.serviceId,
            failed: response.failed,
            skipped: response.skipped,
          },
          'APS-4790 datafix recorded a failed provisioning result'
        );
      } else {
        summary.provisioned++;
      }
    } catch (err) {
      summary.failed++;
      dependencies.logger?.error(
        {
          err,
          connectionId: connection.id,
          clientId: connection.clientId,
          serviceId: connection.serviceId,
        },
        'APS-4790 datafix failed to process a connection request'
      );
    }
  }

  dependencies.logger?.info(summary, 'APS-4790 datafix completed');
  return summary;
}
