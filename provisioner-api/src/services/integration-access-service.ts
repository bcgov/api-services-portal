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
      result:
        | 'updated scopes, submitted for re-approval'
        | 'updated version, submitted for re-approval'
        | 'updated scopes and version, submitted for re-approval';
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
          version: service.version,
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
    for (const environment of uniqueSorted(
      preparedRequests.map((request) => request.environment)
    )) {
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
        request,
        this.logger
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
      } else if (
        change.kind === 'update' ||
        change.kind === 'reactivate' ||
        change.kind === 'pin-version'
      ) {
        const reactivating = change.kind === 'reactivate';
        const pinningVersion = change.kind === 'pin-version';
        const outcome = await this.api.upsertConnection(change.serviceOrgName, {
          clientId: change.connection.clientId!,
          serviceId: change.connection.serviceId!,
          isApproved: pinningVersion
            ? change.connection.isApproved
            : reactivating,
          isActive: pinningVersion ? change.connection.isActive : reactivating,
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
    status: 'approved' | 'pending',
    options: {
      skipMalformedConnections?: boolean;
    } = {}
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
    const subsystem = selectSubsystemForIntegration(
      subsystems,
      normalizedIntegrationId,
      this.logger
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

    // Filter to the exact integration and environment before deriving any
    // client or submission metadata. The member API does not guarantee order.
    const integrationConnections = connections
      .filter(
        (connection) =>
          connection.clientId === subsystem.clientId &&
          connection.environment === normalizedEnvironment &&
          connection.requesterDetails?.client?.integrationId ===
            normalizedIntegrationId
      )
      .sort(compareConnections);

    if (integrationConnections.length === 0) {
      throw new NotFoundError(
        `No connections found for integration ${normalizedIntegrationId} in environment ${normalizedEnvironment}`
      );
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
        environment: normalizedEnvironment,
      },
      this.logger
    );
    if (!authoritative) {
      throw new ConflictError(
        `Integration ${normalizedIntegrationId} has no usable OAuth client in environment ${normalizedEnvironment}`
      );
    }
    const selectedConnections = selectLatestServiceConnections(
      authoritative.connections,
      {
        subsystemId: subsystem.clientId,
        integrationId: normalizedIntegrationId,
        environment: normalizedEnvironment,
      },
      this.logger
    );

    const submissionIds = uniqueSorted(
      selectedConnections
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

    const allowedConnections = selectedConnections.filter(
      (connection) =>
        connection.isApproved === (status === 'approved') &&
        (status === 'pending' || connection.isActive === true)
    );

    this.logger?.debug('Connections allowed %j', allowedConnections);

    const servicesBySubsystem = new Map<
      string,
      Map<string, { name: string; scopes: string[]; version: string }>
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
        const version =
          connection.requesterDetails?.service?.version || service.version;
        const existingService = subsystemServices.get(serviceId);
        subsystemServices.set(serviceId, {
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
      clientId: authoritative.clientId,
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

  const candidates = Array.from(groups.values()).sort((left, right) =>
    compareIdentityRecency(
      selectLatestIdentityConnection(left.connections)!,
      selectLatestIdentityConnection(right.connections)!
    )
  );
  const selected = candidates[candidates.length - 1];
  if (candidates.length > 1) {
    const ignoredConnections = candidates
      .slice(0, -1)
      .flatMap((candidate) => candidate.connections);
    logger?.warn(
      {
        subsystemId: context.subsystemId,
        environment: context.environment,
        requestedIntegrationId: context.integrationId,
        selectedRecordId: selectLatestIdentityConnection(selected.connections)
          ?.id,
        ignoredRecordIds: ignoredConnections.map((connection) => connection.id),
        selection: identitySelectionMethod(connections),
      },
      'Multiple client identities found for one subsystem and environment; continuing with latest record'
    );
  }
  return selected;
}

function selectLatestServiceConnections(
  connections: ConnectionRequest[],
  context: ConnectionSelectionContext,
  logger?: FastifyBaseLogger
): ConnectionRequest[] {
  const byService = new Map<string, ConnectionRequest[]>();
  for (const connection of connections) {
    const key = connection.serviceId || '';
    byService.set(key, [...(byService.get(key) || []), connection]);
  }

  return Array.from(byService.entries())
    .map(([serviceId, candidates]) => {
      const selected = selectLatestConnection(candidates)!;
      if (candidates.length > 1) {
        logger?.warn(
          {
            subsystemId: context.subsystemId,
            environment: context.environment,
            serviceId,
            selectedRecordId: selected.id,
            ignoredRecordIds: candidates
              .filter((connection) => connection !== selected)
              .map((connection) => connection.id),
            selection: selectionMethod(candidates),
          },
          'Multiple connection records found for one service; continuing with latest record'
        );
      }
      return selected;
    })
    .sort(compareConnections);
}

function selectLatestConnection(
  connections: ConnectionRequest[]
): ConnectionRequest | undefined {
  return connections.slice().sort(compareConnectionRecency).at(-1);
}

function selectLatestIdentityConnection(
  connections: ConnectionRequest[]
): ConnectionRequest | undefined {
  return connections.slice().sort(compareIdentityRecency).at(-1);
}

function compareIdentityRecency(
  left: ConnectionRequest,
  right: ConnectionRequest
): number {
  const leftTimestamp = createdTimestamp(left);
  const rightTimestamp = createdTimestamp(right);
  if (leftTimestamp !== rightTimestamp) {
    return leftTimestamp - rightTimestamp;
  }
  return compareStrings(left.id || '', right.id || '');
}

function compareConnectionRecency(
  left: ConnectionRequest,
  right: ConnectionRequest
): number {
  const leftTimestamp = connectionTimestamp(left);
  const rightTimestamp = connectionTimestamp(right);
  if (leftTimestamp !== rightTimestamp) {
    return leftTimestamp - rightTimestamp;
  }
  return compareStrings(left.id || '', right.id || '');
}

function connectionTimestamp(connection: ConnectionRequest): number {
  for (const value of [connection.updatedAt, connection.createdAt]) {
    if (value) {
      const parsed = Date.parse(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return Number.NEGATIVE_INFINITY;
}

function createdTimestamp(connection: ConnectionRequest): number {
  if (connection.createdAt) {
    const parsed = Date.parse(connection.createdAt);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return Number.NEGATIVE_INFINITY;
}

function identitySelectionMethod(connections: ConnectionRequest[]): string {
  return connections.some(
    (connection) => createdTimestamp(connection) !== Number.NEGATIVE_INFINITY
  )
    ? 'createdAt-id'
    : 'deterministic-id-no-createdAt';
}

function selectionMethod(connections: ConnectionRequest[]): string {
  return connections.some(
    (connection) => connectionTimestamp(connection) !== Number.NEGATIVE_INFINITY
  )
    ? 'updatedAt-createdAt-id'
    : 'deterministic-id-no-timestamp';
}

function planConnectionChange(
  existingConnections: ConnectionRequest[],
  subsystem: SubsystemEntry,
  integrationId: string,
  oauthClientId: string,
  policyVersion: string,
  request: PreparedServiceRequest,
  logger?: FastifyBaseLogger
): PlannedConnectionChange {
  // OAuth clients do not form connection identity. There is one shared
  // connection per consuming subsystem, service, and service environment.
  const serviceMatches = existingConnections.filter(
    (connection) =>
      connection.clientId === subsystem.clientId &&
      connection.serviceId === request.name
  );
  const latestServiceMatch = selectLatestConnection(serviceMatches);
  if (
    latestServiceMatch &&
    latestServiceMatch.environment !== request.environment
  ) {
    throw new ConflictError(
      `Connection for subsystem '${subsystem.clientId}' and service '${request.name}' has environment '${latestServiceMatch.environment}', not '${request.environment}'`
    );
  }
  const identityMatches = serviceMatches.filter(
    (connection) =>
      connection.environment === request.environment &&
      connection.requesterDetails?.client?.integrationId === integrationId &&
      connection.requesterDetails?.client?.clientId === oauthClientId
  );
  const existing = selectLatestConnection(identityMatches);
  if (identityMatches.length > 1) {
    logger?.warn(
      {
        subsystemId: subsystem.clientId,
        environment: request.environment,
        serviceId: request.name,
        selectedRecordId: existing?.id,
        ignoredRecordIds: identityMatches
          .filter((connection) => connection !== existing)
          .map((connection) => connection.id),
        selection: selectionMethod(identityMatches),
      },
      'Multiple connection records found for one subsystem and service; continuing with latest record'
    );
  }
  if (!existing) {
    return {
      kind: 'create',
      request,
      result: 'submitted approval request',
    };
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

  const changed = [
    scopesHaveChanged ? 'scopes' : undefined,
    versionHasChanged ? 'version' : undefined,
  ].filter(Boolean);
  return {
    kind: 'update',
    connection: existing,
    request,
    serviceOrgName,
    result: `updated ${changed.join(' and ')}, submitted for re-approval` as
      | 'updated scopes, submitted for re-approval'
      | 'updated version, submitted for re-approval'
      | 'updated scopes and version, submitted for re-approval',
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
