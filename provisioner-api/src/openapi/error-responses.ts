const PROBLEM = {
  content: {
    'application/problem+json': {
      schema: { $ref: '#/components/schemas/Problem' },
    },
  },
} as const;

export const problemResponses = {
  BadRequest: {
    description: 'The request was malformed or failed schema validation.',
    ...PROBLEM,
  },
  Unauthorized: {
    description: 'Authentication is required and was missing or invalid.',
    ...PROBLEM,
  },
  Forbidden: {
    description: 'The caller is authenticated but not allowed to perform this operation.',
    ...PROBLEM,
  },
  NotFound: {
    description: 'The requested resource does not exist.',
    ...PROBLEM,
  },
  Conflict: {
    description: 'The request conflicts with the current state of the resource.',
    ...PROBLEM,
  },
  UnprocessableEntity: {
    description: 'The request body parsed successfully but failed business validation.',
    ...PROBLEM,
  },
  InternalError: {
    description: 'Unexpected server-side failure.',
    ...PROBLEM,
  },
  BadGateway: {
    description: 'An upstream dependency returned an unexpected response.',
    ...PROBLEM,
  },
  ServiceUnavailable: {
    description: 'The service is temporarily unable to handle the request.',
    ...PROBLEM,
  },
} as const;

export const ERROR_RESPONSE_REFS = {
  400: { $ref: '#/components/responses/BadRequest' },
  401: { $ref: '#/components/responses/Unauthorized' },
  403: { $ref: '#/components/responses/Forbidden' },
  404: { $ref: '#/components/responses/NotFound' },
  409: { $ref: '#/components/responses/Conflict' },
  422: { $ref: '#/components/responses/UnprocessableEntity' },
  500: { $ref: '#/components/responses/InternalError' },
  502: { $ref: '#/components/responses/BadGateway' },
  503: { $ref: '#/components/responses/ServiceUnavailable' },
} as const;
