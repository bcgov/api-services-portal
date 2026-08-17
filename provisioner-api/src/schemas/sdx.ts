import { Type, type Static } from '@sinclair/typebox';

const SubsystemService = Type.Object(
  {
    summary: Type.String({ examples: ['Read-only access to claim data.'] }),
    scopes: Type.Array(
      Type.Object({
        label: Type.String({ examples: ['Claims.Read'] }),
        description: Type.String({ examples: ['Read claim records'] }),
      }),
      {
        examples: [
          [{ label: 'Claims.Read', description: 'Read claim records' }],
        ],
      }
    ),
    title: Type.String({ examples: ['Claims Service'] }),
    name: Type.String({ examples: ['claims-svc'] }),
    version: Type.String({ examples: ['1.0.0'] }),
  },
  {
    additionalProperties: false,
    examples: [
      {
        summary: 'Read-only access to claim data.',
        scopes: [{ label: 'Claims.Read', description: 'Read claim records' }],
        title: 'Claims Service',
        name: 'claims-svc',
        version: '1.0.0',
      },
    ],
  }
);

export const SubsystemEnvironment = Type.Object(
  {
    id: Type.String({ examples: ['claims'] }),
    name: Type.String({ examples: ['Claims'] }),
    organization: Type.String({ examples: ['ministry-of-health'] }),
    environment: Type.String({ examples: ['dev'] }),
    description: Type.String({
      examples: ['Authoritative source for benefit claim records.'],
    }),
    services: Type.Array(SubsystemService),
  },
  {
    $id: 'SubsystemEnvironment',
    additionalProperties: false,
    examples: [
      {
        id: 'claims',
        name: 'Claims',
        organization: 'ministry-of-health',
        environment: 'dev',
        description: 'Authoritative source for benefit claim records.',
        services: [
          {
            summary: 'Read-only access to claim data.',
            scopes: [
              { label: 'Claims.Read', description: 'Read claim records' },
            ],
            title: 'Claims Service',
            name: 'claims-svc',
            version: '1.0.0',
          },
        ],
      },
    ],
  }
);

const ResourceServerServiceAccess = Type.Object(
  {
    scopes: Type.Array(Type.String(), { examples: [['Claims.Read']] }),
    name: Type.String({ examples: ['claims-svc'] }),
  },
  {
    additionalProperties: false,
    examples: [{ scopes: ['Claims.Read'], name: 'claims-svc' }],
  }
);

const AllowedResourceServerServiceAccess = Type.Object(
  {
    scopes: Type.Array(Type.String(), { examples: [['Claims.Read']] }),
    name: Type.String({ examples: ['claims-svc'] }),
  },
  {
    additionalProperties: false,
    examples: [{ scopes: ['Claims.Read'], name: 'claims-svc' }],
  }
);

export const ResourceServerAccess = Type.Object(
  {
    environment: Type.String({ examples: ['dev'] }),
    id: Type.String({ examples: ['claims'] }),
    privacyZone: Type.String({ examples: ['public'] }),
    services: Type.Array(AllowedResourceServerServiceAccess),
  },
  {
    $id: 'ResourceServerAccess',
    additionalProperties: false,
    examples: [
      {
        environment: 'dev',
        id: 'MIN.CITZ.SYS-1',
        privacyZone: 'public',
        services: [
          {
            scopes: ['Claims.Read'],
            name: 'MIN.CITZ.MY-API.v1',
          },
        ],
      },
    ],
  }
);

export const IntegrationAccessRequest = Type.Object(
  {
    submissionId: Type.String({
      examples: ['9f3c2f3a-1c1e-4c79-8e34-9f6f2b6b9d8a'],
    }),
    clientId: Type.String({ examples: ['integration-42'] }),
    resourceServers: Type.Array(Type.Ref(ResourceServerAccess)),
  },
  {
    $id: 'IntegrationAccessRequest',
    additionalProperties: false,
    examples: [
      {
        submissionId: '9f3c2f3a-1c1e-4c79-8e34-9f6f2b6b9d8a',
        clientId: 'integration-42',
        resourceServers: [
          {
            environment: 'dev',
            id: '1234',
            privacyZone: 'public',
            services: [
              { scopes: ['Claims.Read'], name: 'claims-svc' },
            ],
          },
        ],
      },
    ],
  }
);

export const NewIntegrationAccessRequestResponse = Type.Object(
  {
    submissionId: Type.String({
      examples: ['9f3c2f3a-1c1e-4c79-8e34-9f6f2b6b9d8a'],
    }),
    results: Type.Record(Type.String(), Type.String(), {
      examples: [{ claims: 'queued' }],
    }),
  },
  {
    $id: 'NewIntegrationAccessRequestResponse',
    additionalProperties: false,
    examples: [
      {
        submissionId: '9f3c2f3a-1c1e-4c79-8e34-9f6f2b6b9d8a',
        results: { claims: 'queued' },
      },
    ],
  }
);

const NewIntegrationAccessResourceServer = Type.Object(
  {
    id: Type.String({ examples: ['MIN.CITZ.MY-SVC'] }),
    environment: Type.String({ examples: ['dev'] }),
    services: Type.Array(ResourceServerServiceAccess),
  },
  {
    additionalProperties: false,
    examples: [
      {
        id: 'MIN.CITZ.MY-SVC',
        environment: 'dev',
        services: [{ scopes: ['Claims.Read'], name: 'claims-svc' }],
      },
    ],
  }
);

export const NewIntegrationAccessRequest = Type.Object(
  {
    requester: Type.String({ examples: ['user@example.gov.bc.ca'] }),
    clientId: Type.String({ examples: ['partner-app'] }),
    policyVersion: Type.String({ examples: ['SDX.R1.00'] }),
    privacyZone: Type.String({ examples: ['public'] }),
    resourceServers: Type.Array(NewIntegrationAccessResourceServer),
  },
  {
    $id: 'NewIntegrationAccessRequest',
    additionalProperties: false,
    examples: [
      {
        integrationId: 'integration-42',
        requester: 'user@example.gov.bc.ca',
        clientId: 'partner-app',
        policyVersion: 'SDX.R1.00',
        privacyZone: 'public',
        resourceServers: [
          {
            services: [{ scopes: ['Claims.Read'], name: 'claims-svc' }],
            environment: 'dev',
            id: 'MIN.CITZ.MY-SVC',
          },
        ],
      },
    ],
  }
);

export type TSubsystemEnvironment = Static<typeof SubsystemEnvironment>;
export type TResourceServerAccess = Static<typeof ResourceServerAccess>;
export type TIntegrationAccessRequest = Static<typeof IntegrationAccessRequest>;
export type TNewIntegrationAccessRequest = Static<
  typeof NewIntegrationAccessRequest
>;
export type TNewIntegrationAccessRequestResponse = Static<
  typeof NewIntegrationAccessRequestResponse
>;

export const sdxSchemas = [
  SubsystemEnvironment,
  ResourceServerAccess,
  IntegrationAccessRequest,
  NewIntegrationAccessRequest,
  NewIntegrationAccessRequestResponse,
];
