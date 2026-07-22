import fp from 'fastify-plugin';
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ERROR_META } from '../errors/api-errors.js';
import type { Problem } from '../errors/problem.js';

const PROBLEM_CONTENT_TYPE = 'application/problem+json';

interface ValidationIssue {
  path?: string;
  message: string;
}

export default fp(async (app) => {
  app.setErrorHandler((err: FastifyError, req, reply) => {
    const problem = toProblem(err, req);
    if (problem.status >= 500) {
      req.log.error(
        { err, problem, route: req.routeOptions?.url },
        'unhandled error'
      );
    } else {
      req.log.warn(
        { err, problem, route: req.routeOptions?.url },
        'request rejected'
      );
    }
    sendProblem(reply, problem);
  });

  app.setNotFoundHandler((req, reply) => {
    const problem: Problem = {
      type: 'https://errors.sdx.gov.bc.ca/not-found',
      title: 'Resource not found',
      status: 404,
      detail: `No route for ${req.method} ${req.url}`,
      instance: req.url,
      code: 'NOT_FOUND',
      requestId: req.id,
    };
    req.log.warn({ problem }, 'route not found');
    sendProblem(reply, problem);
  });
});

function sendProblem(reply: FastifyReply, problem: Problem): void {
  reply
    .code(problem.status)
    .header('content-type', PROBLEM_CONTENT_TYPE)
    .send(problem);
}

function toProblem(err: FastifyError, req: FastifyRequest): Problem {
  if (isValidationError(err)) {
    return {
      type: 'https://errors.sdx.gov.bc.ca/bad-request',
      title: 'Bad request',
      status: 400,
      detail: err.message,
      instance: req.url,
      code: 'BAD_REQUEST',
      requestId: req.id,
      errors: extractValidationIssues(err),
    };
  }

  const code = err.code ?? 'INTERNAL_ERROR';
  const meta = ERROR_META[code] ?? ERROR_META.INTERNAL_ERROR;
  const status =
    typeof err.statusCode === 'number' ? err.statusCode : meta.status;
  return {
    type: meta.type,
    title: meta.title,
    status,
    detail: status >= 500 ? undefined : err.message,
    instance: req.url,
    code,
    requestId: req.id,
    ...((err as { details?: unknown }).details !== undefined
      ? { details: (err as { details?: unknown }).details }
      : {}),
  } as Problem;
}

function isValidationError(err: FastifyError): boolean {
  return (
    err.validation !== undefined ||
    err.code === 'FST_ERR_VALIDATION' ||
    err.code === 'FST_ERR_CTP_INVALID_MEDIA_TYPE'
  );
}

function extractValidationIssues(err: FastifyError): ValidationIssue[] {
  if (!Array.isArray(err.validation)) return [];
  return err.validation.map((v) => ({
    path:
      typeof v.instancePath === 'string' && v.instancePath !== ''
        ? v.instancePath
        : typeof v.schemaPath === 'string'
          ? v.schemaPath
          : undefined,
    message: typeof v.message === 'string' ? v.message : 'validation failed',
  }));
}
