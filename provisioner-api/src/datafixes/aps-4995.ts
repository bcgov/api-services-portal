import type { FastifyBaseLogger } from 'fastify';
import type { ConnectionRequest } from '../clients/feed/types.js';
import type { ConnectionRequestInput } from '../clients/sdx-member/types.js';
import type { TConnectionChangeResponse } from '../schemas/resources.js';

type DatafixLogger = Pick<FastifyBaseLogger, 'info' | 'warn'>;

export interface Aps4995DatafixDependencies {
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

export interface Aps4995DatafixIssue {
  connectionId: string;
  reason: string;
}

export interface Aps4995DatafixSummary {
  connections: number;
  candidates: number;
  planned: number;
  applied: number;
  failed: number;
  dryRun: boolean;
  issues: Aps4995DatafixIssue[];
}

export async function runAps4995Datafix(
  dependencies: Aps4995DatafixDependencies
): Promise<Aps4995DatafixSummary> {
  const connections = await dependencies.listConnections();
  const candidates = connections
    .filter(
      (connection) =>
        connection.id &&
        connection.clientId &&
        connection.serviceId &&
        connection.environment &&
        connection.policyVersion === 'SDX.R1.00' &&
        connection.isApproved === true &&
        connection.isActive === true
    )
    .sort((left, right) => left.id!.localeCompare(right.id!));
  const summary: Aps4995DatafixSummary = {
    connections: connections.length,
    candidates: candidates.length,
    planned: 0,
    applied: 0,
    failed: 0,
    dryRun: !dependencies.apply,
    issues: [],
  };

  for (const connection of candidates) {
    const id = connection.id!;
    const input = connectionInput(connection);
    try {
      const preview = await dependencies.previewConnection(id, input);
      const problem = validatePreview(preview);
      if (problem) {
        recordIssue(summary, dependencies.logger, id, problem);
        continue;
      }

      summary.planned++;
      if (!dependencies.apply) continue;

      const result = await dependencies.applyConnection(id, input);
      if (result.failed > 0 || result.skipped > 0) {
        recordIssue(
          summary,
          dependencies.logger,
          id,
          `reprovision failed=${result.failed} skipped=${result.skipped}`
        );
        continue;
      }
      summary.applied++;
    } catch (err) {
      recordIssue(
        summary,
        dependencies.logger,
        id,
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  dependencies.logger?.info(
    summary,
    'APS-4995 R1 enforcement migration completed'
  );
  return summary;
}

function validatePreview(
  result: TConnectionChangeResponse
): string | undefined {
  const services = (result.preview || []).filter(
    (resource: any) =>
      resource.kind === 'GatewayService' && resource._action !== 'delete'
  ) as any[];
  const consumer = services.find((resource) =>
    String(resource.name).includes('.c.')
  );
  const provider = services.find((resource) =>
    String(resource.name).includes('.p.')
  );
  if (!consumer) return 'consumer-edge GatewayService was not generated';
  if (!provider) return 'provider-edge GatewayService was not generated';

  const consumerPlugins = pluginsByName(consumer);
  const consumerJwt = consumerPlugins.get('jwt-keycloak')?.config;
  if (
    !consumerJwt ||
    consumerJwt.consumer_match !== true ||
    consumerJwt.consumer_match_claim !== 'azp' ||
    consumerJwt.consumer_match_claim_custom_id !== true ||
    consumerJwt.consumer_match_ignore_not_found !== false
  ) {
    return 'consumer-edge JWT plugin does not use strict azp/custom_id matching';
  }
  if (!consumerPlugins.has('acl')) {
    return 'consumer-edge ACL plugin was not generated';
  }
  const exchange = consumerPlugins.get('token-exchange')?.config;
  if (
    !exchange ||
    !Array.isArray(exchange.scopes) ||
    exchange.scopes.length !== 0 ||
    exchange.scope_source !== 'verified_subject_token' ||
    typeof exchange.audience !== 'string' ||
    exchange.audience.length === 0
  ) {
    return 'consumer-edge token exchange is not canonical';
  }

  const providerPlugins = pluginsByName(provider);
  const providerJwt = providerPlugins.get('jwt-keycloak')?.config;
  if (!providerJwt || providerJwt.consumer_match !== false) {
    return 'provider-edge JWT verification was not generated';
  }
  if (providerPlugins.has('token-exchange')) {
    return 'provider-edge must not perform token exchange';
  }
  return undefined;
}

function pluginsByName(resource: any): Map<string, any> {
  return new Map(
    (Array.isArray(resource.plugins) ? resource.plugins : []).map(
      (plugin: any) => [plugin.name, plugin]
    )
  );
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

function parseObject(value: unknown): Record<string, unknown> {
  if (typeof value === 'string') return JSON.parse(value || '{}');
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function recordIssue(
  summary: Aps4995DatafixSummary,
  logger: DatafixLogger | undefined,
  connectionId: string,
  reason: string
) {
  summary.failed++;
  summary.issues.push({ connectionId, reason });
  logger?.warn(
    { connectionId, reason },
    'APS-4995 R1 enforcement migration audit failed'
  );
}
