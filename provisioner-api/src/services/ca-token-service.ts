import type { FastifyBaseLogger } from 'fastify';
import type { CaTokenApiClient } from '../clients/ca-token/index.js';
import type { CaTokenResponse } from '../clients/ca-token/index.js';
import type { SdxMemberApiClient } from '../clients/sdx-member/index.js';
import { BadRequestError } from '../errors/api-errors.js';

/**
 * Drives the CA token endpoint (step-ca). Keyed by environment because each
 * environment has its own CA instance (`ca_token_url`).
 */
export class CaTokenService {
  constructor(
    private readonly sdxMember: SdxMemberApiClient,
    private readonly api: CaTokenApiClient,
    private readonly logger?: FastifyBaseLogger
  ) {}

  /**
   * Requests a one-time-use certificate-signing token from the environment's
   * step-ca instance. The certificate subject and SANs are derived from the
   * runtime group's host and SDX endpoint rather than accepted from the
   * caller, since the runtime group named in the path is the only thing
   * that's authoritative for them.
   */
  async generateCertToken(
    org: string,
    runtimeGroup: string,
    environment: string
  ): Promise<CaTokenResponse> {
    this.logger?.debug(
      { org, runtimeGroup, environment },
      'CaTokenService.generateCertToken'
    );

    // The certificate is being minted for a runtime group the org owns
    // (unlike the CSR flow, which resolves against hosted/available runtime
    // groups), so look it up with the 'owned' filter.
    const rgList = await this.sdxMember.listRuntimeGroups(org, {
      filter: 'owned',
    });
    const rg = rgList.find(
      (rg) => rg.name === runtimeGroup && rg.environment === environment
    );

    if (!rg || !rg.host) {
      throw new BadRequestError(
        `Runtime Group ${runtimeGroup} not found for org ${org} in environment ${environment}`
      );
    }

    // The SANs should include the runtime group's host and the SDX
    // endpoint's hostname (if different) to ensure the certificate is valid
    // for both.
    const san = [rg.host];
    if (rg.sdxEndpoint) {
      try {
        const hostname = new URL(rg.sdxEndpoint).hostname;
        if (hostname !== rg.host) {
          san.push(hostname);
        }
      } catch (err) {
        this.logger?.warn(
          { sdxEndpoint: rg.sdxEndpoint, runtimeGroup, environment },
          'Invalid SDX endpoint URL for runtime group'
        );
      }
    }

    return this.api.requestToken(environment, { subject: rg.host, san });
  }
}
