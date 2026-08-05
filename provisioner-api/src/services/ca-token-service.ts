import type { FastifyBaseLogger } from 'fastify';
import type { CaTokenApiClient } from '../clients/ca-token/index.js';
import type {
  CaTokenRequest,
  CaTokenResponse,
} from '../clients/ca-token/index.js';

/**
 * Drives the CA token endpoint (step-ca). Keyed by environment because each
 * environment has its own CA instance (`ca_token_url`).
 */
export class CaTokenService {
  constructor(
    private readonly api: CaTokenApiClient,
    private readonly logger?: FastifyBaseLogger
  ) {}

  /**
   * Requests a one-time-use certificate-signing token from the environment's
   * step-ca instance.
   */
  async generateCertToken(
    environment: string,
    input: CaTokenRequest
  ): Promise<CaTokenResponse> {
    this.logger?.debug({ environment }, 'CaTokenService.generateCertToken');

    return this.api.requestToken(environment, input);
  }
}
