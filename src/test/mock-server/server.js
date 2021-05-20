const {
  addMocksToSchema,
  makeExecutableSchema,
  mockServer,
  MockList,
} = require('graphql-tools');
const casual = require('casual-browserify');
const times = require('lodash/times');
const random = require('lodash/random');
const snakeCase = require('lodash/snakeCase');
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
let namespacesJson = namespaces.map((n) => ({ name: n, id: casual.uuid }));
let namespace = sample(namespacesJson);
const devs = [
  'Joshua Jones',
  'Ashwin Lunkad',
  'Johnathan Brammall',
  'Greg Lawrance',
];
const owners = ['Craig Rigdon', 'Aidan Cope'];
const permissionTypes = ['View', 'Publish', 'Manage', 'Delete', 'Create'];
const requesters = devs.map((d) => ({
  requesterName: d,
  requester: casual.uuid,
}));
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
      {
        id: casual.uuid,
        name: 'test',
        active: true,
        services: [],
        flow: 'flow',
      },
    ],
  },
  {
    id: casual.uuid,
    name: 'Geocoder Service API',
    environments: [
      {
        id: casual.uuid,
        name: 'test',
        active: true,
        services: [],
        flow: 'flow',
      },
    ],
  },
  {
    id: casual.uuid,
    name: 'eRx API',
    environments: [
      {
        id: casual.uuid,
        name: 'sandbox',
        active: true,
        services: [],
        flow: 'flow',
      },
      {
        id: casual.uuid,
        name: 'prod',
        active: true,
        services: [],
        flow: 'flow',
      },
    ],
  },
  {
    id: casual.uuid,
    name: 'Wildfire Data',
    environments: [
      {
        id: casual.uuid,
        name: 'test',
        active: true,
        services: [],
        flow: 'flow',
      },
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
    // allProducts: () => allProducts,
    allProducts: () => new MockList(8, (_, { id }) => ({ id })),
    allDiscoverableProducts: () => new MockList(10, (_, { id }) => ({ id })),
    allEnvironments: () => {
      const result = [];
      allProducts.forEach((p) => {
        p.environments.forEach((e) => result.push(e));
      });
      return result;
    },
    allGatewayServices: () => new MockList(108, (_, { id }) => ({ id })),
    allDatasets: () => new MockList(40, (_, { id }) => ({ id })),
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
    getPermissionTickets: () => new MockList(6, (_, { id }) => ({ id })),
    getResourceSet: () => new MockList(8, (_, { id }) => ({ id })),
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
      // throw new Error({
      //   errors: [{ message: 'something broke', name: 'ValidationError' }],
      // });
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
    environments: () => new MockList(1, (_, { id }) => ({ id })),
  }),
  Organization: () => ({
    name: casual.random_element([
      'Ministry of Advanced Education and Skills Training',
      'Ministry of Agriculture, Food and Fisheries',
      'Ministry of Attorney General',
      'Ministry of Citizens Services',
      'Ministry of Education',
      'Ministry of Health',
      'Ministry of Forests, Lands, Natural Resource Operations and Rural Development',
      'Ministry of Indigenous Relations and Reconciliation',
    ]),
    sector: casual.random_element([
      'Health & Safety',
      'Service',
      'Social Services',
      'Natural Resources',
      'Econony',
      'Finance',
    ]),
    bcdcId: casual.uuid,
    title: casual.random_element([
      'Ministry of Advanced Education and Skills Training',
      'Ministry of Agriculture, Food and Fisheries',
      'Ministry of Attorney General',
      'Ministry of Citizens Services',
      'Ministry of Education',
      'Ministry of Health',
      'Ministry of Forests, Lands, Natural Resource Operations and Rural Development',
      'Ministry of Indigenous Relations and Reconciliation',
    ]),
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
    approval: casual.boolean,
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
    customId: () => sample([casual.word, null, null, null]),
    tags: JSON.stringify(casual.array_of_words(random(0, 2))),
    namespace: () => sample([null, ...namespaces]),
    plugins: () => new MockList(random(0, 4), (_, { id }) => ({ id })),
    createdAt: formatISO(new Date()).toString(),
    kongConsumerId: casual.uuid,
  }),
  GatewayPlugin: () => {
    const random = sample([true, false, null]);
    // const name = casual.random_element(['rate-limiting', 'ip-restriction']);
    // const isService = random === true;
    // const isRoute = random === false;
    const name = 'rate-limiting';
    const isService = true;
    const isRoute = true;
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
        config = '';
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
    title: casual.random_element([
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
      'BC Gov News API Service',
      'WorkBC Job Postings - API Web Service',
      'BC Roads Map Service - Web Mercator',
      'British Columbia Geographical Names Web Service - BCGNWS',
      'Open511-DriveBC API',
      'Historic City of Vancouver Fire Insurance Map',
      'BC Laws API',
      'BC Web Map Library',
    ]),
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
  AccessRequest: () => ({
    name: 'Gateway Administration API FOR APSO_F APSO_L',
    isApproved: casual.boolean,
    isIssued: true,
    isComplete: false,
    controls: JSON.stringify({
      plugins: [
        {
          name: casual.random_element(['rate-limiting', 'ip-restriction']),
          service: { id: casual.uuid, name: 'my-test-service' },
          route: null,
          kongPluginId: casual.uuid,
          config: casual.word,
          tags: JSON.stringify(casual.array_of_words(2)),
        },
      ],
    }),
  }),
  UMAResourceSet: () => {
    const ns = sample(namespaces);
    const permission = sample(permissionTypes);

    return {
      id: casual.uuid,
      name: `${ns}.${permission}`,
      owner: casual.random_element(owners),
      type: casual.word,
    };
  },
  UMAPermissionTicket: () => {
    const { requester, requesterName } = sample(requesters);
    const ns = sample(namespaces);
    const permission = sample(permissionTypes);

    return {
      id: casual.uuid,
      scope: casual.word,
      scopeName: `${ns}.${permission}`,
      resource: casual.word,
      resourceName: casual.word,
      requester,
      requesterName,
      owner: casual.username,
      ownerName: casual.random_element(owners),
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
});

app.put('/admin/switch/:id', (req, res) => {
  const next = namespaces.find((n) => n.id === req.params.id);
  namespace = next;
  res.json({ switch: true });
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
      roles: ['api-owner', 'developer'],
      isAdmin: false,
      namespace: namespace ? namespace.name : null,
      groups: null,
      sub: 'sub',
    },
  });
});

app.post('/gql/api', async (req, res) => {
  const response = await server.query(req.body.query, req.body.variables);
  res.json(response);
});

app
  .route('/v2/namespaces')
  .get((req, res) => {
    res.json(namespacesJson);
  })
  .post((req, res) => {
    const newName = casual.word;
    namespace = { name: newName, id: casual.uuid };
    namespacesJson.push(namespace);
    res.json(namespace);
  });
app.delete('/v2/namespaces/:namespace', (req, res) => {
  namespacesJson = namespacesJson.filter(
    (n) => n.name !== req.params.namespace
  );
  res.end();
});

app.listen(port, () => console.log(`Mock server running on port ${port}`));
