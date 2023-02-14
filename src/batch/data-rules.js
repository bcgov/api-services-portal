const metadata = {
  Organization: {
    query: 'allOrganizations',
    refKey: 'extForeignKey',
    sync: [
      'name',
      'sector',
      'title',
      'tags',
      'description',
      'orgUnits',
      'extSource',
      'extRecordHash',
    ],
    transformations: {
      tags: { name: 'toStringDefaultArray' },
      orgUnits: {
        name: 'connectExclusiveList',
        list: 'OrganizationUnit',
        syncFirst: true,
      },
    },
  },
  OrganizationUnit: {
    query: 'allOrganizationUnits',
    refKey: 'extForeignKey',
    sync: [
      'name',
      'sector',
      'title',
      'tags',
      'description',
      'extSource',
      'extRecordHash',
    ],
    transformations: {
      tags: { name: 'toStringDefaultArray' },
    },
  },
  Dataset: {
    query: 'allDatasets',
    refKey: 'extForeignKey',
    sync: [
      'name',
      'license_title',
      'security_class',
      'view_audience',
      'download_audience',
      'record_publish_date',
      'notes',
      'title',
      'organization',
      'organizationUnit',
      'isInCatalog',
      'isDraft',
      'tags',
      'contacts',
      'resources',
      'extSource',
      'extRecordHash',
    ],
    transformations: {
      tags: { name: 'toStringDefaultArray' },
      resources: { name: 'toString' },
      organization: {
        name: 'connectOne',
        key: 'organization.id',
        list: 'allOrganizations',
        refKey: 'orgUnits.extForeignKey',
      },
      organizationUnit: {
        name: 'connectOne',
        key: 'organization.id',
        list: 'allOrganizationUnits',
        refKey: 'extForeignKey',
      },
      isInCatalog: { name: 'alwaysTrue' },
      isDraft: { name: 'alwaysFalse' },
    },
  },
  DraftDataset: {
    entity: 'Dataset',
    query: 'allDatasets',
    refKey: 'name',
    sync: [
      'name',
      'license_title',
      'security_class',
      'view_audience',
      'download_audience',
      'record_publish_date',
      'notes',
      'title',
      'organization',
      'organizationUnit',
      'isInCatalog',
      'isDraft',
      'contacts',
      'resources',
      'tags',
    ],
    transformations: {
      tags: { name: 'toStringDefaultArray' },
      organization: {
        name: 'connectOne',
        list: 'allOrganizations',
        refKey: 'name',
      },
      organizationUnit: {
        name: 'connectOne',
        list: 'allOrganizationUnits',
        refKey: 'name',
      },
      isInCatalog: { name: 'alwaysFalse' },
    },
    validations: {
      /* Ref: https://github.com/bcgov/ckanext-bcgov/blob/main/ckanext/bcgov/scripts/data/edc-vocabs.json */
      /* db.datasets.aggregate({ $group : { _id: "$view_audience", count: { $sum: 1 } } }) */
      security_class: {
        type: 'enum',
        values: [
          'HIGH-CABINET',
          'HIGH-CONFIDENTIAL',
          'HIGH-SENSITIVITY',
          'MEDIUM-SENSITIVITY',
          'MEDIUM-PERSONAL',
          'LOW-SENSITIVITY',
          'LOW-PUBLIC',
          'PUBLIC',
          'PROTECTED A',
          'PROTECTED B',
          'PROTECTED C',
        ],
      },
      view_audience: {
        type: 'enum',
        values: [
          'Public',
          'Government',
          'Named users',
          'Government and Business BCeID',
        ],
      },
      download_audience: {
        type: 'enum',
        values: [
          'Public',
          'Government',
          'Named users',
          'Government and Business BCeID',
        ],
      },
      isInCatalog: { type: 'boolean' },
      isDraft: { type: 'boolean' },
      // contacts : TBD
      // resources: TBD
    },
    example: {
      name: 'my_sample_dataset',
      license_title: 'Open Government Licence - British Columbia',
      security_class: 'PUBLIC',
      view_audience: 'Public',
      download_audience: 'Public',
      record_publish_date: '2017-09-05',
      notes: 'Some notes',
      title: 'A title about my dataset',
      tags: ['tag1', 'tag2'],
      organization: 'ministry-of-citizens-services',
      organizationUnit: 'databc',
    },
  },
  Metric: {
    query: 'allMetrics',
    refKey: 'name',
    sync: ['query', 'day', 'metric', 'values'],
    transformations: {
      metric: { name: 'toString' },
      values: { name: 'toString' },
      namespace: {
        name: 'byKey',
        key: 'metric.namespace',
        refKey: 'namespace',
      },
      service: {
        name: 'connectOne',
        key: 'metric.service',
        list: 'allGatewayServices',
        refKey: 'name',
      },
    },
  },
  Alert: {
    query: 'allAlerts',
    refKey: 'name',
    sync: ['name'],
    transformations: {},
  },
  Namespace: {
    query: 'allNamespaces',
    refKey: 'extRefId',
    sync: ['name'],
    transformations: {
      // members: {
      //   name: 'connectExclusiveList',
      //   list: 'MemberRole',
      //   syncFirst: true,
      // },
    },
  },
  MemberRole: {
    query: 'allMemberRoles',
    refKey: 'extRefId',
    sync: ['role', 'user'],
    transformations: {
      user: {
        name: 'connectOne',
        list: 'allUsers',
        refKey: 'name',
      },
    },
  },
  GatewayService: {
    query: 'allGatewayServices',
    refKey: 'extForeignKey',
    sync: [
      'name',
      'namespace',
      'host',
      'tags',
      'plugins',
      'extSource',
      'extRecordHash',
    ],
    hooks: ['handleNameChange'],
    transformations: {
      tags: { name: 'toStringDefaultArray' },
      namespace: { name: 'mapNamespace' },
      plugins: {
        name: 'connectExclusiveList',
        list: 'GatewayPlugin',
        syncFirst: true,
      },
      // routes: {name: "connectExclusiveList", list: "GatewayRoute", loadFirst: true}
    },
  },
  GatewayGroup: {
    query: 'allGatewayGroups',
    refKey: 'extForeignKey',
    sync: ['name', 'namespace', 'extSource', 'extRecordHash'],
    transformations: {},
  },
  GatewayRoute: {
    childOnly: false,
    query: 'allGatewayRoutes',
    refKey: 'extForeignKey',
    sync: [
      'name',
      'namespace',
      'methods',
      'paths',
      'hosts',
      'tags',
      'plugins',
      'extSource',
      'extRecordHash',
    ],
    hooks: ['handleNameChange'],
    transformations: {
      tags: { name: 'toStringDefaultArray' },
      methods: { name: 'toStringDefaultArray' },
      paths: { name: 'toStringDefaultArray' },
      hosts: { name: 'toStringDefaultArray' },
      namespace: { name: 'mapNamespace' },
      service: {
        name: 'connectOne',
        key: 'service.id',
        list: 'allGatewayServices',
        refKey: 'extForeignKey',
      },
      plugins: {
        name: 'connectExclusiveList',
        list: 'GatewayPlugin',
        syncFirst: true,
      },
    },
  },
  GatewayPlugin: {
    childOnly: true,
    query: 'allGatewayPlugins',
    refKey: 'extForeignKey',
    sync: ['name', 'tags', 'config', 'extSource', 'extRecordHash'],
    transformations: {
      tags: { name: 'toStringDefaultArray' },
      config: { name: 'toString' },
      service: {
        name: 'connectOne',
        key: 'service.id',
        list: 'allGatewayServices',
        refKey: 'extForeignKey',
      },
      route: {
        name: 'connectOne',
        key: 'route.id',
        list: 'allGatewayRoutes',
        refKey: 'extForeignKey',
      },
    },
  },
  GatewayConsumer: {
    query: 'allGatewayConsumers',
    refKey: 'extForeignKey',
    sync: [
      'username',
      'tags',
      'customId',
      'namespace',
      'aclGroups',
      'plugins',
      'extSource',
      'extRecordHash',
    ],
    hooks: ['handleUsernameChange'],
    transformations: {
      tags: { name: 'toStringDefaultArray' },
      aclGroups: { name: 'toStringDefaultArray' },
      namespace: { name: 'mapNamespace' },
      plugins: {
        name: 'connectExclusiveList',
        list: 'GatewayPlugin',
        syncFirst: true,
      },
    },
  },
  ServiceAccess: {
    query: 'allServiceAccesses',
    refKey: 'name',
    sync: ['active', 'aclEnabled', 'consumerType'],
    transformations: {
      application: {
        name: 'connectOne',
        list: 'allApplications',
        refKey: 'appId',
      },
      consumer: {
        name: 'connectOne',
        list: 'allGatewayConsumers',
        refKey: 'username',
      },
      productEnvironment: {
        name: 'connectOne',
        list: 'allEnvironments',
        refKey: 'appId',
      },
    },
  },
  Application: {
    query: 'allApplications',
    refKey: 'appId',
    sync: ['name', 'description'],
    transformations: {
      owner: { name: 'connectOne', list: 'allUsers', refKey: 'username' },
      organization: {
        name: 'connectOne',
        key: 'org',
        list: 'allOrganizations',
        refKey: 'name',
      },
      organizationUnit: {
        name: 'connectOne',
        key: 'sub_org',
        list: 'allOrganizationUnits',
        refKey: 'name',
      },
    },
  },
  Product: {
    query: 'allProducts',
    refKey: 'appId',
    sync: ['name', 'namespace'],
    transformations: {
      dataset: { name: 'connectOne', list: 'allDatasets', refKey: 'name' },
      environments: {
        name: 'connectExclusiveList',
        list: 'Environment',
        syncFirst: true,
        refKey: 'appId',
      },
    },
    example: {
      name: 'my-new-product',
      appId: '000000000000',
      environments: [
        {
          name: 'dev',
          active: false,
          approval: false,
          flow: 'public',
          appId: '00000000',
        },
      ],
    },
  },
  Environment: {
    query: 'allEnvironments',
    refKey: 'appId',
    sync: ['name', 'active', 'approval', 'flow', 'additionalDetailsToRequest'],
    ownedBy: 'product',
    transformations: {
      services: {
        name: 'connectMany',
        list: 'allGatewayServices',
        refKey: 'name',
      },
      legal: { name: 'connectOne', list: 'allLegals', refKey: 'reference' },
      credentialIssuer: {
        name: 'connectOne',
        list: 'allCredentialIssuers',
        refKey: 'name',
      },
    },
    validations: {
      active: { type: 'boolean' },
      approval: { type: 'boolean' },
      name: {
        type: 'enum',
        values: ['dev', 'test', 'prod', 'sandbox', 'other'],
      },
      flow: {
        type: 'enum',
        values: [
          'public',
          'authorization-code',
          'client-credentials',
          'kong-acl-only',
          'kong-api-key-only',
          'kong-api-key-acl',
        ],
      },
    },
    example: {
      name: 'dev',
      active: false,
      approval: false,
      flow: 'public',
      appId: '00000000',
    },
  },
  CredentialIssuer: {
    query: 'allCredentialIssuers',
    refKey: 'name',
    sync: [
      'name',
      'namespace',
      'description',
      'flow',
      'mode',
      'authPlugin',
      'clientAuthenticator',
      'instruction',
      'environmentDetails',
      'clientRoles',
      'clientMappers',
      'availableScopes',
      'resourceScopes',
      'resourceType',
      'resourceAccessScope',
      'isShared',
      'inheritFrom',
      'apiKeyName',
      'owner',
    ],
    transformations: {
      availableScopes: { name: 'toStringDefaultArray' },
      resourceScopes: { name: 'toStringDefaultArray' },
      clientRoles: { name: 'toStringDefaultArray' },
      clientMappers: { name: 'toStringDefaultArray' },
      environmentDetails: { name: 'toString' },
      inheritFrom: {
        name: 'connectOne',
        list: 'allSharedIdPs',
        refKey: 'name',
      },
      owner: { name: 'connectOne', list: 'allProviderUsers', refKey: 'email' },
    },
    validations: {
      isShared: { type: 'boolean' },
      flow: {
        type: 'enum',
        values: ['client-credentials'],
      },
      mode: { type: 'enum', values: ['auto'] },
      clientAuthenticator: {
        type: 'enum',
        values: ['client-secret', 'client-jwt', 'client-jwt-jwks-url'],
      },
      environmentDetails: {
        type: 'entityArray',
        entity: 'IssuerEnvironmentConfig',
      },
    },
    example: {
      name: 'my-auth-profile',
      description: 'Auth connection to my IdP',
      flow: 'client-credentials',
      clientAuthenticator: 'client-secret',
      mode: 'auto',
      environmentDetails: [],
      owner: 'janis@gov.bc.ca',
    },
  },
  IssuerEnvironmentConfig: {
    transient: true,
    refKey: 'environment',
    transformations: {},
    sync: [
      'exists',
      'environment',
      'issuerUrl',
      'clientRegistration',
      'clientId',
      'clientSecret',
      'initialAccessToken',
    ],
    validations: {
      exists: { type: 'boolean' },
      environment: {
        type: 'enum',
        values: ['dev', 'test', 'prod', 'sandbox', 'other'],
      },
      clientRegistration: {
        type: 'enum',
        values: ['anonymous', 'managed', 'iat'],
      },
    },
    example: {
      environment: 'dev',
      issuerUrl: 'https://idp.site/auth/realms/my-realm',
      clientRegistration: 'managed',
      clientId: 'a-client-id',
      clientSecret: 'a-client-secret',
    },
  },
  Content: {
    query: 'allContents',
    refKey: 'externalLink',
    sync: [
      'title',
      'description',
      'content',
      'githubRepository',
      'readme',
      'order',
      'isPublic',
      'isComplete',
      'namespace',
      'tags',
      'publishDate',
      'slug',
    ],
    transformations: {
      tags: { name: 'toStringDefaultArray' },
      namespace: { name: 'mapNamespace', update: false },
    },
    validations: {
      order: { type: 'number' },
      isPublic: { type: 'boolean' },
      isComplete: { type: 'boolean' },
    },
    example: {
      externalLink: 'https://externalsite/my_content',
      title: 'my_content',
      description: 'Summary of what my content is',
      content: 'Markdown content',
      order: 0,
      isPublic: true,
      isComplete: true,
      tags: ['tag1', 'tag2'],
    },
  },
  ContentBySlug: {
    entity: 'Content',
    query: 'allContents',
    refKey: 'slug',
    sync: [
      'externalLink',
      'title',
      'description',
      'content',
      'githubRepository',
      'readme',
      'order',
      'isPublic',
      'isComplete',
      'namespace',
      'tags',
      'publishDate',
    ],
    transformations: {
      tags: { name: 'toStringDefaultArray' },
      namespace: { name: 'mapNamespace' },
    },
  },
  Legal: {
    query: 'allLegals',
    refKey: 'reference',
    sync: ['title', 'link', 'document', 'version', 'active'],
    transformations: {},
  },
  Activity: {
    query: 'allActivities',
    refKey: 'extRefId',
    sync: [
      'type',
      'name',
      'action',
      'result',
      'message',
      'refId',
      'namespace',
      'actor',
      'blob',
      'filterKey1',
      'filterKey2',
      'filterKey3',
      'filterKey4',
    ],
    transformations: {
      actor: { name: 'connectOne', list: 'allUsers', refKey: 'username' },
      context: { name: 'toString' },
      blob: {
        name: 'connectExclusiveOne',
        list: 'Blob',
        syncFirst: true,
      },
    },
    validations: {
      action: {
        type: 'enum',
        values: ['add', 'update', 'create', 'delete', 'validate', 'publish'],
      },
      result: {
        type: 'enum',
        values: ['', 'received', 'failed', 'completed', 'success'],
      },
      updatedAt: {
        type: 'DateTime',
      },
      createdAt: {
        type: 'DateTime',
      },
    },
    read: ['updatedAt', 'createdAt'],
    example: {
      type: 'Namespace',
      name: 'delete Namespace[ns_x]',
      action: 'delete',
      refId: 'ns_x',
      result: 'success',
      message: 'Deleted ns_x namespace',
      actor: {
        name: 'XT:Blink, James CITZ:IN',
      },
      blob: {},
      createdAt: '2022-03-11T00:47:42.947Z',
      updatedAt: '2022-03-11T00:47:42.947Z',
    },
  },
  User: {
    query: 'allUsers',
    refKey: 'username',
    sync: ['name', 'username', 'email', 'legalsAgreed', 'provider'],
    transformations: {
      legalsAgreed: { name: 'toStringDefaultArray' },
    },
    validations: {
      legalsAgreed: { type: 'entityArray', entity: 'UserLegalsAgreed' },
    },
  },
  UserLegalsAgreed: {
    transient: true,
    refKey: 'reference',
    transformations: {},
    sync: ['reference', 'agreedTimestamp'],
  },
  Blob: {
    query: 'allBlobs',
    refKey: 'ref',
    sync: ['ref', 'type', 'blob'],
    transformations: {},
  },
};

module.exports.metadata = metadata;
