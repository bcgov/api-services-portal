import {
  SDXAsyncPublisherPattern,
  publisherWebhook,
} from '../services/gateway-patterns/sdx-async-publisher.js';
import { SDXAsyncSubscriberPattern } from '../services/gateway-patterns/sdx-async-subscriber.js';
import type { Services } from '../services/index.js';
import type {
  TConnectionChangeRequest,
  TConnectionChangeResponse,
  TConnectionDefaultsResponse,
  TResourceResult,
} from '../schemas/resources.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';
import type {
  Activity,
  ProvisionerStatus,
} from '../clients/feed/types.js';
import { v4 as uuidv4 } from 'uuid';
import { InternalError } from '../errors/api-errors.js';
import type { PolicyRequesterDetails } from '../services/policy-service.js';
import { managedApplicationScopesForEnvironment } from '../services/policies/SDX.R1.00/security-config.js';

export class ConnectionsController {
  constructor(
    private readonly services: Services,
    private readonly logger?: FastifyBaseLogger
  ) {}

  async onConnectionRequestChange(
    id: string,
    connectionRequest: TConnectionChangeRequest,
    action: 'preview' | 'apply' | 'diff' | 'delete'
  ): Promise<TConnectionChangeResponse> {
    const service = await this.services.sdxMember.getSubsystemService(
      connectionRequest.serviceId
    );

    if (action === 'apply') {
      await this.updateProvisionerStatus(
        connectionRequest,
        'pending',
        'provision',
        'Provisioning started.'
      );
    } else if (action === 'delete') {
      await this.updateProvisionerStatus(
        connectionRequest,
        'deprovisioning',
        'deprovision',
        'Deprovisioning started.'
      );
    }

    let response: TConnectionChangeResponse;
    try {
      const { operationId: _operationId, ...policyConnectionRequest } =
        connectionRequest;
      const resourceSets = await this.services.patternsEvaluator.buildResourcesUsingConnectionRequest(
        id,
        action,
        service,
        normalizeAsyncApiResources(policyConnectionRequest)
      );

      const results: TResourceResult[] = [];

      if (action === 'preview') {
        // For preview, we return the generated resources without applying them
        return {
          applied: 0,
          failed: 0,
          skipped: 0,
          results,
          preview: resourceSets.flatMap((resourceSet) =>
            resourceSet.documents.map((doc) => doc)
          ),
        };
      } else {
        let asyncRouteFailed = false;
        if (action === 'delete') {
          const hasWebhook = (resource: { documents: { kind: string }[] }) =>
            resource.documents.some((doc) => doc.kind === 'PubSubWebhook');
          if (
            !resourceSets.some(hasWebhook) &&
            policyConnectionRequest.serviceResources?.gatewayPatterns?.[LEGACY_WEBHOOK_PATTERN]
          ) {
            resourceSets.unshift({
              documents: [publisherWebhook({
                connId: id,
                clientId: connectionRequest.clientId,
                serviceId: connectionRequest.serviceId,
              })],
            });
          }
          resourceSets.sort(
            (left, right) => Number(hasWebhook(right)) - Number(hasWebhook(left))
          );
        }
        for (const resource of resourceSets) {
          const managedWebhook = resource.documents.some(
            (doc) => doc.kind === 'PubSubWebhook'
          );
          const asyncRoute = resource.documents.some(
            (doc) =>
              doc.kind === 'GatewayService' &&
              doc.name?.startsWith('sdx.asyncapi.')
          );
          if (action === 'apply' && managedWebhook && asyncRouteFailed) {
            results.push({
              provider: 'ape',
              status: 'skipped',
              message: 'An AsyncAPI route failed to provision.',
            });
            continue;
          }
          this.logger?.debug(
            'Dispatching: %s',
            resource.documents.map((doc) => doc.kind).join(', ')
          );

          const newAction =
            resource._delete_handling === 'apply' && action === 'delete'
              ? 'apply'
              : action;

          const result = await this.services.resourceDispatcher.dispatch(
            resource._gateway_id!,
            connectionRequest.environment!,
            resource.documents,
            newAction
          );
          results.push(...result);
          if (
            asyncRoute &&
            result.some((entry) => entry.status !== 'applied')
          ) {
            asyncRouteFailed = true;
          }
        }

        if (action !== 'diff') {
          await this.logActivity(action, connectionRequest, service, results);
        }

        response = {
          applied: results.filter((r) => r.status === 'applied').length,
          failed: results.filter((r) => r.status === 'failed').length,
          skipped: results.filter((r) => r.status === 'skipped').length,
          results,
        };
      }
    } catch (err) {
      this.logger?.error(
        { err, connectionRequest, service },
        'Error processing connection request change'
      );
      if (action !== 'diff' && action !== 'preview') {
        await this.updateFailedStatusAfterException(connectionRequest, action);
        await this.logActivity(
          action,
          connectionRequest,
          service,
          undefined,
          err
        );
        throw new InternalError(
          'An unexpected error occurred while processing the connection request change. Please check the logs for more details.'
        );
      } else {
        throw err;
      }
    }

    if (action === 'apply') {
      const unsuccessful = response.failed + response.skipped;
      if (unsuccessful > 0) {
        const providers = response.results
          .filter((result) => result.status !== 'applied')
          .map((result) => result.provider)
          .join(', ');
        await this.updateProvisionerStatus(
          connectionRequest,
          'failed',
          'provision',
          `Provisioning failed for ${unsuccessful} provider batch${
            unsuccessful === 1 ? '' : 'es'
          }${providers ? `: ${providers}` : ''}.`
        );
      } else {
        await this.updateProvisionerStatus(
          connectionRequest,
          'provisioned',
          'provision',
          `Provisioned ${response.applied} provider batch${
            response.applied === 1 ? '' : 'es'
          } successfully.`,
          this.collectProvisionerInformation(response.results)
        );
      }
    } else if (action === 'delete') {
      const unsuccessful = response.failed + response.skipped;
      if (unsuccessful > 0) {
        const providers = response.results
          .filter((result) => result.status !== 'applied')
          .map((result) => result.provider)
          .join(', ');
        await this.updateProvisionerStatus(
          connectionRequest,
          'failed',
          'deprovision',
          `Deprovisioning failed for ${unsuccessful} provider batch${
            unsuccessful === 1 ? '' : 'es'
          }${providers ? `: ${providers}` : ''}.`
        );
      } else {
        await this.updateProvisionerStatus(
          connectionRequest,
          'deprovisioned',
          'deprovision',
          `Deprovisioned ${response.applied} provider batch${
            response.applied === 1 ? '' : 'es'
          } successfully.`
        );
      }
    }

    return response;
  }

