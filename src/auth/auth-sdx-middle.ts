import { KeystoneService } from '../controllers/ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { Logger } from '../logger';
import { LookupOrganizationGatewayId } from '../services/workflow/create-namespace-sdx';
import {
  getGwaProductEnvironment,
  getPermittedNamespaceNames,
  injectResSvrAccessTokenToContext,
} from '../services/workflow';
import GetRequestAuthToken from './auth-token';

const logger = Logger('auth-sdx-middle');

@injectable()
export class AuthMiddle {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    this.keystone = _keystone;
  }

  public async lookupGatewayId(
    org: string,
    pattern: string,
    body: any
  ): Promise<string | undefined> {
    logger.debug(
      "[lookupGatewayId] org='%s', pattern='%s', body='%j'",
      org,
      pattern,
      body
    );

    // if no pattern, assume it is a connection request, so use serviceId
    if (body.serviceId) {
      if (!pattern) {
        return await this.lookupServiceGateway(org, body.serviceId);
      }
    }
    if (pattern === 'sdx-keys.r1') {
      if (body.parameters?.clientId) {
        return await this.lookupSubsystemGateway(org, body.parameters.clientId);
      } else if (body.parameters?.runtimeGroupName) {
        return await this.lookupRuntimeGroupGateway(
          org,
          body.parameters.runtimeGroupName,
          body.parameters.environment
        );
      } else {
        // assume org, so return org gateaway
        const { gatewayId } = await LookupOrganizationGatewayId(
          this.keystone.sudo(),
          org
        );
        return gatewayId;
      }
    }
    // else assume it is the various patterns

    if (pattern === 'sdx-subsystem.r1' && body.parameters?.clientId) {
      return await this.lookupSubsystemGateway(org, body.parameters.clientId);
    }

    if (
      pattern === 'sdx-runtime-group.r1' &&
      body.parameters?.runtimeGroupName
    ) {
      return await this.lookupRuntimeGroupGateway(
        org,
        body.parameters.runtimeGroupName,
        body.parameters.environment
      );
    }

    if (pattern === 'sdx-service.r1' && body.parameters?.serviceId) {
      return await this.lookupServiceGateway(org, body.parameters.serviceId);
    }

    const validPatterns = [
      'sdx-keys.r1',
      'sdx-runtime-group.r1',
      'sdx-service.r1',
      'sdx-subsystem.r1',
    ];
    if (!validPatterns.includes(pattern)) {
      logger.error(
        "[lookupGatewayId] unknown pattern='%s', expecting='%s'",
        pattern,
        validPatterns.join(', ')
      );
    }

    return undefined;
  }

  /**
   *
   * @param org
   * @param clientId
   * @returns gatewayId
   */
  async lookupSubsystemGateway(org: string, clientId: string): Promise<string> {
    const parts = clientId.split('.');

    logger.debug(
      "[lookupSubsystemGateway] org='%s', clientId='%s', parts='%j'",
      org,
      clientId,
      parts[2]
    );

    return await this.lookupSubsystemGatewayByName(org, parts[2]);
  }

  /**
   *
   * @param org
   * @param name subsystem name (not clientId)
   * @returns gatewayId
   */
  async lookupSubsystemGatewayByName(
    org: string,
    name: string
  ): Promise<string> {
    const ctx = this.keystone.sudo();
    const result = await ctx.executeGraphQL({
      query: `query SubsystemNameByOrgName($org: String!, $name: String!) {
      allSubsystems(where: { name: $name, organization: { name: $org } }, first: 1) {
      name, namespace }
    }`,
      variables: { org, name },
    });

    logger.debug("Subsystems = '%j'", result);

    return result.data?.allSubsystems?.[0]?.namespace;
  }

  /**
   * Resolves the gateway namespace that a Subsystem.Manage check should be evaluated
   * against, across every endpoint that accepts it:
   *  - oas-services get/spec/delete: the `name` path param (that service's own gateway)
   *  - oas-services create: the `subsystem` query param (the service doesn't exist yet)
   *  - connections create (upsertConnection): `body.serviceId`
   *  - connections delete: `id`, looked up to that connection's own `serviceId`
   * List (oas-services and connections both) has no identifying resource and returns
   * undefined, so the caller falls back to the discovery-based check instead.
   *
   * @param org
   * @param name OAS service name (path param), if present
   * @param subsystem subsystem name (query param, used on oas-services create), if present
   * @param serviceId OAS service name (body param, used on connection create), if present
   * @param connectionId ConnectionRequest id (path param, used on connection delete), if present
   * @returns gatewayId, or undefined if there's nothing to scope to (e.g. list)
   */
  async lookupSubsystemManageGatewayId(
    org: string,
    name?: string,
    subsystem?: string,
    serviceId?: string,
    connectionId?: string
  ): Promise<string | undefined> {
    if (name) {
      return await this.lookupServiceGateway(org, name);
    }
    if (serviceId) {
      return await this.lookupServiceGateway(org, serviceId);
    }
    if (subsystem) {
      return await this.lookupSubsystemGatewayByName(org, subsystem);
    }
    if (connectionId) {
      const connectionServiceId = await this.lookupConnectionServiceId(
        connectionId
      );
      if (connectionServiceId) {
        return await this.lookupServiceGateway(org, connectionServiceId);
      }
    }
    return undefined;
  }

  /**
   *
   * @param id ConnectionRequest id
   * @returns the connection's serviceId, if found
   */
  async lookupConnectionServiceId(id: string): Promise<string | undefined> {
    const ctx = this.keystone.sudo();
    const result = await ctx.executeGraphQL({
      query: `query ConnectionRequestById($id: ID!) {
      allConnectionRequests(where: { id: $id }, first: 1) {
      id, serviceId }
    }`,
      variables: { id },
    });

    logger.debug("ConnectionRequest = '%j'", result);

    return result.data?.allConnectionRequests?.[0]?.serviceId;
  }

  /**
   * Discovers which gateway namespace resources the caller (identified by their
   * own bearer token, already verified by the time this is called) has been
   * granted the given scope(s) on, via a UMA2 permission-ticket exchange. Used
   * for operations (like listing oas-services) that have no single resource to
   * resolve, where "authorized" means "holds this scope on at least one
   * resource" and the caller is expected to further filter by the result.
   *
   * @param request the already JWT-verified express request
   * @param scopes UMA2 scopes to check for, e.g. ['Subsystem.Manage']
   * @returns the resource names (gateway ids) the caller holds the scope(s) on
   */
  async getPermittedNamespacesForScope(
    request: any,
    scopes: string[]
  ): Promise<string[]> {
    const envCtx = await getGwaProductEnvironment(this.keystone.sudo(), false);
    envCtx.subjectToken = GetRequestAuthToken(request);
    envCtx.subjectUuid = request.oauth_user?.sub;
    await injectResSvrAccessTokenToContext(envCtx);
    return await getPermittedNamespaceNames(envCtx, scopes);
  }

  /**
   *
   * @param org
   * @param name
   * @returns gatewayId
   */
  async lookupServiceGateway(org: string, name: string): Promise<string> {
    const ctx = this.keystone.sudo();
    const result = await ctx.executeGraphQL({
      query: `query ServiceNameByOrgName($org: String!, $name: ID!) {
      allOpenAPISpecs(where: { name: $name, organization: { name: $org } }, first: 1) {
      name, namespace }
    }`,
      variables: { org, name },
    });

    logger.debug("Services = '%j'", result);

    return result.data?.allOpenAPISpecs?.[0]?.namespace;
  }

  /**
   *
   * @param org
   * @param name
   * @param environment
   * @returns gatewayId
   */
  async lookupRuntimeGroupGateway(
    org: string,
    name: string,
    environment: string
  ): Promise<any> {
    const ctx = this.keystone.sudo();
    const result = await ctx.executeGraphQL({
      query: `query RuntimeGroupByName($org: String!, $name: String!, $environment: String!) {
      allRuntimeGroups(where: { name: $name, environment: $environment, organization: { name: $org } }, first: 1) {
      name, namespace }
    }`,
      variables: { org, name, environment },
    });

    logger.debug("Runtime Groups = '%j'", result);

    // there may be environment-specific runtime group records, but they will all share
    // the same namespace, so we can just return the first one
    return result.data?.allRuntimeGroups?.[0]?.namespace;
  }
}
