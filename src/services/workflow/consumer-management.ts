/**
 * Consumer Products supports the new Consumer List and Detail page
 *
 * There are some special consideration required, due to how the
 * previous Consumer detail page was implemented.
 *
 * The old detail page allowed Kong ACLs to be updated within the context
 * of the single ServiceAccess record.  So no additional ServiceAccess records
 * were created.
 *
 * So the ServiceAccess is a reasonable way of getting a unique set of Consumers,
 * it is not a reasonable way for managing them.
 *
 * getFilteredNamespaceConsumers will take a list of Filter criteria and return a
 * full list of Consumers with minimal information (name, labels, last update date)
 *
 * Filters:
 *   - product/environment
 *   - scope
 *   - role
 *   - label?
 *
 * getConsumerAccess will take a Service Access record, use the Consumer and Application
 * and then combine the Service Access with other Service Access records for that Consumer plus
 * derived data from Kong ACL to get a full list of ConsumerAccess.  Access Request would get
 * added to a particular ConsumerProdEnvAccess record for enriched detail.  Controls can be blended
 * into the ConsumerProdEnvAccess records.  (Perhaps an "Unmanaged Controls" to show controls that
 * are not for a particular ProductEnvironment)
 *
 * getConsumerProdEnvAccess will return similar data to getConsumerAccess but will go into details about
 * the Authorization that the getConsumerAccess will not do.  It will include Access Request details
 *
 * grantConsumerProdEnvAccess will create a new ServiceAccess record for the particular ProductEnvironment
 * : Will be similar to submitting an Access Request, but assume Consumer already exists and
 *   creds already communicated; so possible plugin updates and Scope/Role updates
 * : Validation: If the IdP does not have the Consumer registered, then do not allow this to happen:
 *      "Unable to find Consumer on IdP"
 * : Controls and Authorization (Scopes/Roles) will be included in request (like the "controls")
 *
 * updateConsumerProdEnvAccess will update controls and authorization details
 * : If there was an original Request then show the information for that
 *
 * revokeConsumerProdEnvAccess is only valid for acl flows and will revoke access to the Consumer
 * : For revoking access to IdP based authorization, the Consumer must be deleted
 *
 * labels:
 * - Label Groups are derived from the Label table
 * - Labels are saved as a whole (saveConsumerLabels)
 * - Labels are included in the getFilteredNamespaceConsumers and getConsumerAccess queries
 */

import {
  getAccessRequestByNamespaceServiceAccess,
  lookupConsumerPlugins,
  lookupCredentialReferenceByServiceAccess,
  lookupLabeledServiceAccessesForNamespace,
  lookupServiceAccessesByConsumer,
  lookupServiceAccessesByNamespace,
} from '../keystone';
import { lookupEnvironmentsByNS } from '../keystone/product-environment';
import { KongConsumerService } from '../kong';
import {
  ConsumerAccess,
  ConsumerLabel,
  ConsumerProdEnvAccess,
  ConsumerSummary,
} from './types';
import { Logger } from '../../logger';
import { strict as assert } from 'assert';

const logger = Logger('wf.ConsumerMgmt');

export async function getFilteredNamespaceConsumers(
  context: any,
  ns: string
): Promise<ConsumerSummary[]> {
  logger.debug('[getFilteredNamespaceConsumers] %s', ns);
  return (await lookupLabeledServiceAccessesForNamespace(context, ns))
    .filter((acc) => acc.consumer)
    .map((acc) => {
      return {
        id: acc.id,
        username: acc.consumer.username,
        customId: acc.consumer.customId,
        consumerType: acc.consumerType,
        labels: acc.labels.map(
          (l) =>
            ({
              labelGroup: l.name,
              values: JSON.parse(l.value),
            } as ConsumerLabel)
        ),
        lastUpdated: acc.updatedAt,
      } as ConsumerSummary;
    });
}

