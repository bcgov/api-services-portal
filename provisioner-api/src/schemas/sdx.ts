import { Type, type Static } from '@sinclair/typebox';

const SubsystemService = Type.Object(
  {
    summary: Type.String({ examples: ['Read-only access to claim data.'] }),
    scopes: Type.Record(Type.String(), Type.String(), {
      examples: [{ 'Claims.Read': 'Read claim records' }],
    }),
    title: Type.String({ examples: ['Claims Service'] }),
    name: Type.String({ examples: ['claims-svc'] }),
  },
  {
    additionalProperties: false,
    examples: [
      {
        summary: 'Read-only access to claim data.',
        scopes: { 'Claims.Read': 'Read claim records' },
        title: 'Claims Service',
        name: 'claims-svc',
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
            scopes: { 'Claims.Read': 'Read claim records' },
            title: 'Claims Service',
            name: 'claims-svc',
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

export const ResourceServerAccess = Type.Object(
  {
    clientId: Type.String({ examples: ['partner-app-claims'] }),
    environment: Type.String({ examples: ['dev'] }),
    subsystemId: Type.String({ examples: ['claims'] }),
    services: Type.Array(ResourceServerServiceAccess),
  },
  {
    $id: 'ResourceServerAccess',
    additionalProperties: false,
    examples: [
      {
        id: 'claims',
        environment: 'dev',
        services: [{ scopes: ['Claims.Read'], name: 'claims-svc' }],
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
        integrationClientId: 'integration-42',
        resourceServers: [
          {
            id: 'claims',
            environment: 'dev',
            integrationClientId: '1234',
            services: [{ scopes: ['Claims.Read'], name: 'claims-svc' }],
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
    clientId: Type.String({ examples: ['partner-app-claims'] }),
    privacyZone: Type.String({ examples: ['public'] }),
    environment: Type.String({ examples: ['dev'] }),
    services: Type.Array(ResourceServerServiceAccess),
  },
  {
    additionalProperties: false,
    examples: [
      {
        services: [{ scopes: ['Claims.Read'], name: 'claims-svc' }],
        privacyZone: 'public',
        clientId: 'partner-app-claims',
        environment: 'dev',
        id: 'claims',
      },
    ],
  }
);

export const NewIntegrationAccessRequest = Type.Object(
  {
    integrationId: Type.String({ examples: ['integration-42'] }),
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
            privacyZone: 'public',
            clientId: 'partner-app-claims',
            environment: 'dev',
            id: 'claims',
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
