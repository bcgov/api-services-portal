import { Type, type Static } from '@sinclair/typebox';

/**
 * Resource kinds the provisioner can dispatch, grouped by the upstream
 * provider that owns them. Mirrors the "Resources supported" matrix in the
 * README.
 */
export const RESOURCE_KINDS = [
  'Information',
  // APS (directory)
  'Product',
  'Application',
  // 'ConsumerLabels',
  // 'Activity',
  // SDX (sdxMember)
  // 'Subsystem',
  // 'OpenAPISpec',
  // GWA (gatewayAdmin)
  'GatewayService',
  'GatewayKeySet',
  'GatewayKey',
  'GatewayConsumer',
  // CSS (commonSso)
  'IntegrationAllowedServices',
] as const;

export type ResourceKind = (typeof RESOURCE_KINDS)[number];

const ResourceMetadata = Type.Object(
  {
    name: Type.String({
      description: 'Stable identifier for the resource within its kind.',
      examples: ['claims-product'],
    }),
  },
  { additionalProperties: true }
);

/**
 * A single resource in the submitted set. The envelope is Kubernetes-style: a
 * `kind` selects the handling provider and the free-form `spec` carries the
 * provider-specific payload.
 */
export const Resource = Type.Object(
  {
    kind: Type.String({
      description: 'Discriminates which provider applies the resource.',
      examples: ['Product'],
    }),
    name: Type.Required(
      Type.String({
        description: 'Stable identifier for the resource within its kind.',
        examples: ['claims-product'],
      }),
      {
        description:
          'Required for all resources except those with provider-unique handling.',
      }
    ),
  },
  {
    $id: 'Resource',
    additionalProperties: true,
    examples: [
      {
        kind: 'Product',
        name: 'claims-product',
      },
    ],
  }
);

export const ApplyResourcesRequest = Type.Object(
  {
    gatewayId: Type.String({
      description: 'The ID of the gateway to apply the resources to.',
      examples: ['gateway-123'],
    }),
    resources: Type.Array(Type.Ref(Resource), {
      description: 'The set of resources to apply.',
      minItems: 1,
    }),
  },
  {
    $id: 'ApplyResourcesRequest',
    additionalProperties: false,
    examples: [
      {
        resources: [
          {
            kind: 'Product',
            name: 'claims-product',
          },
        ],
      },
    ],
  }
);

/**
 * Connection-change request. Mirrors the SDX Member API's create-connection
 * input (`ConnectionRequestInput`); the owning organization is resolved from
 * the service catalog rather than supplied here.
 */
export const ConnectionChangeRequest = Type.Object(
  {
    clientId: Type.String({ examples: ['LAB.MIN.FOOD.MY-UI'] }),
    serviceId: Type.String({
      examples: ['LAB.MIN.FOOD.CASE-MANAGEMENT.v1'],
    }),
    isApproved: Type.Optional(Type.Boolean({ examples: [false] })),
    isActive: Type.Optional(Type.Boolean({ examples: [false] })),
    environment: Type.Optional(Type.String({ examples: ['dev'] })),
    policyVersion: Type.Optional(Type.String({ examples: ['SDX.R0.00'] })),
    requesterDetails: Type.Optional(Type.Any()),
    clientResources: Type.Optional(Type.Any()),
    serviceResources: Type.Optional(Type.Any()),
  },
  {
    $id: 'ConnectionChangeRequest',
    additionalProperties: false,
    examples: [
      {
        clientId: 'MIN.FOOD.MY-UI',
        serviceId: 'LAB.MIN.FOOD.CASE-MANAGEMENT.v1',
        isApproved: false,
        environment: 'dev',
      },
    ],
  }
);

/**
 * The baseline `clientResources`/`serviceResources` a new connection
 * request should be built from for a given policy version.
 */
export const ConnectionDefaultsResponse = Type.Object(
  {
    clientResources: Type.Any(),
    serviceResources: Type.Any(),
  },
  {
    $id: 'ConnectionDefaultsResponse',
    additionalProperties: false,
    examples: [
      {
        clientResources: { gatewayPatterns: {} },
        serviceResources: { gatewayPatterns: {} },
      },
    ],
  }
);

const ResourceResult = Type.Object(
  {
    provider: Type.String({
      description: 'Upstream provider the resource was dispatched to.',
      examples: ['aps'],
    }),
    message: Type.Optional(
      Type.String({
        description: 'Detail for a failed or skipped resource.',
        examples: ['unknown kind "Widget"'],
      })
    ),
    status: Type.Union(
      [
        Type.Literal('applied'),
        Type.Literal('failed'),
        Type.Literal('skipped'),
      ],
      {
        description: 'Outcome of the apply attempt for this resource.',
        examples: ['applied'],
      }
    ),
    details: Type.Optional(Type.Unknown(), true),
  },
  { additionalProperties: true }
);

export const ConnectionChangeResponse = Type.Object(
  {
    applied: Type.Integer({
      description: 'Number of resources successfully applied.',
      examples: [2],
    }),
    failed: Type.Integer({
      description: 'Number of resources that failed to apply.',
      examples: [0],
    }),
    skipped: Type.Integer({
      description: 'Number of resources that were skipped.',
      examples: [0],
    }),
    results: Type.Array(ResourceResult),
    preview: Type.Optional(Type.Array(Type.Unknown()), true),
  },
  {
    $id: 'ConnectionChangeResponse',
    additionalProperties: false,
    examples: [
      {
        applied: 1,
        failed: 0,
        results: [
          {
            kind: 'Product',
            name: 'claims-product',
            provider: 'aps',
            status: 'applied',
          },
        ],
      },
    ],
  }
);

