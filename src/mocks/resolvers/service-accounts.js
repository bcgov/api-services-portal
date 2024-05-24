import { v4 as uuidv4 } from 'uuid';

const allNamespaceServiceAccounts = [
  {
    id: '1',
    name: 'sa-sampler-ca33333-3202ij0iwef',
    createdAt: '2022-09-21T18:20:55.655Z',
  },
  {
    id: '2',
    name: 'sa-sampler-ca44444-123iej20dj2',
    createdAt: '2021-10-25T19:30:47.422Z',
  },
  {
    id: '3',
    name: 'sa-sampler-asfadf-asdfasdf',
    createdAt: '2021-10-19T17:56:43.786Z',
  },
  {
    id: '4',
    name: 'sa-sampler-asdfkjsaldf',
    createdAt: '2021-07-10T18:09:11.555Z',
  },
];
export const getAllServiceAccountsHandler = (_, res, ctx) => {
  return res(
    ctx.data({
      allNamespaceServiceAccounts,
      allTemporaryIdentities: [
        {
          id: '1',
          userId: 'u1',
        },
      ],
    })
  );
};

export const createServiceAccountHandler = (_, res, ctx) => {
  const record = {
    id: (allNamespaceServiceAccounts.length + 1).toString(),
    name: `sa-sampler-${uuidv4()}`,
  };
  allNamespaceServiceAccounts.push({
    ...record,
    createdAt: new Date().toISOString(),
  });
  return res(
    ctx.data({
      createServiceAccount: {
        ...record,
        credentials: JSON.stringify({
          flow: 'client-credentials',
          clientId: record.name,
          clientSecret: uuidv4(),
          tokenEndpoint:
            'https://host.gov.bc.ca/auth/realms/aps/protocol/openid-connect/token',
        }),
      },
    })
  );
};

export const getMyServiceAccessHandlers = (_, res, ctx) => {
  return res(
    ctx.data({
      myAccessRequests: [
        {
          id: '1581',
          name: 'BE2BD769-5BDA36EB527',
          active: false,
          application: {
            name: 'Demo App',
          },
          productEnvironment: {
            id: '175',
            name: 'dev',
            flow: 'kong-api-key-acl',
            product: {
              id: '166',
              name: 'eRX Demo API',
            },
            credentialIssuer: {
              clientAuthenticator: 'client-jwt-jwks-url',
            },
          },
        },
      ],
      myServiceAccesses: [
        {
          id: '111',
          name: 'aiofja90sdfja0s9fj',
          active: true,
          application: {
            name: 'Shoppers Drug Mart 123',
          },
          productEnvironment: {
            id: '175',
            name: 'dev',
            flow: 'client-jwt-jwks-url',
            product: {
              id: '166',
              name: 'Demo App',
            },
            credentialIssuer: {
              clientAuthenticator: 'client-jwt-jwks-url',
            },
          },
          credentialReference: JSON.stringify({
            id: 'asldf-asdf-asdf',
            clientId: 'CLIENT_ID_123',
            clientCertificate: null,
            jwksUrl: 'https://example.com/.well-known/jwks.json',
          }),
          controls: JSON.stringify({
            clientGenCertificate: true,
            jwksUrl: 'https://example.com/.well-known/jwks.json',
          }),
          isComplete: true,
          isApproved: true,
          isIssued: true,
        },
        {
          id: '211',
          name: 'asf9oas0f9jwf',
          active: true,
          application: {
            name: 'Shoppers Drug Mart 456',
          },
          productEnvironment: {
            id: '175',
            name: 'dev',
            flow: 'client-jwt-jwks-url',
            product: {
              id: '166',
              name: 'Demo App',
            },
            credentialIssuer: {
              clientAuthenticator: 'client-jwt-jwks-url',
            },
          },
          credentialReference: JSON.stringify({
            id: 'asldf-asdf-asdf',
            clientId: 'CLIENT_ID_123',
            clientCertificate: `-----BEGIN PUBLIC KEY-----
asdf0jas0dfja0sdfj0as9dfja0sd9fj09sdfj0asjdf0as9jf09asjf0a9sjfa0s9djf0asdjf0asdjf0asdjy/aosdf0oaisdfj0a9sdfj+0a9sdf0a9jfoasdjf0asdjf+a0osdifja-sdfj+)9uasdfjlaojksdjfoasdfj+oajsd0fiajsd0f/laksdjflasdkfj2Q1AGNYP8cZOQ9NzNnIYsGTsHw8GvDn6l/b1N+aklsjdfoasdjf0oaisdjf0asidfj/asodfj0asidfj.asdf0jasdf/asodifjas0d-pfj/asddofijas0dfj/asdopija0opsdjB
-----END PUBLIC KEY-----`,
            jwksUrl: null,
          }),
          controls: JSON.stringify({
            clientGenCertificate: true,
            publicKey: `-----BEGIN PUBLIC KEY-----
asdf0jas0dfja0sdfj0as9dfja0sd9fj09sdfj0asjdf0as9jf09asjf0a9sjfa0s9djf0asdjf0asdjf0asdjy/aosdf0oaisdfj0a9sdfj+0a9sdf0a9jfoasdjf0asdjf+a0osdifja-sdfj+)9uasdfjlaojksdjfoasdfj+oajsd0fiajsd0f/laksdjflasdkfj2Q1AGNYP8cZOQ9NzNnIYsGTsHw8GvDn6l/b1N+aklsjdfoasdjf0oaisdjf0asidfj/asodfj0asidfj.asdf0jasdf/asodifjas0d-pfj/asddofijas0dfj/asdopija0opsdjB
-----END PUBLIC KEY-----`,
          }),
          isComplete: true,
          isApproved: true,
          isIssued: true,
        },
        {
          id: '888',
          name: 'ialdkfjasd0f',
          active: true,
          application: {
            name: 'Shoppers Drug Mart 888',
          },
          productEnvironment: {
            id: '175',
            name: 'dev',
            flow: 'client-credentials',
            product: {
              id: '166',
              name: 'Demo App',
            },
            credentialIssuer: {
              clientAuthenticator: 'client-secret',
            },
          },
          isComplete: true,
          isApproved: true,
          isIssued: true,
        },
      ],
    })
  );
};

export const updateMyServiceAccessHandlers = (req, res, ctx) => {
  return res(ctx.data({}));
};
