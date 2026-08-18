import type { Services } from '../services/index.js';
import type {
  TIntegrationAccessRequest,
  TNewIntegrationAccessRequest,
  TNewIntegrationAccessRequestResponse,
} from '../schemas/sdx.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';
import { Activity } from '../clients/feed/index.js';
import { v4 as uuidv4 } from 'uuid';
import { SubsystemEntry } from '../clients/sdx-member/index.js';

export interface CreateIntegrationAccessRequestInput {
  integrationId: string;
  request: TNewIntegrationAccessRequest;
}

export interface GetSubsystemAllowedServicesInput {
  integrationClientId: string;
  environment: string;
  status: 'approved' | 'pending';
}

export class IntegrationController {
  constructor(
    private readonly services: Services,
    private readonly logger?: FastifyBaseLogger
  ) {}

  async getIntegrationAllowedServices(
    input: GetSubsystemAllowedServicesInput
  ): Promise<TIntegrationAccessRequest> {
    return this.services.integrationAccess.buildIntegrationAllowedServices(
      input.integrationClientId,
      input.environment,
      input.status
    );
  }

  async createIntegrationAccessRequest(
    input: CreateIntegrationAccessRequestInput
  ): Promise<TNewIntegrationAccessRequestResponse> {
    // get submissionId from the http request header "X-Request-ID" or generate a new one if not present
    const submissionId = `submission-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    const subsystem =
      await this.services.sdxMember.getSubsystemByIntegrationClientId(
        input.integrationId
      );

    try {
      const result =
        await this.services.integrationAccess.submitIntegrationAccessRequest(
          submissionId,
          subsystem,
          input.integrationId,
          input.request
        );
      await this.logActivity(input, subsystem, result);
      return result;
    } catch (err) {
      await this.logActivity(input, subsystem, undefined, err);
      throw err;
    }
  }

  private async logActivity(
    request: CreateIntegrationAccessRequestInput,
    clientSubsystem: SubsystemEntry,
    result: TNewIntegrationAccessRequestResponse | undefined,
    error?: unknown
  ): Promise<void> {
    const activity: Activity = {
      id: uuidv4(),
      type: 'IntegrationAccessRequest',
      action: 'update',
      result: error ? 'failed' : 'success',
      name: 'N/A',
      message: `Integration access request for  ${request.integrationId} submitted`,
      refId: '',
      context: {
        message: 'Integration access request for {client} {action}',
        params: {
          client: request.integrationId,
          action: 'submitted',
        },
      },
      blob: [
        {
          id: uuidv4(),
          blob: JSON.stringify({ input: request, output: result || error }),
        },
      ],
      filterKey1: `org:${clientSubsystem.organization?.name}`,
      filterKey2: `sdxClient:${clientSubsystem.clientId}`,
    };

    await this.services.activity.publishActivity(activity);
  }
}
