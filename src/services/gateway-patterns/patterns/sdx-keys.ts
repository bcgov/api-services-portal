export interface SDXKeyConfig extends Record<string, string> {
  runtimeGroupName?: string;
  organization?: string;
  public_key_pem: string;
  certificate_pem?: string;
}

/**
 * This pattern will provision keys for SDX services.
 *
 * - Organization signing keys
 * - Edge Server keys
 *
 */
export const SDXKeyPattern = {
  id: 'sdx-key.r1',
  requiredParams: ['public_key_pem', 'gateway_id'],

  inject: async (ctx: any, inputs: Record<string, string>) => {},

  eval: (inputs: Record<string, string>) => {
    const profile: any = {};
    if (inputs.organization) {
      profile.name = `sdx.key.${inputs.runtimeGroupName}.${inputs.organization}:0`;
      profile.kid = `urn:ca:bc:sdx:edge:${inputs.runtimeGroupName}:org:${inputs.organization}`;
      profile.qualifier = `key-${inputs.runtimeGroupName}-${inputs.organization}`;
      profile.type = 'org';
      profile.value = inputs.organization;
    } else {
      profile.name = `sdx.key.${inputs.runtimeGroupName}.edge:0`;
      profile.kid = `urn:ca:bc:sdx:edge:${inputs.runtimeGroupName}:edge`;
      profile.qualifier = `key-${inputs.runtimeGroupName}`;
      profile.type = 'runtime-group';
      profile.value = inputs.runtimeGroupName;
    }

    let tags = [`ns.${inputs.gateway_id}.${profile.qualifier}`];

    let publicKeyPem = inputs.public_key_pem;

    return [
      {
        _format_version: '3.0',
        keys: [
          {
            name: profile.name,
            kid: profile.kid,
            pem: {
              public_key: `${publicKeyPem}`,
            },
            tags: [...tags, `type:${profile.type}`, `name:${profile.value}`],
          },
        ],
      },
    ];
  },
};
