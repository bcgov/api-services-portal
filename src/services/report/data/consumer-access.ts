import { GatewayPlugin } from '../../keystone/types';
import { Keystone } from '@keystonejs/keystone';
import { ReportOfNamespaces } from './namespaces';
import { lookupDetailedServiceAccessesByNS } from '../../keystone/service-access';
import { EnvironmentContext } from '../../workflow/get-namespaces';

interface ReportOfConsumerAccess {
  namespace: string;
  prod_name: string;
  prod_env_name: string;
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
  namespaces: ReportOfNamespaces[]
): Promise<ReportOfConsumerAccess[]> {
  const dataPromises = namespaces.map(
    async (ns): Promise<ReportOfConsumerAccess[]> => {
      const accesses = await lookupDetailedServiceAccessesByNS(ksCtx, ns.name);

      // perm_acl: get from Kong's ACL
      // perm_scope / perm_role : get from the credential issuer IdP

      let data: ReportOfConsumerAccess[] = [];
      accesses.forEach((access) => {
        data.push({
          namespace: ns.name,
          prod_name: access.productEnvironment?.product?.name,
          prod_env_name: access.productEnvironment?.name,
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
