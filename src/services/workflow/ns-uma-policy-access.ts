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
    'namespace access',
    'client',
    policy.name,
    policy.scopes.map((s) => `[+] ${s}`)
  );

  return umaPolicy;
}

/**
 * ERR-014 (follow-on): createSDXNamespace unconditionally called
 * createUmaPolicy after CreateNamespace, which is fine on first
 * registration but 409-conflicts ("Policy ... already exists") on any
 * retry once CreateNamespace itself became a reconcile instead of
 * create-only - reusing the existing namespace resource still hit this
 * unconditional create.
 *
 * Tries create first and, on a 409 from that create call, treats it as
 * already-correctly-configured rather than an error.
 *
 * This deliberately doesn't attempt a full reconcile (diffing and
 * re-applying scopes via updateUmaPolicy): that path also depends on
 * listPolicies, and live testing found the UMA protection API's list
 * endpoint (GET .../uma-policy?resource=...) rejects the same
 * envCtx.accessToken the create POST accepts, with `invalid_bearer_token`,
 * in this environment - a separate, pre-existing gap in this Keycloak
 * client's protection-API permissions, not something introduced here.
 * Treating 409-already-exists as success avoids that broken call and
 * fixes the actual reported symptom (registration retry always failing);
 * it just can't detect or repair a policy whose scopes have drifted from
 * what a fresh registration would create.
 */
export async function upsertUmaPolicy(
  context: any,
  envCtx: EnvironmentContext,
  resourceId: string,
  policy: Policy
) {
  try {
    return await createUmaPolicy(context, envCtx, resourceId, policy);
  } catch (err) {
    const statusCode = (err as any)?.errors?.[0]?.statusCode;
    if (statusCode !== 409) {
      throw err;
    }
    logger.debug(
      '[upsertUmaPolicy] policy already exists for %s, treating as already-configured: %j',
      resourceId,
      policy
    );
    return { name: policy.name };
  }
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
  ).logNamespaceAccess(true, 'namespace access', 'client', policy.name, [
    ...addedScopes.map((s) => `[+] ${s}`),
    ...deletedScopes.map((s) => `[-] ${s}`),
  ]);

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
    'namespace access',
    'client',
    policy.name,
    policy.scopes.map((s) => `[-] ${s}`)
  );
}
