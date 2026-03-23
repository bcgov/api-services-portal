import { RuntimeGroupService } from '../../../services/batch/runtime-group';
import assert from '../../user-assert';
import crypto from 'crypto';

function splitCertificates(certs: string): string[] {
  const certArray = certs.split(/(?=-----BEGIN CERTIFICATE-----)/g);

  return certArray
    .map((cert) => Buffer.from(cert.trim()).toString('base64'))
    .filter((cert) => cert.length > 0);
}

export interface SDXKeyConfig extends Record<string, string> {
  organization: string;
  runtime_group_name: string;
  public_key_pem?: string;
  certificate_pem?: string;
  x5c?: string;
}

interface SDXKeysPatternData {
  jwk: any;
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
  requiredParams: ['organization', 'runtime_group_name'],

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

    let jwk: any = null;
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
      }) as string;

      if (inputs.x5c) {
        jwk = publicKey.export({
          format: 'jwk',
        } as any);
        jwk.x5c = splitCertificates(inputs.x5c);
      }
    }

    return {
      jwk,
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

    const keySetName = `sdx.edge.${inputs.runtime_group_name}`;

    const key = {
      kind: 'GatewayKey',
      name: profile.name,
      kid: profile.kid,
      set: {
        name: keySetName,
      },
      pem: {
        public_key: `${publicKeyPem}`,
      },
      jwk: data.jwk,
      tags: [...tags, `type:${profile.type}`, `name:${profile.value}`],
    };

    if (data.jwk) {
      delete key.pem;
    } else {
      delete key.jwk;
    }

    return [
      {
        kind: 'GatewayKeySet',
        name: keySetName,
        tags,
      },
      key,
    ];
  },
};
