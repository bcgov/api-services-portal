import subDays from 'date-fns/subDays';
import cloneDeep from 'lodash/cloneDeep';
import casual from 'casual-browserify';

const today = new Date();

export const harleyAccessRequest = {
  id: '123',
  name: '',
  additionalDetails:
    'Access to this API requires a BCeID. Your request will be rejected if you did not log into the Portal with a valid Business BCeID. To continue, please provide your contact phone number below.',
  communication: 'Phone Number 204-896-6325 &  204-896-7700. ',
  createdAt: subDays(today, 6).toISOString(),
  requestor: {
    id: 'u1',
    name: 'Harley Jones',
  },
  application: {
    id: 'app1',
    name: 'Easy Mart Store 122',
  },
  productEnvironment: {
    id: 'pe1',
    name: 'dev',
    services: [],
  },
};

const consumers = {
  getFilteredNamespaceConsumers: [
    {
      id: 'c1',
      consumerType: '',
      username: 'sa-moh-proto-ca853245-9d9af1b3c417',
      labels: [
        {
          labelGroup: 'Facility',
          values: ['London Drugs #5062'],
        },
        {
          labelGroup: 'Phone Number',
          values: ['204-537-5569'],
        },
        {
          labelGroup: 'Contact',
          values: ['Antonio Mario Banderas'],
        },
      ],
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'd1',
      consumerType: '',
      username: 'Test Consumer for Shoppers',
      labels: [
        {
          labelGroup: 'Facility',
          values: ['Shoppers Drug Mart'],
        },
        {
          labelGroup: 'Phone Number',
          values: ['604-499-4239'],
        },
      ],
      lastUpdated: subDays(new Date(), 20).toISOString(),
    },
    {
      id: 'c2',
      consumerType: '',
      username: 'Test Consumer for Pharmasave',
      labels: [
        {
          labelGroup: 'Facility',
          values: ['Pharmasave #2222'],
        },
        {
          labelGroup: 'Phone Number',
          values: ['444-444-4444'],
        },
      ],
      lastUpdated: subDays(today, 6).toISOString(),
    },
  ],

  allServiceAccessesByNamespace: [
    {
      namespace: 'loc',
      consumer: {
        id: 'c1',
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
  allAccessRequestsByNamespace: [harleyAccessRequest],
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
    this._data = cloneDeep(this._cached);
  }
}

export const store = new Store(consumers);

export const getConsumersHandler = (_, res, ctx) => {
  return res(ctx.data(store.data));
};

export const getConsumerHandler = (req, res, ctx) => {
  const { id } = req.variables;
  const consumer = store.data.getFilteredNamespaceConsumers.find(
    (d) => d.id === id
  );
  const owner = {
    name: harleyAccessRequest.requestor.name,
    username: 'harley123',
    email: 'harley@easymart.store',
  };
  return res(
    ctx.data({
      getNamespaceConsumerAccess: {
        application: {
          id: 'a1',
          name: harleyAccessRequest.application.name,
          owner,
        },
        ...consumer,
        owner: {
          name: consumer.username,
        },
        prodEnvAccess: [
          {
            productName: 'Pharmanet Electronic Prescribing',
            environment: { id: 'e1', name: 'dev' },
            plugins: [{ name: 'rate-limiting' }],
            revocable: false,
            authorization: {
              id: 'c1',
              availableScopes: '["System/Patient"]',
              clientRoles: '["b.role"]',
            },
            request: {},
          },
          {
            productName: 'Pharmanet Electronic Prescribing',
            environment: { id: 'e2', name: 'conformance' },
            plugins: [{ name: 'rate-limiting' }],
            revocable: false,
            authorization: {
              id: 'c1',
              availableScopes: '["System/Patient"]',
              clientRoles: '["b.role"]',
            },
            request: {},
          },
          {
            productName: 'Another Product',
            environment: { id: 'e3', name: 'prod' },
            plugins: [{ name: 'ip-restriction' }, { name: 'rate-limiting' }],
            revocable: false,
            authorization: {
              id: 'c1',
              availableScopes: '["System/Patient"]',
              clientRoles: '["b.role"]',
            },
            request: {},
          },
        ],
      },
      getGatewayConsumerPlugins: {
        ...consumer,
      },
      allServiceAccesses: [
        {
          application: {
            appId: '123',
            name: 'Easy Drug Mart 51',
            owner: {
              name: 'Benedict Cumberbatch',
              username: 'benedict.cumberbatch@idir',
              email: 'benedict_cumberbatch9956522@gmail.com',
            },
          },
          productEnvironment: {
            product: {
              name: 'Pharmanet Electronic Prescribing',
            },
            services: [
              {
                name: 'service-aps-portal-dev-api',
              },
            ],
          },
        },
      ],
      allProductsByNamespace: [
        {
          id: '111',
          name: 'Pharmanet Electronic Prescribing',
          environments: [
            {
              id: '14',
              name: 'dev',
              active: true,
              flow: 'client-credentials',
              credentialIssuer: {
                id: 'c1',
                availableScopes: '["System/Patient"]',
                clientRoles: '["b.role"]',
              },
              services: [
                {
                  name: 'route-aps-portal-dev-api',
                },
              ],
            },
          ],
        },
        {
          id: '112',
          name: 'Another App',
          environments: [
            {
              id: '64',
              name: 'prod',
              active: true,
              flow: 'client-credentials',
              services: [
                {
                  name: 'service-aps-portal-dev-api',
                },
              ],
            },
            {
              id: '100',
              name: 'sandbox',
              active: true,
              flow: 'client-credentials',
              services: [],
            },
          ],
        },
      ],
    })
  );
};

export const getConsumerProdEnvAccessHandler = (requ, res, ctx) => {
  return res(
    ctx.data({
      getConsumerProdEnvAccess: {
        productName: 'Product Name',
        environment: {
          id: 'e1',
          name: 'dev',
        },
        plugins: [
          {
            name: 'rate-limiting',
            service: {
              id: '1231',
              name: 'service-aps-portal-dev-api',
            },
            route: null,
            protocols: ['http', 'https'],
            config: JSON.stringify({
              second: '1',
              minute: '1',
              hour: '1',
              day: '1',
              policy: 'local',
              service: '1231',
            }),
          },
          {
            name: 'ip-restriction',
            config: JSON.stringify({
              allow: JSON.stringify(['1.1.1.1', '2.2.2.2']),
            }),
            service: {
              id: '1231',
              name: 'service-aps-portal-dev-api',
            },
            route: null,
          },
          {
            name: 'rate-limiting',
            service: null,
            route: {
              id: '22',
              name: 'route-aps-portal-dev-api',
            },
            protocols: ['http', 'https'],
            config: JSON.stringify({
              second: '20',
              minute: '20',
              hour: '20',
              day: '20',
              policy: 'redis',
              service: '1231',
            }),
          },
        ],
        revocable: false,
        authorization: {
          credentialIssuer: {
            name: 'refactortime test',
            flow: 'client-credentials',
            mode: 'auto',
            availableScopes: '["System/Patient","System/MedicationRequest"]',
            clientRoles: '["a.role","b.role","c.role"]',
            resourceType: '',
            resourceAccessScope: '',
            environmentDetails: null,
            defaultClientScopes: [],
            defaultOptionalScopes: [],
            roles: [],
          },
        },
        request: harleyAccessRequest,
        requestApprover: {
          name: 'Mark Simpson',
        },
      },
    })
  );
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
    getFilteredNamespaceConsumers: store.data.getFilteredNamespaceConsumers.filter(
      (c) => c.id !== id
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

export const fullfillRequestHandler = (req, res, ctx) => {
  store.update({
    ...store.data,
    allServiceAccessesByNamespace: [
      ...store.data.allServiceAccessesByNamespace,
      {
        namespace: 'loc',
        consumer: {
          id: '919191919',
          username: 'new-consumer',
          tags:
            '["Facility - London Drugs #5602", "Phone Number - 555-555-5555"]',
          updatedAt: subDays(today, 3).toISOString(),
          aclGroups: JSON.stringify([]),
        },
        application: {
          id: 'a1',
        },
      },
    ],
    allAccessRequestsByNamespace: [],
  });

  return res(ctx.data({ id: req.variables.id }));
};

export const rejectRequestHandler = (req, res, ctx) => {
  store.update({
    ...store.data,
    allAccessRequestsByNamespace: [],
  });
  return res(
    ctx.data({
      id: req.variables.id,
    })
  );
};

export const accessRequestAuthHandler = (req, res, ctx) => {
  const { id } = req.variables;

  if (id === 'd1') {
    return res(
      ctx.data({
        errors: [
          {
            message: 'Unavailable',
          },
        ],
      })
    );
  }

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
          id: 's1',
          name: 'service-aps-portal-dev-api',
          extForeignKey: '1231',
          routes: [
            {
              id: 'r1',
              name: 'route-aps-portal-dev-api',
              extForeignKey: '12',
            },
          ],
        },
        {
          id: 's2',
          name: 'service-aps-portal-prod-api',
          extForeignKey: '3123',
          routes: [
            {
              id: 'r2',
              name: 'route-aps-portal-prod-api',
              extForeignKey: '22',
            },
          ],
        },
      ],
    })
  );
};
