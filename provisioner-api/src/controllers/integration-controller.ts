import type { Services } from '../services/index.js';
import type {
  TIntegrationAccessRequest,
  TIntegrationStatus,
  TNewIntegrationAccessRequest,
  TNewIntegrationAccessRequestResponse,
} from '../schemas/sdx.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';
import { Activity } from '../clients/feed/index.js';
import { v4 as uuidv4 } from 'uuid';
import { SubsystemEntry } from '../clients/sdx-member/index.js';
import { subsystemWithOrganization } from '../services/subsystems-service.js';

export interface CreateIntegrationAccessRequestInput {
  integrationId: string;
  request: TNewIntegrationAccessRequest;
}

export interface GetSubsystemAllowedServicesInput {
  integrationClientId: string;
  environment: string;
  status: 'approved' | 'pending';
}

export interface GetIntegrationStatusInput {
  integrationId: string;
}

export class IntegrationController {
  constructor(
    private readonly services: Services,
    private readonly logger?: FastifyBaseLogger
  ) {}

  async getIntegrationStatus(
    input: GetIntegrationStatusInput
  ): Promise<TIntegrationStatus> {
    return this.services.sdxMember.getIntegrationStatus(input.integrationId);
  }

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
    let outcome: 'failed' | 'held for onboarding' | 'processed' = 'failed';
    try {
      const registered =
        await this.services.sdxMember.findSubsystemByIntegrationClientId(
          input.integrationId
        );

      if (!registered) {
        const result = await this.services.cssOnboarding.hold(
          input.integrationId,
          submissionId,
          input.request
        );
        outcome = 'held for onboarding';
        return result;
      }

      const subsystem = subsystemWithOrganization(
        registered,
        input.integrationId
      );

      let result: TNewIntegrationAccessRequestResponse;
      try {
        result =
          await this.services.integrationAccess.submitIntegrationAccessRequest(
            submissionId,
            subsystem,
            input.integrationId,
            input.request
          );
      } catch (err) {
        await this.logActivity(input, subsystem, undefined, err);
        throw err;
      }

      outcome = 'processed';
      await this.logActivity(input, subsystem, result);
      return result;
    } finally {
      await this.logPersonalActivity(input, submissionId, outcome);
    }
  }

  async completeIntegrationOnboarding(input: {
    integrationId: string;
  }): Promise<TNewIntegrationAccessRequestResponse> {
    const outcome = await this.services.cssOnboarding.complete(
      input.integrationId
    );
    if (outcome.replayed && outcome.subsystem) {
      try {
        await this.logActivity(
          { integrationId: input.integrationId, request: outcome.request },
          outcome.subsystem,
          outcome.response
        );
      } catch (err) {
        this.logger?.error(
          { err, integrationId: input.integrationId },
          'Failed to log replayed integration access request'
        );
      }
    }
    return outcome.response;
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

  private async logPersonalActivity(
    input: CreateIntegrationAccessRequestInput,
    submissionId: string,
    outcome: 'failed' | 'held for onboarding' | 'processed'
  ): Promise<void> {
    const email = input.request.requester.email.trim().toLowerCase();
    await this.services.activity.publishActivity({
      id: uuidv4(),
      type: 'IntegrationAccessRequest',
      action: 'create',
      result: outcome === 'failed' ? 'failed' : 'success',
      name: 'Integration access request',
      message: `Integration access request for ${input.integrationId} ${outcome}`,
      refId: submissionId,
      context: {
        message: 'Integration access request for {client} {action}',
        params: {
          client: input.integrationId,
          action: outcome,
          submissionId,
        },
      },
      filterKey1: `personal:${email}`,
    });
  }
}
