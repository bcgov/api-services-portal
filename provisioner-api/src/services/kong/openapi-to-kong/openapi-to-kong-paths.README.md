# openapi-to-kong-paths

> Convert OpenAPI 3.x path templates into Kong Gateway regex route paths — the
> same way Kong's `deck file openapi2kong` (go-apiops) does it.

## Why?

Kong Gateway's route `paths` field supports two kinds of values:

| Kind | Example | How Kong matches it |
|------|---------|---------------------|
| Plain prefix | `/pets` | Any request whose path **starts with** `/pets` |
| Regex (Kong 3.x: prefixed with `~`) | `~/pets/(?<petId>[^/]+)$` | Full regex match |

OpenAPI path templates use `{paramName}` placeholders (`/pets/{petId}`). This
library converts those templates into the exact regex strings that Kong expects,
including:

- **Named capture groups** `(?<paramName>[^/]+)` — one per template parameter
- **Exact-match anchor** `$` — routes don't accidentally swallow longer paths
- **Kong 3.x `~` prefix** — required to distinguish regex from plain-prefix
  routes (omit for Kong 2.x via the `kongVersion` option)
- **Regex escaping** of static segments (e.g. the `.` in `/v1.0/api` → `\/v1\.0\/api`)

---

## Installation

```bash
# From source
npm install
npm run build
```

---

## Quick start

```typescript
import { convertPath, convertPaths, convertOpenApiSpec } from './src';

// Single path
convertPath('/pets/{petId}');
// {
//   openApiPath: '/pets/{petId}',
//   kongPath:    '~/pets/(?<petId>[^/]+)$',
//   isRegex:     true,
//   parameters:  { petId: '[^/]+' }
// }

// Static path — returned as-is (no regex overhead)
convertPath('/healthz');
// { kongPath: '/healthz', isRegex: false, parameters: {} }

// Multiple paths at once
convertPaths(['/pets', '/pets/{petId}', '/users/{uid}/orders/{oid}']);

// From a parsed OpenAPI document
convertOpenApiSpec(myParsedSpec);
```

---

## API

### `convertPath(openApiPath, options?)`

Convert a single OpenAPI path template.

**Returns** `ConversionResult`:

```ts
interface ConversionResult {
  openApiPath: string;           // original template
  kongPath:    string;           // ready for Kong route `paths` array
  isRegex:     boolean;          // true when the result is a regex
  parameters:  Record<string, string>; // param name → capture pattern used
}
```

### `convertPaths(paths, options?)`

Convert an array of path templates. Returns `ConversionResult[]`.

### `convertOpenApiSpec(spec, options?)`

Accept a parsed OpenAPI document object (must have a `paths` key).
Returns `ConversionResult[]`, one per path key.

### `extractParams(openApiPath)`

Return the parameter names in declaration order.

```ts
extractParams('/users/{uid}/orders/{oid}') // → ['uid', 'oid']
```

### `isParameterized(openApiPath)`

Return `true` when the path contains at least one `{param}`.

---

## Options

```ts
interface ConvertOptions {
  /** 2 = no ~ prefix (Kong 2.x).  3 = ~ prefix (default, Kong 3.x). */
  kongVersion?: 2 | 3;

  /** Trailing-slash handling.
   *  'none'     (default) – exact match, no slash.
   *  'optional' – trailing slash allowed.
   *  'required' – trailing slash mandatory.
   */
  trailingSlash?: 'none' | 'optional' | 'required';

  /** Regex used for every path-parameter segment. Default: '[^/]+' */
  paramPattern?: string;

  /** When true, the LAST parameter uses '\\S+' (openapi-2-kong JS compat). */
  greedyLastParam?: boolean;
}
```

---

## Conversion rules in detail

| OpenAPI path | Default Kong 3.x output |
|---|---|
| `/pets` | `/pets` (plain prefix) |
| `/pets/{petId}` | `~/pets/(?<petId>[^/]+)$` |
| `/users/{uid}/orders/{oid}` | `~/users/(?<uid>[^/]+)/orders/(?<oid>[^/]+)$` |
| `/v1.0/api` | `/v1.0/api` (static, dot left as-is in plain prefix) |
| `/v1.0/{id}` | `~/v1\.0/(?<id>[^/]+)$` (dot escaped in regex) |

### How Kong uses these

1. Kong reads the `paths` array on each Route entity.
2. A plain string is a **prefix match** — useful for catch-all or base routes.
3. A `~`-prefixed string is a **regex match** evaluated via PCRE against the
   full request path. Named capture groups are accessible via
   `$(uri_captures["paramName"])` in the Request Transformer plugin.

---

## Compatibility

Tested against the behaviour documented in:

- [Kong/go-apiops](https://github.com/Kong/go-apiops) — Go implementation used
  by `deck file openapi2kong`
- [openapi-2-kong](https://www.npmjs.com/package/openapi-2-kong) — JS reference
  implementation (use `greedyLastParam: true` for exact output parity)
- [Kong deck 3.0 upgrade guide](https://docs.konghq.com/deck/reference/3.0-upgrade/)

---

## Development

```bash
npm test          # run all 36 tests
npm run build     # compile to dist/
```
