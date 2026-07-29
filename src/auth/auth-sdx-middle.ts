import { KeystoneService } from '../controllers/ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { Logger } from '../logger';
import { LookupOrganizationGatewayId } from '../services/workflow/create-namespace-sdx';

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

    if (pattern === 'sdx-p2p-consumer.r1' && body.parameters?.clientId) {
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

    if (pattern === 'sdx-p2p-provider.r1' && body.parameters?.serviceId) {
      return await this.lookupServiceGateway(org, body.parameters.serviceId);
    }

    const validPatterns = [
      'sdx-keys.r1',
      'sdx-p2p-consumer.r1',
      'sdx-p2p-provider.r1',
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
