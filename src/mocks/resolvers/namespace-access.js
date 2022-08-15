const permissions = [
  {
    id: 'perm1',
    owner: 'o1',
    ownerName: 'aps',
    requester: '123',
    requesterName: 'wolfeschlegelsteinhausen@idir',
    resource: 'r1',
    resourceName: 'aps-portal',
    scope: 's1',
    scopeName: 'Namespace.Manage',
    granted: false,
  },
  {
    id: 'perm1-a',
    owner: 'o1',
    ownerName: 'aps',
    requester: '123',
    requesterName: 'wolfeschlegelsteinhausen@idir',
    resource: 'r1',
    resourceName: 'aps-portal',
    scope: 's1',
    scopeName: 'Content.Publish',
    granted: false,
  },
  {
    id: 'perm1-b',
    owner: 'o1',
    ownerName: 'aps',
    requester: '123',
    requesterName: 'wolfeschlegelsteinhausen@idir',
    resource: 'r1',
    resourceName: 'aps-portal',
    scope: 's1',
    scopeName: 'GatewayConfig.Publish',
    granted: false,
  },
  {
    id: 'perm1-c',
    owner: 'o1',
    ownerName: 'aps',
    requester: '123',
    requesterName: 'wolfeschlegelsteinhausen@idir',
    resource: 'r1',
    resourceName: 'aps-portal',
    scope: 's1',
    scopeName: 'Namespace.Manage',
    granted: false,
  },
  {
    id: 'perm1-d',
    owner: 'o1',
    ownerName: 'aps',
    requester: '123',
    requesterName: 'wolfeschlegelsteinhausen@idir',
    resource: 'r1',
    resourceName: 'aps-portal',
    scope: 's1',
    scopeName: 'Namespace.View',
    granted: false,
  },
  {
    id: 'perm2',
    owner: 'o1',
    ownerName: 'aps',
    requester: '123',
    requesterName: 'elischen@idir',
    resource: 'r2',
    resourceName: 'aps-portal',
    scope: 's1',
    scopeName: 'Namespace.Access',
    granted: false,
  },
];
const umaPolicies = [
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
    scopes: [
      'Namespace.Manage',
      'Content.Publish',
      'GatewayConfig.Publish',
      'Namespace.View',
    ],
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
];

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

export const getUserPermissionsHandler = (_, res, ctx) => {
  return res(
    ctx.data({
      getPermissionTicketsForResource: permissions,
      getOrgPoliciesForResource: [],
      Environment: { name: 'dev', product: { id: 'e1', name: 'GWA API' } },
    })
  );
};

export const getServiceAccessPermissionsHandler = (_, res, ctx) => {
  // Keep around to test an empty view.
  // return res(
  //   ctx.data({
  //     getUmaPoliciesForResource: [],
  //   })
  // );
  return res(
    ctx.data({
      getUmaPoliciesForResource: umaPolicies,
    })
  );
};

export const getResourceSetHandler = (_, res, ctx) => {
  return res(
    ctx.data({
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
    })
  );
};

export const grantAccessHandler = (req, res, ctx) => {
  if (req.variables.data.name === 'fail') {
    return res(
      ctx.data({
        errors: [{ data: { message: 'Invalid access grant' } }],
      })
    );
  }
  req.variables.data.scopes.forEach((scope) => {
    permissions.push({
      id: `perm${permissions.length + 1}`,
      owner: 'o1',
      ownerName: 'aps',
      requester: '123',
      requesterName: req.variables.data.username,
      resource: 'r1',
      resourceName: 'aps-portal',
      scope: 's1',
      scopeName: scope,
      granted: false,
    });
  });
  return res(
    ctx.data({
      id: 'a4',
    })
  );
};

export const grantSAAccessHandler = (req, res, ctx) => {
  if (req.variables.data.name === 'fail') {
    return res(
      ctx.data({
        errors: [{ data: { message: 'Invalid access grant' } }],
      })
    );
  }
  umaPolicies.push({
    id: `uma${umaPolicies.length + 1}`,
    name: `sa-moh-proto-${umaPolicies.length + 1}`,
    description: null,
    type: 'uma',
    logic: 'POSITIVE',
    decisionStrategy: 'UNANIMOUS',
    owner: req.variables.data.name,
    clients: null,
    users: ['r1'],
    groups: null,
    scopes: req.variables.data.scopes,
  });
  return res(
    ctx.data({
      id: 'a4',
    })
  );
};
