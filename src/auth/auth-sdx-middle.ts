import { KeystoneService } from '../controllers/ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { Logger } from '../logger';
import { ForbiddenError } from './forbidden-error';

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
    // if no pattern, assume it is a connection request, so use serviceId
    if (body.serviceId) {
      if (!pattern) {
        return await this.lookupServiceGateway(org, body.serviceId);
      }
    }
    // else assume it is the various patterns
    if (body.parameters?.clientId) {
      if (pattern === 'sdx-keys.r1' || pattern === 'sdx-subsystem.r1') {
        return await this.lookupSubsystemGateway(org, body.parameters.clientId);
      }
    }
    if (body.parameters?.runtimeGroupName) {
      if (pattern === 'sdx-keys.r1' || pattern === 'sdx-runtime-group.r1') {
        return await this.lookupRuntimeGroupGateway(
          org,
          body.parameters.runtimeGroupName,
          body.parameters.environment
        );
      }
    }
    if (body.parameters?.serviceId) {
      if (pattern === 'sdx-service.r1') {
        return await this.lookupServiceGateway(org, body.parameters.serviceId);
      }
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
    const ctx = this.keystone.sudo();
    const result = await ctx.executeGraphQL({
      query: `query SubsystemNameByOrgName($org: String!, $name: String!) {
      allSubsystems(where: { name: $name, organization: { name: $org } }, first: 1) {
      name, namespace }
    }`,
      variables: { org, name: parts[2] },
    });

    logger.debug("Subsystems = '%j'", result);

    return result.data?.allSubsystems?.[0]?.namespace;
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
