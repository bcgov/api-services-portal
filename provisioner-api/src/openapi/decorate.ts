interface PathMeta {
  summary: string;
  description?: string;
}

interface CallbackMeta {
  summary: string;
  description?: string;
  tags?: string[];
}

interface SchemaMeta {
  description: string;
}

interface DecorateOptions {
  pathSummaries: Record<string, PathMeta>;
  callbackSummaries?: Record<string, CallbackMeta>;
  componentSchemaDescriptions?: Record<string, SchemaMeta>;
  errorResponseRefs?: Record<string, { $ref: string }>;
}

type AnyDoc = Record<string, any>;

const METHODS = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
] as const;

const DEFAULT_RESPONSE_DESCRIPTION =
  'Successful response containing the requested representation.';

export function decorateOpenApi<T extends AnyDoc>(
  doc: T,
  {
    pathSummaries,
    callbackSummaries = {},
    componentSchemaDescriptions = {},
    errorResponseRefs = {},
  }: DecorateOptions
): T {
  promoteExamplesDeep(doc);

  const componentsSchemas = doc.components?.schemas as
    | Record<string, AnyDoc>
    | undefined;
  if (componentsSchemas) {
    for (const [name, schema] of Object.entries(componentsSchemas)) {
      const meta = componentSchemaDescriptions[name];
      if (meta) schema.description ??= meta.description;
    }
  }

  const paths = doc.paths as Record<string, AnyDoc> | undefined;
  if (paths) {
    for (const [path, item] of Object.entries(paths)) {
      if (!item) continue;
      const meta = pathSummaries[path];
      if (meta) {
        item.summary ??= meta.summary;
        if (meta.description) item.description ??= meta.description;
      }
      for (const op of operationsOf(item)) {
        attachErrorResponses(op, errorResponseRefs);
        decorateOperation(op, callbackSummaries);
      }
    }
  }
  return doc;
}

function operationsOf(item: AnyDoc): AnyDoc[] {
  return METHODS.map((m) => item[m]).filter((op): op is AnyDoc => Boolean(op));
}

function decorateOperation(
  op: AnyDoc,
  callbackSummaries: Record<string, CallbackMeta>
): void {
  for (const param of (op.parameters as AnyDoc[] | undefined) ?? []) {
    if (param.schema) ensureSchemaExample(param.schema, param.example);
  }
  decorateResponses(op.responses);
  decorateRequestBody(op.requestBody);
  decorateCallbacks(op.callbacks, callbackSummaries);
}

function attachErrorResponses(
  op: AnyDoc,
  refs: Record<string, { $ref: string }>
): void {
  op.responses ??= {};
  for (const [status, ref] of Object.entries(refs)) {
    op.responses[status] ??= ref;
  }
}

function decorateResponses(responses: Record<string, AnyDoc> | undefined): void {
  for (const resp of Object.values(responses ?? {})) {
    if (!resp.description || resp.description === 'Default Response') {
      resp.description = DEFAULT_RESPONSE_DESCRIPTION;
    }
    decorateContent(resp.content);
  }
}

function decorateRequestBody(body: AnyDoc | undefined): void {
  if (body) decorateContent(body.content);
}

function decorateContent(content: Record<string, AnyDoc> | undefined): void {
  for (const media of Object.values(content ?? {})) {
    if (media.schema) ensureSchemaExample(media.schema, media.example);
  }
}

function decorateCallbacks(
  callbacks: Record<string, AnyDoc> | undefined,
  callbackSummaries: Record<string, CallbackMeta>
): void {
  for (const [name, cb] of Object.entries(callbacks ?? {})) {
    const meta = callbackSummaries[name];
    for (const pathItem of Object.values(cb)) {
      if (!pathItem || typeof pathItem !== 'object') continue;
      for (const op of operationsOf(pathItem as AnyDoc)) {
        if (meta) {
          op.summary ??= meta.summary;
          if (meta.description) op.description ??= meta.description;
          if (meta.tags) op.tags ??= meta.tags;
        }
        decorateOperation(op, callbackSummaries);
      }
    }
  }
}

function ensureSchemaExample(schema: AnyDoc, fallback?: unknown): void {
  if (Array.isArray(schema.examples) && schema.examples.length > 0) return;
  if (fallback !== undefined) {
    schema.examples = [fallback];
    return;
  }
  if (schema.default !== undefined) {
    schema.examples = [schema.default];
  }
}

function promoteExamplesDeep(node: unknown): void {
  if (Array.isArray(node)) {
    for (const child of node) promoteExamplesDeep(child);
    return;
  }
  if (!node || typeof node !== 'object') return;
  const obj = node as AnyDoc;
  if (isSchemaLike(obj)) {
    if (obj.example !== undefined && !Array.isArray(obj.examples)) {
      obj.examples = [obj.example];
      delete obj.example;
    }
  }
  for (const value of Object.values(obj)) promoteExamplesDeep(value);
}

function isSchemaLike(obj: AnyDoc): boolean {
  return (
    typeof obj.type === 'string' ||
    Array.isArray(obj.type) ||
    Array.isArray(obj.oneOf) ||
    Array.isArray(obj.anyOf) ||
    Array.isArray(obj.allOf) ||
    'items' in obj ||
    'properties' in obj ||
    'additionalProperties' in obj
  );
}
