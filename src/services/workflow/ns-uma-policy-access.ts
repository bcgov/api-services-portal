import { EnvironmentContext } from '../../lists/extensions/Common';
import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import { StructuredActivityService } from './namespace-activity';
import { enforceAccessToResource } from './ns-uma-perm-access';
import { Policy, UMAPolicyService } from '../uma2';

const logger = Logger('wf.nsumaperm');

export async function createUmaPolicy(
  context: any,
  envCtx: EnvironmentContext,
  resourceId: string,
  policy: Policy
) {
  logger.debug('[createUmaPolicy] %s %j', resourceId, policy);

  await enforceAccessToResource(envCtx, resourceId);

  const policyApi = new UMAPolicyService(
    envCtx.uma2.policy_endpoint,
    envCtx.accessToken
  );

  // name, scopes
  const umaPolicy = await policyApi.createUmaPolicy(resourceId, policy);

  await new StructuredActivityService(
    context.sudo(),
    context.authedItem['namespace']
  ).logNamespaceAccess(
    true,
    'granted',
    'namespace access',
    'client',
    policy.name,
    policy.scopes
  );

  return umaPolicy;
}

export async function updateUmaPolicy(
  context: any,
  envCtx: EnvironmentContext,
  resourceId: string,
  clientId: string,
  scopes: string[]
) {
  logger.debug('[updateUmaPolicy] %s policy %j', resourceId, clientId);

  await enforceAccessToResource(envCtx, resourceId);

  const policyApi = new UMAPolicyService(
    envCtx.uma2.policy_endpoint,
    envCtx.accessToken
  );

  const policies = await policyApi.listPolicies({ resource: resourceId });
  const policy = policies
    .filter((policy) => policy.clients?.includes(clientId))
    .pop();

  assert.strictEqual(Boolean(policy), true, 'No policy found for client');

  const addedScopes = scopes.filter((s) => !policy.scopes.includes(s));
  const deletedScopes = policy.scopes.filter((s) => !scopes.includes(s));

  policy.scopes = scopes;

  await policyApi.updateUmaPolicy(policy.id, policy);

  await new StructuredActivityService(
    context.sudo(),
    context.authedItem['namespace']
  ).logNamespaceAccess(
    true,
    'updated',
    'namespace access',
    'client',
    policy.name,
    [
      ...addedScopes.map((s) => `[+] ${s}`),
      ...deletedScopes.map((s) => `[-] ${s}`),
    ]
  );

  return policy;
}

export async function revokeUmaPolicy(
  context: any,
  envCtx: EnvironmentContext,
  resourceId: string,
  policyId: string
) {
  logger.debug('[revokeUmaPolicy] %s policy %s', resourceId, policyId);

  await enforceAccessToResource(envCtx, resourceId);

  const policyApi = new UMAPolicyService(
    envCtx.uma2.policy_endpoint,
    envCtx.accessToken
  );

  const policy = await policyApi.findPolicyByResource(resourceId, policyId);
  logger.warn('Policy %j', policy);

  await policyApi.deleteUmaPolicy(policyId);

  await new StructuredActivityService(
    context.sudo(),
    context.authedItem['namespace']
  ).logNamespaceAccess(
    true,
    'revoked',
    'namespace access',
    'client',
    policy.name,
    policy.scopes
  );
}
