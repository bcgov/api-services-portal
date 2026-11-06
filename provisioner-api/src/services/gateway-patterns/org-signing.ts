import { X509Certificate } from 'node:crypto';
import type { GatewayAdminService } from '../gateway-admin-service.js';
import type { RuntimeGroup } from '../../clients/sdx-member/index.js';
import { BadRequestError } from '../../errors/api-errors.js';

/** Counter-signing requires the organization's published certificate for this edge. */
export async function requireOrganizationSigning(
  gatewayAdmin: GatewayAdminService | undefined,
  member: { memberClass: string; memberId: string },
  runtime: RuntimeGroup
): Promise<void> {
  const identity = `${member.memberClass}.${member.memberId}`.toLowerCase();
  const kid = `urn:ca:bc:sdx:org:${identity}:${runtime.environment}:0`;
  const hostname = `${member.memberClass}-${member.memberId}.${runtime.name}.${runtime.environment}.servers.sdx`.toLowerCase();
  if (!gatewayAdmin) throw new BadRequestError('Cannot validate organization signing configuration');
  const result = await gatewayAdmin.getKeys(
    `sdx-o-${member.memberClass}-${member.memberId}`.toLowerCase(),
    runtime.environment!, undefined, `sdx.org.${identity}.${runtime.environment}`
  );
  const keys = [...result.keys, ...result.key_sets.flatMap((set) => set.keys || [])];
  const ready = keys.some((key) => {
    if (key.kid !== kid) return false;
    try {
      const jwk = typeof key.jwk === 'string' ? JSON.parse(key.jwk) : key.jwk;
      const leaf = jwk?.x5c?.[0];
      if (typeof leaf !== 'string') return false;
      const cert = new X509Certificate(Buffer.from(leaf, 'base64'));
      const now = Date.now();
      return Boolean(cert.checkHost(hostname)) &&
        Date.parse(cert.validFrom) <= now && Date.parse(cert.validTo) > now;
    } catch { return false; }
  });
  if (!ready) {
    throw new BadRequestError(
      `Counter-sign requires organization signing for ${identity} on runtime group '${runtime.name}' in '${runtime.environment}'. Publish a valid organization certificate for that runtime group before enabling counter-sign.`
    );
  }
}
