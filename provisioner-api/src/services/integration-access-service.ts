import type { FastifyBaseLogger } from 'fastify';
import type { OAuthClient } from '../clients/oauth.js';
import {
  SdxMemberApiClient,
  SubsystemEntry,
} from '../clients/sdx-member/index.js';
import { BadRequestError, NotFoundError } from '../errors/api-errors.js';
import {
  TIntegrationAccessRequest,
  TNewIntegrationAccessRequest,
  TNewIntegrationAccessRequestResponse,
  TResourceServerAccess,
} from '../schemas/sdx.js';
import { PolicyService } from './policy-service.js';
import { EnrichedServiceCatalogEntry } from './gateway-patterns/utils.js';

/**
 * Getting subsystem details
 * and getting allowed access
 * and raising Connection Requests
 */
export class IntegrationAccessService {
  /** Typed client for the SDX Member API. */
  readonly api: SdxMemberApiClient;
  readonly policyService: PolicyService;
  //readonly resourceDispatcher: ResourceDispatcher;

  constructor(
    client: OAuthClient,
    private readonly logger?: FastifyBaseLogger
  ) {
    this.api = new SdxMemberApiClient(client, logger);
    this.policyService = new PolicyService(logger);
  }

  /**
   * Handles a new integration access request submission by creating or updating connection requests in SDX for each requested service. The method checks the requested scopes against the service specifications and updates existing connections if necessary, marking them for re-approval when scopes change.
   */
  async submitIntegrationAccessRequest(
    submissionId: string,
    subsystem: SubsystemEntry,
    integrationId: string,
    input: TNewIntegrationAccessRequest
  ): Promise<TNewIntegrationAccessRequestResponse> {
    const policyVersion = input.policyVersion || 'SDX.R1.00';

    // find the subsystem from the "integrationClientId"
    // if there is none, then put the access request on hold
    // until the subsystem has been linked

    const subsystemOrgName = subsystem.organization!.name;

    const existingConnections =
      await this.api.listConnections(subsystemOrgName);

    this.logger?.debug('Submission ID: %s', submissionId);
    this.logger?.debug('Full access request %j', input);

    const submission: TNewIntegrationAccessRequestResponse = {
      submissionId,
      results: {},
    };

    // evaluate each resource server (RS)
    const allConnectionUpserts = input.resourceServers.map(
      async (requestedResourceServer) => {
        // evaluate each service in the RS
        const servicePromises = requestedResourceServer.services.map(
          async (requestedService) => {
            // check that the scopes requested are part of the OpenAPI/AsyncAPI specification
            const spec = await this.api.getOASService(requestedService.name);

            // make sure the environments are valid
            if (spec.environment !== requestedResourceServer.environment) {
              throw new BadRequestError(
                `Requested service '${requestedService.name}' environment '${spec.environment}' does not match requested resource server environment '${requestedResourceServer.environment}'`
              );
            }
            // make sure the requested resource server id matches the service's subsystem
            if (requestedResourceServer.id !== spec.subsystem.clientId) {
              throw new BadRequestError(
                `Requested service '${requestedService.name}' belongs to subsystem '${spec.subsystem.clientId}' which does not match requested resource server id '${requestedResourceServer.id}'`
              );
            }

            const requesterDetails = {
              submissionId,
              requester: {
                name: input.requester,
              },
              scopes: requestedService.scopes,
              client: {
                integrationId: integrationId,
                clientId: input.clientId,
                privacyZone: input.privacyZone,
              },
              service: {
                clientId: spec.subsystem.clientId,
                privacyZone: spec.subsystem.privacyZone,
              },
            };
            // make sure requested scopes exist in the specification for the service
            requestedService.scopes.forEach((scope) => {
              const operations = spec.operations || [];
              const scopeExists = operations.some((op) => {
                const opScopes = op.scopes || [];
                return opScopes.some((s: { name: string }) => s.name === scope);
              });
              if (!scopeExists) {
                throw new BadRequestError(
                  `Requested scope '${scope}' does not exist in the specification for service '${requestedService.name}'`
                );
              }
            });

            const { clientResources, serviceResources } =
              this.policyService.getDefaultResources(
                policyVersion,
                subsystem,
                spec,
                requesterDetails
              );

            // check if there is an existing connection for this service
            const existingConnection = existingConnections.find(
              (conn) => conn.serviceId === requestedService.name
            );
            if (existingConnection) {
              // if there is an existing connection, check if the scopes have changed
              const existingScopes = (existingConnection.requesterDetails
                ?.scopes || []) as string[];

              const requestedScopes = requestedService.scopes || [];

              // check if the two arrays are different (ignoring order  and duplicates)
              const uniqueExistingScopes: string[] = Array.from(
                new Set(existingScopes)
              );
              const uniqueRequestedScopes: string[] = Array.from(
                new Set(requestedScopes)
              );

              const scopesHaveChanged =
                uniqueExistingScopes.length !== uniqueRequestedScopes.length ||
                uniqueExistingScopes.some(
                  (scope: string) => !uniqueRequestedScopes.includes(scope)
                );
              if (scopesHaveChanged) {
                // if scopes have changed, mark the existing request as 'isApproved=false' and update its
                // scopes and requesterDetails
                requesterDetails.scopes = uniqueRequestedScopes;

                this.api.upsertConnection(subsystemOrgName, {
                  ...{
                    clientId: '',
                    serviceId: '',
                    clientResources,
                    serviceResources,
                  },
                  ...existingConnection,
                  isApproved: false,
                  requesterDetails,
                });

                submission.results[requestedService.name] =
                  'updated scopes, submitted for re-approval';
              } else {
                // if scopes have not changed, do nothing
                if (existingConnection.isApproved) {
                  submission.results[requestedService.name] =
                    'already approved';
                } else {
                  submission.results[requestedService.name] =
                    'pending approval';
                }
              }
            } else {
              this.logger?.debug('Version = %s', policyVersion);
              // if there is no existing connection, create a new one
              const result = await this.api.upsertConnection(subsystemOrgName, {
                clientId: subsystem.clientId,
                serviceId: requestedService.name,
                policyVersion,
                environment: requestedResourceServer.environment,
                requesterDetails,
                clientResources,
                serviceResources,
              });

              this.logger?.debug(
                "Upserted connection for service '%s' with result: %j",
                requestedService.name,
                result
              );
              submission.results[requestedService.name] =
                'submitted approval request';
              return result;
            }
          }
        );
        return await Promise.all(servicePromises);
      }
    );

    const outcomes = await Promise.all(allConnectionUpserts);
    this.logger?.debug(
      { outcomes },
      'All connection upserts completed with outcomes'
    );

    return submission;
  }

