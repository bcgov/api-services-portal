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
import { selectSubsystemForIntegration } from './subsystems-service.js';
import { managedApplicationScopesForEnvironment } from './policies/SDX.R1.00/security-config.js';

interface NormalizedServiceRequest {
  environment: string;
  name: string;
  providerId: string;
  scopes: string[];
  version?: string;
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
      result: string;
    }
  | {
      kind: 'reactivate';
      connection: ConnectionRequest;
      request: PreparedServiceRequest;
      serviceOrgName: string;
      result: 'reactivated approved connection';
    }
  | {
      kind: 'pin-version';
      connection: ConnectionRequest;
      request: PreparedServiceRequest;
      serviceOrgName: string;
      result: 'already approved' | 'pending approval';
    }
  | {
      kind: 'unchanged';
      request: PreparedServiceRequest;
      result: 'already approved' | 'pending approval';
    };

interface PlannedConnectionRemoval {
  connection: ConnectionRequest;
  connectionId: string;
  serviceId: string;
  action?: 'revoke';
  result: 'revoked approved connection' | 'deleted pending request';
}

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
    const subsystemOrgName = requireNonBlank(
      subsystem.organization?.name,
      `Organization for subsystem '${subsystem.clientId}'`
    );
    // Catalog and policy checks are shared with the onboarding hold so a
    // request that cannot be replayed is rejected before any connection write.
    const validated = await this.validateCatalogAndPolicy(input);
    const policyVersion = validated.policyVersion;

    this.logger?.debug('Submission ID: %s', normalizedSubmissionId);
    this.logger?.debug('Full access request %j', input);

    const scopeCatalog =
      policyVersion === 'SDX.R1.00' && validated.requests.length > 0
        ? await this.api.listCatalogScopes()
        : undefined;
    const preparedRequests: PreparedServiceRequest[] = [];

    for (const requested of validated.requests) {
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
          clientId: requested.service.subsystem.clientId,
          privacyZone: requested.service.subsystem.privacyZone,
          version: requested.service.version,
        },
      };

      preparedRequests.push({
        ...requested,
        requesterDetails,
        defaults: this.policyService.getDefaultResources(
          policyVersion,
          subsystem,
          requested.service,
          requesterDetails,
          scopeCatalog
            ? managedApplicationScopesForEnvironment(
                scopeCatalog,
                requested.service.environment
              )
            : undefined
        ),
      });
    }

    const existingConnections =
      await this.api.listConnections(subsystemOrgName);
    for (const environment of uniqueSorted([
      ...preparedRequests.map((request) => request.environment),
      ...existingConnections
        .filter(
          (connection) =>
            connection.clientId === subsystem.clientId &&
            connection.requesterDetails?.client?.integrationId?.trim() ===
              normalizedIntegrationId
        )
        .map((connection) => connection.environment)
        .filter((environment): environment is string => Boolean(environment)),
    ])) {
      enforceRequestClientIdentity(
        existingConnections,
        subsystem,
        normalizedIntegrationId,
        oauthClientId,
        environment,
        this.logger
      );
    }
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
    const requestedServices = new Set(
      preparedRequests.map((request) => request.name)
    );
    const removals = existingConnections
      .filter(
        (connection) =>
          connection.clientId === subsystem.clientId &&
          connection.requesterDetails?.client?.integrationId?.trim() ===
            normalizedIntegrationId &&
          connection.requesterDetails?.client?.clientId?.trim() ===
            oauthClientId &&
          !requestedServices.has(connection.serviceId || '')
      )
      .map((connection): PlannedConnectionRemoval => {
        const connectionId = requireNonBlank(
          connection.id,
          'Omitted connection ID'
        );
        const serviceId = requireNonBlank(
          connection.serviceId,
          'Service ID for omitted connection ' + connectionId
        );
        return connection.isApproved
          ? {
              connection,
              connectionId,
              serviceId,
              action: 'revoke',
              result: 'revoked approved connection',
            }
          : {
              connection,
              connectionId,
              serviceId,
              result: 'deleted pending request',
            };
      })
      .sort((left, right) =>
        compareConnections(left.connection, right.connection)
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
        const outcome = await this.api.upsertConnection(subsystemOrgName, {
          clientId: change.connection.clientId!,
          serviceId: change.connection.serviceId!,
          isApproved: false,
          requesterDetails: request.requesterDetails,
        });
        outcomes.push(outcome);
      } else if (change.kind === 'reactivate') {
        const outcome = await this.api.lifecycleConnection(
          change.serviceOrgName,
          change.connection.id!,
          { action: 'activate' }
        );
        outcomes.push(outcome);
      } else if (change.kind === 'pin-version') {
        const outcome = await this.api.upsertConnection(change.serviceOrgName, {
          clientId: change.connection.clientId!,
          serviceId: change.connection.serviceId!,
          isApproved: change.connection.isApproved,
          requesterDetails: request.requesterDetails,
        });
        outcomes.push(outcome);
      }

      submission.results[request.name] = change.result;
    }

    // The request is an authoritative snapshot. Apply retained changes before
    // removing omitted connections so each revocation callback sees the newest
    // approved state for the services that remain.
    for (const removal of removals) {
      const outcome = await this.api.deleteConnection(
        subsystemOrgName,
        removal.connectionId,
        removal.action
      );
      outcomes.push(outcome);
      submission.results[removal.serviceId] = removal.result;
    }

    this.logger?.debug(
      { outcomes },
      'All connection upserts completed with outcomes'
    );

    return submission;
  }

  /**
   * Checks the policy and catalog fields that do not need the consuming
   * subsystem. Submit and the onboarding hold both use this, so the two paths
   * reject the same requests before anything is stored.
   */
  async validateCatalogAndPolicy(
    input: TNewIntegrationAccessRequest
  ): Promise<{
    policyVersion: string;
    clientId: string;
    requests: Array<NormalizedServiceRequest & { service: ServiceCatalogEntry }>;
  }> {
    const clientId = requireNonBlank(input.clientId, 'OAuth client ID');
    const policyVersion =
      input.policyVersion === undefined
        ? 'SDX.R1.00'
        : requireNonBlank(input.policyVersion, 'Policy version');

    if (!this.policyService.supportsPolicyVersion(policyVersion)) {
      throw new BadRequestError(
        `Policy ${policyVersion} not found in registry`
      );
    }

    const normalizedRequests = normalizeRequestedServices(input);
    const services = new Map<string, ServiceCatalogEntry>();
    const requests: Array<
      NormalizedServiceRequest & { service: ServiceCatalogEntry }
    > = [];

    for (const requested of normalizedRequests) {
      let service = services.get(requested.name);
      if (!service) {
        try {
          service = await this.api.getOASService(requested.name);
        } catch (err) {
          if (isMissingCatalogService(err)) {
            throw new BadRequestError(
              `Service '${requested.name}' was not found in the catalog`
            );
          }
          throw err;
        }
        services.set(requested.name, service);
      }

      validateRequestedService(requested, service);
      requests.push({ ...requested, service });
    }

    return { policyVersion, clientId, requests };
  }

  /**
   * Builds allowed services for one integration and environment.
   */
  async buildIntegrationAllowedServices(
    integrationId: string,
    environment: string,
    status: 'approved' | 'pending',
    options: {
      skipMalformedConnections?: boolean;
      excludeConnectionIds?: string[];
    } = {}
  ): Promise<TIntegrationAccessRequest> {
    return this.buildIntegrationAllowedServicesSnapshot(
      integrationId,
      environment,
      status,
      options
    );
  }

  /**
   * Builds the complete allowed-services callback for one integration across
   * every SDX environment.
   */
  async buildCompleteIntegrationAllowedServices(
    integrationId: string,
    status: 'approved' | 'pending',
    options: {
      skipMalformedConnections?: boolean;
      excludeConnectionIds?: string[];
    } = {}
  ): Promise<TIntegrationAccessRequest> {
    return this.buildIntegrationAllowedServicesSnapshot(
      integrationId,
      undefined,
      status,
      options
    );
  }

  private async buildIntegrationAllowedServicesSnapshot(
    integrationId: string,
    environment: string | undefined,
    status: 'approved' | 'pending',
    options: {
      skipMalformedConnections?: boolean;
      excludeConnectionIds?: string[];
    }
  ): Promise<TIntegrationAccessRequest> {
    const normalizedIntegrationId = requireNonBlank(
      integrationId,
      'Integration ID'
    );
    const normalizedEnvironment =
      environment === undefined
        ? undefined
        : requireNonBlank(environment, 'Environment');
    const environmentContext = normalizedEnvironment || 'all environments';

    const subsystems = await this.api.listCatalogSubsystems({
      integrationClientId: normalizedIntegrationId,
    });
    if (!subsystems || subsystems.length === 0) {
      throw new BadRequestError(
        `Subsystem with integration ${normalizedIntegrationId} not found`
      );
    }
    const subsystem = selectSubsystemForIntegration(
      subsystems,
      normalizedIntegrationId
    );
    if (!subsystem) {
      throw new BadRequestError(
        `Subsystem with integration ${normalizedIntegrationId} not found`
      );
    }
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

    // Filter to the exact integration and, for the read endpoint, environment
    // before deriving any client or submission metadata. Callback snapshots
    // omit the filter so they represent the complete state. The member API
    // does not guarantee order.
    const excludedConnectionIds = new Set(options.excludeConnectionIds || []);
    const integrationConnections = connections
      .filter(
        (connection) =>
          !excludedConnectionIds.has(connection.id || '') &&
          connection.clientId === subsystem.clientId &&
          (normalizedEnvironment === undefined ||
            connection.environment === normalizedEnvironment) &&
          connection.requesterDetails?.client?.integrationId ===
            normalizedIntegrationId
      )
      .sort(compareConnections);

    if (integrationConnections.length === 0) {
      // Partner clients query each configured environment in turn. Once the
      // integration is registered in the catalog, the absence of matching
      // connections is an empty collection rather than a missing
      // resource. Reuse an authoritative identity from another environment when one exists.
      const integrationIdentity = selectAuthoritativeClientConnections(
        connections.filter(
          (connection) =>
            connection.clientId === subsystem.clientId &&
            connection.requesterDetails?.client?.integrationId ===
              normalizedIntegrationId
        ),
        {
          subsystemId: subsystem.clientId,
          integrationId: normalizedIntegrationId,
          environment: environmentContext,
        },
        this.logger
      );
      if (!integrationIdentity) {
        return {
          integrationId: normalizedIntegrationId,
          clientId: '',
          submissionId: 'unknown',
          resourceServers: [],
        };
      }

      const submissionId = latestSubmissionId(integrationIdentity.connections);
      return {
        integrationId: normalizedIntegrationId,
        clientId: integrationIdentity.clientId,
        submissionId,
        resourceServers: [],
      };
    }

    const metadataConnections = integrationConnections.filter((connection) => {
      try {
        const clientId = connection.requesterDetails?.client?.clientId;
        if (typeof clientId !== 'string' || clientId.trim().length === 0) {
          throw new ConflictError(
            `Connection '${connection.serviceId}' does not identify an OAuth client`
          );
        }
        return true;
      } catch (err) {
        if (
          !options.skipMalformedConnections ||
          !isMalformedConnectionError(err)
        ) {
          throw err;
        }
        this.logger?.warn(
          { err, connectionId: connection.id, serviceId: connection.serviceId },
          'Skipping malformed integration connection during revocation'
        );
        return false;
      }
    });

    const authoritative = selectAuthoritativeClientConnections(
      metadataConnections,
      {
        subsystemId: subsystem.clientId,
        integrationId: normalizedIntegrationId,
        environment: environmentContext,
      },
      this.logger
    );
    if (!authoritative) {
      throw new ConflictError(
        `Integration ${normalizedIntegrationId} has no usable OAuth client in ${environmentContext}`
      );
    }
    const selectedConnections = requireUniqueServiceConnections(
      authoritative.connections,
      {
        subsystemId: subsystem.clientId,
        integrationId: normalizedIntegrationId,
        environment: environmentContext,
      }
    );

    const allowedConnections = connectionsForStatus(
      selectedConnections,
      status
    );
    const submissionId = latestSubmissionId(allowedConnections);

    this.logger?.debug('Connections allowed %j', allowedConnections);

    const resourceServersByEnvironmentAndSubsystem = new Map<
      string,
      {
        id: string;
        environment: string;
        services: Map<
          string,
          { name: string; scopes: string[]; version: string }
        >;
      }
    >();

    for (const connection of allowedConnections) {
      try {
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
        const connectionEnvironment = requireNonBlank(
          connection.environment,
          `Connection environment for service '${serviceId}'`
        );
        if (
          normalizedEnvironment !== undefined &&
          connectionEnvironment !== normalizedEnvironment
        ) {
          throw new BadRequestError(
            `Connection service '${serviceId}' environment '${connectionEnvironment}' does not match requested environment '${normalizedEnvironment}'`
          );
        }
        if (service.environment !== connectionEnvironment) {
          throw new BadRequestError(
            `Connection service '${serviceId}' environment '${service.environment}' does not match connection environment '${connectionEnvironment}'`
          );
        }

        const subsystemId = requireNonBlank(
          service.subsystem.clientId,
          `Provider subsystem for service '${serviceId}'`
        );
        const approvedProviderId = connection.requesterDetails?.service?.clientId;
        if (approvedProviderId && approvedProviderId !== subsystemId) {
          throw new ConflictError(
            `Provider for service '${serviceId}' changed after submission; submit updated access for re-approval`
          );
        }
        const resourceServerKey = `${connectionEnvironment}\u0000${subsystemId}`;
        let resourceServer =
          resourceServersByEnvironmentAndSubsystem.get(resourceServerKey);
        if (!resourceServer) {
          resourceServer = {
            id: subsystemId,
            environment: connectionEnvironment,
            services: new Map(),
          };
          resourceServersByEnvironmentAndSubsystem.set(
            resourceServerKey,
            resourceServer
          );
        }

        if (typeof service.version !== 'string' || !service.version.trim()) {
          throw new ConflictError(
            `Catalog version for service '${serviceId}' is missing; submit updated access once the catalog is valid`
          );
        }
        const scopes = normalizeStoredScopes(connection, serviceId);
        const declaredScopes = new Set(
          (service.operations || []).flatMap(operation =>
            (operation.scopes || []).map(scope => scope.name)
          )
        );
        if (scopes.some(scope => !declaredScopes.has(scope))) {
          throw new ConflictError(
            `Approved scopes for service '${serviceId}' are no longer declared in the catalog; submit updated access for re-approval`
          );
        }
        const version =
          connection.requesterDetails?.service?.version || service.version;
        const existingService = resourceServer.services.get(serviceId);
        resourceServer.services.set(serviceId, {
          name: serviceId,
          scopes: uniqueSorted([...(existingService?.scopes || []), ...scopes]),
          version,
        });
      } catch (err) {
        if (
          !options.skipMalformedConnections ||
          !isMalformedConnectionError(err)
        ) {
          throw err;
        }
        this.logger?.warn(
          { err, connectionId: connection.id, serviceId: connection.serviceId },
          'Skipping malformed integration connection during revocation'
        );
      }
    }

    const resourceServers: TResourceServerAccess[] = Array.from(
      resourceServersByEnvironmentAndSubsystem.values()
    )
      .sort((left, right) =>
        compareStrings(
          `${left.environment}\u0000${left.id}`,
          `${right.environment}\u0000${right.id}`
        )
      )
      .map(({ id, environment: resourceEnvironment, services }) => ({
        id,
        environment: resourceEnvironment,
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
      clientId: authoritative.clientId,
      submissionId,
      resourceServers,
    };
  }
}

function connectionsForStatus(
  connections: ConnectionRequest[],
  status: 'approved' | 'pending'
): ConnectionRequest[] {
  if (status === 'approved') {
    return connections.filter((connection) => connection.isApproved === true);
  }

  return connections.flatMap((connection) => {
    const proposal = parseObject(connection.proposedConfiguration);
    if (Object.keys(proposal).length > 0) {
      return [{ ...connection, ...proposal, isApproved: false }];
    }
    return connection.isApproved ? [] : [connection];
  });
}

function parseObject(value: unknown): Record<string, any> {
  if (value && typeof value === 'object') return value as Record<string, any>;
  if (typeof value !== 'string' || !value.trim()) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function latestSubmissionId(connections: ConnectionRequest[]): string {
  const submissionIds = uniqueSorted(
    connections
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
  return submissionIds.at(-1) || 'unknown';
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
      const version =
        requestedService.version === undefined
          ? undefined
          : requireNonBlank(requestedService.version, 'Service version');
      const key = `${providerId}\u0000${environment}\u0000${name}`;
      const existing = requests.get(key);

      if (existing) {
        if (
          existing.version !== undefined &&
          version !== undefined &&
          existing.version !== version
        ) {
          throw new BadRequestError(
            `Service '${name}' was requested with conflicting versions '${existing.version}' and '${version}'`
          );
        }
        existing.version ??= version;
        existing.scopes = uniqueSorted([...existing.scopes, ...scopes]);
      } else {
        requests.set(key, { providerId, environment, name, scopes, version });
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

function isMissingCatalogService(error: unknown): boolean {
  if (error instanceof NotFoundError) return true;
  if (!error || typeof error !== 'object') return false;
  return (error as { details?: { status?: number } }).details?.status === 404;
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
  if (
    requested.version !== undefined &&
    requested.version !== service.version
  ) {
    throw new BadRequestError(
      `Requested service '${requested.name}' version '${requested.version}' does not match catalog version '${service.version}'`
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

interface ConnectionSelectionContext {
  subsystemId: string;
  integrationId: string;
  environment: string;
}

interface AuthoritativeClientConnections {
  integrationId: string;
  clientId: string;
  connections: ConnectionRequest[];
}

function enforceRequestClientIdentity(
  existingConnections: ConnectionRequest[],
  subsystem: SubsystemEntry,
  integrationId: string,
  clientId: string,
  environment: string,
  logger?: FastifyBaseLogger
): void {
  const candidates = existingConnections.filter(
    (connection) =>
      connection.clientId === subsystem.clientId &&
      connection.environment === environment
  );
  const authoritative = selectAuthoritativeClientConnections(
    candidates,
    { subsystemId: subsystem.clientId, integrationId, environment },
    logger
  );
  if (
    authoritative &&
    (authoritative.integrationId !== integrationId ||
      authoritative.clientId !== clientId)
  ) {
    throw new ConflictError(
      `Subsystem '${subsystem.clientId}' is already associated with integration '${authoritative.integrationId}' and OAuth client '${authoritative.clientId}' in environment '${environment}'`
    );
  }
}

function selectAuthoritativeClientConnections(
  connections: ConnectionRequest[],
  context: ConnectionSelectionContext,
  logger?: FastifyBaseLogger
): AuthoritativeClientConnections | undefined {
  const groups = new Map<string, AuthoritativeClientConnections>();
  for (const connection of connections) {
    const integrationId =
      connection.requesterDetails?.client?.integrationId?.trim();
    const clientId = connection.requesterDetails?.client?.clientId?.trim();
    if (!integrationId || !clientId) {
      logger?.warn(
        {
          subsystemId: context.subsystemId,
          environment: context.environment,
          connectionId: connection.id,
          serviceId: connection.serviceId,
        },
        'Ignoring connection with incomplete client identity while resolving one-to-one mapping'
      );
      continue;
    }
    const key = `${integrationId}\u0000${clientId}`;
    const group: AuthoritativeClientConnections = groups.get(key) || {
      integrationId,
      clientId,
      connections: [],
    };
    group.connections.push(connection);
    groups.set(key, group);
  }

  if (groups.size === 0) return undefined;

  if (groups.size > 1) {
    throw new ConflictError(
      `Subsystem '${context.subsystemId}' has connections for more than one integration or OAuth client in environment '${context.environment}'`
    );
  }
  return groups.values().next().value;
}

function requireUniqueServiceConnections(
  connections: ConnectionRequest[],
  context: ConnectionSelectionContext
): ConnectionRequest[] {
  const byService = new Map<string, ConnectionRequest[]>();
  for (const connection of connections) {
    const key = connection.serviceId || '';
    byService.set(key, [...(byService.get(key) || []), connection]);
  }

  return Array.from(byService.entries())
    .map(([serviceId, candidates]) => {
      if (candidates.length > 1) {
        throw new ConflictError(
          `More than one connection exists for subsystem '${context.subsystemId}', integration '${context.integrationId}', service '${serviceId}', and environment '${context.environment}'`
        );
      }
      return candidates[0];
    })
    .sort(compareConnections);
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
  const serviceMatches = existingConnections.filter(
    (connection) =>
      connection.clientId === subsystem.clientId &&
      connection.serviceId === request.name
  );
  if (serviceMatches.length > 1) {
    throw new ConflictError(
      `More than one connection exists for subsystem '${subsystem.clientId}' and service '${request.name}'`
    );
  }
  const existing = serviceMatches[0];
  if (existing && existing.environment !== request.environment) {
    throw new ConflictError(
      `Connection for subsystem '${subsystem.clientId}' and service '${request.name}' has environment '${existing.environment}', not '${request.environment}'`
    );
  }
  if (!existing) {
    return {
      kind: 'create',
      request,
      result: 'submitted approval request',
    };
  }

  const existingClient = existing.requesterDetails?.client;
  if (
    existingClient?.integrationId !== integrationId ||
    existingClient?.clientId !== oauthClientId
  ) {
    throw new ConflictError(
      `Connection for subsystem '${subsystem.clientId}' and service '${request.name}' is associated with a different integration or OAuth client`
    );
  }

  if (existing.policyVersion !== policyVersion) {
    throw new ConflictError(
      `Connection for subsystem '${subsystem.clientId}' and service '${request.name}' uses policy '${existing.policyVersion}', not '${policyVersion}'`
    );
  }

  const serviceOrgName = requireNonBlank(
    request.service.subsystem.organization?.name,
    `Organization for service '${request.name}'`
  );

  const existingScopes = normalizeStoredScopes(existing, request.name);
  const scopesHaveChanged = !sameStrings(existingScopes, request.scopes);
  const requestedScopes = new Set(request.scopes);
  const existingScopeSet = new Set(existingScopes);
  const removedScopes = existingScopes.filter(
    (scope) => !requestedScopes.has(scope)
  );
  const addedScopes = request.scopes.filter(
    (scope) => !existingScopeSet.has(scope)
  );
  const existingVersion = existing.requesterDetails?.service?.version;
  const versionHasChanged =
    existingVersion !== undefined &&
    existingVersion !== request.service.version;
  const legacyVersionNeedsPinning = existingVersion === undefined;

  if (!scopesHaveChanged && !versionHasChanged) {
    if (existing.isApproved && existing.isActive === false) {
      return {
        kind: 'reactivate',
        connection: existing,
        request,
        serviceOrgName,
        result: 'reactivated approved connection',
      };
    }
    if (legacyVersionNeedsPinning) {
      return {
        kind: 'pin-version',
        connection: existing,
        request,
        serviceOrgName,
        result: existing.isApproved ? 'already approved' : 'pending approval',
      };
    }
    return {
      kind: 'unchanged',
      request,
      result: existing.isApproved ? 'already approved' : 'pending approval',
    };
  }

  const result = (() => {
    if (!existing.isApproved) {
      const changed = [
        scopesHaveChanged ? 'scopes' : undefined,
        versionHasChanged ? 'version' : undefined,
      ].filter(Boolean);
      return `updated ${changed.join(' and ')}, pending approval`;
    }

    const applied = removedScopes.length > 0 ? 'revoked scopes applied' : '';
    const pending = [
      addedScopes.length > 0 ? 'added scopes' : undefined,
      versionHasChanged ? 'updated version' : undefined,
    ].filter(Boolean);
    if (applied && pending.length > 0) {
      return `${applied}; ${pending.join(
        ' and '
      )} submitted for re-approval`;
    }
    if (applied) {
      return applied;
    }
    return `${pending.join(' and ')}, submitted for re-approval`;
  })();
  return {
    kind: 'update',
    connection: existing,
    request,
    serviceOrgName,
    result,
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

function isMalformedConnectionError(error: unknown): boolean {
  return error instanceof BadRequestError || error instanceof ConflictError;
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
