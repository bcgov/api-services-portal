import cedar, {
  AuthorizationCall,
  EntityUid,
} from '@cedar-policy/cedar-wasm/nodejs';
import { SDXPolicy as SDX_R0_00_Policy } from './policies/SDX.R0.00/index.js';
import { SDXPolicy as SDX_R1_00_Policy } from './policies/SDX.R1.00/index.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';
import { BadRequestError } from '../errors/api-errors.js';
import type {
  ServiceCatalogEntry,
  SubsystemEntry,
} from '../clients/sdx-member/index.js';
import type {
  PolicyDefaultResources,
  PolicyDefaultsFn,
  PolicyRequesterDetails,
} from './policies/types.js';

export type { PolicyDefaultResources, PolicyRequesterDetails };

export class PolicyService {
  constructor(private readonly logger?: FastifyBaseLogger) {}

  /**
   * Validate a Connection Request.
   */
  validateConnectionRequest(
    policy: string,
    ctx: Record<string, CedarValueJson>
  ): PolicyResult {
    return EvaluatePolicy(
      policy,
      { type: 'SDX::User', id: 'system' },
      { type: 'SDX::Action', id: 'SubmitConnectionRequest' },
      {
        type: 'SDX::ConnectionRequest',
        id: `${ctx.clientId}:${ctx.serviceId}`,
      },
      ctx as unknown as Record<string, CedarValueJson>
    );
  }

  /**
   * The baseline `clientResources`/`serviceResources` a new connection
   * request should be built from for the given policy version. The client
   * subsystem, the service being connected to, and the requester details
   * are passed through so a policy's defaults can be derived from them.
   */
  getDefaultResources(
    policyVersion: string,
    subsystem: SubsystemEntry,
    service: ServiceCatalogEntry,
    requesterDetails: PolicyRequesterDetails
  ): PolicyDefaultResources {
    const policy = POLICY_REGISTRY[policyVersion];
    if (!policy) {
      throw new BadRequestError(`Policy ${policyVersion} not found in registry`);
    }
    return policy.defaults(subsystem, service, requesterDetails);
  }
}

const POLICY_REGISTRY: Record<
  string,
  {
    schema: string;
    policies: Record<string, string>;
    defaults: PolicyDefaultsFn;
  }
> = {
  'SDX.R0.00': SDX_R0_00_Policy,
  'SDX.R1.00': SDX_R1_00_Policy,
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
  if (!POLICY_REGISTRY[policy]) {
    throw new BadRequestError(`Policy ${policy} not found in registry`);
  }
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
