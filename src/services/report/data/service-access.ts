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
  consumer_username: string;
  service_name: string;
  routes?: string;
  plugin: string;
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

  // Gather up all the Clients that all the Environments
  // This will be used to group them into the services that are protected by it

  // use the ReportOfGatewayMetrics to traverse Service and Routes
  // to determine the Plugin (flow)

  if (true) {
    return [];
  }

  // const reportOfReports = await Promise.all(dataPromises);
  // return [].concat.apply([], reportOfReports);
}
