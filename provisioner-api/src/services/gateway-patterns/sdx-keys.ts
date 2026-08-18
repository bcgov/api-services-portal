import crypto, { X509Certificate } from 'crypto';
import type { SdxMemberApiClient } from '../../clients/sdx-member/index.js';
import type { GatewayAdminService } from '../gateway-admin-service.js';
import type { GatewayKey } from '../../clients/gateway-admin/types.js';
import type { PatternProcessor } from '../patterns-evaluator.js';
import { assert } from './utils.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';
import { getRequiredEnvUrl } from '../../config/environments.js';
import {
  BadRequestError,
  UnprocessableEntityError,
} from '../../errors/api-errors.js';
  import {
  buildKid,
  jwkFromPublicPem,
  jwkThumbprint,
  kidSuffix,
  parseJwk,
  randomKeySuffix,
  type JsonWebKey,
} from './sdx-keys-crypto.js';

function splitCertificates(certs: string, encoding: BufferEncoding): string[] {
  const certArray = certs.split(/(?=-----BEGIN CERTIFICATE-----)/g);

  return certArray
    .map((cert) => Buffer.from(cert.trim()).toString(encoding))
    .filter((cert) => cert.length > 0);
}

export type SdxKeyOperation = 'add' | 'rotate' | 'replace' | 'delete';

const KEY_OPERATIONS: readonly SdxKeyOperation[] = [
  'add',
  'rotate',
  'replace',
  'delete',
];

export interface SDXKeyConfig {
  organization: string;
  runtimeGroupName?: string;
  environment: string;
  clientId?: string;
  publicKeyPem?: string;
  certificatePem?: string[];
  caCerts?: string;
  /** Targeted pattern operation. Omit for legacy whole-set publish. */
  operation?: SdxKeyOperation;
  /** Existing kid to replace or delete. */
  targetKid?: string;
  /** Optional caller-supplied kid (or suffix) for add/rotate/replace. */
  kid?: string;
}

export interface KeyChangeRef {
  kid: string;
  name: string;
}

export interface KeySetChanges {
  operation: SdxKeyOperation | 'publish';
  added: KeyChangeRef[];
  removed: KeyChangeRef[];
  retained: KeyChangeRef[];
}

interface DesiredKey {
  name: string;
  kid: string;
  jwk?: JsonWebKey;
  publicKeyPem?: string;
}

interface ExistingKey {
  name: string;
  kid: string;
  thumbprint: string;
  jwk?: JsonWebKey;
  publicKeyPem?: string;
}

interface IncomingKey {
  jwk: JsonWebKey;
  publicKeyPem: string;
  thumbprint: string;
}

interface SDXKeysPatternData {
  jwkList: any[];
  publicKeyPem?: string;
  gatewayId: string;
  qualifier: string;
  profile: {
    name: string;
    kid: string;
    qualifier: string;
    type: string;
    value: string;
    keySetName: string;
  };
  operation?: SdxKeyOperation;
  desiredKeys?: DesiredKey[];
  changes?: KeySetChanges;
}

export interface PatternInjectContext {
  action?: string;
}

/**
 * This pattern will provision keys for the following SDX use cases:
 *
 * - Edge Server signing keys
 * - Organization signing keys
 * - Subsystem (client_id) signing keys
 *
 * When `operation` is omitted, behaviour is unchanged: a single `:0` key (or
 * index-based kids from `certificatePem[]`) is published. When `operation` is
 * set, the pattern fetches the current keyset from the Kong control plane and
 * emits the complete desired state for add / rotate / replace / delete.
 */
export class SDXKeysPattern implements PatternProcessor {
  static ID = 'sdx-keys.r1';
  static requiredParams = ['organization', 'environment'];

  constructor(
    private readonly api: SdxMemberApiClient,
    private readonly gatewayAdmin?: GatewayAdminService,
    private readonly logger?: FastifyBaseLogger
  ) {}

  id = () => SDXKeysPattern.ID;
  requiredParams = () => SDXKeysPattern.requiredParams;
  deleteHandling = (data?: SDXKeysPatternData) =>
    data?.operation ? ('apply' as const) : ('delete' as const);

