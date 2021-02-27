const {
  addMocksToSchema,
  makeExecutableSchema,
  mockServer,
  MockList,
} = require('graphql-tools');
const casual = require('casual-browserify');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 4000;
const random = (start, end) =>
  Math.floor(Math.random() * (end - start) + start);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const schemaStruct = `
  type Organization {
    id: ID!
    name: String!
    sector: String
    bcdcId: String!
    title: String!
    tags: String!
    description: String
    orgUnits: [OrganizationUnit]
  }

  type OrganizationUnit {
    id: ID!
    name: String!
    sector: String!
    title: String!
    bcdcId: String!
    tags: String!
    description: String
  }

  type Environment {
    id: ID!
    name: String!,
    active: Boolean!,
    authMethod: String!
    plugins: [ Plugin ]
    description: String
    credentialIssuer: CredentialIssuer
    services: [ GatewayService ]
    product: Product
  }

  type GatewayService {
    id: ID!
    name: String!
    kongRouteId: String!
    kongServiceId: String!
    namespace: String!
    methods: String
    paths: String
    host: String!
    isActive: Boolean!
    tags: String!
    plugins: [ Plugin ]
    updatedAt: String
    environment: Environment,
  }

  type CredentialIssuer {
    id: ID!
    name: String!
    description: String
    authMethod: String
    mode: String,
    instruction: String
    oidcDiscoveryUrl: String
    initialAccessToken: String
    clientId: String
    clientSecret: String
    contact: User,
    environments: [ Environment ]
  }

  type Product {
    id: ID!
    name: String!
    description: String!
    dataset: Dataset,
    organization: Organization,
    organizationUnit: OrganizationUnit,
    environments: [Environment],
  }

  type Plugin {
    name: String!
    kongPluginId: String
    config: String!
  }

  type Dataset {
    id: ID!
    name: String!
    sector: String
    license_title: String
    view_audience: String
    private: Boolean
    tags: String
    contacts: String
    organization: Organization,
    organizationUnit: OrganizationUnit,
    securityClass: String
    notes: String
    title: String
    catalogContent: String
    isInCatalog: Boolean
  }

  type User {
    name: String!
    username: String!
    email: String!
    isAdmin: Boolean!,
  }

  input EnvironmentWhereUniqueInput {
    id: ID!
  }

  input DatasetWhereInput {
    name: String!
  }

  input GatewayServiceWhereInput {
    namespace: String!
  }

  input ProductWhereUniqueInput {
    id: ID!
  }

  input OrganizationWhereInput {
    id: ID!
  }

  input OrganizationUnitWhereInput {
    id: ID!
  }

  type Query {
    allProducts: [ Product ]
    allEnvironments: [ Environment ]
    allGatewayServices(where: GatewayServiceWhereInput): [ GatewayService ]
    allOrganizations(where: OrganizationWhereInput): [ Organization ]
    allOrganizationUnits(where: OrganizationUnitWhereInput, search: String): [ OrganizationUnit ]
    allDatasets(where: GatewayServiceWhereInput, search: String): [ Dataset ]
    Environment(where: EnvironmentWhereUniqueInput!): Environment
    Product(where: ProductWhereUniqueInput!): Product
  }

  input CreateProductInput {
    name: String!
  }

  input UpdateProductInput {
    name: String!
    organization: ID
    organizationUnit: ID
    dataset: String
  }

  input EnvironmentProductInput {
    id: ID!
  }

  input CreateEnvironmentOneToManyInput {
    connect: EnvironmentProductInput
  }

  input CreateEnvironmentInput {
    name: String!
    product: CreateEnvironmentOneToManyInput
  }

  input GatewayServiceWhereUniqueInput {
    id: ID!
  }

  input GatewayServiceRelateToManyInput {
    disconnectAll: Boolean
    connect: [GatewayServiceWhereUniqueInput]
  }

  input UpdateEnvironmentInput {
    active: Boolean
    name: String
    authMethod: String
    services: GatewayServiceRelateToManyInput
  }

  type Mutation {
    createProduct(data: CreateProductInput): Product!
    updateProduct(id: ID!, data: UpdateProductInput): Product!
    deleteProduct(id: ID!): Product!
    createEnvironment(data: CreateEnvironmentInput): Environment!
    updateEnvironment(id: ID!, data: UpdateEnvironmentInput): Environment!
    deleteEnvironment(id: ID!): Environment!
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;

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
const schema = makeExecutableSchema({ typeDefs: schemaStruct });
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
    name: casual.random_element(['dev', 'test', 'prod', 'sandbox', 'other']),
    active: casual.boolean,
    authMethod: casual.random_element(['JWT', 'public', 'private', 'keys']),
    plugins: () => new MockList(2, (_, { id }) => ({ id })),
    description: casual.short_description,
    services: () => new MockList(random(0, 3), (_, { id }) => ({ id })),
  }),
  GatewayService: () => ({
    name: casual.populate('{{word}}.api.gov.bc.ca'),
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
