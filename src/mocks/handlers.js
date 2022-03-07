import { graphql, rest } from 'msw';
// import casual from 'casual-browserify';

import { harley, mark } from './resolvers/personas';
import {
  accessRequestAuthHandler,
  deleteConsumersHandler,
  gatewayServicesHandler,
  getConsumersHandler,
  grantConsumerHandler,
  store as consumersStore,
} from './resolvers/consumers';

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
  keystone.query('GetConsumers', getConsumersHandler),
  keystone.query('GetAccessRequestAuth', accessRequestAuthHandler),
  keystone.query('GetControlContent', gatewayServicesHandler),
  keystone.mutation('DeleteConsumer', deleteConsumersHandler),
  keystone.mutation('ToggleConsumerACLMembership', grantConsumerHandler),
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
