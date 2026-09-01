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
        'Provisioning started.'
      );
    }

    let response: TConnectionChangeResponse;
    try {
      const resourceSets = await this.services.patternsEvaluator.buildResourcesUsingConnectionRequest(
        id,
        action,
        service,
        connectionRequest
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
        for (const resource of resourceSets) {
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
        if (action === 'apply') {
          await this.updateFailedStatusAfterException(connectionRequest);
        }
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
          `Provisioning failed for ${unsuccessful} provider batch${
            unsuccessful === 1 ? '' : 'es'
          }${providers ? `: ${providers}` : ''}.`
        );
      } else {
        await this.updateProvisionerStatus(
          connectionRequest,
          'provisioned',
          `Provisioned ${response.applied} provider batch${
            response.applied === 1 ? '' : 'es'
          } successfully.`,
          this.collectProvisionerInformation(response.results)
        );
      }
    }

    return response;
  }

  private async updateProvisionerStatus(
    connectionRequest: TConnectionChangeRequest,
    status: ProvisionerStatus['status'],
    message: string,
    information?: Record<string, unknown>
  ): Promise<void> {
    await this.services.connectionStatus.update(
      connectionRequest.clientId,
      connectionRequest.serviceId,
      status,
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
    connectionRequest: TConnectionChangeRequest
  ): Promise<void> {
    try {
      await this.updateProvisionerStatus(
        connectionRequest,
        'failed',
        'Provisioning failed unexpectedly. See provisioner logs for details.'
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

    return this.services.policyEngine.getDefaultResources(
      policyVersion,
      subsystem,
      service,
      requesterDetails
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
