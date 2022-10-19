import {
  Environment,
  GatewayPlugin,
  GatewayService,
  ServiceAccess,
} from '../../keystone/types';
import { Keystone } from '@keystonejs/keystone';
import { ReportOfNamespaces } from './namespaces';
import { lookupDetailedServiceAccessesByNS } from '../../keystone/service-access';
import {
  EnvironmentContext,
  getResourceServerContext,
  ResourceServerContext,
} from '../../workflow/get-namespaces';
import { KongConsumer } from '../../kong/consumer';
import { KongACLService, KongACL, KongConsumers } from '../../kong';
import { ReportOfGatewayMetrics } from './gateway-metrics';
import { lookupEnvironmentsByNS } from '../../keystone/product-environment';
import { KeycloakClientService, KeycloakUserService } from '../../keycloak';
import { Logger } from '../../../logger';
import { lookupServicesByNamespace } from '../../keystone/gateway-service';

const logger = Logger('report.access');

export interface ReportOfConsumerAccess {
  namespace: string;
  consumer_username: string;
  prod_env_issuer?: string;
  perm_acl?: string;
  perm_scope?: string;
  perm_role?: string;
  prod_name: string;
  prod_env_name: string;
  prod_env_app_id: string;
  prod_env_flow: string;
  consumer_updated: string;
  idp_client_id?: string;
  app_name?: string;
  app_id?: string;
  app_owner?: string;
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
  const allKongConsumers = await kongConsumerSvc.getAllConsumers();

  const kongAclSvc = new KongACLService(process.env.KONG_URL);
  const kongAcls = await kongAclSvc.getAllAcls();

  const dataPromises = namespaces.map(
    async (ns): Promise<ReportOfConsumerAccess[]> => {
      const repeatChecker: any = {};
      let data: ReportOfConsumerAccess[] = [];

      const services = await lookupServicesByNamespace(ksCtx, ns.name);
      const relevantAclGroups = findAllRelevantAclGroups(services);

      // accesses will be used to suppliment
      const accesses = await lookupDetailedServiceAccessesByNS(ksCtx, ns.name);
      const consumerLookup: any = {};
      accesses.forEach((access: ServiceAccess) => {
        if (access.consumer) {
          consumerLookup[access.consumer.username] = access;
        } else {
          logger.warn('Service Access with Missing Consumer! %j', access);
        }
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

              try {
                data.push(
                  ...(await fillClientScopeBasedAccess(
                    ns,
                    env,
                    resSvcCtx,
                    consumerLookup,
                    repeatChecker
                  ))
                );

                data.push(
                  ...(await fillClientRoleBasedAccess(
                    ns,
                    env,
                    resSvcCtx,
                    consumerLookup,
                    repeatChecker
                  ))
                );
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
            data.push(
              ...(await fillConsumerKongACLBasedAccess(
                ns,
                env,
                kongAcls,
                consumerLookup,
                repeatChecker,
                allKongConsumers,
                relevantAclGroups
              ))
            );
          }
        }
      );
      await Promise.all(subPromises);

      accesses
        .filter((access) => access.consumer)
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

/*
 */
async function fillClientScopeBasedAccess(
  ns: ReportOfNamespaces,
  env: Environment,
  resSvcCtx: ResourceServerContext,
  consumerLookup: any,
  repeatChecker: any
): Promise<ReportOfConsumerAccess[]> {
  const data: ReportOfConsumerAccess[] = [];

  const applicableScopes = env.credentialIssuer.availableScopes
    ? JSON.parse(env.credentialIssuer.availableScopes)
    : [];

  const kcClient = new KeycloakClientService(resSvcCtx.openid.issuer, null);
  await kcClient.login(
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
            client.defaultClientScopes && client.defaultClientScopes.includes(s)
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
  return data;
}

/*
 */
async function fillClientRoleBasedAccess(
  ns: ReportOfNamespaces,
  env: Environment,
  resSvcCtx: ResourceServerContext,
  consumerLookup: any,
  repeatChecker: any
): Promise<ReportOfConsumerAccess[]> {
  const data: ReportOfConsumerAccess[] = [];

  const applicableRoles = env.credentialIssuer.clientRoles
    ? JSON.parse(env.credentialIssuer.clientRoles)
    : [];

  const kcClient = new KeycloakClientService(resSvcCtx.openid.issuer, null);
  await kcClient.login(
    resSvcCtx.issuerEnvConfig.clientId,
    resSvcCtx.issuerEnvConfig.clientSecret
  );

  const kcUser = new KeycloakUserService(resSvcCtx.openid.issuer);
  await kcUser.login(
    resSvcCtx.issuerEnvConfig.clientId,
    resSvcCtx.issuerEnvConfig.clientSecret
  );

  const resClient = await kcClient.findByClientId(
    resSvcCtx.issuerEnvConfig.clientId
  );
  const roles = await kcClient.listRoles(resClient.id);
  for (const role of roles.filter((r: any) =>
    applicableRoles.includes(r.name)
  )) {
    const users = await kcClient.findUsersWithRole(resClient.id, role.name);
    // find the Clients that have these user IDs
    for (const user of users) {
      if (user.username.startsWith('service-account')) {
        const serviceAccount = user.username
          .substr('service-account-'.length)
          .toUpperCase();
        logger.debug('[roles] %s : %s', role.name, serviceAccount);

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
  return data;
}

/*
 */
async function fillConsumerKongACLBasedAccess(
  ns: ReportOfNamespaces,
  env: Environment,
  kongAcls: KongACL[],
  consumerLookup: any,
  repeatChecker: any,
  allKongConsumers: KongConsumer[],
  relevantAclGroups: string[]
): Promise<ReportOfConsumerAccess[]> {
  const data: ReportOfConsumerAccess[] = [];

  const handledAcls: string[] = [];

  // evaluate Kong ACL matches
  // perm_acl: get from Kong's ACL
  kongAcls
    .filter((acl) => relevantAclGroups.includes(acl.group))
    .forEach((acl) => {
      const consumerFiltered = allKongConsumers.filter(
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
        handledAcls.push(acl.group);

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

  kongAcls
    .filter((acl) => relevantAclGroups.includes(acl.group))
    .filter((acl) => !handledAcls.includes(acl.group))
    .forEach((acl) => {
      const consumerFiltered = allKongConsumers.filter(
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

      data.push({
        namespace: ns.name,
        prod_name: '',
        prod_env_name: '',
        prod_env_app_id: acl.group,
        prod_env_flow: '',
        prod_env_issuer: '',
        consumer_username: username,
        consumer_updated: '',
        idp_client_id: '',
        app_name: '',
        app_id: '',
        app_owner: '',
        perm_acl: 'allow',
        perm_scope: '',
        perm_role: '',
      });
    });
  return data;
}

function findAllRelevantAclGroups(services: GatewayService[]) {
  const allGroups: string[] = [];

  function evalPlugin(_plugin: GatewayPlugin) {
    const config: any = _plugin.config;
    allGroups.push(...config.allow);
  }

  services.forEach((service) => {
    service.plugins
      .filter((plugin) => plugin.name === 'acl')
      .forEach(evalPlugin);
    service.routes?.forEach((route) => {
      route.plugins
        .filter((plugin) => plugin.name === 'acl')
        .forEach(evalPlugin);
    });
  });
  return [...new Set(allGroups)].sort();
}
