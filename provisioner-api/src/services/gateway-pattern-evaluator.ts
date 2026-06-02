import type { FastifyBaseLogger } from 'fastify';
import type { OAuthClient } from '../clients/oauth.js';
import { SdxMemberApiClient } from '../clients/sdx-member/index.js';
import { SDXP2PConsumerPattern } from './gateway-patterns/sdx-p2p-consumer.js';
import { SDXP2PProviderPattern } from './gateway-patterns/sdx-p2p-provider.js';
import { SDXRuntimeGroupPattern } from './gateway-patterns/sdx-runtime-group.js';
import { SDXKeysPattern } from './gateway-patterns/sdx-keys.js';
import { SDXSubsystemsPattern } from './gateway-patterns/sdx-subsystem.js';
import { raiseValidateError } from './gateway-patterns/utils.js';

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
  action?: 'preview' | 'apply' | 'diff' | 'delete';
  parameters: Record<string, any>;
}

/**
 * Evaluates gateway patterns against the SDX Member API. Construct one per
 * request from the authenticated `sdx` OAuth client.
 */
export class GatewayPatternEvaluatorService {
  private readonly api: SdxMemberApiClient;

  constructor(
    client: OAuthClient,
    private readonly logger?: FastifyBaseLogger
  ) {
    this.api = new SdxMemberApiClient(client, logger);
  }

  async GetConfigUsingPattern(
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
