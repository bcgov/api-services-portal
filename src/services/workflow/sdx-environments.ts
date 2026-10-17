import { ValidateError } from 'tsoa';

/**
 * Portal setting that lists the SDX environment labels an OAS service may be
 * uploaded to. Comma-separated, for example `apsdev` or `stg,bct,bc`.
 */
export const SDX_ENVIRONMENTS_ENV_VAR = 'SDX_ENVIRONMENTS';

/**
 * An environment label is used verbatim in service names
 * (`ENV.CLASS.ID.SERVICE.v1`) and runtime-group hosts, so it is kept to a
 * single lowercase alphanumeric token.
 */
const ENVIRONMENT_LABEL_PATTERN = /^[a-z0-9]+$/;

/**
 * Parses the comma-separated `SDX_ENVIRONMENTS` value into a list of labels.
 * Throws a configuration `Error` when the value is missing, empty, or contains
 * a label that is not a lowercase alphanumeric token.
 */
export function parseSdxEnvironments(rawValue: string | undefined): string[] {
  if (rawValue === undefined || rawValue.trim().length === 0) {
    throw new Error(`${SDX_ENVIRONMENTS_ENV_VAR} is required`);
  }

  const environments = rawValue
    .split(',')
    .map((label) => label.trim())
    .filter((label) => label.length > 0);

  if (environments.length === 0) {
    throw new Error(
      `${SDX_ENVIRONMENTS_ENV_VAR} must list at least one environment`
    );
  }

  const invalidLabels = environments.filter(
    (label) => !ENVIRONMENT_LABEL_PATTERN.test(label)
  );
  if (invalidLabels.length > 0) {
    throw new Error(
      `${SDX_ENVIRONMENTS_ENV_VAR} contains invalid environment label(s) ${invalidLabels
        .map((label) => `'${label}'`)
        .join(', ')}; labels must be lowercase alphanumeric`
    );
  }

  return Array.from(new Set(environments));
}

/**
 * Returns the configured list of valid SDX environment labels.
 */
export function getSdxEnvironments(): string[] {
  return parseSdxEnvironments(process.env[SDX_ENVIRONMENTS_ENV_VAR]);
}

/**
 * Startup check so a misconfigured Portal fails fast rather than rejecting
 * every service upload at request time.
 */
export function validateSdxEnvironmentsConfig(): void {
  getSdxEnvironments();
}

/**
 * Rejects an OAS service upload whose `environment` is not one of the
 * configured SDX environments. Matching is exact (labels are lowercase).
 */
export function assertSdxEnvironment(environment: string): void {
  const validEnvironments = getSdxEnvironments();
  if (validEnvironments.includes(environment)) {
    return;
  }
  throw new ValidateError(
    {
      environment: {
        message: `Environment '${environment}' is not a valid SDX environment. Valid environments: ${validEnvironments.join(
          ', '
        )}`,
        value: environment,
      },
    },
    'Validation Failed'
  );
}