  async inject(
    inputs: SDXKeyConfig,
    ctx?: PatternInjectContext
  ): Promise<SDXKeysPatternData> {
    const operation = parseOperation(inputs.operation);
    if (operation && ctx?.action === 'delete') {
      throw new BadRequestError(
        'Query action=delete removes the entire key qualifier. For targeted deletion, use action=apply with operation=delete.'
      );
    }

    const profile: any = {};

    if (inputs.runtimeGroupName) {
      const owned = await this.api.listRuntimeGroups(inputs.organization, {
        filter: 'owned',
      });
      const rg = owned.find((g) => g.name === inputs.runtimeGroupName);

      assert.strictEqual(
        Boolean(rg),
        true,
        'Organization does not own this runtime group'
      );

      profile.keySetName = `sdx.edge.${inputs.runtimeGroupName}.${inputs.environment}`;
      profile.name = `sdx.keys.${inputs.runtimeGroupName}.${inputs.environment}.edge`;
      profile.kid = `urn:ca:bc:sdx:edge:${inputs.runtimeGroupName}:${inputs.environment}`;
      profile.qualifier = `key-${inputs.runtimeGroupName}-${inputs.environment}`;
      profile.type = 'runtime-group';
      profile.value = `${inputs.runtimeGroupName}.${inputs.environment}`;
      profile.gatewayId = rg!.gatewayId;
    } else if (inputs.clientId) {
      const subsystem = await this.api.getCatalogSubsystem(inputs.clientId);

      const orgSubsystem = await this.api.getSubsystemClient(
        subsystem.organization?.name!,
        subsystem.name
      );

      const id = inputs.clientId.toLowerCase();

      profile.keySetName = `sdx.sys.${id}.${inputs.environment}`;
      profile.name = `sdx.keys.${id}.${inputs.environment}.sys`;
      profile.kid = `urn:ca:bc:sdx:sys:${id}:${inputs.environment}`;
      profile.qualifier = `key-${id}-${inputs.environment}`;
      profile.type = 'client';
      profile.value = `${inputs.clientId}.${inputs.environment}`;
      profile.gatewayId = orgSubsystem.gateway?.id;
    } else {
      const organizations: any = await this.api.listOrganizations();
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

      profile.keySetName = `sdx.org.${memberText}.${inputs.environment}`;
      profile.name = `sdx.keys.${memberText}.org.${inputs.environment}`;
      profile.kid = `urn:ca:bc:sdx:org:${memberText}:${inputs.environment}`;
      profile.qualifier = `key-${memberText}-${inputs.environment}`;
      profile.type = 'organization';
      profile.value = `${inputs.organization}.${inputs.environment}`;
      profile.gatewayId =
        `sdx-o-${member.memberClass}-${member.memberId}`.toLowerCase();
    }

    let jwkList: any[] = [];
    let publicKeyPem = inputs.publicKeyPem;

    if (!operation && inputs.certificatePem) {
      for (const [index, certPem] of inputs.certificatePem.entries()) {
        const certs = splitCertificates(certPem, 'utf8');
        const cert = new crypto.X509Certificate(certs[0]);
        const publicKey = cert.publicKey;
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

    const data: SDXKeysPatternData = {
      profile,
      jwkList,
      publicKeyPem,
      gatewayId: profile.gatewayId,
      qualifier: profile.qualifier,
    };

    if (operation) {
      const incoming = parseIncomingKey(inputs);
      if (
        (operation === 'add' ||
          operation === 'rotate' ||
          operation === 'replace') &&
        !incoming
      ) {
        throw new UnprocessableEntityError(
          'publicKeyPem or certificatePem is required for add, rotate, and replace'
        );
      }
      if (
        (operation === 'replace' || operation === 'delete') &&
        !inputs.targetKid
      ) {
        throw new UnprocessableEntityError(
          'targetKid is required for replace and delete'
        );
      }

      const existing = await this.loadExistingKeys(
        profile.gatewayId,
        inputs.environment,
        `ns.${profile.gatewayId}.${profile.qualifier}`,
        profile.keySetName
      );

      const { desiredKeys, changes } = applyOperation({
        operation,
        existing,
        incoming,
        profileName: profile.name,
        kidBase: profile.kid,
        targetKid: inputs.targetKid,
        suppliedKid: inputs.kid,
      });

      data.operation = operation;
      data.desiredKeys = desiredKeys;
      data.changes = changes;
    }

    return data;
  }

  eval(inputs: SDXKeyConfig, data: SDXKeysPatternData) {
    const profile = data.profile;
    const tags = [`ns.${data.gatewayId}.${profile.qualifier}`];
    const keySetName = profile.keySetName;

    const keys = data.desiredKeys
      ? data.desiredKeys.map((key) => desiredKeyDocument(key, keySetName, tags, profile))
      : legacyKeyDocuments(data, keySetName, tags, profile);

    const operatorEdgeUrl = getRequiredEnvUrl(
      inputs.environment,
      'operator_edge_url',
      'SDX Operator edge server'
    );
    const routeHostUrl = new URL(operatorEdgeUrl);

    const info = {
      kind: 'Information',
      data: {
        type: profile.type,
        set: keySetName,
        endpoint: `${routeHostUrl}keysets/${keySetName}/.well-known/jwks.json`,
        ...(data.changes ? { changes: data.changes } : {}),
      },
    };

    return [
      info,
      {
        kind: 'GatewayKeySet',
        name: keySetName,
        tags,
      },
      ...keys,
    ];
  }

  private async loadExistingKeys(
    gatewayId: string,
    environment: string,
    tag: string,
    keySetName: string
  ): Promise<ExistingKey[]> {
    if (!this.gatewayAdmin) {
      throw new UnprocessableEntityError(
        'Gateway key lookup is not configured; cannot apply a targeted key operation'
      );
    }

    const response = await this.gatewayAdmin.getKeys(
      gatewayId,
      environment,
      tag,
      keySetName
    );

    return (response.keys ?? [])
      .map((key) => toExistingKey(key))
      .filter((key): key is ExistingKey => key !== undefined);
  }
}

function parseOperation(
  value: string | undefined
): SdxKeyOperation | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }
  if ((KEY_OPERATIONS as readonly string[]).includes(value)) {
    return value as SdxKeyOperation;
  }
  throw new UnprocessableEntityError(
    `Unsupported sdx-keys.r1 operation '${value}'. Expected add, rotate, replace, or delete.`
  );
}

