/* eslint-disable @typescript-eslint/no-var-requires */
const {
  addMocksToSchema,
  makeExecutableSchema,
  mockServer,
  MockList,
} = require('graphql-tools');
const casual = require('casual-browserify');
const kebabCase = require('lodash/kebabCase');
const random = require('lodash/random');
const times = require('lodash/times');
const express = require('express');
const cors = require('cors');
const { addHours, parse, formatISO, subDays } = require('date-fns');

const adminApi = require('./admin-api');
const cert = require('./data/certs');
const data = require('./data/example-data');
const dsApi = require('./ds-api');
const MockDatabase = require('./data/db');
const metricsData = require('./data/metrics-data');
const schemas = require('./schemas');
const { sample } = require('lodash');

const app = express();
const db = new MockDatabase('api-owner', 'aps-portal');
const port = 4000;

const randomNullValue = () => {
  const isFilled = casual.coin_flip;

  if (!isFilled) {
    return null;
  }

  return {
    id: casual.uuid,
  };
};

app.locals.db = db;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Casual Definitions
casual.define('service', () => {
  const ns = sample(data.namespaces);
  const env = sample(data.envs);
  return `service-${ns}-${env}-${casual.word}`;
});
casual.define('route', () => {
  const ns = sample(data.namespaces);
  const env = sample(data.envs);
  return `route-${ns}-${env}-${casual.word}`;
});

const schema = makeExecutableSchema({ typeDefs: schemas });
const schemaWithMocks = addMocksToSchema({
  schema,
});

