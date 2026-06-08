import type { FastifyBaseLogger } from 'fastify';
import type { OAuthClient } from '../clients/oauth.js';
import {
  ConnectionRequestInput,
  SdxMemberApiClient,
} from '../clients/sdx-member/index.js';
import { SDXP2PConsumerPattern } from './gateway-patterns/sdx-p2p-consumer.js';
import { SDXP2PProviderPattern } from './gateway-patterns/sdx-p2p-provider.js';
import { SDXRuntimeGroupPattern } from './gateway-patterns/sdx-runtime-group.js';
import { SDXKeysPattern } from './gateway-patterns/sdx-keys.js';
import { SDXSubsystemsPattern } from './gateway-patterns/sdx-subsystem.js';
import { raiseValidateError } from './gateway-patterns/utils.js';
import {
  BadRequestError,
  NotFoundError,
  withDetails,
} from '../errors/api-errors.js';
import { PolicyService } from './policy-service.js';

export interface PatternOutput {
  documents: any[];
  _gateway_id?: string;
}

/**
 * A gateway pattern turns a small set of parameters into a list of gateway
 * resource documents. The optional `inject` step fetches the SDX Member data
 * the pattern needs (subsystems, services, connections, runtime groups, …)
 * through the typed {@link SdxMemberApiClient}.
 */
export interface PatternProcessor {
  id: string;
  requiredParams: string[];
  eval: (inputs: Record<string, any>, data?: any) => any[];
  inject?: (
    api: SdxMemberApiClient,
    inputs: Record<string, any>
  ) => Promise<any>;
}

const PATTERNS: Record<string, PatternProcessor> = {
  [SDXP2PConsumerPattern.id]: SDXP2PConsumerPattern,
  [SDXP2PProviderPattern.id]: SDXP2PProviderPattern,
  [SDXRuntimeGroupPattern.id]: SDXRuntimeGroupPattern,
  [SDXKeysPattern.id]: SDXKeysPattern,
  [SDXSubsystemsPattern.id]: SDXSubsystemsPattern,
};

export interface GatewayPatternConfig {
  pattern: string;
  //action?: 'preview' | 'apply' | 'diff' | 'delete';
  parameters: Record<string, any>;
}

/**
 * Evaluates gateway patterns against the SDX Member API. Construct one per
 * request from the authenticated `sdx` OAuth client.
 */
export class PatternsEvaluatorService {
  private readonly api: SdxMemberApiClient;
  readonly policyService: PolicyService;

  constructor(
    client: OAuthClient,
    private readonly logger?: FastifyBaseLogger
  ) {
    this.api = new SdxMemberApiClient(client, logger);
    this.policyService = new PolicyService(logger);
  }

  /**
   * Takes a ConnectionRequestChange event and gets the integrationId
   * and builds an IntegrationAccessRequest that will be forwarded
   * to CSS for provisioning
   */
  async buildResourcesUsingConnectionRequest(
    id: string,
    connection: ConnectionRequestInput
  ): Promise<PatternOutput[]> {
    const service = await this.api.getOASService(connection.serviceId);
    const orgName = service.subsystem.organization?.name;
    if (!orgName) {
      throw new NotFoundError(
        `Organization for service '${connection.serviceId}' not found`
      );
    }

    this.logger?.debug(
      { serviceId: connection.serviceId, org: orgName },
      'SdxMemberService.onConnectionRequestChange'
    );

    // run the policy check
    const policyResult = this.policyService.validateConnectionRequest(
      connection.policyVersion || '',
      connection as unknown as Record<string, any>
    );

    if (!policyResult.allowed) {
      this.logger?.error('Policy check failed: %j', policyResult);
      throw withDetails(
        new BadRequestError(
          `Connection request change not allowed by '${connection.policyVersion}' policy`
        ),
        {
          reason: policyResult,
        }
      );
    }

    this.logger?.debug('Policy check passed: %j', policyResult);

    // use the gateway patterns to create the resources
    const gatewayPatterns = {
      ...(connection.clientResources?.gatewayPatterns as any),
      ...(connection.serviceResources?.gatewayPatterns as any),
    };

    const results = [];
    for (const pattern of Object.keys(gatewayPatterns)) {
      const patternResult = await this.buildResourcesUsingPattern({
        pattern: pattern,
        parameters: {
          ...{
            conn_id: id,
          },
          ...gatewayPatterns[pattern],
        },
      });
      results.push(patternResult);
    }

    return results;
  }

  async buildResourcesUsingPattern(
    inputs: GatewayPatternConfig
  ): Promise<PatternOutput> {
    const pattern = PATTERNS[inputs.pattern];
    if (!pattern) {
      raiseValidateError(
        'Invalid input',
        'inputs.pattern',
        'unsupported pattern'
      );
    }

    this.expectRequiredParams(inputs.parameters, pattern.requiredParams);

    if (pattern.inject) {
      const data = await pattern.inject(this.api, inputs.parameters);
      this.logger?.info('Pattern inject data: %j', data);
      return {
        _gateway_id: data.gateway_id,
        documents: pattern.eval(inputs.parameters, data),
      };
    }

    return { documents: pattern.eval(inputs.parameters) };
  }

  private expectRequiredParams(
    provided: Record<string, any>,
    required: string[]
  ): void {
    const missing = required.filter((param) => !provided[param]);
    if (missing.length > 0) {
      raiseValidateError(
        'Invalid input',
        missing.join(', '),
        'missing required parameter'
      );
    }
  }
}
