import times from 'lodash/times';

export const allProductsHandler = (req, res, ctx) => {
  return res(
    ctx.data({
      allProductsByNamespace: [
        {
          id: 'p1',
          name: 'PharmaNet Electronic Prescribing',
          environments: [
            {
              id: 'e1',
              name: 'prod',
              active: true,
              flow: 'client-credentials',
              credentialIssuer: {
                name: 'MoH IdP',
              },
              services: [],
            },
            {
              id: 'e2',
              name: 'dev',
              active: false,
              flow: 'client-credentials',
              credentialIssuer: {
                name: 'MoH IdP',
              },
              services: [
                {
                  id: 's1',
                  name: 'a-service-for-moh-proto',
                },
              ],
            },
          ],
        },
        {
          id: 'p2',
          name: 'PharmaNet API',
          environments: [
            {
              id: 'e11',
              name: 'test',
              flow: 'client-credentials',
              active: true,
              credentialIssuer: {
                name: 'MoH IdP',
              },
              services: [
                {
                  id: 's2',
                  name: 'Sample_API',
                },
                {
                  id: 's5',
                  name: 'api-for-example',
                },
                {
                  id: 's6',
                  name: 'api-for-test',
                },
                {
                  id: 's7',
                  name: 'api-for-new-stores',
                },
              ],
            },
            {
              id: 'e21',
              name: 'other',
              active: true,
              flow: 'kong-api-key-acl',
              credentialIssuer: {
                name: 'MoH IdP',
              },
              services: [
                {
                  id: 's3',
                  name: 'My New API',
                },
              ],
            },
          ],
        },
      ],
    })
  );
};

export const getEnvironmentHandler = (req, res, ctx) => {
  return res(
    ctx.data({
      OwnedEnvironment: {
        id: req.params.id,
        name: 'prod',
        active: true,
        flow: 'client-credentials',
        appId: 'e02ei220',
        legal: null,
        credentialIssuer: {
          id: '8',
        },
        approval: true,
        additionalDetailsToRequest:
          'To gain access to production, you must be certified.  Please provide your certification number below.',
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
        services: [
          {
            id: '1',
            name: 'a-service-for-moh-proto',
            environment: null,
          },
        ],
      },
    })
  );
};

export const getAllCredentialIssuersByNamespace = (req, res, ctx) => {
  return res(
    ctx.data({
      allCredentialIssuersByNamespace: [
        {
          id: 1,
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
          id: 8,
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
      allLegals: [
        {
          id: '1',
          title: 'Terms of Use for API Gateway',
          reference: 'terms-of-use-for-api-gateway-1',
        },
      ],
    })
  );
};

export const allGatewayServicesHandler = (req, res, ctx) => {
  const allGatewayServices = [];

  times(10, (n) => {
    allGatewayServices.push({
      id: `s${n}`,
      name: `a-service-for-moh-proto-${n}`,
      environment: null,
    });
  });

  return res(
    ctx.data({
      allGatewayServices,
    })
  );
};

export const updateEnvironmentHandler = (req, res, ctx) => {
  return res(ctx.data({}));
};
