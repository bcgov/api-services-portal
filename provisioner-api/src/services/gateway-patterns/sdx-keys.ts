import crypto, { X509Certificate } from 'crypto';
import type { SdxMemberApiClient } from '../../clients/sdx-member/index.js';
import { assert } from './utils.js';

function splitCertificates(certs: string, encoding: BufferEncoding): string[] {
  const certArray = certs.split(/(?=-----BEGIN CERTIFICATE-----)/g);

  return certArray
    .map((cert) => Buffer.from(cert.trim()).toString(encoding))
    .filter((cert) => cert.length > 0);
}

export interface SDXKeyConfig {
  organization: string;
  runtimeGroupName?: string;
  environment?: string;
  clientId?: string;
  publicKeyPem?: string;
  certificatePem?: string[];
  caCerts?: string;
}

interface SDXKeysPatternData {
  jwkList: any[];
  publicKeyPem: string;
  gatewayId: string;
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
  requiredParams: [],

  inject: async (
    api: SdxMemberApiClient,
    inputs: SDXKeyConfig
  ): Promise<SDXKeysPatternData> => {
    const profile: any = {};

    if (inputs.runtimeGroupName) {
      // retrieve the runtime group details owned by the organization
      const owned = await api.listRuntimeGroups(inputs.organization, {
        filter: 'owned',
      });
      const rg = owned.find((g) => g.name === inputs.runtimeGroupName);

      assert.strictEqual(
        Boolean(rg),
        true,
        'Organization does not own this runtime group'
      );

      profile.keySetName = `sdx.edge.${inputs.runtimeGroupName}`;
      profile.name = `sdx.keys.${inputs.runtimeGroupName}.edge`;
      profile.kid = `urn:ca:bc:sdx:edge:${inputs.runtimeGroupName}`;
      profile.qualifier = `key-${inputs.runtimeGroupName}`;
      profile.type = 'runtime-group';
      profile.value = inputs.runtimeGroupName;
      profile.gatewayId = rg!.gatewayId;
    } else if (inputs.clientId) {
      // retrieve the subsystem details for the client_id
      const subsystem = await api.getCatalogSubsystem(inputs.clientId);

      const orgSubsystem = await api.getSubsystemClient(
        subsystem.organization?.name!,
        subsystem.name
      );

      const id = inputs.clientId.toLowerCase();

      profile.keySetName = `sdx.sys.${id}`;
      profile.name = `sdx.keys.${id}.sys`;
      profile.kid = `urn:ca:bc:sdx:sys:${id}`;
      profile.qualifier = `key-${id}`;
      profile.type = 'client';
      profile.value = inputs.clientId;
      profile.gatewayId = orgSubsystem.gateway?.id;
    } else {
      // assume organization — resolve the member details from any subsystem
      // belonging to the organization in the catalog.
      const organizations: any = await api.listOrganizations();
      const orgMember = organizations.find(
        (s: any) => s.name === inputs.organization && s.member
      );

      assert.strictEqual(
        Boolean(orgMember),
        true,
        'Organization member details not found'
      );

      const member = orgMember!.member!;

      const memberText =
        `${member.memberClass}.${member.memberId}`.toLowerCase();

      profile.keySetName = `sdx.org.${memberText}`;
      profile.name = `sdx.keys.${memberText}.org`;
      profile.kid = `urn:ca:bc:sdx:org:${memberText}`;
      profile.qualifier = `key-${memberText}`;
      profile.type = 'organization';
      profile.value = inputs.organization;
      profile.gatewayId =
        `sdx-o-${member.memberClass}-${member.memberId}`.toLowerCase();
    }

    let jwkList: any[] = [];
    let publicKeyPem = inputs.publicKeyPem;

    // extract public key from certificate
    if (inputs.certificatePem) {
      for (const [index, certPem] of inputs.certificatePem.entries()) {
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

        if (inputs.caCerts) {
          const caCerts = splitCertificates(inputs.caCerts, 'utf8');
          const fullChain = [...certs, ...caCerts];
          const result = verifyCertificateChain(fullChain);
          assert.strictEqual(
            result.valid,
            true,
            'Certificate chain verification failed: ' + result.error
          );

          const jwk: any = publicKey.export({
            format: 'jwk',
          } as any);
          jwk.x5c = splitCertificates(fullChain.join('\n'), 'base64');
          jwk.kid = `${profile.kid}:${index}`;
          jwkList.push(jwk);
        }
      }
    }

    // assert.strictEqual(
    //   profile.gateway_id !== undefined,
    //   true,
    //   'Missing key information to construct gateway_id'
    // );

    return {
      profile,
      jwkList: jwkList,
      publicKeyPem: publicKeyPem,
      gatewayId: profile.gatewayId,
    } as SDXKeysPatternData;
  },

  eval: (_: Record<string, string>, data: SDXKeysPatternData) => {
    const profile = data.profile;

    let tags = [`ns.${data.gatewayId}.${profile.qualifier}`];

    let publicKeyPem = data.publicKeyPem;

    const keySetName = profile.keySetName;

    const keys: any = data.jwkList.map((jwk, index) => ({
      kind: 'GatewayKey',
      name: `${profile.name}:${index}`,
      kid: jwk.kid,
      set: {
        name: keySetName,
      },
      jwk: JSON.stringify(jwk),
      tags: [...tags, `type:${profile.type}`, `name:${profile.value}`],
    }));

    if (keys.length === 0) {
      keys.push({
        kind: 'GatewayKey',
        name: `${profile.name}:0`,
        kid: `${profile.kid}:0`,
        set: {
          name: keySetName,
        },
        pem: {
          public_key: `${publicKeyPem}`,
        },
        tags: [...tags, `type:${profile.type}`, `name:${profile.value}`],
      });
    }

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

function verifyCertificateChain(chainPems: string[]): {
  valid: boolean;
  error?: string;
} {
  try {
    const certs = chainPems.map((pem) => new X509Certificate(pem));

    for (let i = 0; i < certs.length - 1; i++) {
      const subject = certs[i];
      const issuer = certs[i + 1];

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
