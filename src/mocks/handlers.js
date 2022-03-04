import { graphql, rest } from 'msw';
import subDays from 'date-fns/subDays';
import casual from 'casual-browserify';

export const keystone = graphql.link('*/gql/api');
const today = new Date();

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

const consumers = {
  allServiceAccessesByNamespace: [
    {
      namespace: 'loc',
      consumer: {
        id: '120912301',
        username: 'sa-moh-proto-ca853245-9d9af1b3c417',
        tags:
          '["Facility - London Drugs #5602", "Phone Number - 555-555-5555"]',
        updatedAt: subDays(today, 3).toISOString(),
      },
    },
    {
      namespace: 'loc',
      consumer: {
        id: '94901091230',
        username: 'Test Consumer for Shoppers',
        tags:
          '["Facility - Shoppers Drug Mart #2222", "Phone Number - 444-444-4444"]',
        updatedAt: subDays(today, 5).toISOString(),
      },
    },
  ],
  allAccessRequestsByNamespace: [
    {
      id: '123',
    },
  ],
};

export const handlers = [
  rest.get('*/admin/session', (req, res, ctx) => {
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
  keystone.query('GetConsumers', (_, res, ctx) => {
    return res(ctx.data(consumers));
  }),
  keystone.mutation('DeleteConsumer', (req, res, ctx) => {
    const { id } = req.variables;
    consumers.allServiceAccessesByNamespace = consumers.allServiceAccessesByNamespace.filter(
      (c) => c.consumer.id !== id
    );
    return res(
      ctx.data({
        deleteGatewayConsumer: {
          id,
        },
      })
    );
  }),
];
