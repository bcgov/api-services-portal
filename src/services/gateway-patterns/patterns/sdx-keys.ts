import { SubsystemService } from '../../../services/batch/subsystem';
import { RuntimeGroupService } from '../../../services/batch/runtime-group';
import assert from '../../user-assert';
import crypto, { X509Certificate } from 'crypto';
import {
  getOrganization,
  parseOrganizationMemberDetails,
} from '../../../services/keystone/organization';
import { Logger } from '../../../logger';

const logger = Logger('sdx-keys-pattern');

function splitCertificates(certs: string, encoding: BufferEncoding): string[] {
  const certArray = certs.split(/(?=-----BEGIN CERTIFICATE-----)/g);

  return certArray
    .map((cert) => Buffer.from(cert.trim()).toString(encoding))
    .filter((cert) => cert.length > 0);
}

export interface SDXKeyConfig extends Record<string, any> {
  organization: string;
  runtime_group_name?: string;
  client_id?: string;
  public_key_pem?: string;
  certificate_pem?: string[];
  ca_certs?: string;
}

interface SDXKeysPatternData {
  jwk_list: any[];
  public_key_pem: string;
  gateway_id: string;
  profile: {
    name: string;
    kid: string;
    qualifier: string;
    type: string;
    value: string;
    keySetName: string;
  };
}

/**
 * This pattern will provision keys for the following SDX use cases:
 *
 * - Edge Server signing keys
 * - Organization signing keys
 * - Subsystem (client_id) signing keys
 *
 */
export const SDXKeysPattern = {
  id: 'sdx-keys.r1',
  requiredParams: ['organization'],

  inject: async (
    ctx: any,
    inputs: Record<string, any>
  ): Promise<SDXKeysPatternData> => {
    const profile: any = {};

    if (inputs.runtime_group_name) {
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

      profile.keySetName = `sdx.e.${inputs.runtime_group_name}`;
      profile.name = `sdx.keys.${inputs.runtime_group_name}.edge`;
      profile.kid = `urn:ca:bc:sdx:edge:${inputs.runtime_group_name}`;
      profile.qualifier = `key-${inputs.runtime_group_name}`;
      profile.type = 'runtime-group';
      profile.value = inputs.runtime_group_name;
      profile.gateway_id = rg.namespace;
    } else if (inputs.client_id) {
      // retrieve the subsystem details for the client_id
      const subsysService = new SubsystemService();
      const subsystem = await subsysService.findSubsystemByClientId(
        ctx,
        inputs.client_id
      );

      assert.strictEqual(
        subsystem.organization.name === inputs.organization,
        true,
        'Organization does not own this client subsystem'
      );

      profile.keySetName = `sdx.c.${inputs.client_id.toLowerCase()}`;
      profile.name = `sdx.keys.${inputs.client_id}.client`;
      profile.kid = `urn:ca:bc:sdx:client:${inputs.client_id}`;
      profile.qualifier = `key-${inputs.client_id}`;
      profile.type = 'client';
      profile.value = inputs.client_id;
      profile.gateway_id = subsystem.namespace;
    } else {
      // assume organization
      const org = await getOrganization(ctx, inputs.organization);

      const member = parseOrganizationMemberDetails(org.tags);

      const memberText = `${member.memberClass}.${member.memberId}`.toLowerCase();

      profile.keySetName = `sdx.o.${memberText}`;
      profile.name = `sdx.keys.${memberText}.org`;
      profile.kid = `urn:ca:bc:sdx:org:${memberText}`;
      profile.qualifier = `key-${memberText}`;
      profile.type = 'organization';
      profile.value = inputs.organization;
      profile.gateway_id = `sdx-o-${memberText}`;
    }

    let jwkList: any[] = [];
    let publicKeyPem = inputs.public_key_pem;

    // extract public key from certificate
    if (inputs.certificate_pem) {
      for (const certPem of inputs.certificate_pem) {
        // Create an X509Certificate instance
        const certs = splitCertificates(certPem, 'utf8');

        const cert = new crypto.X509Certificate(certs[0]);

        // Access the publicKey object
        const publicKey = cert.publicKey;

        // Export the public key to a desired format (e.g., PEM, DER, JWK)
        // The 'type' can be 'pkcs1' (RSA only) or 'spki'
        // The 'format' can be 'pem', 'der', or 'jwk'
        publicKeyPem = publicKey.export({
          type: 'spki',
          format: 'pem',
        }) as string;

        if (inputs.ca_certs) {
          const caCerts = splitCertificates(inputs.ca_certs, 'utf8');
          const fullChain = [...certs, ...caCerts];
          const result = verifyCertificateChain(fullChain);
          if (!result.valid) {
            throw new Error(
              `Certificate chain verification failed: ${result.error}`
            );
          }

          const jwk: any = publicKey.export({
            format: 'jwk',
          } as any);
          jwk.x5c = splitCertificates(fullChain.join('\n'), 'base64');
          jwkList.push(jwk);
        }
      }
    }

    return {
      profile,
      jwk_list: jwkList,
      public_key_pem: publicKeyPem,
      gateway_id: profile.gateway_id,
    };
  },

  eval: (_inputs: Record<string, string>, data: SDXKeysPatternData) => {
    const profile = data.profile;

    let tags = [`ns.${data.gateway_id}.${profile.qualifier}`];

    let publicKeyPem = data.public_key_pem;

    const keySetName = profile.keySetName;

    const keys = data.jwk_list.map((jwk, index) => {
      const key = {
        kind: 'GatewayKey',
        name: `${profile.name}:${index}`,
        kid: `${profile.kid}:${index}`,
        set: {
          name: keySetName,
        },
        pem: {
          public_key: `${publicKeyPem}`,
        },
        jwk,
        tags: [...tags, `type:${profile.type}`, `name:${profile.value}`],
      };

      if (jwk) {
        delete key.pem;
      } else {
        delete key.jwk;
      }
      return key;
    });

    return [
      ...[
        {
          kind: 'GatewayKeySet',
          name: keySetName,
          tags,
        },
      ],
      ...keys,
    ];
  },
};

function verifyCertificateChain(
  chainPems: string[]
): { valid: boolean; error?: string } {
  logger.info(
    'Verifying certificate chain with %d certificates',
    chainPems.length
  );

  try {
    const certs = chainPems.map((pem) => new X509Certificate(pem));

    for (let i = 0; i < certs.length - 1; i++) {
      const subject = certs[i];
      const issuer = certs[i + 1];

      logger.info('Eval %j', subject.subject);
      // Check issuer name matches
      if (subject.issuer !== issuer.subject) {
        return {
          valid: false,
          error: `Chain broken at depth ${i}: issuer mismatch`,
        };
      }

      // Verify signature
      if (!subject.verify(issuer.publicKey)) {
        return { valid: false, error: `Signature invalid at depth ${i}` };
      }
    }

    // Check root is self-signed
    const root = certs[certs.length - 1];
    if (!root.verify(root.publicKey)) {
      return { valid: false, error: 'Root cert is not self-signed' };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: (err as Error).message };
  }
}
