import { graphql, rest } from 'msw';

import { harley, mark } from './resolvers/personas';
import {
  allProductsByNamespaceHandler,
  accessRequestAuthHandler,
  deleteConsumersHandler,
  fullfillRequestHandler,
  gatewayServicesHandler,
  getAccessRequestsHandler,
  getAllConsumerGroupLabelsHandler,
  getConsumersHandler,
  getConsumerHandler,
  getConsumerProdEnvAccessHandler,
  grantConsumerHandler,
  grantAccessToConsumerHandler,
  getConsumersFilterHandler,
  rejectRequestHandler,
  revokeAccessFromConsumer,
  saveConsumerLabels,
  updateConsumerAccessHandler,
  store as consumersStore,
} from './resolvers/consumers';
import {
  getCurrentNamesSpaceHandler,
  getOrganizationGroupsPermissionsHandler,
  getResourceSetHandler,
  getServiceAccessPermissionsHandler,
  getUserPermissionsHandler,
  grantAccessHandler,
  grantSAAccessHandler,
  revokeAccessHandler,
  revokeSAAccessHandler,
} from './resolvers/namespace-access';
import { getActivityHandler } from './resolvers/activity';
import {
  addEnvironmentHandler,
  addProductHandler,
  allProductsHandler,
  allLegalsHandler,
  getEnvironmentHandler,
  getAllCredentialIssuersByNamespace,
  allGatewayServicesHandler,
  updateProductHandler,
  updateEnvironmentHandler,
  deleteEnvironmentHandler,
  deleteProductHandler,
} from './resolvers/products';
import { handleAllDatasets } from './resolvers/datasets';

  createServiceAccountHandler,
  getAllServiceAccountsHandler,
} from './resolvers/service-accounts';

// Namespaces
const allNamespaces = [
  {
    id: 'n1',
    name: 'aps-portal',
  },
  {
    id: 'n2',
    name: 'loc',
  },
];
let namespace = mark.namespace;

export function resetAll() {
  consumersStore.reset();
}

export const keystone = graphql.link('*/gql/api');

export const handlers = [
  rest.get('*/about', (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        version: 'v1.1.10',
        revision: '1932u12093u12093u12094u230eujdfweoifu09',
        cluster: 'gold',
        helpLinks: {
          helpDeskUrl:
            'https://dpdd.atlassian.net/servicedesk/customer/portal/1/group/2',
          helpChatUrl: 'https://chat.developer.gov.bc.ca/channel/aps-ops',
          helpIssueUrl: 'https://github.com/bcgov/api-services-portal/issues',
          helpApiDocsUrl: '/ds/api/v2/console/',
          helpSupportUrl: 'https://bcgov.github.io/aps-infra-platform/',
          helpReleaseUrl:
            'https://bcgov.github.io/aps-infra-platform/releases/2022-may/',
          helpStatusUrl: 'https://uptime.com/s/bcgov-dss',
        },
      })
    );
  }),
  rest.get('*/admin/session', (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: { ...mark, namespace },
      })
    );
  }),
  rest.put('*/admin/switch/:ns', (req, res, ctx) => {
    namespace = allNamespaces.find((n) => n.id === req.params.ns).name;
    return res(
      ctx.status(200),
      ctx.json({
        switch: true,
      })
    );
  }),
  keystone.query('GetNamespaces', (_, res, ctx) => {
    return res(
      ctx.data({
        allNamespaces,
      })
    );
  }),
  keystone.query('GetActivity', getActivityHandler),
  keystone.query('GetConsumers', getConsumersHandler),
  keystone.query('GetConsumer', getConsumerHandler),
  keystone.query('GetAccessRequests', getAccessRequestsHandler),
  keystone.query('GetConsumerEditDetails', getConsumerProdEnvAccessHandler),
  keystone.query('GetAccessRequestAuth', accessRequestAuthHandler),
  keystone.query('GetFilterConsumers', getConsumersFilterHandler),
  keystone.query('GetAllConsumerGroupLabels', getAllConsumerGroupLabelsHandler),
  keystone.query('GetControlContent', gatewayServicesHandler),
  keystone.query('GetAllDatasets', handleAllDatasets),
  keystone.query('GetAllProducts', allProductsHandler),
  keystone.mutation('AddProduct', addProductHandler),
  keystone.mutation('UpdateProduct', updateProductHandler),
  keystone.mutation('RemoveProduct', deleteProductHandler),
  keystone.mutation('AddEnvironment', addEnvironmentHandler),
  keystone.mutation('DeleteEnvironment', deleteEnvironmentHandler),
  keystone.query('GetOwnedEnvironment', getEnvironmentHandler),
  keystone.query(
    'GetAllCredentialIssuersByNamespace',
    getAllCredentialIssuersByNamespace
  ),
  keystone.query('GetAllGatewayServices', allGatewayServicesHandler),
  keystone.query('GetAllLegals', allLegalsHandler),
  keystone.query(
    'GetConsumerProductsAndEnvironments',
    allProductsByNamespaceHandler
  ),
  keystone.mutation('UpdateEnvironment', updateEnvironmentHandler),
  // Service accounts
  keystone.query('GetAllServiceAccounts', getAllServiceAccountsHandler),
  keystone.mutation('CreateServiceAccount', createServiceAccountHandler),
  // Namespace Access
  keystone.query('GetUserPermissions', getUserPermissionsHandler),
  keystone.query(
    'GetServiceAccessPermissions',
    getServiceAccessPermissionsHandler
  ),
  keystone.query(
    'GetOrganizationGroupsPermissions',
    getOrganizationGroupsPermissionsHandler
  ),
  keystone.query('GetResourceSet', getResourceSetHandler),
  keystone.query('GetCurrentNamespace', getCurrentNamesSpaceHandler),
  keystone.mutation('GrantUserAccess', grantAccessHandler),
  keystone.mutation('GrantSAAccess', grantSAAccessHandler),
  keystone.mutation('RevokeAccess', revokeAccessHandler),
  keystone.mutation('RevokeSAAccess', revokeSAAccessHandler),
  // MUTATIONS
  keystone.mutation('DeleteConsumer', deleteConsumersHandler),
  keystone.mutation('ToggleConsumerACLMembership', grantConsumerHandler),
  keystone.mutation('FulfillRequest', fullfillRequestHandler),
  keystone.mutation('RejectAccessRequest', rejectRequestHandler),
  keystone.mutation('UpdateConsumerAccess', updateConsumerAccessHandler),
  keystone.mutation('SaveConsumerLabels', saveConsumerLabels),
  keystone.mutation('GrantAccessToConsumer', grantAccessToConsumerHandler),
  keystone.mutation('RevokeAccessFromConsumer', revokeAccessFromConsumer),
  keystone.query('GetBusinessProfile', (req, res, ctx) => {
    const { serviceAccessId } = req.variables;
    const institution = serviceAccessId === 'd1' ? null : harley.business;
    return res(
      ctx.data({
        BusinessProfile: {
          institution,
        },
      })
    );
  }),
  keystone.query('RequestDetailsBusinessProfile', (req, res, ctx) => {
    return res(
      ctx.data({
        BusinessProfile: {
          institution: harley.business,
        },
      })
    );
  }),
];