export const ApplyResourcesResponse = Type.Object(
  {
    applied: Type.Integer({
      description: 'Number of resources successfully applied.',
      examples: [2],
    }),
    failed: Type.Integer({
      description: 'Number of resources that failed to apply.',
      examples: [0],
    }),
    skipped: Type.Integer({
      description: 'Number of resources that were skipped.',
      examples: [0],
    }),
    results: Type.Array(ResourceResult),
    preview: Type.Optional(Type.Array(Type.Unknown()), true),
    changes: Type.Optional(
      Type.Object(
        {
          operation: Type.String({
            description:
              'Pattern operation applied (add, rotate, replace, delete, or publish).',
            examples: ['rotate'],
          }),
          added: Type.Array(
            Type.Object({
              kid: Type.String(),
              name: Type.String(),
            })
          ),
          removed: Type.Array(
            Type.Object({
              kid: Type.String(),
              name: Type.String(),
            })
          ),
          retained: Type.Array(
            Type.Object({
              kid: Type.String(),
              name: Type.String(),
            })
          ),
        },
        { additionalProperties: false }
      )
    ),
  },
  {
    $id: 'ApplyResourcesResponse',
    additionalProperties: false,
    examples: [
      {
        applied: 1,
        failed: 0,
        skipped: 0,
        results: [
          {
            kind: 'Product',
            name: 'claims-product',
            provider: 'aps',
            status: 'applied',
          },
        ],
      },
    ],
  }
);

/**
 * Request to evaluate a gateway pattern and apply the resources it produces.
 * The pattern id is supplied as a path parameter; this body carries the
 * pattern parameters.
 */
export const ApplyPatternRequest = Type.Object(
  {
    parameters: Type.Record(Type.String(), Type.Unknown(), {
      description: 'Parameters required by the pattern.',
      default: {},
    }),
  },
  {
    $id: 'ApplyPatternRequest',
    additionalProperties: false,
    examples: [
      {
        parameters: {
          clientId: 'MIN.FOOD.MY-UI',
          serviceSd: 'LAB.MIN.FOOD.CASE-MANAGEMENT.v1',
          upstreamUrl: 'httpbun.com',
        },
      },
    ],
  }
);

/**
 * A tagged gateway entity belonging to a gateway (namespace), as returned by
 * the GWA API. Mirrors the `GatewayResource` component from the GWA spec.
 */
export const GatewayResource = Type.Object(
  {
    tag: Type.String({
      description: 'The namespace tag applied to the entity.',
      examples: ['ns.platform'],
    }),
    entity_id: Type.String({
      description: "The gateway entity's unique identifier.",
      examples: ['7e6b4c2a-1c1e-4c79-8e34-9f6f2b6b9d8a'],
    }),
    entity_name: Type.String({
      description: "The gateway entity's name.",
      examples: ['routes'],
    }),
  },
  {
    $id: 'GatewayResource',
    additionalProperties: true,
    examples: [
      {
        tag: 'ns.platform',
        entity_id: '7e6b4c2a-1c1e-4c79-8e34-9f6f2b6b9d8a',
        entity_name: 'routes',
      },
    ],
  }
);

export const GatewayResourcesResponse = Type.Array(Type.Ref(GatewayResource), {
  description: 'Tagged gateway entities belonging to the gateway.',
  examples: [
    [
      {
        tag: 'ns.platform',
        entity_id: '7e6b4c2a-1c1e-4c79-8e34-9f6f2b6b9d8a',
        entity_name: 'routes',
      },
    ],
  ],
});

export const GatewayKeysResponse = Type.Object(
  {
    key_sets: Type.Array(Type.Unknown(), {
      description: 'Kong key sets for the gateway (public fields only).',
    }),
    keys: Type.Array(Type.Unknown(), {
      description: 'Kong keys for the gateway (public fields only).',
    }),
  },
  {
    $id: 'GatewayKeysResponse',
    additionalProperties: false,
    examples: [
      {
        key_sets: [{ name: 'sdx.edge.myrg.dev' }],
        keys: [
          {
            name: 'sdx.keys.myrg.dev.edge:0',
            kid: 'urn:ca:bc:sdx:edge:myrg:dev:0',
          },
        ],
      },
    ],
  }
);

export type TResource = Static<typeof Resource>;
export type TResourceResult = Static<typeof ResourceResult>;
export type TApplyResourcesRequest = Static<typeof ApplyResourcesRequest>;
export type TApplyResourcesResponse = Static<typeof ApplyResourcesResponse>;
export type TConnectionChangeRequest = Static<typeof ConnectionChangeRequest>;
export type TConnectionChangeResponse = Static<typeof ConnectionChangeResponse>;
export type TConnectionDefaultsResponse = Static<
  typeof ConnectionDefaultsResponse
>;
export type TApplyPatternRequest = Static<typeof ApplyPatternRequest>;

export const resourceSchemas = [
  Resource,
  ApplyResourcesRequest,
  ApplyResourcesResponse,
  ConnectionChangeRequest,
  ConnectionChangeResponse,
  ConnectionDefaultsResponse,
  ApplyPatternRequest,
  GatewayResource,
  GatewayKeysResponse,
];
