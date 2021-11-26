import { strict as assert } from 'assert';
import { getIssuerEnvironmentConfig } from './types';
import {
  lookupCredentialIssuerById,
  lookupProductEnvironmentServices,
  lookupServices,
} from '../keystone';
import { Logger } from '../../logger';
import {
  CredentialIssuer,
  Environment,
  GatewayPlugin,
  GatewayService,
} from '../keystone/types';

const logger = Logger('wf.ValidateActiveEnv');

export const ValidateActiveEnvironment = async (
  context: any,
  operation: any,
  existingItem: any,
  originalInput: any,
  resolvedData: any,
  addValidationError: any
) => {
  if (
    ('active' in originalInput && originalInput['active'] == true) ||
    (operation == 'update' &&
      'active' in existingItem &&
      existingItem['active'] == true &&
      !('active' in originalInput && originalInput['active'] == false))
  ) {
    try {
      const envServices =
        existingItem == null
          ? ({} as Environment)
          : await lookupProductEnvironmentServices(context, existingItem.id);

      const issuer =
        'credentialIssuer' in resolvedData
          ? await lookupCredentialIssuerById(
              context,
              `${resolvedData.credentialIssuer}`
            )
          : envServices.credentialIssuer;

      const resolvedServices =
        'services' in resolvedData
          ? await lookupServices(context, resolvedData['services'])
          : null;

      const flow =
        'flow' in resolvedData ? resolvedData['flow'] : envServices.flow;
      const envName =
        'name' in resolvedData ? resolvedData['name'] : envServices.name;

      // The Credential Issuer says what plugins are expected
      // Loop through the Services to make sure the plugin is configured correctly

      // for "kong-api-key-acl", make sure there is an 'acl' and 'key-auth' plugin on all Services of this environment
      // for "client-credentials", make sure there is an 'jwt-keycloak' plugin on all Services of this environment
      // for "authorization-code", make sure there is an 'oidc' plugin on all Services of this environment
      if (flow == 'kong-api-key-acl') {
        const isServiceMissingAllPlugins = isServiceMissingAllPluginsHandler([
          'acl',
          'key-auth',
        ]);

        // If we are changing the service list, then use that to look for violations, otherwise use what is current
        const missing = resolvedServices
          ? resolvedServices.filter(isServiceMissingAllPlugins)
          : envServices.services.filter(isServiceMissingAllPlugins);

        if (missing.length != 0) {
          addValidationError(
            '[' +
              missing.map((s: any) => s.name).join(',') +
              '] missing or incomplete acl or key-auth plugin.'
          );
        }
      } else if (flow == 'kong-api-key-only') {
        const isServiceMissingAllPlugins = isServiceMissingAllPluginsHandler([
          'key-auth',
        ]);

        // If we are changing the service list, then use that to look for violations, otherwise use what is current
        const missing = resolvedServices
          ? resolvedServices.filter(isServiceMissingAllPlugins)
          : envServices.services.filter(isServiceMissingAllPlugins);

        if (missing.length != 0) {
          addValidationError(
            '[' +
              missing.map((s: any) => s.name).join(',') +
              '] missing or incomplete key-auth plugin.'
          );
        }
      } else if (flow == 'kong-acl-only') {
        const isServiceMissingAllPlugins = isServiceMissingAllPluginsHandler([
          'acl',
        ]);

        // If we are changing the service list, then use that to look for violations, otherwise use what is current
        const missing = resolvedServices
          ? resolvedServices.filter(isServiceMissingAllPlugins)
          : envServices.services.filter(isServiceMissingAllPlugins);

        if (missing.length != 0) {
          addValidationError(
            '[' +
              missing.map((s: any) => s.name).join(',') +
              '] missing or incomplete acl plugin.'
          );
        }
      } else if (flow == 'client-credentials') {
        assert.strictEqual(
          issuer != null,
          true,
          'Environment missing issuer details'
        );

        const envConfig = getIssuerEnvironmentConfig(issuer, envName);

        const isServiceMissingAllPlugins = isServiceMissingAllPluginsHandler(
          ['jwt-keycloak'],
          (plugin: any) =>
            plugin.config['well_known_template'].startsWith(envConfig.issuerUrl)
        );

        // If we are changing the service list, then use that to look for violations, otherwise use what is current
        const missing = resolvedServices
          ? resolvedServices.filter(isServiceMissingAllPlugins)
          : envServices.services.filter(isServiceMissingAllPlugins);

        if (missing.length != 0) {
          addValidationError(
            '[' +
              missing.map((s: any) => s.name).join(',') +
              '] missing or incomplete jwt-keycloak plugin.'
          );
        }
      } else if (flow == 'authorization-code') {
        assert.strictEqual(
          issuer != null,
          true,
          'Environment missing issuer details'
        );

        const envConfig = getIssuerEnvironmentConfig(issuer, envName);

        const isServiceMissingAllPlugins = isServiceMissingAllPluginsHandler(
          ['oidc'],
          (plugin: any) =>
            plugin.config['discovery'].startsWith(envConfig.issuerUrl)
        );

        // If we are changing the service list, then use that to look for violations, otherwise use what is current
        const missing = resolvedServices
          ? resolvedServices.filter(isServiceMissingAllPlugins)
          : envServices.services.filter(isServiceMissingAllPlugins);

        if (missing.length != 0) {
          addValidationError(
            '[' +
              missing.map((s: any) => s.name).join(',') +
              '] missing or incomplete oidc plugin.'
          );
        }
      } else if (flow == 'public') {
      } else {
        addValidationError(
          'Unexpected error when trying to validate the environment.'
        );
      }
    } catch (err) {
      logger.error('Validation threw an exception %s', err);
      if (err instanceof assert.AssertionError) {
        addValidationError(err.message);
      } else {
        addValidationError('Unexpected error validating environment');
      }
    }
  }
};

export function isServiceMissingAllPluginsHandler(
  requiredPlugins: string[],
  additionalValidation = (plugin: { name: string; config: object }) => true
) {
  return (svc: GatewayService) => {
    const serviceLevel =
      svc.plugins.filter(
        (plugin: any) =>
          requiredPlugins.includes(plugin.name) && additionalValidation(plugin)
      ).length == requiredPlugins.length;
    if (serviceLevel) {
      return false;
    } else {
      // check that at least one route has these plugins
      return (
        svc.routes.filter(
          (route) =>
            route.plugins.filter(
              (plugin: any) =>
                requiredPlugins.includes(plugin.name) &&
                additionalValidation(plugin)
            ).length == requiredPlugins.length
        ).length == 0
      );
    }
  };
}