function parseIncomingKey(inputs: SDXKeyConfig): IncomingKey | undefined {
  if (inputs.certificatePem && inputs.certificatePem.length > 0) {
    if (inputs.certificatePem.length > 1) {
      throw new UnprocessableEntityError(
        'operation accepts a single certificatePem entry'
      );
    }
    const certs = splitCertificates(inputs.certificatePem[0], 'utf8');
    const cert = new crypto.X509Certificate(certs[0]);
    const publicKeyPem = cert.publicKey.export({
      type: 'spki',
      format: 'pem',
    }) as string;
    const jwk = jwkFromPublicPem(publicKeyPem);

    if (inputs.caCerts) {
      const caCerts = splitCertificates(inputs.caCerts, 'utf8');
      const fullChain = [...certs, ...caCerts];
      const result = verifyCertificateChain(fullChain);
      assert.strictEqual(
        result.valid,
        true,
        'Certificate chain verification failed: ' + result.error
      );
      (jwk as any).x5c = splitCertificates(fullChain.join('\n'), 'base64');
    }

    return {
      jwk,
      publicKeyPem,
      thumbprint: jwkThumbprint(jwk),
    };
  }

  if (inputs.publicKeyPem) {
    const jwk = jwkFromPublicPem(inputs.publicKeyPem);
    return {
      jwk,
      publicKeyPem: inputs.publicKeyPem,
      thumbprint: jwkThumbprint(jwk),
    };
  }

  return undefined;
}

function toExistingKey(key: GatewayKey): ExistingKey | undefined {
  const kid = key.kid;
  const name = key.name;
  if (!kid || !name) {
    return undefined;
  }

  const jwk = parseJwk(key.jwk);
  const publicKeyPem = key.pem?.public_key;
  let thumbprint: string | undefined;
  try {
    if (jwk) {
      thumbprint = jwkThumbprint(jwk);
    } else if (publicKeyPem) {
      thumbprint = jwkThumbprint(jwkFromPublicPem(publicKeyPem));
    }
  } catch {
    return undefined;
  }
  if (!thumbprint) {
    return undefined;
  }

  return { name, kid, thumbprint, jwk, publicKeyPem };
}

