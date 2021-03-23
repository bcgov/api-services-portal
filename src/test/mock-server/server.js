const {
  addMocksToSchema,
  makeExecutableSchema,
  mockServer,
  MockList,
} = require('graphql-tools');
const casual = require('casual-browserify');
const times = require('lodash/times');
const random = require('lodash/random');
const express = require('express');
const cors = require('cors');
const { addHours, parse, formatISO, subDays } = require('date-fns');

const metricsData = require('./metrics-data');
const schemas = require('./schemas');
const { sample } = require('lodash');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const envs = ['prod', 'staging', 'dev', 'sandbox'];
const namespaces = [
  'jh-etk-prod',
  'dss-map',
  'dss-aps',
  'dss-loc',
  'citz-gdx',
  'dss-dds',
];
// Casual Definitions
casual.define('namespace', () => {
  return sample(namespaces);
});
casual.define('service', () => {
  const ns = sample(namespaces);
  const env = sample(envs);
  return `service-${ns}-${env}-${casual.word}`;
});
casual.define('route', () => {
  const ns = sample(namespaces);
  const env = sample(envs);
  return `route-${ns}-${env}-${casual.word}`;
});

//const store = createMockStore({ schema: schemaStruct });
// const allProducts = new MockList(6, (_, { id }) => ({ id }));
let allProducts = [
  {
    id: casual.uuid,
    name: 'BC Data Catalogue',
    environments: [
      { id: casual.uuid, name: 'test', active: true, services: [] },
    ],
  },
];
const allOrganizations = new MockList(8, (_, { id }) => ({ id }));
const allOrganizationUnits = new MockList(18, (_, { id }) => ({ id }));
const schema = makeExecutableSchema({ typeDefs: schemas });
const schemaWithMocks = addMocksToSchema({
  schema,
});

