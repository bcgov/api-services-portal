import type { FastifyBaseLogger } from 'fastify';
import type { StepCaApiClient } from '../clients/step-ca/index.js';
import type { TokenResponse } from '../clients/step-ca/types.js';
import { SdxMemberApiClient } from '../clients/sdx-member/index.js';
import { BadRequestError } from '../errors/api-errors.js';

/**
 * Drives step-ca. Keyed by environment because each environment has its own
 * step-ca instance (`step_ca_url`).
 */
export class StepCaService {
  constructor(
    private readonly sdxMember: SdxMemberApiClient,
    private readonly api: StepCaApiClient,
    private readonly logger?: FastifyBaseLogger
  ) {}

  /**
   * Requests a one-time-use certificate-signing token for a runtime group
   * from the environment's step-ca instance.
   */
  async generateToken(
    org: string,
    runtimeGroup: string,
    environment: string
  ): Promise<TokenResponse> {
    this.logger?.debug(
      { runtimeGroup, environment },
      'StepCaService.generateToken'
    );

    // 'owned' (not 'available'): the token is for the org's own edge server,
    // and the 'available' filter (runtime groups merely *hosting* the org)
    // strips `host`/`sdxEndpoint` server-side as an information boundary for
    // non-owning orgs.
    const rgList = await this.sdxMember.listRuntimeGroups(org, {
      filter: 'owned',
    });
    const rg = rgList.find(
      (rg) => rg.name === runtimeGroup && rg.environment === environment
    );

    if (!rg) {
      throw new BadRequestError(
        `Runtime Group ${runtimeGroup} not found for org ${org} in environment ${environment}`
      );
    }
    if (!rg.host) {
      throw new BadRequestError(
        `Runtime Group ${runtimeGroup} has no host configured`
      );
    }

    let sdxEndpoint: URL;
    try {
      sdxEndpoint = new URL(rg.sdxEndpoint ?? '');
    } catch {
      throw new BadRequestError(
        `Runtime Group ${runtimeGroup} does not have a valid sdxEndpoint URL required for requesting a token`
      );
    }

    // The subject alternative names (SANs) for the certificate should include
    // the runtime group's host and the SDX endpoint hostname (if different)
    // to ensure the certificate is valid for both.
    const san = [rg.host];
    if (sdxEndpoint.hostname !== rg.host) {
      san.push(sdxEndpoint.hostname);
    }

    return this.api.requestToken(environment, { subject: rg.host, san });
  }
}
