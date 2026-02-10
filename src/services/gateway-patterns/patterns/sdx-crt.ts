import { parseOrganizationMemberDetails } from '../../keystone/organization';
import { RuntimeGroupService } from '../../batch/runtime-group';
import { RuntimeGroup } from '../../keystone/types';

export interface SDXCRTConfig extends Record<string, string> {
  runtime_group_name?: string;
  organization?: string;
  registration: string;
}

export interface SDXCRTRegistration {
  pub_key: string;
  csr: string;
  signing_algorithm: string;
  inputs: {
    country: string;
    org_name: string;
    serial_number: string;
    common_name: string;
    san: string;
  };
  key_id: string;
  jwk: {
    crv: string;
    y: string;
    x: string;
    kid: string;
    kty: string;
  };
}

export interface SDXCRTPatternData {
  runtimeGroup: RuntimeGroup;
}

/**
 * This pattern will provision keys for SDX services.
 *
 * - Organization signing keys
 * - Edge Server keys
 *
 */
export const SDXCRTPattern = {
  id: 'sdx-crt.r1',
  requiredParams: ['runtime_group_name', 'organization', 'registration'],

  inject: async (ctx: any, inputs: Record<string, string>) => {
    const rgService = new RuntimeGroupService();
    const runtimeGroup = await rgService.findRuntimeGroupByName(
      ctx,
      inputs.organization,
      inputs.runtime_group_name
    );

    return {
      runtimeGroup,
    };
  },

  eval: (inputs: Record<string, string>, data: SDXCRTPatternData) => {
    const profile: any = {};

    const member = parseOrganizationMemberDetails(
      data.runtimeGroup.organization.tags
    );

    profile.name = `sdx.crt.${data.runtimeGroup.name}.${member.memberClass}.${member.memberId}:0`;
    profile.qualifier = `crt-${data.runtimeGroup.name}.${member.memberClass}.${member.memberId}`;
    profile.type = 'orgcrt';
    profile.value = data.runtimeGroup.organization.name;

    let tags = [`ns.${inputs.gateway_id}.${profile.qualifier}`];

    const regDocument: SDXCRTRegistration = JSON.parse(
      Buffer.from(inputs.registration, 'base64').toString('utf-8')
    );

    regDocument.jwk.kid = regDocument.key_id;

    return [
      {
        _format_version: '3.0',
        keys: [
          {
            name: profile.name,
            kid: regDocument.key_id,
            jwk: JSON.stringify(regDocument.jwk),
            tags: [...tags, `type:${profile.type}`, `name:${profile.value}`],
          },
        ],
      },
    ];
  },
};
