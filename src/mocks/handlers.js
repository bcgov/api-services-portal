import { graphql, rest } from 'msw';

import { harley, mark } from './resolvers/personas';
import {
  accessRequestAuthHandler,
  deleteConsumersHandler,
  fullfillRequestHandler,
  gatewayServicesHandler,
  getConsumersHandler,
  getConsumerHandler,
  grantConsumerHandler,
  rejectRequestHandler,
  store as consumersStore,
} from './resolvers/consumers';
import { allProductsByNamespaceHandler } from './resolvers/products';

import KongHandlers from './handlers/kong';
import KeycloakHandlers from './handlers/keycloak';

export function resetAll() {
  consumersStore.reset();
}

export const keystone = graphql.link('*/gql/api');

export const handlers = [
  rest.get('*/admin/session', (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: mark,
      })
    );
  }),
  keystone.query('GetNamespaces', (_, res, ctx) => {
    return res(
      ctx.data({
        allNamespaces: [
          {
            id: 'n1',
            name: 'aps-portal',
          },
          {
            id: 'n2',
            name: 'loc',
          },
        ],
      })
    );
  }),
  keystone.query('GetConsumers', getConsumersHandler),
  keystone.query('GetConsumer', getConsumerHandler),
  keystone.query('GetAccessRequestAuth', accessRequestAuthHandler),
  keystone.query('GetControlContent', gatewayServicesHandler),
  keystone.query(
    'GetConsumerProductsAndEnvironments',
    allProductsByNamespaceHandler
  ),
  keystone.mutation('DeleteConsumer', deleteConsumersHandler),
  keystone.mutation('ToggleConsumerACLMembership', grantConsumerHandler),
  keystone.mutation('FulfillRequest', fullfillRequestHandler),
  keystone.mutation('RejectAccessRequest', rejectRequestHandler),
  keystone.query('GetBusinessProfile', (req, res, ctx) => {
    return res(
      ctx.data({
        BusinessProfile: {
          institution: harley.business,
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
