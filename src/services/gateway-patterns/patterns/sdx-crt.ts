export interface SDXCRTConfig extends Record<string, string> {
  gateway_id: string;
  runtimeGroupName?: string;
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

/**
 * This pattern will provision keys for SDX services.
 *
 * - Organization signing keys
 * - Edge Server keys
 *
 */
export const SDXCRTPattern = {
  id: 'sdx-crt.r1',
  requiredParams: ['registration', 'gateway_id'],

  inject: async (ctx: any, inputs: Record<string, string>) => {},

  eval: (inputs: Record<string, string>) => {
    const profile: any = {};
    if (inputs.organization) {
      profile.name = `sdx.crt.${inputs.runtimeGroupName}.${inputs.organization}:0`;
      profile.qualifier = `crt-${inputs.runtimeGroupName}-${inputs.organization}`;
      profile.type = 'orgcrt';
      profile.value = inputs.organization;
    }

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
