import { parseOrganizationMemberDetails } from '../../keystone/organization';
import { RuntimeGroupService } from '../../batch/runtime-group';
import { RuntimeGroup } from '../../keystone/types';
import assert from 'assert';

export interface SDXCRTConfig extends Record<string, string> {
  runtime_group_name?: string;
  pub_key: string;
  jwk: string;
  csr: string;
  signing_algorithm: string;
  key_id: string;
  crt: string;
}

export interface SDXCRTPatternData {
  runtimeGroup: RuntimeGroup;
}

function splitCertificates(certs: string): string[] {
  const certArray = certs.split(/(?=-----BEGIN CERTIFICATE-----)/g);

  return certArray
    .map((cert) => Buffer.from(cert.trim()).toString('base64'))
    .filter((cert) => cert.length > 0);
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
  requiredParams: [
    'runtime_group_name',
    'pub_key',
    'csr',
    'signing_algorithm',
    'key_id',
    'crt',
  ],

  inject: async (ctx: any, inputs: Record<string, string>) => {
    const rgService = new RuntimeGroupService();
    const runtimeGroup = await rgService.findRuntimeGroupByUniqueName(
      ctx,
      inputs.runtime_group_name
    );

    assert.strictEqual(
      runtimeGroup.hostedOrganizations.filter(
        (o) => o.name === inputs.organization
      ).length > 0,
      true,
      'Runtime Group not allowed for organization'
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

    const memberText = `${member.memberClass}.${member.memberId}`.toLowerCase();
    profile.name = `sdx.crt.${data.runtimeGroup.name.toUpperCase()}.${
      member.memberClass
    }.${member.memberId}:0`;
    profile.qualifier = `crt-${data.runtimeGroup.name}.${memberText}`;
    profile.type = 'orgcrt';
    profile.value = data.runtimeGroup.organization.name;

    let tags = [`ns.${inputs.gateway_id}.${profile.qualifier}`];

    const jwk = JSON.parse(inputs.jwk);

    jwk.x5c = splitCertificates(inputs.crt);
    jwk.kid = inputs.key_id;

    return [
      {
        _format_version: '3.0',
        keys: [
          {
            name: profile.name,
            kid: jwk.kid,
            // pem: {
            //   public_key: `${inputs.pub_key}`,
            // },
            jwk: JSON.stringify(jwk),
            tags: [...tags, `type:${profile.type}`, `name:${profile.value}`],
          },
        ],
      },
    ];
  },
};
