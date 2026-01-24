export interface SDXKeyConfig extends Record<string, string> {
  gateway_id: string;
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
    const name = `sdx.key.${inputs.runtimeGroupName}.${inputs.organization}:0`;
    const kid = `urn:ca:bc:sdx:edge:${inputs.runtimeGroupName}:org:${inputs.organization}`;

    const nsQualifier = `key-${inputs.runtimeGroupName}-${inputs.organization}`;

    let tags = [`ns.${inputs.gateway_id}.${nsQualifier}`];

    let publicKeyPem = inputs.public_key_pem;

    let type = 'org';
    let value = inputs.organization;

    return [
      {
        _format_version: '3.0',
        keys: [
          {
            name,
            kid,
            pem: {
              public_key: `${publicKeyPem}`,
            },
            tags: [...tags, `type:${type}`, `name:${value}`],
          },
        ],
      },
    ];
  },
};
