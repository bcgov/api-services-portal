import type { Services } from '../services/index.js';
import type {
  TIntegrationAccessRequest,
  TNewIntegrationAccessRequest,
  TNewIntegrationAccessRequestResponse,
  TSubsystemEnvironment,
} from '../schemas/sdx.js';

export interface GetSubsystemsInput {
  subjectToken?: string;
  resourceServersOnly?: boolean;
  environment?: string;
}

export interface GetSubsystemAllowedServicesInput {
  subsystemId: string;
  integrationId?: string;
}

export interface CreateSubsystemAccessRequestInput {
  subsystemId: string;
  request: TNewIntegrationAccessRequest;
}

export class SubsystemController {
  constructor(private readonly services: Services) {}

  async getSubsystems(
    _input: GetSubsystemsInput
  ): Promise<TSubsystemEnvironment[]> {
    await this.services.sdxMember.getHello();
    return [];
  }

  async getSubsystemAllowedServices(
    _input: GetSubsystemAllowedServicesInput
  ): Promise<TIntegrationAccessRequest[]> {
    await this.services.sdxMember.getHello();
    return [];
  }

  async createSubsystemAccessRequest(
    input: CreateSubsystemAccessRequestInput
  ): Promise<TNewIntegrationAccessRequestResponse> {
    await this.services.directory.getHello();
    await this.services.sdxMember.getHello();
    await this.services.gatewayAdmin.getHello();
    await this.services.commonSso.getHello();
    return {
      submissionId: '00000000-0000-0000-0000-000000000000',
      results: { [input.subsystemId]: 'queued' },
    };
  }
}
