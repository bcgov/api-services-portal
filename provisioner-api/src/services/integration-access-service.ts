import type { FastifyBaseLogger } from 'fastify';
import type { OAuthClient } from '../clients/oauth.js';
import {
  SdxMemberApiClient,
  type ConnectionRequest,
  type ServiceCatalogEntry,
  type SubsystemEntry,
} from '../clients/sdx-member/index.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../errors/api-errors.js';
import {
  type TIntegrationAccessRequest,
  type TNewIntegrationAccessRequest,
  type TNewIntegrationAccessRequestResponse,
  type TResourceServerAccess,
} from '../schemas/sdx.js';
import {
  PolicyService,
  type PolicyDefaultResources,
  type PolicyRequesterDetails,
} from './policy-service.js';

interface NormalizedServiceRequest {
  environment: string;
  name: string;
  providerId: string;
  scopes: string[];
}

interface PreparedServiceRequest extends NormalizedServiceRequest {
  defaults: PolicyDefaultResources;
  requesterDetails: PolicyRequesterDetails;
  service: ServiceCatalogEntry;
}

type PlannedConnectionChange =
  | {
      kind: 'create';
      request: PreparedServiceRequest;
      result: 'submitted approval request';
    }
  | {
      kind: 'update';
      connection: ConnectionRequest;
      request: PreparedServiceRequest;
      serviceOrgName: string;
      result: 'updated scopes, submitted for re-approval';
    }
  | {
      kind: 'unchanged';
      request: PreparedServiceRequest;
      result: 'already approved' | 'pending approval';
    };

/**
 * Gets subsystem details, builds allowed access, and raises connection requests.
 */
export class IntegrationAccessService {
  /** Typed client for the SDX Member API. */
  readonly api: SdxMemberApiClient;
  readonly policyService: PolicyService;

  constructor(
    client: OAuthClient,
    private readonly logger?: FastifyBaseLogger
  ) {
    this.api = new SdxMemberApiClient(client, logger);
    this.policyService = new PolicyService(logger);
  }

  /**
   * Validates a complete integration access submission before changing any
   * connections, then creates or updates each requested subsystem-to-service
   * connection. Duplicate service entries are merged and their scopes are
   * de-duplicated.
   */
  async submitIntegrationAccessRequest(
    submissionId: string,
    subsystem: SubsystemEntry,
    integrationId: string,
    input: TNewIntegrationAccessRequest
  ): Promise<TNewIntegrationAccessRequestResponse> {
    const normalizedSubmissionId = requireNonBlank(
      submissionId,
      'Submission ID'
    );
    const normalizedIntegrationId = requireNonBlank(
      integrationId,
      'Integration ID'
    );
    const oauthClientId = requireNonBlank(input.clientId, 'OAuth client ID');
    const policyVersion =
      input.policyVersion === undefined
        ? 'SDX.R1.00'
        : requireNonBlank(input.policyVersion, 'Policy version');
    const subsystemOrgName = requireNonBlank(
      subsystem.organization?.name,
      `Organization for subsystem '${subsystem.clientId}'`
    );

    if (!this.policyService.supportsPolicyVersion(policyVersion)) {
      throw new BadRequestError(
        `Policy ${policyVersion} not found in registry`
      );
    }

    this.logger?.debug('Submission ID: %s', normalizedSubmissionId);
    this.logger?.debug('Full access request %j', input);

    // All catalog and policy validation completes before the first write. This
    // prevents a bad service later in the request from leaving earlier services
    // partially submitted.
    const normalizedRequests = normalizeRequestedServices(input);
    const preparedRequests: PreparedServiceRequest[] = [];
    const services = new Map<string, ServiceCatalogEntry>();

    for (const requested of normalizedRequests) {
      let service = services.get(requested.name);
      if (!service) {
        service = await this.api.getOASService(requested.name);
        services.set(requested.name, service);
      }

      validateRequestedService(requested, service);

      const requesterDetails: PolicyRequesterDetails = {
        submissionId: normalizedSubmissionId,
        requester: {
          name: input.requester.displayName,
          email: input.requester.email,
        },
        scopes: requested.scopes,
        client: {
          integrationId: normalizedIntegrationId,
          clientId: oauthClientId,
          privacyZone: input.privacyZone,
        },
        service: {
          clientId: service.subsystem.clientId,
          privacyZone: service.subsystem.privacyZone,
        },
      };

      preparedRequests.push({
        ...requested,
        service,
        requesterDetails,
        defaults: this.policyService.getDefaultResources(
          policyVersion,
          subsystem,
          service,
          requesterDetails
        ),
      });
    }

    const existingConnections =
      await this.api.listConnections(subsystemOrgName);
    const changes = preparedRequests.map((request) =>
      planConnectionChange(
        existingConnections,
        subsystem,
        normalizedIntegrationId,
        oauthClientId,
        policyVersion,
        request
      )
    );

    const submission: TNewIntegrationAccessRequestResponse = {
      submissionId: normalizedSubmissionId,
      results: {},
    };
    const outcomes: unknown[] = [];

    // Requests are prepared in a stable order, so both write order and response
    // property order are deterministic.
    for (const change of changes) {
      const { request } = change;
      if (change.kind === 'create') {
        const outcome = await this.api.upsertConnection(subsystemOrgName, {
          clientId: subsystem.clientId,
          serviceId: request.name,
          policyVersion,
          environment: request.environment,
          requesterDetails: request.requesterDetails,
          clientResources: request.defaults.clientResources,
          serviceResources: request.defaults.serviceResources,
        });
        outcomes.push(outcome);
      } else if (change.kind === 'update') {
        const outcome = await this.api.upsertConnection(change.serviceOrgName, {
          clientId: change.connection.clientId!,
          serviceId: change.connection.serviceId!,
          isApproved: false,
          requesterDetails: request.requesterDetails,
        });
        outcomes.push(outcome);
      }

      submission.results[request.name] = change.result;
    }

    this.logger?.debug(
      { outcomes },
      'All connection upserts completed with outcomes'
    );

    return submission;
  }

