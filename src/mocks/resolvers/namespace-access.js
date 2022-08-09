export const getCurrentNamesSpaceHandler = (_, res, ctx) => {
  return res(
    ctx.data({
      currentNamespace: {
        id: 'ns1',
        name: 'aps-portal',
        scopes: [
          { name: 'GatewayConfig.Publish' },
          { name: 'Namespace.Manage' },
          { name: 'Access.Manage' },
          { name: 'Namespace.View' },
        ],
        prodEnvId: 'p1',
      },
    })
  );
};

export const getPermissionsHandler = (_, res, ctx) => {
  return res(
    ctx.data({
      getPermissionTicketsForResource: [
        {
          id: 'perm1',
          owner: 'o1',
          ownerName: 'aps',
          requester: '123',
          requesterName: 'harley123',
          resource: 'r1',
          resourceName: 'aps-portal',
          scope: 's1',
          scopeName: 'Namespace.Manage',
          granted: true,
        },
        {
          id: 'perm2',
          owner: 'o1',
          ownerName: 'aps',
          requester: '123',
          requesterName: 'harley123',
          resource: 'r1',
          resourceName: 'aps-portal',
          scope: 's1',
          scopeName: 'Namespace.Manage',
          granted: true,
        },
      ],
      getUmaPoliciesForResource: [
        {
          id: 'uma1',
          name: 'sa-moh-proto-3io4u124u21oiu341',
          description: null,
          type: 'uma',
          logic: 'POSITIVE',
          decisionStrategy: 'UNANIMOUS',
          owner: 'o1',
          clients: null,
          users: ['r1'],
          groups: null,
          scopes: ['Namespace.Manage'],
        },
        {
          id: 'uma1',
          name: 'sa-moh-proto-ca153245-e53d468ec6a6',
          description: null,
          type: 'uma',
          logic: 'POSITIVE',
          decisionStrategy: 'UNANIMOUS',
          owner: 'o1',
          clients: null,
          users: ['demouser@idir'],
          groups: null,
          scopes: ['Namespace.Manage'],
        },
        {
          id: 'uma2',
          name: 'sa-aps-portal',
          description: 'Service Acct asdf',
          type: 'uma',
          logic: 'POSITIVE',
          decisionStrategy: 'UNANIMOUS',
          owner: 'o1',
          clients: ['sa-'],
          users: null,
          groups: null,
          scopes: ['GatewayConfig.Publish'],
        },
      ],
      getOrgPoliciesForResource: [],
      getResourceSet: {
        id: 'r1',
        name: 'aps-portal',
        type: 'namespace',
        resource_scopes: [
          { name: 'GatewayConfig.Publish' },
          { name: 'Namespace.Manage' },
          { name: 'Access.Manage' },
          { name: 'Namespace.View' },
        ],
      },
      Environment: { name: 'dev', product: { id: 'e1', name: 'GWA API' } },
    })
  );
};
