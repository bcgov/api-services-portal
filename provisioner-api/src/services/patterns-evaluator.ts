import type { FastifyBaseLogger } from 'fastify';
import {
  ConnectionRequestInput,
  SdxMemberApiClient,
  ServiceCatalogEntry,
} from '../clients/sdx-member/index.js';
import { SDXP2PConsumerPattern } from './gateway-patterns/sdx-p2p-consumer.js';
import { SDXP2PConsumerAccessPattern } from './gateway-patterns/sdx-p2p-consumer-access.js';
import { SDXP2PProviderPattern } from './gateway-patterns/sdx-p2p-provider.js';
import { SDXRuntimeGroupPattern } from './gateway-patterns/sdx-runtime-group.js';
import { SDXKeysPattern } from './gateway-patterns/sdx-keys.js';
import { SDXServicePattern } from './gateway-patterns/sdx-service.js';
import { raiseValidateError } from './gateway-patterns/utils.js';
import { BadRequestError, withDetails } from '../errors/api-errors.js';
import { PolicyService } from './policy-service.js';

import { loadEnvironments } from '../config/environments.js';
import { SDXSubsystemPattern } from './gateway-patterns/sdx-subsystem.js';
import { IntegrationAccessService } from './integration-access-service.js';

export interface PatternOutput {
  documents: any[];
  _delete_handling?: 'delete' | 'apply';
  _gateway_id?: string;
}

/**
 * A gateway pattern turns a small set of parameters into a list of gateway
 * resource documents. The optional `inject` step fetches the SDX Member data
 * the pattern needs (subsystems, services, connections, runtime groups, …)
 * through the typed {@link SdxMemberApiClient}.
 */
export interface PatternProcessor {
  id: () => string;
  requiredParams: () => string[];
  eval: (inputs: any, data?: any) => any[];
  inject?: (inputs: any) => Promise<any>;
  deleteHandling: (data?: any) => 'delete' | 'apply';
}

export interface GatewayPatternConfig {
  patternName: string;
  parameters: Record<string, any>;
}

/**
 * Evaluates gateway patterns against the SDX Member API. Construct one per
 * request from the authenticated `sdx` OAuth client.
 */
export class PatternsEvaluatorService {
  private readonly patterns: Record<string, PatternProcessor>;

  constructor(
    private readonly policyService: PolicyService,
    sdx: SdxMemberApiClient,
    integrationAccessService: IntegrationAccessService,
    private readonly logger?: FastifyBaseLogger
  ) {
    this.patterns = {
      [SDXKeysPattern.ID]: new SDXKeysPattern(sdx, logger),
      [SDXP2PConsumerAccessPattern.ID]: new SDXP2PConsumerAccessPattern(
        sdx,
        integrationAccessService,
        logger
      ),
      [SDXP2PConsumerPattern.ID]: new SDXP2PConsumerPattern(sdx, logger),
      [SDXP2PProviderPattern.ID]: new SDXP2PProviderPattern(sdx, logger),
      [SDXRuntimeGroupPattern.ID]: new SDXRuntimeGroupPattern(sdx, logger),
      [SDXServicePattern.ID]: new SDXServicePattern(sdx, logger),
      [SDXSubsystemPattern.ID]: new SDXSubsystemPattern(sdx, logger),
    };
  }

  /**
   * Takes a ConnectionRequestChange event and gets the integrationId
   * and builds an IntegrationAccessRequest that will be forwarded
   * to CSS for provisioning
   */
  async buildResourcesUsingConnectionRequest(
    id: string,
    action: 'preview' | 'apply' | 'diff' | 'delete',
    service: ServiceCatalogEntry,
    connection: ConnectionRequestInput
  ): Promise<PatternOutput[]> {
    if (connection.environment !== service.environment) {
      throw new BadRequestError(
        `Connection request environment '${connection.environment}' does not match service environment '${service.environment}'`
      );
    }

    // only do the policy check for preview, apply and diff actions, not for delete
    if (action !== 'delete') {
      const combinedScopes = [...(connection.requesterDetails?.scopes || [])];
      if (connection.requesterDetails?.service?.privacyZone) {
        combinedScopes.push(connection.requesterDetails.service.privacyZone);
      }

      const {
        provisionerStatus: _provisionerStatus,
        ...policyConnection
      } = connection;
      const policyContext = {
        ...policyConnection,
        combinedScopes,
        action,
        globals: {
          environment: loadEnvironments()[connection.environment],
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
    }

    // use the gateway patterns to create the resources
    const gatewayPatterns = {
      ...(connection.clientResources?.gatewayPatterns as any),
      ...(connection.serviceResources?.gatewayPatterns as any),
    };

    this.logger?.debug(
      'Evaluating patterns: %s',
      Object.keys(gatewayPatterns).join(', ')
    );

    const results = [];
    for (const patternName of Object.keys(gatewayPatterns)) {
      this.logger?.debug(
        'Building resources using pattern %s with parameters %j',
        patternName,
        gatewayPatterns[patternName]
      );
      const patternResult = await this.buildResourcesUsingPattern({
        patternName: patternName,
        parameters: {
          ...{
            connId: id,
            clientId: connection.clientId,
            serviceId: connection.serviceId,
          },
          ...gatewayPatterns[patternName],
        },
      });
      results.push(patternResult);
    }

    return results;
  }

  /**
   *
   * @param inputs
   * @returns PatternOutput
   */
  async buildResourcesUsingPattern({
    patternName,
    parameters,
  }: GatewayPatternConfig): Promise<PatternOutput> {
    const pattern = this.patterns[patternName];
    if (!pattern) {
      raiseValidateError('Invalid input', 'pattern', 'unsupported pattern');
    }

    this.expectRequiredParams(parameters, pattern.requiredParams());

    if (pattern.inject) {
      const data = await pattern.inject(parameters);
      this.logger?.info('Pattern inject data for %s: %j', patternName, data);
      return {
        _gateway_id: data.gatewayId,
        _delete_handling: pattern.deleteHandling(data),
        documents: pattern.eval(parameters, data),
      };
    }

    return { documents: pattern.eval(parameters) };
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
