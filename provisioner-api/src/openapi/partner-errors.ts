import { Type } from '@sinclair/typebox';
import { ProblemSchema } from '../errors/problem.js';

const descriptions: Record<number, string> = {
  400: 'Request schema or business validation failed; consult the operation description for supported values.',
  401: 'Missing, invalid or expired bearer token.',
  403: 'Bearer token lacks the required partner scope.',
  404: 'No matching integration/organization for a new request, or no connections in the requested environment.',
  409: 'Conflicting stored connection identity, provider or scope state. Updated access must be submitted for re-approval.',
  500: 'Unexpected internal failure.',
  502: 'SDX upstream transport, non-2xx or configuration failure, including a catalog service that no longer exists.',
};

/** Only errors produced by each partner operation; no blanket response list. */
export function partnerErrors(...statuses: number[]) {
  return Object.fromEntries(
    statuses.map((status) => [
      status,
      {
        description: descriptions[status],
        content: {
          'application/problem+json': { schema: Type.Ref(ProblemSchema) },
        },
      },
    ])
  );
}
