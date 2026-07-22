import type { FastifyBaseLogger } from 'fastify';
import type { SdxOperatorApiClient } from '../clients/sdx-operator/index.js';
import type { CsrRequest, CsrResponse } from '../clients/sdx-operator/index.js';
import { SdxMemberApiClient } from '../clients/sdx-member/index.js';
import { BadRequestError } from '../errors/api-errors.js';

interface CatalogOrganization {
  name: string;
  title: string;
  description?: string;
  member: {
    memberClass: string;
    memberId: string;
  };
}

/**
 * Drives the SDX Operator edge server. Keyed by environment because each
 * environment has its own edge endpoint (`operator_edge_url`).
 */
export class SdxOperatorService {
  constructor(
    private readonly sdxMember: SdxMemberApiClient,
    private readonly api: SdxOperatorApiClient,
    private readonly logger?: FastifyBaseLogger
  ) {}

  /**
   * Requests a new key pair and CSR for a runtime group from the environment's
   * edge server.
   */
  async createCsr(
    org: string,
    runtimeGroup: string,
    environment: string,
    input: { requester_name?: string; requester_email?: string }
  ): Promise<CsrResponse> {
    this.logger?.debug(
      { runtimeGroup, environment },
      'SdxOperatorService.createCsr'
    );

    // get the Runtime Group detail
    const rgList = await this.sdxMember.listRuntimeGroups(org, {
      filter: 'available',
    });
    const rg = rgList.find(
      (rg) => rg.name === runtimeGroup && rg.environment === environment
    );

    if (!rg) {
      throw new BadRequestError(
        `Runtime Group ${runtimeGroup} not found for org ${org} in environment ${environment}`
      );
    }

    const organization = (await this.sdxMember.listOrganizations())
      .map((o) => o as CatalogOrganization)
      .find((o: any) => o.name === org);

    if (!organization) {
      throw new BadRequestError(`Organization ${org} not found`);
    }

    const member = organization.member;

    const san = `${member.memberClass}-${
      member.memberId
    }.${rg.name}.${environment}.servers.sdx`.toLocaleLowerCase();

    const body: CsrRequest = {
      country: 'CA',
      org_name: organization.title,
      serial_number: `${environment.toLocaleUpperCase()}/${
        member.memberClass
      }/${rg.name!.toUpperCase()}`,
      common_name: member.memberId,
      san: san,
      requester_name: input.requester_name,
      requester_email: input.requester_email,
    };

    return this.api.createCsr(environment, runtimeGroup, body);
  }
}
