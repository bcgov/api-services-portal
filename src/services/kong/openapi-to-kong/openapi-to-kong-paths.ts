/**
 * openapi-to-kong-paths
 *
 * Converts OpenAPI 3.x path templates into Kong Gateway route regex patterns,
 * faithfully replicating the logic used by Kong's deck `openapi2kong` command
 * (go-apiops / openapi-2-kong).
 *
 * Rules implemented (matching Kong's behaviour):
 *  1. Static paths (no parameters) → plain prefix string, no regex needed.
 *  2. Path parameters `{paramName}` → named capture group `(?<paramName>[^/]+)`
 *     that matches one path segment (no slash).
 *  3. The final `$` anchor is always appended so routes perform an exact match.
 *  4. Kong 3.x: regex route paths MUST be prefixed with `~` to distinguish them
 *     from plain prefix routes.
 *  5. Special regex metacharacters in the static portions are escaped.
 *  6. An optional `trailingSlash` mode lets callers accept or require a trailing
 *     slash variant.
 *
 * References:
 *  - https://github.com/Kong/go-apiops  (deck openapi2kong source)
 *  - https://www.npmjs.com/package/openapi-2-kong  (JS reference implementation)
 *  - https://docs.konghq.com/deck/reference/3.0-upgrade/  (~ prefix requirement)
 *  - https://spec.openapis.org/oas/v3.1.0#path-templating  (OpenAPI path rules)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Options that control how the conversion is performed. */
export interface ConvertOptions {
  /**
   * Kong Gateway major version.
   *  - `2` → no `~` prefix on regex paths (Kong 2.x behaviour).
   *  - `3` (default) → regex paths prefixed with `~` (Kong 3.x requirement).
   */
  kongVersion?: 2 | 3;

  /**
   * Controls trailing-slash behaviour for the generated pattern.
   *  - `'none'`     (default) – path must match exactly with no trailing slash.
   *  - `'optional'` – a trailing slash is allowed but not required.
   *  - `'required'` – a trailing slash is mandatory.
   */
  trailingSlash?: "none" | "optional" | "required";

  /**
   * Pattern used for a single path-parameter segment.
   * Defaults to `[^/]+ ` (any character except a forward slash, one or more).
   *
   * The openapi-2-kong JS package uses `\S+` (any non-whitespace) for the
   * *last* segment.  Set this to `\\S+` to replicate that behaviour exactly.
   */
  paramPattern?: string;

  /**
   * When `true`, the last path parameter in the path uses `\\S+` instead of
   * the normal `paramPattern`.  This matches the openapi-2-kong JS package's
   * exact output (e.g. `\/pets/(?<id>\S+)$`).
   *
   * Defaults to `false`.
   */
  greedyLastParam?: boolean;
}

/** The result of a single path conversion. */
export interface ConversionResult {
  /** The original OpenAPI path template, e.g. `/pets/{petId}`. */
  openApiPath: string;

  /**
   * The Kong route path string ready to be placed in the `paths` array of a
   * Route entity.
   *
   * - For static paths this is a plain string (no regex).
   * - For paths with parameters this is a regex string, prefixed with `~`
   *   when targeting Kong 3.x.
   */
  kongPath: string;

  /** `true` when the result is a regular expression (has path parameters). */
  isRegex: boolean;

  /**
   * Map of parameter name → the regex fragment used to capture it, in the
   * order they appear in the path.
   */
  parameters: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * OpenAPI path parameter regex: matches `{identifier}` tokens.
 * Identifiers follow the same rules as JSON Schema property names.
 */
const PARAM_RE = /\{([^}]+)\}/g;

/**
 * Regex metacharacters that must be escaped in the static portions of the
 * path (everything that is not a path parameter).
 *
 * We intentionally do NOT escape `/` because Kong uses it as a literal
 * path separator.
 */
const ESCAPE_RE = /[.+*?()\[\]{}\\^$|]/g;

/** Escape regex metacharacters in a static path segment. */
function escapeStatic(segment: string): string {
  return segment.replace(ESCAPE_RE, "\\$&");
}

/** Return `true` when the path template contains at least one `{param}`. */
function hasParameters(path: string): boolean {
  PARAM_RE.lastIndex = 0;
  return PARAM_RE.test(path);
}

// ---------------------------------------------------------------------------
// Core conversion
// ---------------------------------------------------------------------------

/**
 * Convert a single OpenAPI path template to a Kong route path.
 *
 * @param openApiPath  The OpenAPI path template, e.g. `/users/{userId}/posts`.
 * @param options      Conversion options (see {@link ConvertOptions}).
 * @returns            A {@link ConversionResult} describing the Kong path.
 *
 * @example
 * ```ts
 * convertPath('/users/{userId}/posts')
 * // → { kongPath: '~/users/(?<userId>[^/]+)/posts$', isRegex: true, … }
 *
 * convertPath('/healthz')
 * // → { kongPath: '/healthz', isRegex: false, … }
 * ```
 */
