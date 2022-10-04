import compact from 'lodash/compact';

const allLegals = new Map([
  [
    'legal1',
    {
      id: 'legal1',
      title: 'Terms of Use for API Gateway',
      reference: 'terms-of-use-for-api-gateway-1',
    },
  ],
]);
const services = new Map([
  [
    's1',
    {
      id: 's1',
      name: 'a-service-for-moh-proto',
    },
  ],
  [
    's2',
    {
      id: 's2',
      name: 'Sample_API',
    },
  ],
  [
    's3',
    {
      id: 's3',
      name: 'My New API',
    },
  ],
  [
    's4',
    {
      id: 's4',
      name: 'b-service-for-transport',
    },
  ],
  [
    's5',
    {
      id: 's5',
      name: 'api-for-example',
    },
  ],
  [
    's6',
    {
      id: 's6',
      name: 'api-for-test',
    },
  ],
  [
    's7',
    {
      id: 's7',
      name: 'api-for-new-stores',
    },
  ],
]);
const environments = new Map([
  [
    'e1',
    {
      id: 'e1',
      name: 'prod',
      active: true,
      flow: 'client-credentials',
      credentialIssuer: {
        id: '8',
        name: 'MoH IdP',
      },
      legal: allLegals.get('legal1'),
      services: ['s1'],
      approval: true,
      additionalDetailsToRequest:
        'To gain access to production, you must be certified.  Please provide your certification number below.',
    },
  ],
  [
    'e2',
    {
      id: 'e2',
      name: 'dev',
      active: false,
      flow: 'client-credentials',
      credentialIssuer: {
        id: '8',
        name: 'MoH IdP',
      },
      services: [],
      approval: true,
      additionalDetailsToRequest:
        'To gain access to production, you must be certified.  Please provide your certification number below.',
    },
  ],
  [
    'e3',
    {
      id: 'e3',
      name: 'other',
      active: true,
      flow: 'client-credentials',
      credentialIssuer: {
        id: '8',
        name: 'MoH IdP',
      },
      legal: allLegals.get('legal1'),
      services: [],
      approval: true,
      additionalDetailsToRequest:
        'To gain access to production, you must be certified.  Please provide your certification number below.',
    },
  ],
  [
    'e11',
    {
      id: 'e11',
      name: 'test',
      flow: 'client-credentials',
      active: true,
      credentialIssuer: {
        id: '1',
        name: 'MoH IdP',
      },
      services: ['s2', 's4', 's5', 's7'],
      approval: false,
      additionalDetailsToRequest: '',
    },
  ],
  [
    'e21',
    {
      id: 'e21',
      name: 'other',
      active: true,
      flow: 'kong-api-key-acl',
      credentialIssuer: {
        id: '8',
        name: 'MoH IdP',
      },
      services: ['s3'],
      approval: false,
      additionalDetailsToRequest: '',
    },
  ],
]);

let allProductsByNamespace = [
  {
    id: 'p1',
    name: 'PharmaNet Electronic Prescribing',
    environments: ['e1', 'e2', 'e3'],
  },
  {
    id: 'p2',
    name: 'PharmaNet API',
    environments: ['e11', 'e21'],
  },
];

export const allProductsHandler = (req, res, ctx) => {
  return res(
    ctx.data({
      allProductsByNamespace: allProductsByNamespace.map((p) => ({
        ...p,
        environments: compact(
          p.environments
            .map((e) => environments.get(e))
            .map((e) => ({
              ...e,
              services: e.services.map((s) => services.get(s)),
            }))
        ),
      })),
    })
  );
};

export const getEnvironmentHandler = (req, res, ctx) => {
  const { id } = req.variables;
  const environment = environments.get(id);

  return res(
    ctx.data({
      OwnedEnvironment: {
        ...environment,
        services: environment.services.map((s) => services.get(s)),
        appId: 'e02ei220',
        product: {
          name: 'PharmaNet Electronic Prescribing',
          namespace: 'moh-proto',
          organization: null,
          environments: [
            {
              name: 'prod',
              id: '30',
            },
            {
              name: 'conformance',
              id: '29',
            },
          ],
        },
      },
    })
  );
};

