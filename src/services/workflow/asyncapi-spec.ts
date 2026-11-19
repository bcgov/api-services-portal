import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { schemasWithoutId } from '@asyncapi/specs';
import { ValidateError } from 'tsoa';
import type { SpecOperations } from './openapi-spec-loader';

const ajv = new Ajv({ strict: false, ownProperties: true });
addFormats(ajv);
const validators = {
  '3.0.0': ajv.compile(schemasWithoutId['3.0.0']),
  '3.1.0': ajv.compile(schemasWithoutId['3.1.0']),
};

export function parseAsyncAPIOperations(document: {
  asyncapi: unknown;
  operations?: Record<string, unknown>;
}): SpecOperations[] {
  const version = document.asyncapi;
  if (version !== '3.0.0' && version !== '3.1.0') {
    throw specError('Supported AsyncAPI versions are 3.0.0 and 3.1.0.');
  }

  const validate = validators[version];
  if (!validate(document)) {
    const detail = ajv.errorsText(validate.errors, { dataVar: 'spec' });
    throw specError(`Invalid AsyncAPI specification. ${detail}`);
  }

  const operations: SpecOperations[] = [];
  for (const [operationId, entry] of Object.entries(
    document.operations ?? {}
  )) {
    const operation = resolveLocalReference(document, entry);
    if (!operation) {
      continue;
    }
    if (operation.action !== 'send' && operation.action !== 'receive') {
      throw specError(
        `Invalid action for AsyncAPI operation '${operationId}'.`
      );
    }

    const channel = resolveLocalReference(document, operation.channel);
    const scopes: SpecOperations['scopes'] = [];
    for (const security of operation.security ?? []) {
      const scheme = resolveLocalReference(document, security);
      if (Array.isArray(scheme?.scopes)) {
        scopes.push(...scheme.scopes.map((name: string) => ({ name })));
      }
    }
    operations.push({
      operationId,
      method: operation.action.toUpperCase(),
      path: channel?.address ?? '',
      summary: operation.summary ?? '',
      scopes,
    });
  }
  return operations;
}

function resolveLocalReference(document: any, entry: any): any {
  const visited = new Set<string>();
  while (typeof entry?.$ref === 'string') {
    const ref = entry.$ref;
    // External references stay in the uploaded document.
    if (!ref.startsWith('#/')) {
      return undefined;
    }
    if (visited.has(ref)) {
      throw specError(`Circular AsyncAPI reference '${ref}'.`);
    }
    visited.add(ref);

    let pointer: string;
    try {
      pointer = decodeURIComponent(ref.slice(2));
    } catch {
      throw specError(`Invalid AsyncAPI reference '${ref}'.`);
    }
    entry = pointer.split('/').reduce((value, token) => {
      const key = token.replace(/~1/g, '/').replace(/~0/g, '~');
      return value && Object.prototype.hasOwnProperty.call(value, key)
        ? value[key]
        : undefined;
    }, document);
    if (!entry || typeof entry !== 'object') {
      throw specError(`Unresolved AsyncAPI reference '${ref}'.`);
    }
  }
  return entry;
}

function specError(message: string): ValidateError {
  return new ValidateError({ spec: { message } }, 'Validation Failed');
}