const server = mockServer(schemaWithMocks, {
  Query: () => ({
    allProducts: () => allProducts,
    allEnvironments: () => {
      const result = [];
      allProducts.forEach((p) => {
        p.environments.forEach((e) => result.push(e));
      });
      return result;
    },
    allGatewayServices: () => new MockList(108, (_, { id }) => ({ id })),
    allDatasets: () => new MockList(8, (_, { id }) => ({ id })),
    allOrganizations: () => allOrganizations,
    allOrganizationUnits: () => allOrganizationUnits,
    allAccessRequests: () => new MockList(6, (_, { id }) => ({ id })),
    allGatewayConsumers: () => new MockList(4, (_, { id }) => ({ id })),
    allPlugins: () => new MockList(4, (_, { id }) => ({ id })),
    allMetrics: (_query, _, args) => {
      const result = args.variableValues.days.map((d, index) => {
        const metrics = metricsData[index];
        const date = parse(d, 'yyyy-MM-dd', new Date());
        const values = [];

        times(24, (n) => {
          const hour = addHours(date, n);

          if (metrics[n]) {
            values.push([hour.getTime(), metrics[n]]);
          }
        });

        return {
          name: `kong_http_requests_hourly.${d}.{}`,
          query: 'kong_http_requests_hourly',
          day: d,
          metric: '{}',
          values: JSON.stringify(values),
        };
      });

      return result;
    },
  }),
  Mutation: () => ({
    createProduct: ({ data }) => {
      const id = casual.uuid;
      allProducts.push({ id, name: data.name, environments: [] });
      return { id, name: data.name };
    },
    updateProduct: ({ id, data }) => {
      return {
        id,
        ...data,
      };
    },
    deleteProduct: ({ id }) => {
      allProducts = allProducts.filter((d) => d.id !== id);
      return allProducts;
    },
    createEnvironment: ({ data }) => {
      const parent = allProducts.find((d) => d.id === data.product.connect.id);
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
      allProducts.forEach((p) => {
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

      allProducts.forEach((p) => {
        const environmentIds = p.environments.map((e) => e.id);
        const environmentIndex = environmentIds.indexOf(id);
        if (environmentIndex >= 0) {
          name = p.environments[environmentIndex].name;
        }
        p.environments = p.environments.filter((e) => e.id !== id);
      });

      return { id, name };
    },
  }),
  Product: () => ({
    name: casual.title,
    description: casual.words(10),
    kongRouteId: casual.uuid,
    kongServiceId: casual.uuid,
    namespace: casual.namespace,
    host: casual.populate('svr{{day_of_year}}.api.gov.bc.ca'),
    methods: 'GET',
    paths: casual.domain,
    isActive: casual.coin_flip,
    tags: casual.words(3),
  }),
  Organization: () => ({
    name: casual.word,
    sector: casual.random_element([
      'Health & Safety',
      'Service',
      'Social Services',
    ]),
    bcdcId: casual.uuid,
    title: casual.word,
    tags: casual.words(3),
    description: casual.description,
    orgUnits: () => new MockList(2, (_, { id }) => ({ id })),
  }),
  OrganizationUnit: () => ({
    name: casual.title,
    sector: casual.word,
    title: casual.title,
    bcdcId: casual.uuid,
    tags: casual.word,
    description: casual.short_description,
  }),
  Environment: ({ id }) => ({
    id,
    name: casual.random_element([
      'dev',
      'test',
      'prod',
      'sandbox',
      'other',
      null,
    ]),
    active: casual.boolean,
    authMethod: casual.random_element(['jwt', 'public', 'keys']),
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
    methods: JSON.stringify([
      casual.random_element(['GET', 'POST', 'PUT', 'DELETE']),
    ]),
    tags: '["ns.jh-etk-prod"]',
  }),
  CredentialIssuer: () => ({
    name: casual.title,
    description: casual.description,
    authMethod: casual.random_element(['jwt', 'public', 'keys']),
    mode: casual.word,
    instruction: casual.description,
    oidcDiscoveryUrl: casual.url,
    initialAccessToken: casual.card_number,
    clientId: casual.uuid,
    clientSecret: casual.uuid,
    environments: () => new MockList(2, (_, { id }) => ({ id })),
  }),
  GatewayConsumer: () => ({
    username: casual.username,
    customId: casual.word,
    tags: JSON.stringify(casual.array_of_words(2)),
    createdAt: formatISO(new Date()).toString(),
  }),
  GatewayPlugin: () => {
    const random = sample([true, false, null]);
    const isService = random === true;
    const isRoute = random === false;

    return {
      name: casual.random_element(['rate-limiting', 'ip-restriction']),
      service: () => {
        if (isService) {
          return { id: casual.uuid };
        }
        return null;
      },
      route: (...args) => {
        if (isRoute) {
          return { id: casual.uuid };
        }
        return null;
      },
      kongPluginId: casual.uuid,
      config: casual.word,
      tags: JSON.stringify(casual.array_of_words(2)),
    };
  },
  Dataset: () => ({
    name: casual.uuid,
    sector: casual.word,
    license_title: casual.word,
    view_audience: casual.word,
    private: casual.coin_flip,
    tags: casual.word,
    contacts: casual.word,
    securityClass: casual.word,
    notes: casual.short_description,
    title: casual.word,
    catalogContent: casual.word,
    isInCatalog: casual.coin_flip,
  }),
  AccessRequest: () => ({
    name: 'Gateway Administration API FOR APSO_F APSO_L',
    isApproved: true,
    isIssued: true,
    isComplete: false,
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
});

app.get('/admin/session', (_, res) => {
  // res.sendStatus(401);
  res.json({
    user: {
      id: casual.uuid,
      userId: casual.uuid,
      name: 'Viktor Vaughn',
      username: 'vikvaughn',
      email: 'villain@doom.net',
      roles: ['api-owner'],
      isAdmin: false,
      namespace: 'dss-aps',
      groups: null,
    },
  });
});

app.post('/admin/api', async (req, res) => {
  const response = await server.query(req.body.query, req.body.variables);
  res.json(response);
});

app.listen(port, () => console.log(`Mock server running on port ${port}`));
