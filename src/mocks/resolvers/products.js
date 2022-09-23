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
              flow: 'client-credentials',
              credentialIssuer: {
                name: 'MoH IdP',
              },
              services: [],
            },
            {
              id: 'e2',
              name: 'dev',
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