  private async updateProvisionerStatus(
    connectionRequest: TConnectionChangeRequest,
    status: ProvisionerStatus['status'],
    operation: NonNullable<ProvisionerStatus['operation']>,
    message: string,
    information?: Record<string, unknown>
  ): Promise<void> {
    await this.services.connectionStatus.update(
      connectionRequest.clientId,
      connectionRequest.serviceId,
      status,
      operation,
      connectionRequest.operationId,
      message,
      information
    );
  }

  private collectProvisionerInformation(
    results: TResourceResult[]
  ): Record<string, unknown> {
    return results.reduce<Record<string, unknown>>((information, result) => {
      if (
        result.provider === 'info' &&
        result.status === 'applied' &&
        isRecord(result.details)
      ) {
        Object.assign(information, result.details);
      }
      return information;
    }, {});
  }

  private async updateFailedStatusAfterException(
    connectionRequest: TConnectionChangeRequest,
    action: 'apply' | 'delete'
  ): Promise<void> {
    try {
      const deprovisioning = action === 'delete';
      await this.updateProvisionerStatus(
        connectionRequest,
        'failed',
        deprovisioning ? 'deprovision' : 'provision',
        (deprovisioning ? 'Deprovisioning' : 'Provisioning') +
          ' failed unexpectedly. See provisioner logs for details.'
      );
    } catch (statusError) {
      this.logger?.error(
        { err: statusError, connectionRequest },
        'Unable to record failed provisioner status'
      );
    }
  }

