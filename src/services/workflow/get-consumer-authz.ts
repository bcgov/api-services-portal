import { KeycloakClientService, KeycloakUserService } from '../keycloak';

import { Logger } from '../../logger';
import { EnvironmentContext } from './get-namespaces';

const logger = Logger('wf.getconsumerauthz');

export async function getConsumerAuthz(
  envCtx: EnvironmentContext,
  consumerUsername: string
): Promise<any> {
  logger.debug('[getConsumerAuthz] %s', consumerUsername);
  try {
    const kcClientService = new KeycloakClientService(
      envCtx.issuerEnvConfig.issuerUrl
    );
    const kcUserService = new KeycloakUserService(
      envCtx.issuerEnvConfig.issuerUrl
    );
    await kcClientService.login(
      envCtx.issuerEnvConfig.clientId,
      envCtx.issuerEnvConfig.clientSecret
    );
    await kcUserService.login(
      envCtx.issuerEnvConfig.clientId,
      envCtx.issuerEnvConfig.clientSecret
    );

    const client = await kcClientService.findByClientId(
      envCtx.issuerEnvConfig.clientId
    );

    const isClient = await kcClientService.isClient(consumerUsername);

    if (isClient) {
      const consumerClient = await kcClientService.findByClientId(
        consumerUsername
      );
      const userId = await kcClientService.lookupServiceAccountUserId(
        consumerClient.id
      );
      const userRoles = await kcUserService.listUserClientRoles(
        userId,
        client.id
      );
      const defaultScopes = await kcClientService.listDefaultScopes(
        consumerClient.id
      );

      return {
        id: userId,
        consumerType: 'client',
        defaultScopes: defaultScopes.map((v: any) => v.name),
        optionalScopes: [],
        clientRoles: userRoles.map((r: any) => r.name),
      } as any;
    } else {
      const userId = await kcUserService.lookupUserByUsername(consumerUsername);
      const userRoles = await kcUserService.listUserClientRoles(
        userId,
        client.id
      );
      return {
        id: userId,
        consumerType: 'user',
        defaultScopes: [],
        optionalScopes: [],
        clientRoles: userRoles.map((r: any) => r.name),
      } as any;
    }
  } catch (err: any) {
    logger.error(
      '[getConsumerAuthz] (%j) Error %s',
      consumerUsername,
      err.message
    );
    throw err;
  }
}