  /**
   * Builds the allowed-services callback for one integration and environment.
   */
  async buildIntegrationAllowedServices(
    integrationId: string,
    environment: string,
    status: 'approved' | 'pending'
  ): Promise<TIntegrationAccessRequest> {
    const normalizedIntegrationId = requireNonBlank(
      integrationId,
      'Integration ID'
    );
    const normalizedEnvironment = requireNonBlank(environment, 'Environment');

    const subsystems = await this.api.listCatalogSubsystems({
      integrationClientId: normalizedIntegrationId,
    });
    if (!subsystems || subsystems.length === 0) {
      throw new BadRequestError(
        `Subsystem with integration ${normalizedIntegrationId} not found`
      );
    }
    if (subsystems.length > 1) {
      throw new ConflictError(
        `Integration ${normalizedIntegrationId} resolves to more than one subsystem`
      );
    }

    const subsystem = subsystems[0];
    const subsystemOrgName = requireNonBlank(
      subsystem.organization?.name,
      `Organization for subsystem '${subsystem.clientId}'`
    );

    this.logger?.debug(
      'Matched %s to subsystem = %s, org = %s',
      normalizedIntegrationId,
      subsystem.clientId,
      subsystemOrgName
    );

    const connections = await this.api.listConnections(subsystemOrgName);
    this.logger?.debug('Connections = %j', connections);

    // Filter to the exact integration and environment before deriving any
    // client or submission metadata. The member API does not guarantee order.
    const allowedConnections = connections
      .filter(
        (connection) =>
          connection.clientId === subsystem.clientId &&
          connection.environment === normalizedEnvironment &&
          connection.requesterDetails?.client?.integrationId ===
            normalizedIntegrationId &&
          connection.isApproved === (status === 'approved')
      )
      .sort(compareConnections);

    if (allowedConnections.length === 0) {
      throw new NotFoundError(
        `No ${status} connections found for integration ${normalizedIntegrationId} in environment ${normalizedEnvironment}`
      );
    }

    this.logger?.debug('Connections allowed %j', allowedConnections);

    const clientIds = uniqueSorted(
      allowedConnections.map((connection) => {
        const clientId = connection.requesterDetails?.client?.clientId;
        if (typeof clientId !== 'string' || clientId.trim().length === 0) {
          throw new ConflictError(
            `Connection '${connection.serviceId}' does not identify an OAuth client`
          );
        }
        return clientId.trim();
      })
    );
    if (clientIds.length !== 1) {
      throw new ConflictError(
        `Integration ${normalizedIntegrationId} has connections for more than one OAuth client in environment ${normalizedEnvironment}`
      );
    }

    const submissionIds = uniqueSorted(
      allowedConnections
        .map((connection) => connection.requesterDetails?.submissionId)
        .filter(
          (submissionId): submissionId is string =>
            typeof submissionId === 'string' && submissionId.trim().length > 0
        )
        .map((submissionId) => submissionId.trim())
    );
    // Generated submission IDs contain their creation timestamp, so the
    // lexicographically greatest matching ID is the most recent. Keep the
    // legacy fallback for records created before submission IDs were stored.
    const submissionId = submissionIds.at(-1) || 'unknown';

    const servicesBySubsystem = new Map<
      string,
      Map<string, { name: string; scopes: string[] }>
    >();

    for (const connection of allowedConnections) {
      const serviceId = requireNonBlank(
        connection.serviceId,
        'Connection service ID'
      );
      const service = await this.api.getOASService(serviceId);
      if (service.name !== serviceId) {
        throw new BadRequestError(
          `Catalog lookup for service '${serviceId}' returned '${service.name}'`
        );
      }
      if (service.environment !== normalizedEnvironment) {
        throw new BadRequestError(
          `Connection service '${serviceId}' environment '${service.environment}' does not match requested environment '${normalizedEnvironment}'`
        );
      }

      const subsystemId = requireNonBlank(
        service.subsystem.clientId,
        `Provider subsystem for service '${serviceId}'`
      );
      let subsystemServices = servicesBySubsystem.get(subsystemId);
      if (!subsystemServices) {
        subsystemServices = new Map();
        servicesBySubsystem.set(subsystemId, subsystemServices);
      }

      const scopes = normalizeStoredScopes(connection, serviceId);
      const existingService = subsystemServices.get(serviceId);
      subsystemServices.set(serviceId, {
        name: serviceId,
        scopes: uniqueSorted([...(existingService?.scopes || []), ...scopes]),
      });
    }

    const resourceServers: TResourceServerAccess[] = Array.from(
      servicesBySubsystem.entries()
    )
      .sort(([left], [right]) => compareStrings(left, right))
      .map(([id, services]) => ({
        id,
        environment: normalizedEnvironment,
        services: Array.from(services.values()).sort((left, right) =>
          compareStrings(left.name, right.name)
        ),
      }));

    this.logger?.debug(
      { resourceServers },
      'Built resource servers for integration %s',
      normalizedIntegrationId
    );

    return {
      integrationId: normalizedIntegrationId,
      clientId: clientIds[0],
      submissionId,
      resourceServers,
    };
  }
}

