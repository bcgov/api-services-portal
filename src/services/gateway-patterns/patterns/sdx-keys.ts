import { RuntimeGroupService } from '../../../services/batch/runtime-group';
import assert from '../../user-assert';
import crypto from 'crypto';

export interface SDXKeyConfig extends Record<string, string> {
  organization: string;
  runtime_group_name: string;
  public_key_pem?: string;
  certificate_pem?: string;
}

interface SDXKeysPatternData {
  public_key_pem: string;
  gateway_id: string;
}

/**
 * This pattern will provision keys for SDX services.
 *
 * - Edge Server keys
 *
 */
export const SDXKeysPattern = {
  id: 'sdx-keys.r1',
  requiredParams: ['runtime_group_name', 'public_key_pem'],

  inject: async (
    ctx: any,
    inputs: Record<string, string>
  ): Promise<SDXKeysPatternData> => {
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

    let publicKeyPem = inputs.public_key_pem;

    // extract public key from certificate
    if (inputs.certificate_pem) {
      // Create an X509Certificate instance
      const cert = new crypto.X509Certificate(inputs.certificate_pem);

      // Access the publicKey object
      const publicKey = cert.publicKey;

      // Export the public key to a desired format (e.g., PEM, DER, JWK)
      // The 'type' can be 'pkcs1' (RSA only) or 'spki'
      // The 'format' can be 'pem', 'der', or 'jwk'
      publicKeyPem = publicKey.export({
        type: 'spki',
        format: 'pem',
      });
    }

    return {
      public_key_pem: publicKeyPem,
      gateway_id: rg.namespace,
    };
  },

  eval: (inputs: Record<string, string>, data: SDXKeysPatternData) => {
    const profile: any = {};
    profile.name = `sdx.keys.${inputs.runtime_group_name}.edge:0`;
    profile.kid = `urn:ca:bc:sdx:edge:${inputs.runtime_group_name}:edge`;
    profile.qualifier = `key-${inputs.runtime_group_name}`;
    profile.type = 'runtime-group';
    profile.value = inputs.runtime_group_name;

    let tags = [`ns.${data.gateway_id}.${profile.qualifier}`];

    let publicKeyPem = data.public_key_pem;

    const keySetName = `sdx.keyset.${inputs.runtime_group_name}.edge`;

    return [
      {
        _format_version: '3.0',
        key_sets: [
          {
            name: keySetName,
            tags,
          },
        ],
        keys: [
          {
            name: profile.name,
            kid: profile.kid,
            set: {
              name: keySetName,
            },
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
