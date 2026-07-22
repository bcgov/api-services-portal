import type { Services } from '../services/index.js';
import type {
  TConnectionChangeRequest,
  TConnectionChangeResponse,
  TResourceResult,
} from '../schemas/resources.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';
import { Activity } from '../clients/feed/types.js';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError, InternalError } from '../errors/api-errors.js';

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

    try {
      const resourceSets =
        await this.services.patternsEvaluator.buildResourcesUsingConnectionRequest(
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

        return {
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
      message: `Connection ${connectionRequest.clientId} → ${connectionRequest.serviceId} ${action === 'apply' ? 'provisioned' : 'removed'}`,
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