export async function getNamespaceConsumerAccess(
  context: any,
  ns: string,
  serviceAccessId: string
): Promise<ConsumerAccess> {
  logger.debug('[getNamespaceConsumerAccess] %s %s', ns, serviceAccessId);

  const serviceAccess = await lookupCredentialReferenceByServiceAccess(
    context,
    serviceAccessId
  );

  const access: ConsumerAccess = {
    consumer: serviceAccess.consumer,
    application: serviceAccess.application,
    owner: {
      id: serviceAccess.application?.owner.id,
      name: serviceAccess.application?.owner.name,
      username: serviceAccess.application?.owner.username,
      email: serviceAccess.application?.owner.email,
    },
    labels: [],
    prodEnvAccess: [],
  };

  // ConsumerProdEnvAccess:
  // - get ServiceAccess records that match the consumer ID and namespace
  // - get the ACLs for the Consumer and derive the ProdEnvAccess records

  const kongApi = new KongConsumerService(
    process.env.KONG_URL,
    process.env.GWA_URL
  );
  const aclGroups = (
    await kongApi.getConsumerACLByNamespace(
      serviceAccess.consumer.extForeignKey,
      ns
    )
  ).map((acl: any) => acl.group);

  // find the ProductEnvironments that the ACL 'group' corresponds to
  const envs = await lookupEnvironmentsByNS(context, ns);

  const gwConsumer = await lookupConsumerPlugins(
    context,
    serviceAccess.consumer.id
  );

  const other = await lookupServiceAccessesByConsumer(
    context,
    ns,
    serviceAccess.consumer.id
  );

  const batch1 = other.map((svc) => {
    return {
      productName: svc.productEnvironment.product.name,
      environment: {
        id: svc.productEnvironment.id,
        name: svc.productEnvironment.name,
        additionalDetails: svc.productEnvironment.additionalDetailsToRequest,
        flow: svc.productEnvironment.flow,
        services: svc.productEnvironment.services,
      },
      plugins: gwConsumer.plugins.filter(
        (plugin) => plugin.service?.environment.id === svc.productEnvironment.id
      ),
      revocable: false,
      authorization: null,
      request: null,
    } as ConsumerProdEnvAccess;
  });

  const batch2 = envs
    .filter((env) => aclGroups.includes(env.appId))
    .filter(
      (env) => batch1.filter((acc) => acc.environment.id === env.id).length == 0
    )
    .map((env) => {
      return {
        productName: env.product.name,
        environment: {
          id: env.id,
          name: env.name,
          additionalDetails: env.additionalDetailsToRequest,
          flow: env.flow,
          services: env.services,
        },
        plugins: gwConsumer.plugins.filter(
          (plugin) => plugin.service?.environment.id === env.id
        ),
        revocable: true,
        authorization: null,
        request: null,
      } as ConsumerProdEnvAccess;
    });

  access.prodEnvAccess = batch1.concat(batch2);
  return access;
}

export async function getConsumerProdEnvAccess(
  context: any,
  ns: string,
  serviceAccessId: string,
  prodEnvId: string
): Promise<ConsumerProdEnvAccess> {
  // same as getNamespaceConsumerAccess
  // but add 'authorization' and 'request' details (if applicable)
  // and add plugin config

  const consumer = await getNamespaceConsumerAccess(
    context,
    ns,
    serviceAccessId
  );

  consumer.prodEnvAccess = consumer.prodEnvAccess.filter(
    (p) => p.environment.id === prodEnvId
  );

  assert.strictEqual(consumer.prodEnvAccess.length, 1, 'Invalid access data');

  const access = consumer.prodEnvAccess;

  // authorization?: any;
  // Authorization: Scopes and Roles for flows requiring IdPs

  // request?: AccessRequest;
  // lookup request based on ServiceAccess record
  const request = await getAccessRequestByNamespaceServiceAccess(
    context,
    ns,
    serviceAccessId
  );
  access[0].request = request;

  return access[0];
}

export async function grantConsumerProdEnvAccess(
  context: any,
  consumerId: string,
  access: ConsumerProdEnvAccess
): Promise<void> {}

export async function updateConsumerProdEnvAccess(
  context: any,
  consumerId: string,
  access: ConsumerProdEnvAccess
): Promise<void> {}

export async function revokeConsumerProdEnvAccess(
  context: any,
  consumerId: string,
  prodEnvId: string
): Promise<void> {}

export async function saveConsumerLabels(
  context: any,
  consumerId: string,
  labels: ConsumerLabel[]
): Promise<void> {}
