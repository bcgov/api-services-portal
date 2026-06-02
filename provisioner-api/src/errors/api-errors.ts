import createError, { type FastifyError } from '@fastify/error';

const TYPE_BASE = 'https://errors.sdx.gov.bc.ca/';

export interface ProblemMeta {
  status: number;
  title: string;
  type: string;
}

export const ERROR_META: Record<string, ProblemMeta> = {
  BAD_REQUEST: {
    status: 400,
    title: 'Bad request',
    type: `${TYPE_BASE}bad-request`,
  },
  UNAUTHORIZED: {
    status: 401,
    title: 'Authentication required',
    type: `${TYPE_BASE}unauthorized`,
  },
  FORBIDDEN: {
    status: 403,
    title: 'Forbidden',
    type: `${TYPE_BASE}forbidden`,
  },
  NOT_FOUND: {
    status: 404,
    title: 'Resource not found',
    type: `${TYPE_BASE}not-found`,
  },
  CONFLICT: {
    status: 409,
    title: 'Conflict',
    type: `${TYPE_BASE}conflict`,
  },
  UNPROCESSABLE_ENTITY: {
    status: 422,
    title: 'Unprocessable entity',
    type: `${TYPE_BASE}unprocessable-entity`,
  },
  INTERNAL_ERROR: {
    status: 500,
    title: 'Internal server error',
    type: `${TYPE_BASE}internal-error`,
  },
  BAD_GATEWAY: {
    status: 502,
    title: 'Bad gateway',
    type: `${TYPE_BASE}bad-gateway`,
  },
  SERVICE_UNAVAILABLE: {
    status: 503,
    title: 'Service unavailable',
    type: `${TYPE_BASE}service-unavailable`,
  },
  SUBSYSTEM_NOT_FOUND: {
    status: 404,
    title: 'Subsystem not found',
    type: `${TYPE_BASE}subsystem-not-found`,
  },
  INVALID_ACCESS_REQUEST: {
    status: 422,
    title: 'Invalid integration access request',
    type: `${TYPE_BASE}invalid-access-request`,
  },
};

export const BadRequestError = createError('BAD_REQUEST', '%s', 400);
export const UnauthorizedError = createError('UNAUTHORIZED', '%s', 401);
export const ForbiddenError = createError('FORBIDDEN', '%s', 403);
export const NotFoundError = createError('NOT_FOUND', '%s', 404);
export const ConflictError = createError('CONFLICT', '%s', 409);
export const UnprocessableEntityError = createError(
  'UNPROCESSABLE_ENTITY',
  '%s',
  422
);
export const InternalError = createError('INTERNAL_ERROR', '%s', 500);
export const BadGatewayError = createError('BAD_GATEWAY', '%s', 502);
export const ServiceUnavailableError = createError(
  'SERVICE_UNAVAILABLE',
  '%s',
  503
);

export const SubsystemNotFoundError = createError(
  'SUBSYSTEM_NOT_FOUND',
  'Subsystem "%s" not found',
  404
);
export const InvalidAccessRequestError = createError(
  'INVALID_ACCESS_REQUEST',
  '%s',
  422
);

export type ApiError = FastifyError & { details?: unknown };

export function withDetails<E extends Error>(err: E, details: unknown): E {
  (err as Error & { details?: unknown }).details = details;
  return err;
}
