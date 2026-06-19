import type { FastifyBaseLogger } from 'fastify';
import type { OAuthClient } from '../clients/oauth.js';
import {
  ConnectionRequestInput,
  SdxMemberApiClient,
  ServiceCatalogEntry,
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

import { Environments } from './policies/env.js';

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
  eval: (inputs: any, data?: any) => any[];
  inject?: (api: SdxMemberApiClient, inputs: any) => Promise<any>;
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
    service: ServiceCatalogEntry,
    connection: ConnectionRequestInput
  ): Promise<PatternOutput[]> {
    if (connection.environment !== service.environment) {
      throw new BadRequestError(
        `Connection request environment '${connection.environment}' does not match service environment '${service.environment}'`
      );
    }

    const combinedScopes = [
      ...(connection.requesterDetails.scopes || []),
      connection.requesterDetails.service.privacyZone,
    ];

    const policyContext = {
      ...connection,
      combinedScopes,
      globals: {
        environment: Environments[connection.environment],
      },
    };

    this.logger?.debug('Evaluting policy with %j', policyContext);

    // run the policy check
    const policyResult = this.policyService.validateConnectionRequest(
      connection.policyVersion || '',
      policyContext
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
            connId: id,
            clientId: connection.clientId,
            serviceId: connection.serviceId,
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
      this.logger?.info('Pattern inject data for %s: %j', inputs.pattern, data);
      return {
        _gateway_id: data.gatewayId,
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
