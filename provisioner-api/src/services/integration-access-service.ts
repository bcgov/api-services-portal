import type { FastifyBaseLogger } from 'fastify';
import type { OAuthClient } from '../clients/oauth.js';
import {
  SdxMemberApiClient,
  type ConnectionClientGrant,
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
    }
  | {
      kind: 'reactivate';
      connection: ConnectionRequest;
      request: PreparedServiceRequest;
      serviceOrgName: string;
    }
  | {
      kind: 'unchanged';
      connection: ConnectionRequest;
      request: PreparedServiceRequest;
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
    const changes = preparedRequests.map((request) =>
      planConnectionChange(
        existingConnections,
        subsystem,
        policyVersion,
        request
      )
    );

    // Complete all reads before the first write so an unavailable or malformed
    // grant cannot leave an earlier service partially submitted.
    const grantsByConnection = new Map<string, ConnectionClientGrant[]>();
    for (const change of changes) {
      if (change.kind === 'create') continue;
      const connectionId = requireNonBlank(
        change.connection.id,
        `Connection ID for service '${change.request.name}'`
      );
      if (!grantsByConnection.has(connectionId)) {
        grantsByConnection.set(
          connectionId,
          await this.api.listConnectionClientGrants(
            subsystemOrgName,
            connectionId
          )
        );
      }
    }

    const submission: TNewIntegrationAccessRequestResponse = {
      submissionId: normalizedSubmissionId,
      results: {},
    };
    const outcomes: unknown[] = [];

    // Requests are prepared in a stable order, so both write order and response
    // property order are deterministic.
    for (const change of changes) {
      const { request } = change;
      let connectionId: string;
      let existingGrant: ConnectionClientGrant | undefined;

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
        connectionId = requireNonBlank(
          outcome.id,
          `Created connection ID for service '${request.name}'`
        );
      } else {
        connectionId = requireNonBlank(
          change.connection.id,
          `Connection ID for service '${request.name}'`
        );
        const matchingGrants = (
          grantsByConnection.get(connectionId) || []
        ).filter(
          (grant) =>
            grant.integrationId === normalizedIntegrationId &&
            grant.oauthClientId === oauthClientId
        );
        if (matchingGrants.length > 1) {
          throw new ConflictError(
            `More than one grant exists for integration '${normalizedIntegrationId}' and OAuth client '${oauthClientId}' on connection '${connectionId}'`
          );
        }
        existingGrant = matchingGrants[0];

        if (change.kind === 'reactivate') {
          const outcome = await this.api.upsertConnection(
            change.serviceOrgName,
            {
              clientId: change.connection.clientId!,
              serviceId: change.connection.serviceId!,
              isApproved: true,
              isActive: true,
            }
          );
          outcomes.push(outcome);
        }
      }

      const scopesChanged =
        existingGrant !== undefined &&
        !sameStrings(
          normalizeGrantScopes(existingGrant, request.name),
          request.scopes
        );
      const versionChanged =
        existingGrant !== undefined &&
        grantServiceVersion(existingGrant) !== request.service.version;
      const grantOutcome = await this.api.upsertConnectionClientGrant(
        subsystemOrgName,
        connectionId,
        {
          integrationId: normalizedIntegrationId,
          oauthClientId,
          submissionId: normalizedSubmissionId,
          requesterDetails: request.requesterDetails,
          scopes: request.scopes,
        }
      );
      outcomes.push(grantOutcome);

      if (change.kind === 'create') {
        submission.results[request.name] =
          'submitted connection and grant approval request';
      } else if (!existingGrant) {
        submission.results[request.name] = 'submitted grant approval request';
      } else if (
        scopesChanged ||
        versionChanged ||
        existingGrant.status === 'rejected'
      ) {
        submission.results[request.name] =
          'updated grant, submitted for re-approval';
      } else if (change.kind === 'reactivate') {
        submission.results[request.name] = 'reactivated approved connection';
      } else {
        submission.results[request.name] =
          existingGrant.status === 'approved' &&
          change.connection.isApproved === true
            ? 'already approved'
            : 'pending approval';
      }
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

    const candidateConnections = connections
      .filter(
        (connection) =>
          connection.clientId === subsystem.clientId &&
          connection.environment === normalizedEnvironment
      )
      .sort(compareConnections);

    const grantContexts: ConnectionGrantContext[] = [];
    for (const connection of candidateConnections) {
      const connectionId = requireNonBlank(
        connection.id,
        `Connection ID for service '${connection.serviceId}'`
      );
      const grants = await this.api.listConnectionClientGrants(
        subsystemOrgName,
        connectionId
      );
      if (grants.length === 0) {
        const legacyGrant = grantFromLegacyConnection(connection);
        if (legacyGrant) {
          grantContexts.push({ connection, grant: legacyGrant });
        }
      } else {
        grantContexts.push(...grants.map((grant) => ({ connection, grant })));
      }
    }

    const integrationGrants = grantContexts.filter(
      ({ grant }) => grant.integrationId === normalizedIntegrationId
    );
    if (integrationGrants.length === 0) {
      throw new NotFoundError(
        `No connections found for integration ${normalizedIntegrationId} in environment ${normalizedEnvironment}`
      );
    }

    const metadataGrants = integrationGrants.filter(({ connection, grant }) => {
      const clientId = grant.oauthClientId;
      if (typeof clientId === 'string' && clientId.trim().length > 0) {
        return true;
      }
      const err = new ConflictError(
        `Grant '${grant.id}' for connection '${connection.serviceId}' does not identify an OAuth client`
      );
      if (!options.skipMalformedConnections) {
        throw err;
      }
      this.logger?.warn(
        { err, connectionId: connection.id, grantId: grant.id },
        'Skipping malformed integration grant during revocation'
      );
      return false;
    });

    const clientIds = uniqueSorted(
      metadataGrants.map(({ grant }) => grant.oauthClientId.trim())
    );
    if (clientIds.length === 0) {
      throw new ConflictError(
        `Integration ${normalizedIntegrationId} has no usable OAuth client in environment ${normalizedEnvironment}`
      );
    }
    if (clientIds.length !== 1) {
      throw new ConflictError(
        `Integration ${normalizedIntegrationId} has grants for more than one OAuth client in environment ${normalizedEnvironment}`
      );
    }

    const submissionIds = uniqueSorted(
      metadataGrants
        .map(({ grant }) => grant.submissionId)
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

    const allowedGrants = metadataGrants.filter(({ connection, grant }) =>
      status === 'approved'
        ? connection.isApproved === true &&
          connection.isActive === true &&
          grant.status === 'approved'
        : grant.status === 'pending' ||
          (connection.isApproved !== true && grant.status === 'approved')
    );

    this.logger?.debug('Grants allowed %j', allowedGrants);

    const servicesBySubsystem = new Map<
      string,
      Map<string, { name: string; scopes: string[]; version: string }>
    >();

    for (const { connection, grant } of allowedGrants) {
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

        const scopes = normalizeGrantScopes(grant, serviceId);
        const version =
          grantServiceVersion(grant) ||
          connection.requesterDetails?.service?.version ||
          service.version;
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
          {
            err,
            connectionId: connection.id,
            grantId: grant.id,
            serviceId: connection.serviceId,
          },
          'Skipping malformed integration grant during revocation'
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

function planConnectionChange(
  existingConnections: ConnectionRequest[],
  subsystem: SubsystemEntry,
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
    };
  }

  if (existing.environment !== request.environment) {
    throw new ConflictError(
      `Connection for subsystem '${subsystem.clientId}' and service '${request.name}' has environment '${existing.environment}', not '${request.environment}'`
    );
  }

  if (existing.policyVersion !== policyVersion) {
    throw new ConflictError(
      `Connection for subsystem '${subsystem.clientId}' and service '${request.name}' uses policy '${existing.policyVersion}', not '${policyVersion}'`
    );
  }

  if (existing.isApproved && existing.isActive === false) {
    return {
      kind: 'reactivate',
      connection: existing,
      request,
      serviceOrgName: requireNonBlank(
        request.service.subsystem.organization?.name,
        `Organization for service '${request.name}'`
      ),
    };
  }

  return {
    kind: 'unchanged',
    connection: existing,
    request,
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

function normalizeGrantScopes(
  grant: ConnectionClientGrant,
  serviceName: string
): string[] {
  const scopes = grant.scopes;
  if (!Array.isArray(scopes)) {
    throw new ConflictError(
      `Grant for service '${serviceName}' does not contain a valid scope list`
    );
  }
  if (scopes.some((scope) => typeof scope !== 'string')) {
    throw new ConflictError(
      `Grant for service '${serviceName}' contains an invalid scope`
    );
  }
  const normalized = scopes.map((scope) => scope.trim());
  if (normalized.some((scope) => scope.length === 0)) {
    throw new ConflictError(
      `Grant for service '${serviceName}' contains a blank scope`
    );
  }
  return uniqueSorted(normalized);
}

function grantServiceVersion(grant: ConnectionClientGrant): string | undefined {
  const version = grant.requesterDetails?.service?.version;
  return typeof version === 'string' && version.trim().length > 0
    ? version.trim()
    : undefined;
}

function grantFromLegacyConnection(
  connection: ConnectionRequest
): ConnectionClientGrant | undefined {
  const details = connection.requesterDetails;
  const integrationId = details?.client?.integrationId;
  if (typeof integrationId !== 'string' || integrationId.trim().length === 0) {
    return undefined;
  }

  const oauthClientId = details?.client?.clientId;
  return {
    id: `legacy-${connection.id || connection.serviceId || 'connection'}`,
    connection: connection.id,
    integrationId: integrationId.trim(),
    oauthClientId:
      typeof oauthClientId === 'string' ? oauthClientId.trim() : '',
    submissionId:
      typeof details?.submissionId === 'string'
        ? details.submissionId
        : undefined,
    requesterDetails: details,
    scopes: details?.scopes,
    status: connection.isApproved ? 'approved' : 'pending',
  };
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
interface ConnectionGrantContext {
  connection: ConnectionRequest;
  grant: ConnectionClientGrant;
}
