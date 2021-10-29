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
import { logger } from '../../../logger';
import { lookupServicesByNamespace } from '../../keystone/gateway-service';

export interface ReportOfServiceAccess {
  namespace: string;
  service_name: string;
  routes?: string;
  plugin: string;
  consumer_username?: string;
  perm_acl?: string;
  perm_scope?: string;
  perm_role?: string;
}

/*
 */
export async function getServiceAccess(
  envCtx: EnvironmentContext,
  ksCtx: Keystone,
  namespaces: ReportOfNamespaces[],
  serviceLookup: Map<string, ReportOfGatewayMetrics>
): Promise<ReportOfServiceAccess[]> {
  const kongConsumerSvc = new KongConsumers(process.env.KONG_URL);
  const allKongConsumers = await kongConsumerSvc.getAllConsumers();

  const kongAclSvc = new KongACLService(process.env.KONG_URL);
  const kongAcls = await kongAclSvc.getAllAcls();

  const dataPromises = namespaces.map(
    async (ns): Promise<ReportOfServiceAccess[]> => {
      const data: ReportOfServiceAccess[] = [];

      const services = await lookupServicesByNamespace(ksCtx, ns.name);

      const envs = await lookupEnvironmentsByNS(ksCtx, ns.name);
      const subPromises = envs
        .map(
          async (env: Environment): Promise<ResourceServerContext> => {
            if (env.flow === 'client-credentials') {
              return await getResourceServerContext(env);
            }
            return;
          }
        )
        .filter((e) => e);
      const resSvcCtxs: ResourceServerContext[] = await Promise.all(
        subPromises
      );

      for (const service of services) {
        const plugin = service.plugins.filter((p) =>
          ['acl', 'jwt-keycloak'].includes(p.name)
        );
        if (plugin.length == 0) {
          continue;
        }

        const partial: ReportOfServiceAccess = {
          namespace: ns.name,
          service_name: service.name,
          routes: buildRouteList(service),
          plugin: plugin[0].name,
        };

        const pluginConfig = plugin[0].config as any;

        if (plugin[0].name === 'acl') {
          data.push(
            ...(await fillConsumerKongACLBasedAccess(
              kongAcls,
              allKongConsumers,
              pluginConfig.allow as string[],
              partial
            ))
          );
        }
        // if jwt-keycloak, then include consumers that have credentials issued
        if (plugin[0].name === 'jwt-keycloak') {
          const allowedIssuers = pluginConfig.allowed_iss;
          logger.debug(
            '[getServiceAccess] Service %s allowed Issuers %j',
            service.name,
            allowedIssuers
          );
          for (const resSvcCtx of resSvcCtxs.filter((svcCtx) =>
            allowedIssuers.includes(svcCtx.issuerEnvConfig.issuerUrl)
          )) {
            data.push(
              ...(await fillClientScopeBasedAccess(resSvcCtx, partial))
            );
          }
        }
      }
      return data;
    }
  );

  const reportOfReports = await Promise.all(dataPromises);
  return [].concat.apply([], reportOfReports);
}

/*
 */
async function fillConsumerKongACLBasedAccess(
  kongAcls: KongACL[],
  allKongConsumers: KongConsumer[],
  relevantAclGroups: string[],
  partial: ReportOfServiceAccess
): Promise<ReportOfServiceAccess[]> {
  const data: ReportOfServiceAccess[] = [];

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

      if (!handledAcls.includes(username)) {
        handledAcls.push(username);

        data.push({
          ...partial,
          consumer_username: username,
          perm_acl: 'allow - ' + acl.group,
        });
      }
    });

  return data;
}

/*
 */
async function fillClientScopeBasedAccess(
  resSvcCtx: ResourceServerContext,
  partial: ReportOfServiceAccess
): Promise<ReportOfServiceAccess[]> {
  const data: ReportOfServiceAccess[] = [];

  const env = resSvcCtx.prodEnv;

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
    '[getServiceAccess] %s (Client Count %d)',
    env.id,
    clients.length
  );

  const repeatChecker: string[] = [];

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
        '[getServiceAccess] %s (%s): %j',
        client.clientId,
        client.id,
        client.defaultClientScopes
      );

      const username = client.clientId;

      data.push({
        ...partial,
        consumer_username: username,
        perm_scope: client.defaultClientScopes.join(' '),
      });
    });
  return data;
}

function buildRouteList(service: GatewayService) {
  return [...service.routes?.map((route) => route.hosts)].join('\n');
}
