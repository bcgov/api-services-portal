import { graphql, rest } from 'msw';
import casual from 'casual-browserify';

import {
  deleteConsumersHandler,
  getConsumersHandler,
  grantConsumerHandler,
  store as consumersStore,
} from './resolvers/consumers';

export function resetAll() {
  consumersStore.reset();
}

export const keystone = graphql.link('*/gql/api');

const harley = {
  id: '78f5c377-9a15-40ba-a95b-06fc9cef3cec',
  userId: 'bbb646ce-7b65-40b4-a511-8a66121bf8c9',
  name: 'Harley Jones',
  username: 'harley@idir',
  email: 'harley@gov.ca',
  roles: ['portal-user'],
  isAdmin: false,
  namespace: 'aps-portal',
  groups: null,
  legalsAgreed: '[]',
  sub: 'sub',
};

export const handlers = [
  rest.get('*/admin/session', (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: {
          id: casual.uuid,
          userId: casual.uuid,
          name: 'Mark Smith',
          username: 'markadmin',
          email: 'mark.smith@gov.ca',
          roles: ['api-owner', 'portal-user'],
          isAdmin: false,
          namespace: 'aps-portal',
          groups: null,
          legalsAgreed: '[]',
          sub: 'sub',
        },
      })
    );
  }),
  keystone.query('GetConsumers', getConsumersHandler),
  keystone.mutation('DeleteConsumer', deleteConsumersHandler),
  keystone.mutation('ToggleConsumerACLMembership', grantConsumerHandler),
];
