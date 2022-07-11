import { logger } from '../../logger';
import { lookupServiceAccessesByEnvironment } from '../keystone';
import { lookupKongConsumerIds } from '../keystone/gateway-consumer';
import { lookupConsumerIdsByLabels } from '../keystone/labels';
import { lookupEnvironmentsByNS } from '../keystone/product-environment';
import { Environment } from '../keystone/types';
import { KongACLService, KongConsumerService } from '../kong';
import { ConsumerQueryFilter } from './types';

export async function doFiltering(
  context: any,
  ns: string,
  filter: ConsumerQueryFilter
): Promise<string[]> {
  const promises = [];
  if (filter.products?.length > 0 || filter.environments?.length > 0) {
    promises.push(
      filterByProductAndEnvironment(
        context,
        ns,
        filter.products,
        filter.environments
      )
    );
  }
  if (filter.labels?.length > 0) {
    promises.push(
      filterByLabel(
        context,
        ns,
        filter.labels[0].labelGroup,
        filter.labels[0].value
      )
    );
  }
  if (promises.length == 0) {
    return undefined;
  }

  // ok, this flattens an array of array of strings, and then de-duplicates them
  return [
    ...new Set([].concat.apply([], await Promise.all(promises)) as string[]),
  ];
}

/**
 * Can be from Service Access records, or derived from Kong ACLs
 *
 * @param productName
 * @param envName
 * @returns
 */
async function filterByProductAndEnvironment(
  context: any,
  ns: string,
  products: string[],
  envNames: string[]
): Promise<string[]> {
  // find the ProductEnvironments that the ACL 'group' corresponds to
  const envs = await lookupEnvironmentsByNS(context, ns);

  const filteredEnvs = envs
    .filter(
      (e) =>
        !products || products.length == 0 || products.includes(e.product.id)
    )
    .filter(
      (e) => !envNames || envNames.length == 0 || envNames.includes(e.name)
    );

  logger.debug(
    '[filterByProductAndEnvironment] Filtered Envs %s %s : %j',
    products,
    envNames,
    filteredEnvs
  );

  const aclBasedConsumerIds = await queryACLConsumerIds(context, filteredEnvs);
  logger.debug('[filterByProductAndEnvironment] %j', aclBasedConsumerIds);

  // Now get Consumers from the ServiceAccess matching the envs
  const serviceAccessBasedIds = await queryServiceAccessConsumerIds(
    context,
    ns,
    filteredEnvs
  );
  logger.debug('[filterByProductAndEnvironment] %j', serviceAccessBasedIds);

  return aclBasedConsumerIds.concat(serviceAccessBasedIds);
}

/**
 *
 * @param context
 * @param envs
 */
async function queryACLConsumerIds(
  context: any,
  envs: Environment[]
): Promise<string[]> {
  const envAppIds = envs
    .filter((e) => e.flow === 'kong-api-key-acl')
    .map((e) => e.appId);

  if (envAppIds.length == 0) {
    return [];
  }

  const kongApi = new KongACLService(process.env.KONG_URL);
  const allAcls = await kongApi.getAllAcls();

  const matchedKongConsumerIds = allAcls
    .filter((acl) => envAppIds.includes(acl.group))
    .map((acl) => acl.consumer.id);

  return (await lookupKongConsumerIds(context, matchedKongConsumerIds)).map(
    (c) => c.id
  );
}

/**
 *
 * @param context
 * @param envs
 * @param products
 * @param envNames
 */
async function queryServiceAccessConsumerIds(
  context: any,
  ns: string,
  envs: Environment[]
): Promise<string[]> {
  const envIds = envs.map((e) => e.id);

  return (await lookupServiceAccessesByEnvironment(context, ns, envIds)).map(
    (c) => c.consumer.id
  );
}

/**
 * Use Service Access records to find Consumers with Product Credential issuers having that Scope or Role
 * Call the IdP to get all Clients that have that permission
 * Lookup Consumers matching the Client IDs in Custom ID
 *
 * @param context
 * @param scope
 * @param role
 * @returns
 */
async function filterByScopesAndRoles(
  context: any,
  ns: string,
  scope: string,
  role: string
): Promise<string[]> {
  return null;
}

/**
 * Use Labels to look up Consumer IDs
 *
 * @param labelGroup
 * @param value
 * @returns
 */
async function filterByLabel(
  context: any,
  ns: string,
  labelGroup: string,
  value: string
): Promise<string[]> {
  return await lookupConsumerIdsByLabels(context, ns, labelGroup, value);
}