  async getConnectionDefaults(
    clientId: string,
    serviceId: string,
    policyVersion: string
  ): Promise<TConnectionDefaultsResponse> {
    const subsystem =
      await this.services.sdxMember.api.getCatalogSubsystem(clientId);
    const service =
      await this.services.sdxMember.getSubsystemService(serviceId);

    const requesterDetails: PolicyRequesterDetails = {
      submissionId: '',
      requester: { name: '' },
      scopes: [],
      client: { clientId, privacyZone: subsystem.privacyZone },
      service: {
        clientId: service.subsystem.clientId,
        privacyZone: service.subsystem.privacyZone,
      },
    };

    const managedApplicationScopes =
      policyVersion === 'SDX.R1.00'
        ? managedApplicationScopesForEnvironment(
            await this.services.sdxMember.api.listCatalogScopes(),
            service.environment
          )
        : undefined;

    return this.services.policyEngine.getDefaultResources(
      policyVersion,
      subsystem,
      service,
      requesterDetails,
      managedApplicationScopes
    ) as TConnectionDefaultsResponse;
  }

  private async logActivity(
    action: 'apply' | 'delete',
    connectionRequest: TConnectionChangeRequest,
    service: any,
    results: TResourceResult[] | undefined,
    error?: unknown
  ): Promise<void> {
    this.logger?.debug('Logging activity for connection request change: %j', {
      action,
      connectionRequest,
      service,
      results,
      error,
    });
    const activity: Activity = {
      id: uuidv4(),
      type: 'ConnectionRequest',
      action: 'publish',
      result:
        error || results?.some((r) => r.status === 'failed')
          ? 'failed'
          : 'success',
      name: 'N/A',
      message: `Connection ${connectionRequest.clientId} → ${
        connectionRequest.serviceId
      } ${action === 'apply' ? 'provisioned' : 'removed'}`,
      refId: '',
      context: {
        message: 'Connection {client} → {service} {action}',
        params: {
          client: connectionRequest.clientId,
          service: connectionRequest.serviceId,
          action: action === 'apply' ? 'provisioned' : 'removed',
        },
      },
      blob: [
        {
          id: uuidv4(),
          blob: JSON.stringify({
            input: connectionRequest,
            output: results || error,
          }),
        },
      ],
      filterKey1: `org:${service.subsystem.organization?.name}`,
      filterKey2: `sdxClient:${connectionRequest.clientId}`,
      filterKey3: `sdxService:${connectionRequest.serviceId}`,
    };

    await this.services.activity.publishActivity(activity);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Connections saved with the earlier resource placement still resolve to
// the same route names and managed webhook IDs.
const LEGACY_WEBHOOK_PATTERN = 'sdx-asyncapi-webhook.r1';

function normalizeAsyncApiResources(
  connection: TConnectionChangeRequest
): TConnectionChangeRequest {
  const client = connection.clientResources?.gatewayPatterns;
  const service = connection.serviceResources?.gatewayPatterns;
  const producer = SDXAsyncPublisherPattern.ID;
  const subscriber = SDXAsyncSubscriberPattern.ID;
  const webhook = LEGACY_WEBHOOK_PATTERN;
  const oldPublisher = 'sdx-asyncapi-producer.r1';
  const oldSubscriber = 'sdx-p2p-subscriber.r1';
  const publisher =
    service?.[producer] ??
    client?.[producer] ??
    service?.[oldPublisher] ??
    client?.[oldPublisher];
  const subscription =
    client?.[subscriber] ??
    service?.[subscriber] ??
    client?.[oldSubscriber] ??
    service?.[oldSubscriber];
  if (!publisher && !subscription && !service?.[webhook]) return connection;

  const clientPatterns = { ...client };
  const servicePatterns = { ...service };
  for (const patterns of [clientPatterns, servicePatterns]) {
    delete patterns[producer];
    delete patterns[subscriber];
    delete patterns[oldPublisher];
    delete patterns[oldSubscriber];
  }
  if (publisher) servicePatterns[producer] = publisher;
  if (subscription) {
    clientPatterns[subscriber] = publisher
      ? { ...subscription, topic: publisher.topic }
      : subscription;
  }
  delete servicePatterns[webhook];
  return {
    ...connection,
    clientResources: {
      ...connection.clientResources,
      gatewayPatterns: clientPatterns,
    },
    serviceResources: {
      ...connection.serviceResources,
      gatewayPatterns: servicePatterns,
    },
  };
}
