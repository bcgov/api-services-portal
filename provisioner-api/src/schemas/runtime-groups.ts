import { Type, type Static } from '@sinclair/typebox';

/**
 * Body for a certificate signing request (CSR) generation against a runtime
 * group's edge server. Mirrors the edge server's `/edge/{runtimeGroup}/csr`
 * payload.
 */
export const CsrRequest = Type.Object(
  {
    requester_name: Type.Optional(
      Type.String({
        description: 'Display name of the person requesting the key.',
        examples: ['Jane Doe'],
      })
    ),
    requester_email: Type.Optional(
      Type.String({
        description: 'Email of the person requesting the key.',
        examples: ['jane.doe@gov.bc.ca'],
      })
    ),
  },
  {
    $id: 'CsrRequest',
    additionalProperties: false,
    examples: [
      {
        requester_name: 'Jane Doe',
        requester_email: 'jane.doe@gov.bc.ca',
      },
    ],
  }
);

/**
 * The edge server's response to a CSR request. The exact shape is owned by the
 * edge server, so it is passed through as a free-form object.
 */
export const CsrResponse = Type.Object(
  {},
  {
    $id: 'CsrResponse',
    additionalProperties: true,
    description: 'Key pair and CSR material produced by the edge server.',
  }
);

export type TCsrRequest = Static<typeof CsrRequest>;

/**
 * The CA's response to a certificate-signing token request. The subject and
 * SANs are derived server-side from the runtime group named in the path, so
 * no request body is needed.
 */
export const CertTokenResponse = Type.Object(
  {
    token: Type.String({
      description: 'One-time-use certificate-signing token issued by the CA.',
    }),
  },
  {
    $id: 'CertTokenResponse',
    additionalProperties: false,
  }
);

export const runtimeGroupSchemas = [CsrRequest, CsrResponse, CertTokenResponse];
