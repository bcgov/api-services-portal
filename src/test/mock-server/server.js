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

const schemas = require('./schemas');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    allGatewayServices: () => new MockList(8, (_, { id }) => ({ id })),
    allDatasets: () => new MockList(8, (_, { id }) => ({ id })),
    allOrganizations: () => allOrganizations,
    allOrganizationUnits: () => allOrganizationUnits,
    allGatewayMetrics: (...args) => {
      const result = [];

      times(50, (n) => {
        result.push({
          name: casual.name,
          query: casual.word,
          day: casual.day_of_year,
          metric: casual.word,
          values:
            '[[1614844800,"17532.050209204997"],[1614848400,"33731.548117154816"],[1614852000,"9551.799163179923"],[1614855600,"12328.368200836827"],[1614859200,"6868.619246861925"],[1614862800,"7182.928870292886"],[1614866400,"17246.861924686174"],[1614870000,"9041.673640167364"],[1614873600,"16066.945606694566"],[1614877200,"12913.939835829853"],[1614880800,"19980.34470244608"],[1614884400,"21010.551831900157"],[1614888000,"28475.638697092596"],[1614891600,"18445.85774058575"],[1614895200,"28171.380753138048"],[1614898800,"22011.70797766982"],[1614902400,"22986.786057675767"],[1614906000,"19009.20502092047"],[1614909600,"25652.887029288675"],[1614913200,"16475.33885573865"],[1614916800,"12444.86013453247"],[1614920400,"10647.369828409091"],[1614924000,"30382.594142259386"],[1614927600,"9677.322175732226"]]',
        });
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
    namespace: casual.word,
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
    authMethod: casual.random_element(['JWT', 'public', 'private', 'keys']),
    plugins: () => new MockList(2, (_, { id }) => ({ id })),
    description: casual.short_description,
    services: () => new MockList(random(0, 3), (_, { id }) => ({ id })),
  }),
  GatewayService: () => ({
    name: casual.word,
    kongRouteId: casual.uuid,
    kongServiceId: casual.uuid,
    namespace: casual.word,
    methods: casual.word,
    paths: casual.word,
    host: casual.populate('svr{{day_of_year}}.api.gov.bc.ca'),
    isActive: casual.boolean,
    tags: casual.word,
    updatedAt: casual.date('YYYY-MM-DD'),
    plugins: () => new MockList(2, (_, { id }) => ({ id })),
    routes: () => new MockList(random(1, 3), (_, { id }) => ({ id })),
  }),
  GatewayRoute: () => ({
    name: casual.word,
  }),
  CredentialIssuer: () => ({
    name: casual.title,
    description: casual.description,
    authMethod: casual.random_element(['JWT', 'public', 'private', 'keys']),
    mode: casual.word,
    instruction: casual.description,
    oidcDiscoveryUrl: casual.url,
    initialAccessToken: casual.card_number,
    clientId: casual.uuid,
    clientSecret: casual.uuid,
    environments: () => new MockList(2, (_, { id }) => ({ id })),
  }),
  Plugin: () => ({
    name: casual.title,
    kongPluginId: casual.uuid,
    config: casual.word,
  }),
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
  User: () => ({
    name: casual.name,
    username: casual.username,
    email: casual.email,
    isAdmin: false,
  }),
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
      namespace: 'ns.sampler',
      groups: null,
    },
  });
});

app.post('/admin/api', async (req, res) => {
  const response = await server.query(req.body.query, req.body.variables);
  res.json(response);
});

app.listen(port, () => console.log(`Mock server running on port ${port}`));
