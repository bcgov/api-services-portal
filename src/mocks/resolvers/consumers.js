import subDays from 'date-fns/subDays';
import cloneDeep from 'lodash/cloneDeep';

const today = new Date();

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
        aclGroups: JSON.stringify([]),
      },
      application: {
        id: 'a1',
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
        aclGroups: JSON.stringify([]),
      },
      application: {
        appId: 'a2',
      },
    },
    // This ID will throw a delete failure
    {
      namespace: 'loc',
      consumer: {
        id: 'd1',
        username: 'Test Consumer for Pharmasave',
        tags: '["Facility - Pharmasave #2222", "Phone Number - 444-444-4444"]',
        updatedAt: subDays(today, 6).toISOString(),
        aclGroups: JSON.stringify([]),
      },
      application: {
        appId: 'a1',
      },
    },
  ],
  allAccessRequestsByNamespace: [
    {
      id: '123',
      name: '',
      additionalDetails:
        'Access to this API requires a BCeID. Your request will be rejected if you did not log into the Portal with a valid Business BCeID. To continue, please provide your contact phone number below.',
      communication: 'Phone Number 204-896-6325 &  204-896-7700. ',
      createdAt: subDays(today, 6).toISOString(),
      requestor: {
        name: 'Harley Jones',
      },
      application: {
        name: 'Easy Mart Store 122',
      },
      productEnvironment: {
        name: 'dev',
      },
    },
  ],
};

class Store {
  constructor(data) {
    this._data = data;
    this._cached = cloneDeep(data);
  }

  get data() {
    return this._data;
  }

  update(data) {
    this._data = data;
  }

  reset() {
    this._data = this._cached;
  }
}

export const store = new Store(consumers);

export const getConsumersHandler = (_, res, ctx) => {
  return res(ctx.data(store.data));
};

export const deleteConsumersHandler = (req, res, ctx) => {
  const { id } = req.variables;

  if (id === 'd1') {
    return res(
      ctx.data({
        errors: [{ message: 'Permission denied' }],
      })
    );
  }

  const mutated = {
    ...store.data,
    allServiceAccessesByNamespace: store.data.allServiceAccessesByNamespace.filter(
      (c) => c.consumer.id !== id
    ),
  };
  store.update(mutated);

  return res(
    ctx.data({
      deleteGatewayConsumer: {
        id,
      },
    })
  );
};

export const grantConsumerHandler = (req, res, ctx) => {
  const { prodEnvId, consumerId, group, grant } = req.variables;

  if (consumerId === 'd1') {
    return res(
      ctx.data({
        errors: [{ message: 'Permission denied' }],
      })
    );
  }

  return res(ctx.data({}));
};

export const accessRequestAuthHandler = (req, res, ctx) => {
  return res(
    ctx.data({
      AccessRequest: {
        controls: '',
        productEnvironment: {
          credentialIssuer: {
            availableScopes: JSON.stringify([
              'System/Patient',
              'System/MedicationRequest',
              'System/CheeseSlicesChalkCheesy',
            ]),
            clientRoles: JSON.stringify(['a.role', 'b.role', 'c.role']),
          },
        },
      },
    })
  );
};

export const gatewayServicesHandler = (req, res, ctx) => {
  return res(
    ctx.data({
      allGatewayServicesByNamespace: [
        {
          id: '1',
          name: 'name',
          extForeignKey: '1231',
          routes: [
            {
              id: 'r1',
              name: 'route',
              extForeignKey: '12',
            },
          ],
        },
      ],
    })
  );
};