export function convertPath(
  openApiPath: string,
  options: ConvertOptions = {}
): ConversionResult {
  const {
    kongVersion = 3,
    trailingSlash = "none",
    paramPattern = "[^/]+",
    greedyLastParam = false,
  } = options;

  if (!openApiPath.startsWith("/")) {
    throw new Error(
      `Invalid OpenAPI path "${openApiPath}": must start with "/".`
    );
  }

  // Fast path: no parameters → plain prefix string.
  if (!hasParameters(openApiPath)) {
    let kongPath = openApiPath;

    if (trailingSlash === "optional") {
      // Use regex to allow the optional slash.
      const escaped = escapeStatic(openApiPath);
      const pattern = `${escaped}\\/?$`;
      kongPath = kongVersion === 3 ? `~${pattern}` : pattern;
      return {
        openApiPath,
        kongPath,
        isRegex: true,
        parameters: {},
      };
    }

    if (trailingSlash === "required") {
      kongPath = openApiPath.endsWith("/")
        ? openApiPath
        : `${openApiPath}/`;
    }

    return {
      openApiPath,
      kongPath,
      isRegex: false,
      parameters: {},
    };
  }

  // Collect parameter names in order so we can detect the last one.
  const paramNames: string[] = [];
  let m: RegExpExecArray | null;
  PARAM_RE.lastIndex = 0;
  while ((m = PARAM_RE.exec(openApiPath)) !== null) {
    paramNames.push(m[1]);
  }

  const lastParam = greedyLastParam
    ? paramNames[paramNames.length - 1]
    : null;

  // Build the regex pattern segment by segment.
  const parameters: Record<string, string> = {};
  let pattern = "";
  let cursor = 0;

  PARAM_RE.lastIndex = 0;
  while ((m = PARAM_RE.exec(openApiPath)) !== null) {
    const [fullMatch, paramName] = m;
    const start = m.index;

    // Append the static portion before this parameter.
    if (start > cursor) {
      pattern += escapeStatic(openApiPath.slice(cursor, start));
    }

    // Choose the capture pattern for this parameter.
    const capturePattern =
      paramName === lastParam ? "\\S+" : paramPattern;

    const fragment = `(?<${paramName}>${capturePattern})`;
    parameters[paramName] = capturePattern;
    pattern += fragment;

    cursor = start + fullMatch.length;
  }

  // Append any remaining static suffix.
  if (cursor < openApiPath.length) {
    pattern += escapeStatic(openApiPath.slice(cursor));
  }

  // Trailing slash handling.
  switch (trailingSlash) {
    case "optional":
      pattern += "\\/?";
      break;
    case "required":
      pattern += "\\/";
      break;
    // 'none' → nothing extra
  }

  // Exact-match anchor.
  pattern += "$";

  // Kong 3.x requires the `~` prefix to signal a regex route.
  const kongPath = kongVersion === 3 ? `~${pattern}` : pattern;

  return {
    openApiPath,
    kongPath,
    isRegex: true,
    parameters,
  };
}

// ---------------------------------------------------------------------------
// Bulk conversion helpers
// ---------------------------------------------------------------------------

/**
 * Convert an array of OpenAPI path templates at once.
 *
 * @param paths    Array of OpenAPI path strings.
 * @param options  Shared {@link ConvertOptions} applied to every path.
 * @returns        Array of {@link ConversionResult} in the same order.
 */
export function convertPaths(
  paths: string[],
  options: ConvertOptions = {}
): ConversionResult[] {
  return paths.map((p) => convertPath(p, options));
}

/**
 * Convert all paths found in a minimal OpenAPI 3.x document object.
 *
 * @param spec     A parsed OpenAPI document (or any object with a `paths` key).
 * @param options  Shared {@link ConvertOptions}.
 * @returns        Array of {@link ConversionResult}, one per path key.
 */
export function convertOpenApiSpec(
  spec: { paths?: Record<string, unknown> },
  options: ConvertOptions = {}
): ConversionResult[] {
  if (!spec.paths || typeof spec.paths !== "object") {
    return [];
  }
  return convertPaths(Object.keys(spec.paths), options);
}

// ---------------------------------------------------------------------------
// Utility: extract parameter names from a path
// ---------------------------------------------------------------------------

/**
 * Return all parameter names in the order they appear in the path.
 *
 * @example
 * ```ts
 * extractParams('/users/{userId}/orders/{orderId}')
 * // → ['userId', 'orderId']
 * ```
 */
export function extractParams(openApiPath: string): string[] {
  const names: string[] = [];
  PARAM_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = PARAM_RE.exec(openApiPath)) !== null) {
    names.push(m[1]);
  }
  return names;
}

/**
 * Return `true` when the path contains at least one template parameter.
 *
 * @example
 * ```ts
 * isParameterized('/pets/{id}')   // true
 * isParameterized('/pets')        // false
 * ```
 */
export { hasParameters as isParameterized };
