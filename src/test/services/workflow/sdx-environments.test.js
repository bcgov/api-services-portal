const {
  SDX_ENVIRONMENTS_ENV_VAR,
  parseSdxEnvironments,
  getSdxEnvironments,
  validateSdxEnvironmentsConfig,
  assertSdxEnvironment,
} = require('../../../services/workflow/sdx-environments');

describe('sdx-environments', () => {
  const originalValue = process.env[SDX_ENVIRONMENTS_ENV_VAR];

  afterEach(() => {
    process.env[SDX_ENVIRONMENTS_ENV_VAR] = originalValue;
  });

  describe('parseSdxEnvironments', () => {
    it('splits a comma-separated list and trims whitespace', () => {
      expect(parseSdxEnvironments('stg, bct ,bc')).toEqual(['stg', 'bct', 'bc']);
    });

    it('accepts a single environment', () => {
      expect(parseSdxEnvironments('apsdev')).toEqual(['apsdev']);
    });

    it('drops empty entries and duplicates', () => {
      expect(parseSdxEnvironments('dev,,cyp,dev,')).toEqual(['dev', 'cyp']);
    });

    it('rejects a missing value', () => {
      expect(() => parseSdxEnvironments(undefined)).toThrow(
        'SDX_ENVIRONMENTS is required'
      );
      expect(() => parseSdxEnvironments('   ')).toThrow(
        'SDX_ENVIRONMENTS is required'
      );
    });

    it('rejects a list with no labels', () => {
      expect(() => parseSdxEnvironments(', ,')).toThrow(
        'SDX_ENVIRONMENTS must list at least one environment'
      );
    });

    it('rejects labels that are not lowercase alphanumeric', () => {
      expect(() => parseSdxEnvironments('dev,Prod,aps-test')).toThrow(
        "SDX_ENVIRONMENTS contains invalid environment label(s) 'Prod', 'aps-test'; labels must be lowercase alphanumeric"
      );
    });
  });

  describe('getSdxEnvironments / validateSdxEnvironmentsConfig', () => {
    it('reads the list from the environment', () => {
      process.env[SDX_ENVIRONMENTS_ENV_VAR] = 'apstst';
      expect(getSdxEnvironments()).toEqual(['apstst']);
      expect(() => validateSdxEnvironmentsConfig()).not.toThrow();
    });

    it('fails fast when the setting is missing', () => {
      delete process.env[SDX_ENVIRONMENTS_ENV_VAR];
      expect(() => validateSdxEnvironmentsConfig()).toThrow(
        'SDX_ENVIRONMENTS is required'
      );
    });
  });

  describe('assertSdxEnvironment', () => {
    beforeEach(() => {
      process.env[SDX_ENVIRONMENTS_ENV_VAR] = 'dev,cyp';
    });

    it('accepts a configured environment', () => {
      expect(() => assertSdxEnvironment('dev')).not.toThrow();
      expect(() => assertSdxEnvironment('cyp')).not.toThrow();
    });

    it('rejects an unknown environment with a field-level validation error listing the valid values', () => {
      expect(() => assertSdxEnvironment('prod')).toThrow(
        expect.objectContaining({
          message: 'Validation Failed',
          fields: {
            environment: {
              message:
                "Environment 'prod' is not a valid SDX environment. Valid environments: dev, cyp",
              value: 'prod',
            },
          },
        })
      );
    });

    it('matches labels exactly (case-sensitive)', () => {
      expect(() => assertSdxEnvironment('DEV')).toThrow('Validation Failed');
    });
  });
});
