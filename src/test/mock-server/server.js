const { mockServer, MockList } = require('graphql-tools');
const casual = require('casual-browserify');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const schema = `
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

  type RootQuery {
    allPackages: [ Package ]
  }

  schema {
    query: RootQuery
  }
`;

const server = mockServer(schema, {
  RootQuery: () => ({
    allPackages: () => new MockList(6, (o, { id }) => ({ id })),
  }),
  Package: () => ({
    name: casual.name,
    kongRouteId: casual.uuid,
    kongServiceId: casual.uuid,
    namespace: casual.word,
    host: casual.domain,
    methods: 'GET',
    paths: casual.domain,
    isActive: casual.boolean,
    tags: casual.word,
    environments: () =>
      new MockList(2, (_, { id }) => ({
        id,
        name: casual.word,
        active: casual.boolean,
        authMethod: casual.random_element(['private', 'public', 'JWT', 'keys']),
        services: () =>
          new MockList(4, (_, { id }) => ({
            id,
          })),
      })),
  }),
  Organization: () => ({
    name: casual.word,
    sector: casual.word,
    bcdcId: casual.uuid,
    title: casual.word,
    tags: casual.word,
    description: casual.description,
    orgUnits: () => new MockList(2, (_, { id }) => ({ id })),
  }),

  OrganizationUnit: () => ({
    name: casual.word,
    sector: casual.word,
    title: casual.word,
    bcdcId: casual.uuid,
    tags: casual.word,
    description: casual.short_description,
  }),
  Environment: () => ({
    name: casual.word,
    active: casual.boolean,
    authMethod: casual.random_element(['JWT', 'public', 'private', 'apiKey']),
    plugins: () => new MockList(2, (_, { id }) => ({ id })),
    description: casual.short_description,
    services: () => new MockList(2, (_, { id }) => ({ id })),
  }),
  ServiceRoute: () => ({
    name: casual.word,
    kongRouteId: casual.uuid,
    kongServiceId: casual.uuid,
    namespace: casual.word,
    methods: casual.word,
    paths: casual.word,
    host: casual.domain,
    isActive: casual.boolean,
    tags: casual.word,
    plugins: () => new MockList(2, (_, { id }) => ({ id })),
  }),
  CredentialIssuer: () => ({
    name: casual.word,
    description: casual.description,
    authMethod: casual.random_element(['JWT', 'public', 'private', 'apiKey']),
    mode: casual.word,
    instruction: casual.description,
    oidcDiscoveryUrl: casual.url,
    initialAccessToken: casual.card_number,
    clientId: casual.uuid,
    clientSecret: casual.uuid,
    environments: () => new MockList(2, (_, { id }) => ({ id })),
  }),
  Plugin: () => ({
    name: casual.word,
    kongPluginId: casual.uuid,
    config: casual.word,
  }),
  Dataset: () => ({
    name: casual.word,
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

app.get('/admin/session', (req, res) => {
  res.json({
    name: 'Viktor Vaughn',
    username: 'DOOM',
    email: 'villain@doom.net',
    roles: ['api-developer'],
  });
});

app.post('/admin/api', async (req, res) => {
  const response = await server.query(req.body.query, req.body.variables);
  res.json(response);
});

app.listen(port, () => console.log('mock server running'));
