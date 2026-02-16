import { RuntimeGroupService } from '../../../services/batch/runtime-group';
import assert from '../../user-assert';

export interface SDXKeyConfig extends Record<string, string> {
  organization: string;
  runtime_group_name: string;
  public_key_pem?: string;
  certificate_pem?: string;
}

/**
 * This pattern will provision keys for SDX services.
 *
 * - Edge Server keys
 *
 */
export const SDXKeyPattern = {
  id: 'sdx-key.r1',
  requiredParams: ['public_key_pem', 'gateway_id'],

  inject: async (ctx: any, inputs: Record<string, string>) => {
    // retrieve the runtime group details
    const rgService = new RuntimeGroupService();
    const rg = await rgService.findRuntimeGroupByUniqueName(
      ctx,
      inputs.runtime_group_name
    );

    assert.strictEqual(
      rg.organization.name === inputs.organization,
      true,
      'Organization does not own this runtime group'
    );

    inputs['gateway_id'] = rg.namespace;

    return {
      gateway_id: rg.namespace,
    };
  },

  eval: (inputs: Record<string, string>) => {
    const profile: any = {};
    profile.name = `sdx.key.${inputs.runtime_group_name}.edge:0`;
    profile.kid = `urn:ca:bc:sdx:edge:${inputs.runtime_group_name}:edge`;
    profile.qualifier = `key-${inputs.runtime_group_name}`;
    profile.type = 'runtime-group';
    profile.value = inputs.runtime_group_name;

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