const server = mockServer(schemaWithMocks, {
  Query: () => ({
    allProducts: () => db.get('products'),
    allProductsByNamespace: () => {
      const products = db.get('products');
      products.map((prod) => {
        prod.environments = () => new MockList(2, (_, { id }) => ({ id }));
      });
      return products;
    },
    allNamespaces: () => db.get('namespaces'),
    allDiscoverableProducts: () => new MockList(10, (_, { id }) => ({ id })),
    allEnvironments: () => new MockList(4, (_, { id }) => ({ id })),
    allGatewayServices: () => new MockList(108, (_, { id }) => ({ id })),
    allDatasets: () => new MockList(40, (_, { id }) => ({ id })),
    allOrganizations: () => new MockList(8, (_, { id }) => ({ id })),
    allOrganizationUnits: () => new MockList(18, (_, { id }) => ({ id })),
    allAccessRequests: () => new MockList(6, (_, { id }) => ({ id })),
    allNamespaceServiceAccounts: () => new MockList(2, (_, { id }) => ({ id })),
    allGatewayConsumers: () => new MockList(4, (_, { id }) => ({ id })),
    allPlugins: () => new MockList(4, (_, { id }) => ({ id })),
    allMetrics: (query) => {
      if (query.where.query === 'kong_http_requests_daily_namespace') {
        return metricsData.namespaceMetrics;
      }
      return metricsData.serviceMetrics;
    },
    getPermissionTickets: () => new MockList(6, (_, { id }) => ({ id })),
    getPermissionTicketsForResource: () =>
      new MockList(6, (_, { id }) => ({ id })),
    getResourceSet: () => new MockList(8, (_, { id }) => ({ id })),
    myApplications: () => new MockList(8, (_, { id }) => ({ id })),
    myServiceAccesses: () => new MockList(4, (_, { id }) => ({ id })),
    mySelf: () => db.get('user'),
    BusinessProfile: () => ({
      user: {
        displayName: 'Joe Smith',
        firstname: 'Joe',
        surname: 'Smith',
        email: 'joe_smith@nowhere.com',
      },
      institution: {
        type: 'Other',
        legalName: 'Smith Associates',
        address: {
          addressLine1: '2233 Broadway South',
          addressLine2: null,
          city: 'Mincetown',
          postal: 'V1B4A3',
          province: 'BC',
          country: 'CA',
        },
        businessTypeOther: 'Corporation',
      },
    }),
  }),
  Mutation: () => ({
    createProduct: ({ data }) => {
      const record = db.create('products', {
        name: data.name,
        environments: [],
      });
      return record;
    },
    updateProduct: ({ id, data }) => {
      const allProducts = db.get('products');
      const record = allProducts.find((p) => p.id === id);
      const changed = {
        id,
        ...record,
        ...data,
      };
      db.set('products', [...allProducts.filter((p) => p.id !== id), changed]);
      return changed;
    },
    deleteProduct: ({ id }) => {
      const allProducts = db.get('products');
      db.set(
        'products',
        allProducts.filter((p) => p.id !== id)
      );
    },
    createEnvironment: ({ data }) => {
      const parent = db
        .get('products')
        .find((d) => d.id === data.product.connect.id);
      const res = {
        id: casual.uuid,
        name: data.name,
        active: false,
      };

      if (parent) {
        parent.environments.push(res);
      }

      return res;
    },
    updateEnvironment: ({ id, data }) => {
      // throw new Error({
      //   errors: [{ message: 'something broke', name: 'ValidationError' }],
      // });
      db.get('products').forEach((p) => {
        const environmentIds = p.environments.map((e) => e.id);

        if (environmentIds.includes(id)) {
          const environmentIndex = environmentIds.indexOf(id);
          if (environmentIndex >= 0) {
            p.environments[environmentIndex] = {
              ...p.environments[environmentIndex],
              ...data,
            };
          }
        }
      });
      return { id, ...data };
    },
    deleteEnvironment: ({ id }) => {
      let name = '';

      db.get('products').forEach((p) => {
        const environmentIds = p.environments.map((e) => e.id);
        const environmentIndex = environmentIds.indexOf(id);
        if (environmentIndex >= 0) {
          name = p.environments[environmentIndex].name;
        }
        p.environments = p.environments.filter((e) => e.id !== id);
      });

      return { id, name };
    },
    createNamespace: ({ namespace }) => {
      const record = db.create('namespaces', { name: namespace });
      return record;
    },
    deleteNamespace: ({ namespace }) => {
      const namespaces = db.get('namespaces');
      db.set(
        'namespaces',
        namespaces.filter((n) => n.name !== namespace)
      );
      return true;
    },
    createServiceAccount: () => {
      const user = db.get('user');

      return {
        id: `sa-${user.namespace}-${casual.uuid}`,
        name: `sa-${user.namespace}-${casual.uuid}`,
        credentials: JSON.stringify({
          clientId: casual.uuid,
          clientSecret: casual.uuid,
          tokenEndpoint:
            'https://apps-gov-bc-ca.dev.ca/auth/realms/token/endpoint',
        }),
      };
    },
  }),
  Application: () => ({
    name: `My Application ${random(1, 100)}`,
    appId: casual.uuid,
    description: casual.description,
  }),
  Namespace: () => ({
    name: casual.random_element(data.namespaces),
  }),
  ServiceAccount: () => {
    const user = db.get('user');
    return {
      id: `sa-${user.namespace}-${casual.uuid}`,
      name: `sa-${user.namespace}-${casual.uuid}`,
    };
  },
  Product: () => ({
    name: casual.random_element([
      'BC Address Geocoder Web Service',
      'API Gateway Services',
      'Address List Editor',
      'Document Generation',
      'BC Route Planner',
      'Service BC Office Locations',
      'Welcome BC Settlement Service Providers - Interactive Web Map Data',
      'Laboratory Services in BC',
      'Immunization Services in BC',
      'BC Health Care Facilities (Hospital)',
    ]),
    description: casual.words(10),
    kongRouteId: casual.uuid,
    kongServiceId: casual.uuid,
    namespace: casual.namespace,
    host: casual.populate('svr{{day_of_year}}.api.gov.bc.ca'),
    methods: 'GET',
    paths: casual.domain,
    isActive: casual.coin_flip,
    tags: casual.words(3),
    environments: () => new MockList(3, (_, { id }) => ({ id })),
    dataset: randomNullValue(),
    organization: randomNullValue(),
    organizationUnit: randomNullValue(),
  }),
  Organization: () => ({
    name: casual.random_element(data.organizations.map((o) => kebabCase(o))),
    sector: casual.random_element([
      'Health & Safety',
      'Service',
      'Social Services',
      'Natural Resources',
      'Econony',
      'Finance',
    ]),
    bcdcId: casual.uuid,
    title: casual.random_element(data.organizations),
    tags: casual.words(3),
    description: casual.description,
    orgUnits: () => new MockList(2, (_, { id }) => ({ id })),
  }),
  OrganizationUnit: () => ({
    name: casual.random_element(
      data.organizationUnits.map((o) => kebabCase(o))
    ),
    sector: casual.word,
    title: casual.random_element(data.organizationUnits),
    bcdcId: casual.uuid,
    tags: casual.word,
    description: casual.short_description,
  }),
  Environment: ({ id }) => ({
    id,
    name: casual.random_element(['dev', 'test', 'prod', 'sandbox', 'other']),
    approval: casual.boolean,
    active: casual.boolean,
    flow: casual.random_element([
      'kong-api-key-acl',
      'public',
      'client-credentials',
    ]),
    plugins: () => new MockList(2, (_, { id }) => ({ id })),
    description: casual.short_description,
    services: () => new MockList(random(0, 3), (_, { id }) => ({ id })),
  }),
  GatewayService: () => ({
    name: casual.service,
    kongRouteId: casual.uuid,
    kongServiceId: casual.uuid,
    namespace: casual.namespace,
    paths: casual.word,
    host: casual.populate('svr{{day_of_year}}.api.gov.bc.ca'),
    extSource: casual.word,
    extForeignKey: casual.uuid,
    isActive: casual.boolean,
    tags: '["ns.jh-etk-prod"]',
    updatedAt: casual.date('YYYY-MM-DD'),
    plugins: () => new MockList(2, (_, { id }) => ({ id })),
    routes: () => new MockList(random(1, 3), (_, { id }) => ({ id })),
  }),
  GatewayRoute: () => ({
    name: casual.route,
    namespace: casual.namespace,
    kongRouteId: casual.uuid,
    extForeignKey: casual.uuid,
    methods: JSON.stringify([
      casual.random_element(['GET', 'POST', 'PUT', 'DELETE']),
    ]),
    tags: '["ns.sample"]',
    hosts: JSON.stringify(['route']),
    paths: JSON.stringify(['/path']),
  }),
  CredentialIssuer: () => {
    const flow = casual.random_element([
      'kong-api-key-acl',
      'client-credentials',
    ]);
    let credentialValues = {};

    if (flow === 'client-credentials') {
      credentialValues = {
        availableScopes: JSON.stringify(['Scope1', 'Scope2', 'Scope3']),
        clientRoles: JSON.stringify(['role-a', 'role-b', 'role-c']),
        resourceScopes: JSON.stringify([]),
        resourceAccessScope: 'Manager.View',
        resourceType: 'namespace',
        apiKeyName: null,
      };
    }

    return {
      name: casual.title,
      description: casual.description,
      authMethod: casual.random_element(['jwt', 'public', 'keys']),
      mode: casual.random_element(['manual', 'auto']),
      instruction: casual.description,
      oidcDiscoveryUrl: casual.url,
      initialAccessToken: casual.card_number,
      flow,
      clientAuthenticator: 'client-secret',
      clientId: casual.uuid,
      clientSecret: casual.uuid,
      availableScopes: null,
      clientRoles: null,
      resourceScopes: null,
      resourceAccessScope: null,
      resourceType: null,
      apiKeyName: 'keyname',
      ...credentialValues,
      environments: () => JSON.stringify([]),
      environmentDetails:
        '[{"environment":"dev","issuerUrl":"https://authz-dev.apps.silver.devops.gov.bc.ca/auth/realms/aps","clientRegistration":"managed","clientId":"gwa","clientSecret":"93d2b2f2-c2d9-d526-1f29-482d23eeaebf"}]',
    };
  },
  GatewayConsumer: () => ({
    username: casual.username,
    customId: () => sample([casual.word, null, null, null]),
    tags: JSON.stringify(casual.array_of_words(random(0, 2))),
    aclGroups: JSON.stringify([]),
    namespace: () => sample([null, ...data.namespaces]),
    plugins: () => new MockList(random(0, 4), (_, { id }) => ({ id })),
    createdAt: formatISO(new Date()).toString(),
    kongConsumerId: casual.uuid,
  }),
  GatewayPlugin: () => {
    const random = sample([true, false, null]);
    const name = casual.random_element(['rate-limiting', 'ip-restriction']);
    const isService = random === true;
    const isRoute = random === false;
    let config = '';

    switch (name) {
      case 'rate-limiting':
        config = JSON.stringify({
          second: 12,
          minute: 12,
          hour: 12,
          day: 12,
          policy: casual.random_element(['local', 'redis']),
        });
        break;
      case 'ip-restriction':
        config = JSON.stringify({
          allow: ['2.2.2.2'],
          deny: null,
        });
        break;
      default:
        config = JSON.stringify({});
    }

    return {
      name,
      service: () => {
        if (isService) {
          return { id: casual.uuid };
        }
        return null;
      },
      route: () => {
        if (isRoute) {
          return { id: casual.uuid };
        }
        return null;
      },
      kongPluginId: casual.uuid,
      config,
      tags: JSON.stringify(casual.array_of_words(2)),
    };
  },
  Dataset: () => ({
    title: casual.random_element(data.datasets),
    name: casual.random_element(data.datasets.map((d) => kebabCase(d))),
    sector: casual.random_element([
      'Health & Safety',
      'Service',
      'Social Services',
      'Natural Resources',
      'Econony',
      'Finance',
    ]),
    license_title: 'Open Government License - British Columbia',
    view_audience: casual.random_element(['public', 'private']),
    private: casual.coin_flip,
    tags: JSON.stringify(casual.array_of_words(random(2, 8))),
    contacts: casual.word,
    security_class: casual.random_element([
      'LOW-PUBLIC',
      'HIGH-PUBLIC',
      'LOW-INTERNAL',
      'HIGH-INTERNAL',
    ]),
    notes: casual.description,
    catalogContent: casual.word,
    isInCatalog: casual.coin_flip,
    record_publish_date: casual.date('YYYY-MM-DD'),
  }),
  ServiceAccess: () => ({
    active: casual.boolean,
    name: casual.random_element(db.get('products')).name,
  }),
  AccessRequest: () => ({
    name: 'Gateway Administration API FOR APSO_F APSO_L',
    isApproved: casual.boolean,
    isIssued: true,
    isComplete: false,
    credential: JSON.stringify({
      apiKey: '5SbpWNWbPhV40ZcGBKRUxQneEAErF8Mw',
      clientId: casual.uuid,
      clientSecret: casual.uuid,
      clientPrivateKey: cert,
      clientPublicKey: cert,
      tokenEndpoint: 'https://apps-gov-bc-ca.dev.ca/auth/realms/token/endpoint',
    }),
    controls: JSON.stringify({
      plugins: [
        {
          name: casual.random_element(['rate-limiting', 'ip-restriction']),
          service: { id: casual.uuid, name: 'my-test-service' },
          route: null,
          kongPluginId: casual.uuid,
          config: JSON.stringify({}),
          tags: JSON.stringify(casual.array_of_words(2)),
        },
      ],
    }),
    additionalDetails: casual.sentences(4),
    communication: casual.sentence,
  }),
  UMAResourceSet: () => {
    const ns = sample(data.namespaces);
    const permission = sample(data.permissionTypes);

    return {
      id: casual.uuid,
      name: `${ns}.${permission}`,
      owner: casual.random_element(data.owners),
      type: casual.word,
    };
  },
  ConsumerScopesAndRoles: () => ({
    id: casual.uuid,
    consumerType: casual.word,
    defaultScopes: [
      'System/Patient',
      'System/MedicationRequest',
      'System/CheeseSlicesChalkCheesy',
    ],
    optionalScopes: [],
    clientRoles: ['a.role', 'b.role', 'c.role'],
  }),
  UMAPermissionTicket: () => {
    const { requester, requesterName } = sample(data.requesters);
    const ns = sample(data.namespaces);
    const permission = sample(data.permissionTypes);

    return {
      id: casual.uuid,
      scope: casual.word,
      scopeName: `${ns}.${permission}`,
      resource: casual.word,
      resourceName: casual.word,
      requester,
      requesterName,
      owner: casual.username,
      ownerName: casual.random_element(data.owners),
      granted: casual.coin_flip,
    };
  },
  Legal: () => ({
    description: 'This API comes with a set of terms you should follow',
    link: 'http://www2.gov.bc.ca/gov/content/home/copyright',
  }),
  User: () => ({
    name: casual.name,
    username: casual.username,
    email: casual.email,
    isAdmin: false,
  }),
  DateTime: () => {
    const subtract = random(0, 20);
    const date = subDays(new Date(), subtract);

    return formatISO(date);
  },
  Activity: () => {
    return { context: JSON.stringify({ name: 'blah' }) };
  },
});

app.post('/gql/api', async (req, res) => {
  const response = await server.query(req.body.query, req.body.variables);
  res.json(response);
});

app.use('/admin', adminApi);
app.use('/ds/api', dsApi);
app.listen(port, () => console.log(`Mock server running on port ${port}`));
