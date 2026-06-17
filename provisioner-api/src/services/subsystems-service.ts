import type { FastifyBaseLogger } from 'fastify';
import type { OAuthClient } from '../clients/oauth.js';
import {
  SdxMemberApiClient,
  SubsystemEntry,
} from '../clients/sdx-member/index.js';
import { BadRequestError } from '../errors/api-errors.js';
import { TSubsystemEnvironment } from '../schemas/sdx.js';

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
              scopes: s.operations.reduce(
                (acc: { [name: string]: string }, op) => {
                  op.scopes?.forEach((scope) => {
                    acc[scope] = '';
                  });
                  return acc;
                },
                {}
              ),
              summary: s.summary || '',
            })),
        }))
        .filter((o) => o.services.length > 0);
    } else {
      throw new BadRequestError('Must provide environment query parameters');
    }
  }
}
