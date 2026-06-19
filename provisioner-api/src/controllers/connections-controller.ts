import type { Services } from '../services/index.js';
import type {
  TConnectionChangeRequest,
  TConnectionChangeResponse,
  TResourceResult,
} from '../schemas/resources.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';
import { BadRequestError } from '../errors/api-errors.js';
import { Activity } from '../clients/feed/types.js';
import { connect } from 'http2';
import { v4 as uuidv4 } from 'uuid';

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

    const resourceSets =
      await this.services.patternsEvaluator.buildResourcesUsingConnectionRequest(
        id,
        service,
        connectionRequest
      );

    const results: TResourceResult[] = [];

    if (action === 'preview') {
      // For preview, we return the generated resources without applying them
      return {
        applied: 0,
        failed: 0,
        results,
        preview: resourceSets.flatMap((resourceSet) =>
          resourceSet.documents.map((doc) => doc)
        ),
      };
    } else {
      for (const resource of resourceSets) {
        const result = await this.services.resourceDispatcher.dispatch(
          resource._gateway_id!,
          resource.documents,
          action
        );
        results.push(...result);
      }

      if (action !== 'diff') {
        await this.logActivity(action, connectionRequest, service, results);
      }

      return {
        applied: results.filter((r) => r.status === 'applied').length,
        failed: results.filter((r) => r.status === 'failed').length,
        results,
      };
    }
  }

  private async logActivity(
    action: 'apply' | 'delete',
    connectionRequest: TConnectionChangeRequest,
    service: any,
    results: TResourceResult[]
  ): Promise<void> {
    const activity: Activity = {
      id: uuidv4(),
      type: 'ConnectionRequest',
      action: 'publish',
      result: results.some((r) => r.status === 'failed') ? 'failed' : 'success',
      name: 'N/A',
      message: `Connection ${connectionRequest.clientId} -> ${connectionRequest.serviceId} ${action === 'apply' ? 'provisioned' : 'removed'}`,
      refId: '',
      context: {
        message: 'Connection {client} -> {service} {action}',
        params: {
          client: connectionRequest.clientId,
          service: connectionRequest.serviceId,
          action: action === 'apply' ? 'provisioned' : 'removed',
        },
      },
      blob: [
        {
          id: uuidv4(),
          blob: JSON.stringify({ input: connectionRequest, output: results }),
        },
      ],
      filterKey1: `org:${service.subsystem.organization?.name}`,
      filterKey2: `sdxClient:${connectionRequest.clientId}`,
      filterKey3: `sdxService:${connectionRequest.serviceId}`,
    };

    await this.services.activity.publishActivity(activity);
  }
}
