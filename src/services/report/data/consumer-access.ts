import { Environment, ServiceAccess } from '../../keystone/types';
import { Keystone } from '@keystonejs/keystone';
import { ReportOfNamespaces } from './namespaces';
import { lookupDetailedServiceAccessesByNS } from '../../keystone/service-access';
import {
  EnvironmentContext,
  getResourceServerContext,
  ResourceServerContext,
} from '../../workflow/get-namespaces';
import { KongACLService, KongConsumers } from '../../kong';
import { ReportOfGatewayMetrics } from './gateway-metrics';
import { lookupEnvironmentsByNS } from '../../keystone/product-environment';
import { KeycloakClientService, KeycloakUserService } from '../../keycloak';
import { logger } from '../../../logger';

export interface ReportOfConsumerAccess {
  namespace: string;
  prod_name: string;
  prod_env_name: string;
  prod_env_app_id: string;
  prod_env_flow: string;
  prod_env_issuer?: string;
  consumer_username: string;
  consumer_updated: string;
  idp_client_id?: string;
  app_name?: string;
  app_id?: string;
  app_owner?: string;
  perm_acl?: string;
  perm_scope?: string;
  perm_role?: string;
}

/*
 */
export async function getConsumerAccess(
  envCtx: EnvironmentContext,
  ksCtx: Keystone,
  namespaces: ReportOfNamespaces[],
  serviceLookup: Map<string, ReportOfGatewayMetrics>
): Promise<ReportOfConsumerAccess[]> {
  const kongConsumerSvc = new KongConsumers(process.env.KONG_URL);
  const allConsumers = await kongConsumerSvc.getAllConsumers();

  const kongAclSvc = new KongACLService(process.env.KONG_URL);
  const kongAcls = await kongAclSvc.getAllAcls();

  const dataPromises = namespaces.map(
    async (ns): Promise<ReportOfConsumerAccess[]> => {
      const repeatChecker: any = {};
      let data: ReportOfConsumerAccess[] = [];

      // accesses will be used to suppliment
      const accesses = await lookupDetailedServiceAccessesByNS(ksCtx, ns.name);
      const consumerLookup: any = {};
      accesses.forEach((access: ServiceAccess) => {
        consumerLookup[access.consumer.username] = access;
      });

      // lookup Product Environment Credential Issuer
      // For each, get a list of the protected Routes via the Plugin and add to a column
      // For each, either find out the Consumers that have the ACL
      // or use getResourceServerContext and the kcAdmin to lookup Scope and Role details
      // Require: Quick lookup of IdP Consumer ID to (Consumer,Application,Requestor)
      // Reference: Kong Consumer ID
      const envs = await lookupEnvironmentsByNS(ksCtx, ns.name);
      const subPromises = envs.map(
        async (env: Environment): Promise<void> => {
          if (env.flow === 'client-credentials') {
            const resSvcCtx = await getResourceServerContext(env);
            if (resSvcCtx != null) {
              if (env.credentialIssuer.id in repeatChecker) {
                return;
              }
              repeatChecker[env.credentialIssuer.id] = 'processed';

              const applicableScopes = env.credentialIssuer.availableScopes
                ? JSON.parse(env.credentialIssuer.availableScopes)
                : [];
              const applicableRoles = env.credentialIssuer.clientRoles
                ? JSON.parse(env.credentialIssuer.clientRoles)
                : [];

              const kcClient = new KeycloakClientService(
                resSvcCtx.openid.issuer,
                null
              );

              const kcUser = new KeycloakUserService(resSvcCtx.openid.issuer);

              try {
                await kcClient.login(
                  resSvcCtx.issuerEnvConfig.clientId,
                  resSvcCtx.issuerEnvConfig.clientSecret
                );
                await kcUser.login(
                  resSvcCtx.issuerEnvConfig.clientId,
                  resSvcCtx.issuerEnvConfig.clientSecret
                );

                const clients = await kcClient.list();
                logger.debug(
                  '[getConsumerAccess] %s (Client Count %d)',
                  env.id,
                  clients.length
                );
                clients
                  .filter(
                    (client: any) =>
                      [...applicableScopes].filter(
                        (s) =>
                          client.defaultClientScopes &&
                          client.defaultClientScopes.includes(s)
                      ).length > 0
                  )
                  .forEach((client: any) => {
                    repeatChecker[client.clientId] = 'processed';

                    logger.debug(
                      '[getConsumerAccess] %s (%s): %j',
                      client.clientId,
                      client.id,
                      client.defaultClientScopes
                    );
                    const access =
                      client.clientId in consumerLookup
                        ? consumerLookup[client.clientId]
                        : {};

                    data.push({
                      namespace: ns.name,
                      prod_name: env.product.name,
                      prod_env_name: env.name,
                      prod_env_app_id: env.appId,
                      prod_env_flow: env.flow,
                      prod_env_issuer: env.credentialIssuer?.name,
                      consumer_username: client.clientId,
                      consumer_updated: access.consumer?.updatedAt,
                      idp_client_id: client.id,
                      app_name: access.application?.name,
                      app_id: access.application?.appId,
                      app_owner: access.application?.owner?.username,
                      perm_acl: '',
                      perm_scope: client.defaultClientScopes.join(' '),
                      perm_role: '',
                    });
                  });

                // ROLES
                //
                const resClient = await kcClient.findByClientId(
                  resSvcCtx.issuerEnvConfig.clientId
                );
                const roles = await kcClient.listRoles(resClient.id);
                for (const role of roles.filter((role: any) =>
                  applicableRoles.includes(role.name)
                )) {
                  const users = await kcClient.findUsersWithRole(
                    resClient.id,
                    role.name
                  );
                  // find the Clients that have these user IDs
                  for (const user of users) {
                    if (user.username.startsWith('service-account')) {
                      const serviceAccount = user.username
                        .substr('service-account-'.length)
                        .toUpperCase();
                      logger.debug(
                        '[roles] %s : %s',
                        role.name,
                        serviceAccount
                      );

                      repeatChecker[serviceAccount] = 'processed';

                      const access =
                        serviceAccount in consumerLookup
                          ? consumerLookup[serviceAccount]
                          : {};

                      data.push({
                        namespace: ns.name,
                        prod_name: env.product.name,
                        prod_env_name: env.name,
                        prod_env_app_id: env.appId,
                        prod_env_flow: env.flow,
                        prod_env_issuer: env.credentialIssuer?.name,
                        consumer_username: serviceAccount,
                        consumer_updated: access.consumer?.updatedAt,
                        idp_client_id: '',
                        app_name: access.application?.name,
                        app_id: access.application?.appId,
                        app_owner: access.application?.owner?.username,
                        perm_acl: '',
                        perm_scope: '',
                        perm_role: role.name,
                      });
                    }
                  }
                }
              } catch (e) {
                logger.error(
                  '[getConsumerAccess] %s %s Processing Error! %s',
                  env.product.name,
                  env.name,
                  e
                );
              }
            } else {
              logger.error(
                '[getConsumerAccess] %s %s CredIssuer Missing!',
                env.product.name,
                env.name
              );
            }
          } else {
            // evaluate Kong ACL matches
            // perm_acl: get from Kong's ACL
            kongAcls.forEach((acl) => {
              const consumerFiltered = allConsumers.filter(
                (cons) => cons.id == acl.consumer.id
              );
              if (consumerFiltered.length != 1) {
                logger.warn(
                  '[acl] Consumer was not found!  Very unusual %s',
                  acl.consumer.id
                );
                return;
              }
              const username = consumerFiltered[0].username;

              if (env.appId === acl.group && username in consumerLookup) {
                const access: ServiceAccess = consumerLookup[username];

                repeatChecker[username] = 'processed';

                data.push({
                  namespace: ns.name,
                  prod_name: env.product.name,
                  prod_env_name: env.name,
                  prod_env_app_id: env.appId,
                  prod_env_flow: env.flow,
                  prod_env_issuer: env.credentialIssuer?.name,
                  consumer_username: access.consumer?.username,
                  consumer_updated: access.consumer?.updatedAt,
                  idp_client_id: '',
                  app_name: access.application?.name,
                  app_id: access.application?.appId,
                  app_owner: access.application?.owner?.username,
                  perm_acl: 'allow',
                  perm_scope: '',
                  perm_role: '',
                });
              } else {
                logger.warn(
                  '[acl] %s ignored - not applicable for this environment or missing from Service Access',
                  acl.group
                );
              }
            });
          }
        }
      );
      await Promise.all(subPromises);

      accesses
        .filter((access) => !(access.consumer.username in repeatChecker))
        .forEach((access) => {
          data.push({
            namespace: ns.name,
            prod_name: access.productEnvironment?.product?.name,
            prod_env_name: access.productEnvironment?.name,
            prod_env_app_id: access.productEnvironment?.appId,
            prod_env_flow: access.productEnvironment?.flow,
            prod_env_issuer: access.productEnvironment?.credentialIssuer?.name,
            consumer_username: access.consumer.username,
            consumer_updated: access.consumer.updatedAt,
            idp_client_id: '',
            app_name: access.application?.name,
            app_id: access.application?.appId,
            app_owner: access.application?.owner?.username,
            perm_acl: '',
            perm_scope: '',
            perm_role: '',
          });
        });
      return data;
    }
  );

  const reportOfReports = await Promise.all(dataPromises);
  return [].concat.apply([], reportOfReports);
}
