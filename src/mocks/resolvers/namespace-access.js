import { shuffle } from 'lodash';

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
    ctx.delay(7000),
    ctx.data({
      currentNamespace,
    })
  );
};

export const updateCurrentNamesSpaceHandler = (req, res, ctx) => {
  currentNamespace = {
    ...currentNamespace,
    ...req.variables,
    org: req.variables.org ? { title: req.variables.org } : null,
    orgUnit: req.variables.orgUnit ? { title: req.variables.orgUnit } : null,
  };
  return res(ctx.data({}));
};

export const getListOrganizationsHandler = (req, res, ctx) => {
  return res(
    ctx.data({
      allOrganizations: [
        {
          name: 'bc-agency',
          title: 'Crown Corporations and Agencies',
        },
        {
          name: 'government-communications-and-public-engagement',
          title: 'Government Communications and Public Engagement',
        },
        {
          name: 'government-of-canada',
          title: 'Government of Canada',
        },
        {
          name: 'local-government',
          title: 'Local Government',
        },
        {
          name: 'ministry-of-advanced-education-and-skills-training',
          title: 'Ministry of Advanced Education and Skills Training',
        },
        {
          name: 'ministry-of-agriculture',
          title: 'Ministry of Agriculture and Food',
        },
        {
          name: 'ministry-of-attorney-general',
          title: 'Ministry of Attorney General',
        },
        {
          name: 'ministry-of-children-and-family-development',
          title: 'Ministry of Children and Family Development',
        },
        {
          name: 'ministry-of-citizens-services',
          title: 'Ministry of Citizens Services',
        },
        {
          name: 'ministry-of-citizens-services',
          title: 'Ministry of Citizens Services',
        },
        {
          name: 'ministry-of-education',
          title: 'Ministry of Education and Child Care',
        },
        {
          name: 'ministry-of-energy-mines-and-low-carbon-innovation',
          title: 'Ministry of Energy, Mines and Low Carbon Innovation',
        },
        {
          name: 'ministry-of-environment-and-climate-change-strategy',
          title: 'Ministry of Environment and Climate Change Strategy',
        },
        {
          name: 'ministry-of-finance',
          title: 'Ministry of Finance',
        },
        {
          name: 'ministry-of-forests',
          title: 'Ministry of Forests',
        },
        {
          name:
            'ministry-of-forests-lands-natural-resource-operations-and-rural-development',
          title:
            'Ministry of Forests, Lands, Natural Resource Operations and Rural Development',
        },
        {
          name: 'ministry-of-indigenous-relations-and-reconciliation',
          title: 'Ministry of Indigenous Relations and Reconciliation',
        },
        {
          name: 'ministry-of-jobs-economic-recovery-and-innovation',
          title: 'Ministry of Jobs, Economic Recovery and Innovation',
        },
        {
          name: 'ministry-of-labour',
          title: 'Ministry of Labour',
        },
        {
          name: 'ministry-of-land-water-and-resource-stewardship',
          title: 'Ministry of Land, Water and Resource Stewardship',
        },
        {
          name: 'ministry-of-mental-health-and-addictions',
          title: 'Ministry of Mental Health and Addictions',
        },
        {
          name: 'ministry-of-municipal-affairs',
          title: 'Ministry of Municipal Affairs',
        },
        {
          name:
            'ministry-of-public-safety-and-solicitor-general-and-emergency-bc',
          title:
            'Ministry of Public Safety and Solicitor General and Emergency BC',
        },
        {
          name: 'ministry-of-social-development-and-poverty-reduction',
          title: 'Ministry of Social Development and Poverty Reduction',
        },
        {
          name: 'ministry-of-tourism-arts-culture-and-sports',
          title: 'Ministry of Tourism, Arts, Culture and Sport',
        },
        {
          name: 'ministry-of-transportation-and-infrastructure',
          title: 'Ministry of Transportation and Infrastructure',
        },
        {
          name: 'office-of-the-premier-and-cabinet-office',
          title: 'Office of the Premier and Cabinet Office',
        },
      ],
    })
  );
};

const orgUnits = [
  {
    name: 'agricultural-land-commission',
    title: 'Agricultural Land Commission',
  },
  {
    name: 'bc-arts-council',
    title: 'BC Arts Council',
  },
  {
    name: 'bc-assessment-authority',
    title: 'BC Assessment Authority',
  },
  {
    name: 'bc-games-society',
    title: 'BC Games Society',
  },
  {
    name: 'bc-housing-management-commission',
    title: 'BC Housing Management Commission',
  },
  {
    name: 'bc-hydro-and-power-authority',
    title: 'BC Hydro and Power Authority',
  },
  {
    name: 'bc-oil-and-gas-commission',
    title: 'BC Oil and Gas Commission',
  },
  {
    name: 'bc-public-service-agency',
    title: 'BC Public Service Agency',
  },
  {
    name: 'british-columbia-container-trucking-commissioner',
    title: 'British Columbia Container Trucking Commissioner',
  },
  {
    name: 'business-information-and-analysis-statistical-services',
    title: 'Business Information and Analysis Statistical Services',
  },
  {
    name: 'community-living-bc',
    title: 'Community Living BC',
  },
  {
    name: 'destination-bc',
    title: 'Destination BC',
  },
  {
    name: 'elections-bc',
    title: 'Elections BC',
  },
  {
    name: 'health-authority-interior',
    title: 'Health Authority - Interior',
  },
  {
    name: 'health-authority-provincial-health-services-authority',
    title: 'Health Authority - Provincial Health Services Authority',
  },
  {
    name: 'industry-training-authority',
    title: 'Industry Training Authority',
  },
  {
    name: 'insurance-corporation-of-british-columbia',
    title: 'Insurance Corporation of British Columbia',
  },
  {
    name: 'integrated-cadastral-information-society',
    title: 'Integrated Cadastral Information Society',
  },
  {
    name: 'ltsa',
    title: 'Land Title and Survey Authority of BC - LTSA',
  },
  {
    name: 'translink',
    title: 'TransLink',
  },
  {
    name: 'worksafebc',
    title: 'WorkSafeBC',
  },
];

export const getListOrganizationUnitsHandler = (req, res, ctx) => {
  const result = shuffle(orgUnits).slice(0, 5);
  return res(
    ctx.data({
      allOrganizations: [
        {
          orgUnits: result,
        },
      ],
    })
  );
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