function normalizeRequestedServices(
  input: TNewIntegrationAccessRequest
): NormalizedServiceRequest[] {
  const requests = new Map<string, NormalizedServiceRequest>();

  for (const resourceServer of input.resourceServers) {
    const providerId = requireNonBlank(resourceServer.id, 'Resource server ID');
    const environment = requireNonBlank(
      resourceServer.environment,
      `Environment for resource server '${providerId}'`
    );

    for (const requestedService of resourceServer.services) {
      const name = requireNonBlank(requestedService.name, 'Service name');
      const scopes = normalizeRequestedScopes(requestedService.scopes, name);
      const key = `${providerId}\u0000${environment}\u0000${name}`;
      const existing = requests.get(key);

      if (existing) {
        existing.scopes = uniqueSorted([...existing.scopes, ...scopes]);
      } else {
        requests.set(key, { providerId, environment, name, scopes });
      }
    }
  }

  return Array.from(requests.values()).sort((left, right) =>
    compareStrings(
      `${left.environment}\u0000${left.providerId}\u0000${left.name}`,
      `${right.environment}\u0000${right.providerId}\u0000${right.name}`
    )
  );
}

function validateRequestedService(
  requested: NormalizedServiceRequest,
  service: ServiceCatalogEntry
): void {
  if (service.name !== requested.name) {
    throw new BadRequestError(
      `Catalog lookup for service '${requested.name}' returned '${service.name}'`
    );
  }
  if (service.environment !== requested.environment) {
    throw new BadRequestError(
      `Requested service '${requested.name}' environment '${service.environment}' does not match requested resource server environment '${requested.environment}'`
    );
  }
  if (service.subsystem.clientId !== requested.providerId) {
    throw new BadRequestError(
      `Requested service '${requested.name}' belongs to subsystem '${service.subsystem.clientId}' which does not match requested resource server id '${requested.providerId}'`
    );
  }

  const declaredScopes = new Set(
    (service.operations || []).flatMap((operation) =>
      (operation.scopes || []).map((scope) => scope.name)
    )
  );
  for (const scope of requested.scopes) {
    if (!declaredScopes.has(scope)) {
      throw new BadRequestError(
        `Requested scope '${scope}' does not exist in the specification for service '${requested.name}'`
      );
    }
  }
}

