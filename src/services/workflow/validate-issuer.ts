import { Logger } from '../../logger';
import { getGwaProductEnvironment } from '.';
import { Keystone } from '@keystonejs/keystone';
import { KeycloakGroupService } from '../keycloak';
import { regExprValidation } from '../utils';

const logger = Logger('wf.ValidateIssuer');

export const ValidateIssuer = async (
  context: any,
  operation: any,
  existingItem: any,
  originalInput: any,
  resolvedData: any,
  addValidationError: any
) => {
  if ('name' in originalInput) {
    regExprValidation(
      '^[a-zA-Z][a-zA-Z0-9 -]{4,40}$',
      originalInput['name'],
      'Profile name must be between 5 and 40 alpha-numeric (or space, dash) characters and begin with an alphabet'
    );
  }
  const isSharedIdP =
    operation === 'create'
      ? 'inheritFrom' in resolvedData
      : 'inheritFrom' in existingItem;
  if (
    isSharedIdP &&
    'availableScopes' in originalInput &&
    originalInput['availableScopes'] != '[]'
  ) {
    addValidationError('Client Scopes not supported with Shared IdP');
  }

  if (operation === 'create' && 'isShared' in originalInput) {
    const privileged = await isNamespacePrivileged(
      context,
      resolvedData['namespace']
    );
    if (!privileged) {
      logger.warn(
        '[%s] Setting shared is only available in privileged gateways',
        resolvedData['namespace']
      );
      addValidationError(
        'Setting shared is only available in privileged gateways'
      );
    }
  }
};

async function isNamespacePrivileged(
  ctx: Keystone,
  ns: string
): Promise<boolean> {
  const prodEnv = await getGwaProductEnvironment(ctx, false);
  const envConfig = prodEnv.issuerEnvConfig;

  const svc = new KeycloakGroupService(envConfig.issuerUrl);
  await svc.login(envConfig.clientId, envConfig.clientSecret);

  const nsGroup = await svc.findByName('ns', ns, false);

  if ('perm-protected-ns' in nsGroup.attributes) {
    const perm = nsGroup.attributes['perm-protected-ns'].pop();
    return perm === 'allow';
  }
  return false;
}
