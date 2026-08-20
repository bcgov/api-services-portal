import type { FastifyBaseLogger } from 'fastify';
import type { OAuthClient } from '../clients/oauth.js';
import {
  SdxMemberApiClient,
  ServiceCatalogEntry,
  SubsystemEntry,
} from '../clients/sdx-member/index.js';
import { BadRequestError, NotFoundError } from '../errors/api-errors.js';
import {
  TIntegrationAccessRequest,
  TIntegrationStatus,
  TSubsystemEnvironment,
} from '../schemas/sdx.js';

/**
 * Getting subsystem details
 * and getting allowed access
 * and raising Connection Requests
 */
export class SdxMemberService {
  /** Typed client for the SDX Member API. */
  readonly api: SdxMemberApiClient;
  //readonly policyService: PolicyService;
  //readonly resourceDispatcher: ResourceDispatcher;

  constructor(
    client: OAuthClient,
    private readonly logger?: FastifyBaseLogger
  ) {
    this.api = new SdxMemberApiClient(client, logger);
  }

  async getSubsystemByIntegrationClientId(
    integrationClientId: string
  ): Promise<SubsystemEntry> {
    const subsystems = await this.api.listCatalogSubsystems({
      integrationClientId,
    });
    if (!subsystems || subsystems.length === 0) {
      throw new NotFoundError(
        `Subsystem with clientId ${integrationClientId} not found`
      );
    }

    const subsystem = subsystems[0];

    if (subsystem.organization === undefined) {
      throw new NotFoundError(
        `Organization for subsystem with clientId ${integrationClientId} not found`
      );
    }
    return subsystem;
  }

  /**
   * Reports whether an integration client is registered as an SDX
   * subsystem, and its attributes if so.
   *
   * @param integrationClientId
   * @returns TIntegrationStatus
   */
  async getIntegrationStatus(
    integrationClientId: string
  ): Promise<TIntegrationStatus> {
    const subsystems = await this.api.listCatalogSubsystems({
      integrationClientId,
    });

    if (!subsystems || subsystems.length === 0) {
      return { status: 'unregistered' };
    }

    const subsystem = subsystems[0];

    return {
      status: 'registered',
      id: subsystem.clientId,
      name: subsystem.name,
      organization: subsystem.organization?.name || 'unknown',
      description: subsystem.description || '',
    };
  }

  /**
   *
   * @param environment
   * @param resourceServersOnly
   * @param subjectToken
   * @returns TSubsystemEnvironment[]
   */
  async getSubsystems(environment?: string): Promise<TSubsystemEnvironment[]> {
    const services = await this.api.listServiceCatalog();

    if (environment) {
      // get unique subsystem entries from the catalog
      const subsystemsMap: Record<string, SubsystemEntry> = {};
      services.forEach((r) => {
        if (!subsystemsMap[r.subsystem.clientId]) {
          subsystemsMap[r.subsystem.clientId] = r.subsystem;
        }
      });

      return Object.values(subsystemsMap)
        .map((o) => ({
          id: o.clientId,
          name: o.name,
          organization: o.organization?.name || 'unknown',
          environment: environment,
          description: o.description || '',
          services: services
            .filter((s) => s.subsystem.clientId === o.clientId)
            .filter((s) => s.environment === environment)
            .map((s) => ({
              name: s.name,
              title: s.title,
              version: s.version,
              scopes: Array.from(
                s.operations
                  .reduce((acc: Map<string, string>, op) => {
                    op.scopes?.forEach((scope) => {
                      acc.set(scope.name, scope.description || '');
                    });
                    return acc;
                  }, new Map<string, string>())
                  .entries()
              ).map(([label, description]) => ({ label, description })),
              summary: s.summary || '',
            })),
        }))
        .filter((o) => o.services.length > 0);
    } else {
      throw new BadRequestError('Must provide environment query parameters');
    }
  }

  /**
   *
   * @param serviceId
   * @returns ServiceCatalogEntry
   */
  async getSubsystemService(serviceId: string): Promise<ServiceCatalogEntry> {
    const service = await this.api.getOASService(serviceId);
    const orgName = service.subsystem.organization?.name;
    if (!orgName) {
      throw new NotFoundError(
        `Organization for service '${serviceId}' not found`
      );
    }
    return service;
  }
}