function planConnectionChange(
  existingConnections: ConnectionRequest[],
  subsystem: SubsystemEntry,
  integrationId: string,
  oauthClientId: string,
  policyVersion: string,
  request: PreparedServiceRequest
): PlannedConnectionChange {
  // OAuth clients do not form connection identity. There is one shared
  // connection per consuming subsystem, service, and service environment.
  const identityMatches = existingConnections.filter(
    (connection) =>
      connection.clientId === subsystem.clientId &&
      connection.serviceId === request.name
  );
  if (identityMatches.length > 1) {
    throw new ConflictError(
      `More than one connection exists for subsystem '${subsystem.clientId}' and service '${request.name}'`
    );
  }

  const existing = identityMatches[0];
  if (!existing) {
    return {
      kind: 'create',
      request,
      result: 'submitted approval request',
    };
  }

  if (existing.environment !== request.environment) {
    throw new ConflictError(
      `Connection for subsystem '${subsystem.clientId}' and service '${request.name}' has environment '${existing.environment}', not '${request.environment}'`
    );
  }

  const existingClient = existing.requesterDetails?.client;
  if (
    existingClient?.integrationId !== integrationId ||
    existingClient?.clientId !== oauthClientId
  ) {
    throw new ConflictError(
      `Connection for subsystem '${subsystem.clientId}' and service '${request.name}' is associated with a different integration or OAuth client; client grants are required before this connection can be shared`
    );
  }

  if (existing.policyVersion !== policyVersion) {
    throw new ConflictError(
      `Connection for subsystem '${subsystem.clientId}' and service '${request.name}' uses policy '${existing.policyVersion}', not '${policyVersion}'`
    );
  }

  const existingScopes = normalizeStoredScopes(existing, request.name);
  if (sameStrings(existingScopes, request.scopes)) {
    return {
      kind: 'unchanged',
      request,
      result: existing.isApproved ? 'already approved' : 'pending approval',
    };
  }

  const serviceOrgName = requireNonBlank(
    request.service.subsystem.organization?.name,
    `Organization for service '${request.name}'`
  );

  return {
    kind: 'update',
    connection: existing,
    request,
    serviceOrgName,
    result: 'updated scopes, submitted for re-approval',
  };
}

function normalizeRequestedScopes(scopes: string[], serviceName: string) {
  return uniqueSorted(
    scopes.map((scope, index) =>
      requireNonBlank(
        scope,
        `Scope at index ${index} for service '${serviceName}'`
      )
    )
  );
}

function normalizeStoredScopes(
  connection: ConnectionRequest,
  serviceName: string
): string[] {
  const scopes = connection.requesterDetails?.scopes;
  if (!Array.isArray(scopes)) {
    throw new ConflictError(
      `Connection for service '${serviceName}' does not contain a valid scope list`
    );
  }
  if (scopes.some((scope) => typeof scope !== 'string')) {
    throw new ConflictError(
      `Connection for service '${serviceName}' contains an invalid scope`
    );
  }
  const normalized = scopes.map((scope) => scope.trim());
  if (normalized.some((scope) => scope.length === 0)) {
    throw new ConflictError(
      `Connection for service '${serviceName}' contains a blank scope`
    );
  }
  return uniqueSorted(normalized);
}

function requireNonBlank(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new BadRequestError(`${label} must not be blank`);
  }
  return value.trim();
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort(compareStrings);
}

function sameStrings(left: string[], right: string[]): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function compareConnections(
  left: ConnectionRequest,
  right: ConnectionRequest
): number {
  return compareStrings(
    `${left.serviceId || ''}\u0000${left.id || ''}`,
    `${right.serviceId || ''}\u0000${right.id || ''}`
  );
}

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
