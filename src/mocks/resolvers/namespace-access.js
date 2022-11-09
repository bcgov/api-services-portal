let permissions = [
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
    granted: true,
  },
  {
    id: 'perm1-a',
    owner: 'o1',
    ownerName: 'aps',
    requester: '123',
    requesterName: 'wolfeschlegelsteinhausen@idir',
    resource: 'r1',
    resourceName: 'aps-portal',
    scope: 's2',
    scopeName: 'Content.Publish',
    granted: true,
  },
  {
    id: 'perm1-b',
    owner: 'o1',
    ownerName: 'aps',
    requester: '123',
    requesterName: 'wolfeschlegelsteinhausen@idir',
    resource: 'r1',
    resourceName: 'aps-portal',
    scope: 's3',
    scopeName: 'GatewayConfig.Publish',
    granted: true,
  },
  {
    id: 'perm1-c',
    owner: 'o1',
    ownerName: 'aps',
    requester: '123',
    requesterName: 'wolfeschlegelsteinhausen@idir',
    resource: 'r1',
    resourceName: 'aps-portal',
    scope: 's5',
    scopeName: 'Namespace.Rename',
    granted: true,
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
    granted: true,
  },
  {
    id: 'perm2',
    owner: 'o1',
    ownerName: 'aps',
    requester: '123',
    requesterName: 'elischen@idir',
    resource: 'r2',
    resourceName: 'aps-portal',
    scope: 's4',
    scopeName: 'Namespace.Access',
    granted: true,
  },
];
let umaPolicies = [
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
    id: 'uma2',
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
    id: 'uma3',
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

let currentNamespace = {
  id: 'ns1',
  name: 'aps-portal',
  scopes: [
    { name: 'GatewayConfig.Publish' },
    { name: 'Namespace.Manage' },
    { name: 'Access.Manage' },
    { name: 'Namespace.View' },
  ],
  prodEnvId: 'p1',
  org: null,
  orgUnit: null,
  orgEnabled: false,
  orgAdmins: ['Jim.Hopper@gov.bc.ca', 'bogus.secondone@gov.bc.ca'],
};

export const getCurrentNamesSpaceHandler = (_, res, ctx) => {
  return res(
    ctx.delay(400),
    ctx.data({
      currentNamespace,
    })
  );
};

export const updateCurrentNamesSpaceHandler = (req, res, ctx) => {
  currentNamespace = {
    ...currentNamespace,
    ...req.variables,
  };
  return res(ctx.data({}));
};

export const getUserPermissionsHandler = (_, res, ctx) => {
  // Test errors here
  // return res(
  //   ctx.data({
  //     errors: [{ message: 'You do not have accesss for this resource' }],
  //   })
  // );
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

export const getOrganizationGroupsPermissionsHandler = (_, res, ctx) => {
  return res(
    ctx.data({
      getOrgPoliciesForResource: [
        {
          id: 'og1',
          name:
            'group-organization-admin-ca.bc.gov-ministry-of-health-pharmaceutical-services-division-policy',
          description:
            "Group '/organization-admin/ca.bc.gov/ministry-of-health' / 'pharmaceutical-services-division' Policy",
          type: 'group',
          logic: 'POSITIVE',
          decisionStrategy: 'UNANIMOUS',
          owner: 'o1',
          clients: null,
          users: ['acope@idir', 'jbrammal@idir', 'becumberbatch@idir'],
          groups: [
            '/organization-admin',
            '/organization-admin/ca.bc.gov',
            '/organization-admin/ca.bc.gov/ministry-of-health',
            '/organization-admin/ca.bc.gov/ministry-of-health/pharmaceutical-services-division',
          ],
          scopes: ['Namespace.View'],
        },
        {
          id: 'og2',
          name:
            'group-organization-admin-ca.bc.gov-ministry-of-health-this-is-another-division',
          description:
            "Group '/organization-admin/ca.bc.gov/ministry-of-health' / 'this-is-another-division' Policy",
          type: 'group',
          logic: 'POSITIVE',
          decisionStrategy: 'UNANIMOUS',
          owner: 'o1',
          clients: null,
          users: ['acope@idir'],
          groups: [
            '/organization-admin',
            '/organization-admin/ca.bc.gov',
            '/organization-admin/ca.bc.gov/ministry-of-health',
            '/organization-admin/ca.bc.gov/ministry-of-health/this-is-another-division',
          ],
          scopes: [
            'Access.Manage',
            'Content.Publish',
            'GatewayConfig.Publish',
            'Namespace.Manage',
            'Namespace.View',
          ],
        },
      ],
    })
  );
};

export const getResourceSetHandler = (_, res, ctx) => {
  return res(
    ctx.delay(4000),
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
  if (req.variables.data.username === 'fail') {
    return res(
      ctx.data({
        errors: [
          {
            message: 'User not found fail',
            locations: [
              {
                line: 3,
                column: 5,
              },
            ],
            path: ['grantPermissions'],
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
            },
            uid: '123123lkj123123lkj',
            name: 'GraphQLError',
          },
        ],
        data: {
          grantPermissions: null,
        },
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
        errors: [
          {
            message: 'Service account not found fail',
            locations: [
              {
                line: 3,
                column: 5,
              },
            ],
            path: ['grantPermissions'],
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
            },
            uid: '123123lkj123123lkj',
            name: 'GraphQLError',
          },
        ],
        data: {
          grantPermissions: null,
        },
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

export const revokeAccessHandler = (req, res, ctx) => {
  const { tickets } = req.variables;
  permissions = permissions.filter((p) => !tickets.includes(p.scope));
  return res(ctx.data(true));
};
export const revokeSAAccessHandler = (req, res, ctx) => {
  umaPolicies = umaPolicies.filter((u) => u.id !== req.variables.policyId);
  return res(ctx.data(true));
};
