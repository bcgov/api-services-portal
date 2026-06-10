import type { FastifyBaseLogger } from 'fastify';
import type { OAuthClient } from '../clients/oauth.js';
import {
  SdxMemberApiClient,
  SubsystemEntry,
  type BatchResult,
  type ConnectionRequestInput,
} from '../clients/sdx-member/index.js';
import { CreateSubsystemAccessRequestInput } from '../controllers/subsystem-controller.js';
import { BadRequestError, NotFoundError } from '../errors/api-errors.js';
import {
  TIntegrationAccessRequest,
  TNewIntegrationAccessRequest,
  TNewIntegrationAccessRequestResponse,
  TSubsystemEnvironment,
} from '../schemas/sdx.js';
import { PolicyService } from './policy-service.js';
import { ResourceDispatcher } from './resource-dispatcher.js';
import { Services } from './index.js';

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
  async getSubsystems(
    environment?: string,
    resourceServersOnly?: boolean,
    subjectToken?: string
  ): Promise<TSubsystemEnvironment[]> {
    const services = await this.api.listServiceCatalog();

    if (environment && resourceServersOnly === false) {
      const records = await this.api.listCatalogSubsystems();

      return records.map((o) => ({
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
      }));
    } else if (environment && resourceServersOnly === true) {
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
    } else if (subjectToken) {
      // check subjectToken JWT is valid
      // do a search in authz for `provider_user_guid` attribute
      // matching on the `idir_user_guid` claim (or `sub` although that is ending @azureidir)
      // lookup all the resource sets that the user has access to
      // use that to get the list of organizations and from that the list of subsystems
      //
      throw new BadRequestError('Not implemented');
    } else {
      throw new BadRequestError(
        'Must provide either subjectToken or (resourceServersOnly and environment) query parameter'
      );
    }
  }
}
