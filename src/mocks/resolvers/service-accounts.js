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
export const getAllServiceAccountsHandler = (req, res, ctx) => {
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

export const createServiceAccountHandler = (req, res, ctx) => {
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