  /**
   *
   * @param integrationId
   * @param environment
   * @returns
   */
  async buildIntegrationAllowedServices(
    integrationId: string,
    environment: string,
    status: 'approved' | 'pending'
  ): Promise<TIntegrationAccessRequest> {
    // query the subsystem by an integrationClientId
    //
    const subsystems = await this.api.listCatalogSubsystems({
      integrationClientId: integrationId,
    });
    if (!subsystems || subsystems.length === 0) {
      throw new BadRequestError(
        `Subsystem with integration ${integrationId} not found`
      );
    }

    // there will always be at most one
    const subsystem = subsystems.pop();
    if (!subsystem) {
      throw new BadRequestError(
        `Subsystem with integration ${integrationId} not found`
      );
    }

    this.logger?.debug(
      'Matched %s to subsystem = %s, org = %s',
      integrationId,
      subsystem.clientId,
      subsystem.organization?.name
    );

    // get all the approved connection requests for the subsystem client ID
    // and only the connections that match the particular policy version
    const connections = await this.api.listConnections(
      subsystem.organization?.name!
    );
    this.logger?.debug('Connections = %j', connections);

    // get the clientId from the allowed connections
    const clientId = connections.find(
      (c) => c.requesterDetails.client?.clientId
    )?.requesterDetails.client?.clientId;
    if (!clientId) {
      throw new NotFoundError(
        `No connections found for integration ${integrationId} in environment ${environment}`
      );
    }

    const allowedConnections = connections.filter(
      (c) =>
        c.clientId === subsystem.clientId &&
        c.environment === environment &&
        c.requesterDetails.client?.integrationId === integrationId &&
        c.isApproved === (status === 'approved')
    );

    this.logger?.debug('connections allowed %j', allowedConnections);

    // group by the s.serviceResources.subsystemId
    // and then for each subsystem, popupate the resourceServer object
    const servicesBySubsystem: Record<
      string,
      { connections: typeof allowedConnections }
    > = {};
    for (const s of allowedConnections) {
      const service = (await this.api.getOASService(
        s.serviceId!
      )) as EnrichedServiceCatalogEntry;

      const subsystemId = service.subsystem.clientId;
      if (!servicesBySubsystem[subsystemId]) {
        servicesBySubsystem[subsystemId] = {
          connections: [],
        };
      }
      servicesBySubsystem[subsystemId].connections.push(s);
    }

    this.logger?.debug('servicesBySubsystem %j', servicesBySubsystem);

    // find the submissionId
    const submissionId =
      allowedConnections[0]?.requesterDetails.submissionId || 'unknown';

    // for each subsystem, lookup the subsystem details from the catalog to get the organization name
    // and then construct the TIntegrationAccessRequest object

    const resourceServers: TResourceServerAccess[] = [];
    for (const [subsystemId, { connections: services }] of Object.entries(
      servicesBySubsystem
    )) {
      resourceServers.push({
        id: subsystemId,
        environment: environment,
        services: services.map((s) => ({
          name: s.serviceId!,
          scopes: (s.requesterDetails?.scopes || []) as string[],
        })),
      });
    }

    this.logger?.debug(
      { resourceServers },
      'Built resource servers for integration %s',
      integrationId
    );

    return {
      clientId: clientId,
      submissionId: submissionId,
      resourceServers: resourceServers,
    };
  }
}
