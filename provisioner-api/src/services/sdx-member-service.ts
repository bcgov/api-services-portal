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

/**
 * Getting subsystem details
 * and getting allowed access
 * and raising Connection Requests
 */
export class SdxMemberService {
  /** Typed client for the SDX Member API. */
  readonly api: SdxMemberApiClient;

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

      return Object.values(subsystemsMap).map((o) => ({
        id: o.clientId,
        name: o.name,
        organization: o.organization?.name || 'unknown',
        environment: environment,
        description: o.description || '',
        services: services
          .filter((s) => s.subsystem.clientId === o.clientId)
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

  /**
   * Applies a connection change (create or update) to SDX. The owning
   * organization is resolved from the service catalog using the connection's
   * `serviceId`, then forwarded to the SDX create-connection (upsert) API.
   */
  async onConnectionRequestChange(
    connection: ConnectionRequestInput,
    action: 'preview' | 'apply'
  ): Promise<BatchResult> {
    const service = await this.api.getOASService(connection.serviceId);
    const orgName = service.subsystem.organization?.name;
    if (!orgName) {
      throw new NotFoundError(
        `Organization for service '${connection.serviceId}' not found`
      );
    }

    this.logger?.debug(
      { serviceId: connection.serviceId, org: orgName },
      'SdxMemberService.onConnectionRequestChange'
    );

    // run the policy check

    // if passes, do the gateway patterns to get the resources,
    // and dispatch the resources

    return this.api.upsertConnection(orgName, connection);
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
    const allPromises = input.resourceServers.map(
      async (requestedResourceServer) => {
        const requesterDetails = {
          // submissionId,
          // requestor: accessRequest.requestor,
          // client: {
          //   integrationId: accessRequest.integrationId,
          //   clientId: accessRequest.clientId,
          //   privacyZone: accessRequest.privacyZone,
          // },
          // service: {
          //   clientId: requestedResourceServer.clientId,
          //   privacyZone: requestedResourceServer.privacyZone,
          // },
        };

        // evaluate each service in the RS
        const servicePromises = requestedResourceServer.services.map(
          async (requestedService) => {
            // check that the scopes requested are part of the OpenAPI/AsyncAPI specification
            const spec = await this.api.getOASService(requestedService.name);

            // make sure requested scopes exist in the specification for the service
            requestedService.scopes.forEach((scope) => {
              const operations = spec.operations || [];
              const scopeExists = operations.some((op) => {
                const opScopes = op.scopes || [];
                return opScopes.includes(scope);
              });
              if (!scopeExists) {
                throw new NotFoundError(
                  `Requested scope '${scope}' does not exist in the specification for service '${requestedService.name}'`
                );
              }
            });

            const serviceResources = {
              // subsystemId: spec.subsystem.clientId,
            };

            // check if there is an existing connection for this service
            const existingConnection = existingConnections.find(
              (conn) => conn.serviceId === requestedService.name
            );
            if (existingConnection) {
              // if there is an existing connection, check if the scopes have changed
              const existingScopes = (existingConnection.scopes ||
                []) as string[];

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
                this.api.upsertConnection(subsystemOrgName, {
                  ...{ clientId: '', serviceId: '' },
                  ...existingConnection,
                  isApproved: false,
                  scopes: JSON.stringify(uniqueRequestedScopes),
                  requesterDetails: JSON.stringify(requesterDetails),
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
              // if there is no existing connection, create a new one
              const result = this.api.upsertConnection(subsystemOrgName, {
                clientId: subsystem.clientId,
                serviceId: requestedService.name,
                policyVersion,
                environment: requestedResourceServer.environment,
                scopes: JSON.stringify(requestedService.scopes || []),
                requesterDetails: JSON.stringify(requesterDetails),
                clientResources: JSON.stringify({}),
                serviceResources: JSON.stringify(serviceResources),
              });

              this.logger?.debug(
                "Upserted connection for service '%s' with result: %j",
                requestedService.name,
                result
              );
              submission.results[requestedService.name] =
                'submitted approval request';
            }
          }
        );
        await Promise.all(servicePromises);
      }
    );

    await Promise.all(allPromises);

    return submission;
  }

  /**
   *
   * @param subsystemId
   * @param integrationId
   * @returns
   */
  async getIntegrationAllowedServices(
    subsystemId: string,
    integrationId: string,
    policyVersion: string
  ): Promise<TIntegrationAccessRequest[]> {
    const subsystem = await this.api.getCatalogSubsystem(subsystemId);
    if (!subsystem) {
      throw new NotFoundError(
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
            (s) => s.requesterDetails.client.integrationId === integrationId
          )
          .map((s) => ({
            integrationId,
            submissionId: s.requesterDetails.submissionId,
            resourceServers: [
              {
                id: subsystemDetail.clientId,
                name: subsystemDetail.name,
                environment: s.environment || '',
                organization: orgName,
                services: [
                  {
                    name: s.serviceId || '',
                    scopes: (s.scopes || []) as string[],
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
