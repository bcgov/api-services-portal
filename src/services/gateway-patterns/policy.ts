import cedar, {
  AuthorizationCall,
  EntityUid,
} from '@cedar-policy/cedar-wasm/nodejs';
import { Logger } from '../../logger';
import { SDXPolicy as SDX_R0_00_Policy } from './policies/SDX.R0.00';

const logger = Logger('gateway-patterns.policy');

const POLICY_REGISTRY: Record<
  string,
  { schema: string; policies: Record<string, string> }
> = {
  'SDX.R0.00': SDX_R0_00_Policy,
};

export interface PolicyResult {
  allowed: boolean;
  decision: 'allow' | 'deny' | 'error';
  reason: string[]; // policy IDs that contributed
  errors: string[];
}

type CedarValueJson =
  | string
  | number
  | boolean
  | null
  | CedarValueJson[]
  | { __entity: { type: string; id: string } }
  | { [key: string]: CedarValueJson };

/**
 * For a given connection configuration and a specified policy ID, there will be
 * a policy describing which patterns and upgrades are required
 * for the connection to be allowed. This function evaluates the policy
 * and returns a boolean indicating whether the connection is allowed or not.
 *
 *
 * @param principal
 * @param action
 * @param resource
 * @param context
 * @returns
 */
function EvaluatePolicy(
  policy: string,
  principal: EntityUid,
  action: EntityUid,
  resource: EntityUid,
  context: Record<string, CedarValueJson>
): PolicyResult {
  logger.info(`Cedar version: ${cedar.getCedarVersion()}`);

  const call: AuthorizationCall = {
    principal,
    action,
    resource,
    context,
    schema: POLICY_REGISTRY[policy].schema,
    policies: {
      staticPolicies: POLICY_REGISTRY[policy].policies,
    },
    entities: [],
  };

  // logger.debug('Call %j', call);

  // const vcall: ValidationCall = {
  //   schema: SDX_R0_00_Policy.schema,
  //   policies: {
  //     staticPolicies: SDX_R0_00_Policy.policies,
  //   },
  // };

  // const result = cedar.validate(vcall);
  // console.log(JSON.stringify(result, null, 4));

  const answer = cedar.isAuthorized(call);

  // logger.debug('Answer = %j', answer);

  if (answer.type === 'failure') {
    return {
      allowed: false,
      decision: 'error',
      reason: [
        answer.errors.map((e) => e.message).join('; ') ||
          'Cedar evaluation error',
      ],
      errors: answer.warnings.map((w) => w.message) ?? [
        'Cedar evaluation error',
      ],
    };
  }

  return {
    allowed: answer.response.decision === 'allow',
    decision: answer.response.decision,
    reason: answer.response.diagnostics.reason,
    errors:
      answer.response.diagnostics.errors.map((e) => e.error.message) ?? [],
  };
}

/**
 * Validate a Connection Request.
 */
export function validateConnectionRequest(
  ctx: Record<string, CedarValueJson>
): PolicyResult {
  return EvaluatePolicy(
    'SDX.R0.00',
    { type: 'SDX::User', id: 'system' },
    { type: 'SDX::Action', id: 'SubmitConnectionRequest' },
    { type: 'SDX::ConnectionRequest', id: `${ctx.clientId}:${ctx.serviceId}` },
    ctx as unknown as Record<string, CedarValueJson>
  );
}

/**
 *
 * @param pattern
 * @param ctx
 * @returns PolicyResult
 */
export function validateConsumerPolicy(
  pattern: string,
  ctx: Record<string, CedarValueJson>
): PolicyResult {
  return EvaluatePolicy(
    'SDX.R0.00',
    { type: 'SDX::User', id: 'system' },
    { type: 'SDX::Action', id: 'ApplyConsumerPattern' },
    { type: 'SDX::ConsumerPattern', id: `${pattern}` },
    ctx as unknown as Record<string, CedarValueJson>
  );
}

/**
 *
 * @param pattern
 * @param ctx
 * @returns PolicyResult
 */
export function validateProviderPolicy(
  pattern: string,
  ctx: Record<string, CedarValueJson>
): PolicyResult {
  return EvaluatePolicy(
    'SDX.R0.00',
    { type: 'SDX::User', id: 'system' },
    { type: 'SDX::Action', id: 'ApplyProviderPattern' },
    { type: 'SDX::ProviderPattern', id: `${pattern}` },
    ctx as unknown as Record<string, CedarValueJson>
  );
}
