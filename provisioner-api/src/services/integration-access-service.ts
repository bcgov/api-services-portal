import type { FastifyBaseLogger } from 'fastify';
import type { OAuthClient } from '../clients/oauth.js';
import { SdxMemberApiClient } from '../clients/sdx-member/index.js';
import { BadRequestError, NotFoundError } from '../errors/api-errors.js';
import {
  TIntegrationAccessRequest,
  TNewIntegrationAccessRequest,
  TNewIntegrationAccessRequestResponse,
} from '../schemas/sdx.js';
import { PolicyService } from './policy-service.js';

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
    subsystemId: string,
    input: TNewIntegrationAccessRequest
  ): Promise<TNewIntegrationAccessRequestResponse> {
    const policyVersion = 'SDX.R0.00';

    const subsystem = await this.api.getCatalogSubsystem(subsystemId);
    if (!subsystem) {
      throw new NotFoundError(
        `Subsystem with clientId ${subsystemId} not found`
      );
    }

    if (subsystem.organization === undefined) {
      throw new NotFoundError(
        `Organization for subsystem with clientId ${subsystemId} not found`
      );
    }

    const subsystemOrgName = subsystem.organization.name;

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
            const requesterDetails = {
              submissionId,
              requester: input.requester,
              scopes: requestedService.scopes,
              client: {
                integrationId: input.integrationId,
                clientId: input.clientId,
                privacyZone: input.privacyZone,
              },
              service: {
                clientId: requestedResourceServer.clientId,
                privacyZone: requestedResourceServer.privacyZone,
              },
            };

            // check that the scopes requested are part of the OpenAPI/AsyncAPI specification
            const spec = await this.api.getOASService(requestedService.name);

            // make sure the environments are valid
            if (spec.environment !== requestedResourceServer.environment) {
              throw new BadRequestError(
                `Requested service '${requestedService.name}' environment '${spec.environment}' does not match requested resource server environment '${requestedResourceServer.environment}'`
              );
            }
            // make sure requested scopes exist in the specification for the service
            requestedService.scopes.forEach((scope) => {
              const operations = spec.operations || [];
              const scopeExists = operations.some((op) => {
                const opScopes = op.scopes || [];
                return opScopes.includes(scope);
              });
              if (!scopeExists) {
                throw new BadRequestError(
                  `Requested scope '${scope}' does not exist in the specification for service '${requestedService.name}'`
                );
              }
            });

            const serviceResources = {
              subsystemId: spec.subsystem.clientId,
              gatewayResources: {},
            };

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
                    clientResources: {},
                    serviceResources: {},
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
                requesterDetails: requesterDetails,
                clientResources: {},
                serviceResources: serviceResources,
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

    return submission;
  }

  /**
   *
   * @param subsystemId
   * @param integrationId
   * @returns
   */
  async buildIntegrationAllowedServices(
    subsystemId: string,
    policyVersion: string,
    integrationId?: string
  ): Promise<TIntegrationAccessRequest[]> {
    const subsystem = await this.api.getCatalogSubsystem(subsystemId);
    if (!subsystem) {
      throw new BadRequestError(
        `Subsystem with clientId ${subsystemId} not found`
      );
    }

    // get all the approved connection requests for the subsystem client ID
    // and only the connections that match the particular policy version
    const connections = await this.api.listConnections(
      subsystem.organization?.name || ''
    );
    const allowedServices = connections.filter(
      (c) =>
        c.isApproved &&
        c.clientId === subsystem.clientId &&
        c.policyVersion === policyVersion
    );

    this.logger?.debug('connection allowed %j', allowedServices);

    // group by the s.serviceResources.subsystemId
    // and then for each subsystem, popupate the resourceServer object
    const servicesBySubsystem: Record<string, typeof allowedServices> = {};
    allowedServices.forEach((s) => {
      const subsystemId = s.serviceResources.subsystemId;
      if (!servicesBySubsystem[subsystemId]) {
        servicesBySubsystem[subsystemId] = [];
      }
      servicesBySubsystem[subsystemId].push(s);
    });

    this.logger?.debug('servicesBySubsystem %j', servicesBySubsystem);

    // for each subsystem, lookup the subsystem details from the catalog to get the organization name
    // and then construct the TIntegrationAccessRequest object
    const integrationAllowedServices: TIntegrationAccessRequest[] = [];
    for (const [subsystemId, services] of Object.entries(servicesBySubsystem)) {
      const subsystemDetail = await this.api.getCatalogSubsystem(subsystemId);
      if (!subsystemDetail) {
        this.logger?.warn(
          `Subsystem detail not found for subsystemId ${subsystemId}`
        );
        continue;
      }
      const orgName = subsystemDetail.organization?.name || 'unknown';

      integrationAllowedServices.push(
        ...services
          .filter(
            (s) =>
              integrationId === undefined ||
              s.requesterDetails.client.integrationId === integrationId
          )
          .map((s) => ({
            integrationId: s.requesterDetails.client.integrationId,
            submissionId: s.requesterDetails.submissionId,
            resourceServers: [
              {
                id: subsystemDetail.clientId,
                name: subsystemDetail.name,
                environment: s.environment!,
                organization: orgName,
                services: [
                  {
                    name: s.serviceId!,
                    scopes: (s.requesterDetails?.scopes || []) as string[],
                  },
                ],
              },
            ],
          }))
      );
    }

    return integrationAllowedServices;
  }
}