export const getAllCredentialIssuersByNamespace = (req, res, ctx) => {
  return res(
    ctx.data({
      allCredentialIssuersByNamespace: [
        {
          id: '1',
          name: 'Resource Server',
          environmentDetails: JSON.stringify([
            {
              environment: 'conformance',
              clientSecret: '****',
              clientRegistration: 'managed',
              issuerUrl: 'https://oidc.site/auth/realms/asdfasdf',
              clientId: 'moh-proto',
              exists: true,
            },
            {
              environment: 'prod',
              clientSecret: '****',
              clientRegistration: 'managed',
              issuerUrl: 'https://oidc.site/auth/realms/asdfasdf',
              clientId: 'moh-proto',
              exists: true,
            },
          ]),
        },
        {
          id: '8',
          name: 'Resource Server (Signed)',
          environmentDetails: JSON.stringify([
            {
              environment: 'conformance',
              clientSecret: '****',
              clientRegistration: 'managed',
              issuerUrl: 'https://oidc.site/auth/realms/asdfasdf',
              clientId: 'moh-proto',
              exists: true,
            },
            {
              environment: 'prod',
              clientSecret: '****',
              clientRegistration: 'managed',
              issuerUrl: 'https://oidc.site/auth/realms/asdfasdf',
              clientId: 'moh-proto',
              exists: true,
            },
          ]),
        },
      ],
    })
  );
};

export const allLegalsHandler = (req, res, ctx) => {
  return res(
    ctx.data({
      allLegals: Array.from(allLegals.values()),
    })
  );
};

export const allGatewayServicesHandler = (req, res, ctx) => {
  return res(
    ctx.data({
      allGatewayServices: Array.from(services.values()),
    })
  );
};

export const addProductHandler = (req, res, ctx) => {
  const record = {
    id: `p${allProductsByNamespace.length + 1}`,
    name: req.variables.name,
    environments: [],
  };
  allProductsByNamespace.push(record);
  return res(
    ctx.data({
      createProduct: record,
    })
  );
};

export const updateProductHandler = (req, res, ctx) => {
  const { id, data } = req.variables;
  allProductsByNamespace = allProductsByNamespace.map((p) => {
    if (p.id === id) {
      return {
        ...p,
        name: data.name,
      };
    }
    return p;
  });
  return res(ctx.data({ id }));
};

export const addEnvironmentHandler = (req, res, ctx) => {
  const { product } = req.variables;

  const record = {
    id: `e${environments.size}`,
    name: req.variables.name,
    services: [],
  };
  environments.set(record.id, record);
  allProductsByNamespace = allProductsByNamespace.map((p) => {
    const environments =
      p.id === product ? [...p.environments, record.id] : p.environments;
    return {
      ...p,
      environments,
    };
  });
  return res(
    ctx.data({
      createEnvironment: record,
    })
  );
};

export const updateEnvironmentHandler = (req, res, ctx) => {
  const { id, data } = req.variables;
  if (id === 'e2') {
    return res(
      ctx.data({
        errors: [{ message: 'Nesting error' }],
      })
    );
  }
  const environment = environments.get(id);
  const result = environments.set(id, {
    ...environment,
    ...data,
    services: data.services.connect.map((s) => s.id),
    credentialIssuer: {
      ...environment.credentialIssuer,
      id: data.credentialIssuer.connect.id,
    },
    legal: data.legal.connect ? allLegals.get(data.legal.connect.id) : null,
  });

  return res(ctx.data(result.get(id)));
};

export const deleteEnvironmentHandler = (req, res, ctx) => {
  const { id } = req.variables;
  allProductsByNamespace = allProductsByNamespace.map((p) => ({
    ...p,
    environments: p.environments.filter((e) => e.id !== id),
  }));
  return res(ctx.data({}));
};

export const deleteProductHandler = (req, res, ctx) => {
  const { id } = req.variables;
  allProductsByNamespace = allProductsByNamespace.filter((p) => p.id !== id);
  return res(ctx.data({}));
};
