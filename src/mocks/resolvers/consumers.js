import subDays from 'date-fns/subDays';
import cloneDeep from 'lodash/cloneDeep';
import casual from 'casual-browserify';

const today = new Date();
const allConsumerGroupLabels = [
  'Phone Number',
  'Facility',
  'Contact Person',
  'Location',
];

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
    providerUsername: 'harley123',
    email: 'harley@easymart.store',
  },
  application: {
    id: 'app1',
    name: 'Easy Mart Store 122',
  },
  productEnvironment: {
    id: 'pe1',
    name: 'dev',
    services: [],
    product: {
      name: 'MoH PharmaNet Electronic Prescribing',
    },
  },
};

export const allProductsByNamespace = [
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
];

const consumers = {
  allAccessRequestsByNamespace: [harleyAccessRequest],
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
          labelGroup: 'Contact Person',
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
  allConsumerScopesAndRoles: {
    roles: ['admin', 'user'],
    scopes: ['Sample.*'],
  },
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

export const getConsumersHandler = (req, res, ctx) => {
  return res(ctx.delay(), ctx.data({ ...store.data, allConsumerGroupLabels }));
};

export const getConsumerHandler = (req, res, ctx) => {
  const { consumerId } = req.variables;
  const consumer = store.data.getFilteredNamespaceConsumers.find(
    (d) => d.id === consumerId
  );
  const owner = {
    name: harleyAccessRequest.requestor.name,
    providerUsername: 'harley123',
    email: 'harley@easymart.store',
  };
  return res(
    ctx.data({
      getNamespaceConsumerAccess: {
        application:
          consumerId === 'd1'
            ? null
            : {
                id: 'a1',
                name: harleyAccessRequest.application.name,
                owner,
              },
        ...consumer,
        consumer,
        owner,
        prodEnvAccess: [
          {
            productName: 'Pharmanet Electronic Prescribing',
            environment: {
              id: 'e1',
              name: 'dev',
            },
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
            environment: {
              id: 'e2',
              name: 'conformance',
            },
            plugins: [{ name: 'rate-limiting' }],
            revocable: false,
            authorization: {
              id: 'c2',
              availableScopes: '["System/Patient"]',
              clientRoles: '["b.role"]',
            },
            request: {},
          },
          {
            productName: 'Another Product',
            environment: {
              id: 'e3',
              name: 'prod',
            },
            plugins: [{ name: 'ip-restriction' }, { name: 'rate-limiting' }],
            revocable: false,
            authorization: {
              id: 'c3',
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
      allProductsByNamespace,
    })
  );
};

export const getAccessRequestsHandler = (req, res, ctx) => {
  return res(
    ctx.data({
      allAccessRequestsByNamespace: store.data.allAccessRequestsByNamespace,
    })
  );
};

export const getConsumersFilterHandler = (req, res, ctx) => {
  return res(
    ctx.data({
      // getFilteredNamespaceConsumers: [],
      allProductsByNamespace,
      allConsumerScopesAndRoles: store.data.allConsumerScopesAndRoles,
    })
  );
};

export const allProductsByNamespaceHandler = (req, res, ctx) => {
  return res(
    ctx.data({
      allProductsByNamespace,
    })
  );
};

export const getConsumerProdEnvAccessHandler = (req, res, ctx) => {
  const { prodEnvId, serviceAccessId } = req.variables;
  return res(
    ctx.data({
      getConsumerProdEnvAccess: {
        productName: 'Product Name',
        environment: {
          additionalDetailsToRequest: 'Please add your phone number',
          id: prodEnvId,
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
          defaultClientScopes: ['System/Patient', 'System/MedicationRequest'],
          roles: ['a.role', 'b.role', 'c.role'],
          defaultOptionalScopes: [],
          credentialIssuer: {
            name: 'refactortime test',
            flow: 'client-credentials',
            mode: 'auto',
            resourceType: '',
            resourceAccessScope: '',
            availableScopes: '["System/Patient","System/MedicationRequest"]',
            clientRoles: '["a.role","b.role","c.role"]',
            environmentDetails: null,
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

export const grantAccessToConsumerHandler = (req, res, ctx) => {
  return res(ctx.data(true));
};

export const fullfillRequestHandler = (req, res, ctx) => {
  store.update({
    ...store.data,
    allAccessRequestsByNamespace: [],
    getFilteredNamespaceConsumers: [
      ...store.data.getFilteredNamespaceConsumers,
      {
        id: '919191919',
        consumerType: '',
        username: 'MoH PharmaNet Electronic Prescribing',
        labels: [
          {
            labelGroup: 'Facility',
            values: ['London Drugs #5602'],
          },
        ],
        lastUpdated: new Date().toISOString(),
      },
    ],
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

export const updateConsumerAccessHandler = (req, res, ctx) => {
  return res(ctx.data(true));
};

export const revokeAccessFromConsumer = (req, res, ctx) => {
  if (req.variables.consumerId === 'd1') {
    return res(ctx.data(false));
  }
  return res(ctx.data(true));
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

export const saveConsumerLabels = (_, res, ctx) => {
  return res(ctx.data(true));
};

export const getAllConsumerGroupLabelsHandler = (_, res, ctx) => {
  return res(
    ctx.data({
      allConsumerGroupLabels,
    })
  );
};
