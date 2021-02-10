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
    services: [ ServiceRoute ]
    package: Package
  }

  type ServiceRoute {
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

  type Package {
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

  type Query {
    allPackages: [ Package ]
  }

  input CreatePackageInput {
    name: String!
  }

  input CreateEnvironmentInput {
    name: String!
    package: ID!
  }

  type Mutation {
    createPackage(data: CreatePackageInput): Package!
    createEnvironment(data: CreateEnvironmentInput): Environment!
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;

//const store = createMockStore({ schema: schemaStruct });
const allPackages = new MockList(6, (_, { id }) => ({ id }));
// const allPackages = [{ id: casual.uuid, name: 'hi' }];
const schema = makeExecutableSchema({ typeDefs: schemaStruct });
const schemaWithMocks = addMocksToSchema({
  schema,
});
const server = mockServer(schemaWithMocks, {
  Query: () => ({
    allPackages: () => allPackages,
  }),
  Mutation: () => ({
    createPackage: ({ data }) => {
      // allPackages.push({ id: casual.uuid, name: data.name });
      return { name: data.name };
    },
    createEnvironment: ({ data }) => {
      return { name: data.name };
    },
  }),
  Package: () => ({
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
    environments: () =>
      new MockList(random(0, 3), (_, { id }) => ({
        id,
      })),
  }),
  Organization: () => ({
    name: casual.random_element(['Health Authority', 'DataBC', 'Elections BC']),
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
  Environment: () => ({
    name: casual.random_element(['dev', 'test', 'prod']),
    active: casual.boolean,
    authMethod: casual.random_element(['JWT', 'public', 'private', 'keys']),
    plugins: () => new MockList(2, (_, { id }) => ({ id })),
    description: casual.short_description,
    services: () => new MockList(random(0, 3), (_, { id }) => ({ id })),
  }),
  ServiceRoute: () => ({
    name: casual.populate('{{domain}}.api.gov.bc.ca'),
    kongRouteId: casual.uuid,
    kongServiceId: casual.uuid,
    namespace: casual.word,
    methods: casual.word,
    paths: casual.word,
    host: casual.populate('svr{{day_of_year}}.api.gov.bc.ca'),
    isActive: casual.boolean,
    tags: casual.word,
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
    name: casual.title,
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