function applyOperation(args: {
  operation: SdxKeyOperation;
  existing: ExistingKey[];
  incoming?: IncomingKey;
  profileName: string;
  kidBase: string;
  targetKid?: string;
  suppliedKid?: string;
}): { desiredKeys: DesiredKey[]; changes: KeySetChanges } {
  const { operation, existing, incoming, profileName, kidBase } = args;

  const asDesired = (key: ExistingKey): DesiredKey => ({
    name: key.name,
    kid: key.kid,
    jwk: key.jwk,
    publicKeyPem: key.publicKeyPem,
  });
  const asRef = (key: { kid: string; name: string }): KeyChangeRef => ({
    kid: key.kid,
    name: key.name,
  });

  if (operation === 'delete') {
    const target = existing.find((key) => key.kid === args.targetKid);
    if (!target) {
      throw new UnprocessableEntityError(
        `targetKid '${args.targetKid}' was not found in the current key set`
      );
    }
    const retained = existing.filter((key) => key.kid !== args.targetKid);
    if (retained.length === 0) {
      throw new UnprocessableEntityError(
        'Deleting the last key requires query action=delete to remove the entire key qualifier'
      );
    }
    return {
      desiredKeys: retained.map(asDesired),
      changes: {
        operation,
        added: [],
        removed: [asRef(target)],
        retained: retained.map(asRef),
      },
    };
  }

  if (!incoming) {
    throw new UnprocessableEntityError(
      'publicKeyPem or certificatePem is required'
    );
  }

  const duplicate = existing.find(
    (key) => key.thumbprint === incoming.thumbprint
  );

  if (operation === 'add' || operation === 'rotate') {
    if (duplicate) {
      return {
        desiredKeys: existing.map(asDesired),
        changes: {
          operation,
          added: [],
          removed: [],
          retained: existing.map(asRef),
        },
      };
    }

    const newKey = newDesiredKey(
      profileName,
      kidBase,
      incoming,
      args.suppliedKid
    );
    return {
      desiredKeys: [...existing.map(asDesired), newKey],
      changes: {
        operation,
        added: [asRef(newKey)],
        removed: [],
        retained: existing.map(asRef),
      },
    };
  }

  // replace
  const target = existing.find((key) => key.kid === args.targetKid);
  if (!target) {
    throw new UnprocessableEntityError(
      `targetKid '${args.targetKid}' was not found in the current key set`
    );
  }

  if (duplicate) {
    const retained = existing.filter((key) => key.kid !== target.kid);
    if (duplicate.kid === target.kid) {
      return {
        desiredKeys: existing.map(asDesired),
        changes: {
          operation,
          added: [],
          removed: [],
          retained: existing.map(asRef),
        },
      };
    }
    return {
      desiredKeys: retained.map(asDesired),
      changes: {
        operation,
        added: [],
        removed: [asRef(target)],
        retained: retained.map(asRef),
      },
    };
  }

  const replacement = newDesiredKey(
    profileName,
    kidBase,
    incoming,
    args.suppliedKid
  );
  const retained = existing
    .filter((key) => key.kid !== target.kid)
    .map(asDesired);
  return {
    desiredKeys: [...retained, replacement],
    changes: {
      operation,
      added: [asRef(replacement)],
      removed: [asRef(target)],
      retained: retained.map(asRef),
    },
  };
}

function newDesiredKey(
  profileName: string,
  kidBase: string,
  incoming: IncomingKey,
  suppliedKid?: string
): DesiredKey {
  const suffix = randomKeySuffix(
    suppliedKid && !suppliedKid.startsWith('urn:') ? suppliedKid : undefined
  );
  const kid = suppliedKid?.startsWith('urn:')
    ? suppliedKid
    : buildKid(kidBase, suffix);
  const nameSuffix = suppliedKid?.startsWith('urn:')
    ? kidSuffix(kid, kidBase)
    : suffix;
  return {
    name: `${profileName}:${nameSuffix}`,
    kid,
    jwk: incoming.jwk,
    publicKeyPem: incoming.publicKeyPem,
  };
}

function desiredKeyDocument(
  key: DesiredKey,
  keySetName: string,
  tags: string[],
  profile: SDXKeysPatternData['profile']
) {
  const doc: any = {
    kind: 'GatewayKey',
    name: key.name,
    kid: key.kid,
    set: { name: keySetName },
    tags: [...tags, `type:${profile.type}`, `name:${profile.value}`],
  };
  if (key.jwk && (key.jwk as any).x5c) {
    const jwk = { ...key.jwk, kid: key.kid };
    doc.jwk = JSON.stringify(jwk);
  } else if (key.publicKeyPem) {
    doc.pem = { public_key: key.publicKeyPem };
  } else if (key.jwk) {
    const jwk = { ...key.jwk, kid: key.kid };
    doc.jwk = JSON.stringify(jwk);
  }
  return doc;
}

function legacyKeyDocuments(
  data: SDXKeysPatternData,
  keySetName: string,
  tags: string[],
  profile: SDXKeysPatternData['profile']
) {
  const keys: any[] = data.jwkList.map((jwk, index) => ({
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
        public_key: `${data.publicKeyPem}`,
      },
      tags: [...tags, `type:${profile.type}`, `name:${profile.value}`],
    });
  }

  return keys;
}

function verifyCertificateChain(chainPems: string[]): {
  valid: boolean;
  error?: string;
} {
  try {
    const certs = chainPems.map((pem) => new X509Certificate(pem));

    for (let i = 0; i < certs.length - 1; i++) {
      const subject = certs[i];
      const issuer = certs[i + 1];

      if (subject.issuer !== issuer.subject) {
        return {
          valid: false,
          error: `Chain broken at depth ${i}: issuer mismatch`,
        };
      }

      if (!subject.verify(issuer.publicKey)) {
        return { valid: false, error: `Signature invalid at depth ${i}` };
      }
    }

    const root = certs[certs.length - 1];
    if (!root.verify(root.publicKey)) {
      return { valid: false, error: 'Root cert is not self-signed' };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: (err as Error).message };
  }
}
