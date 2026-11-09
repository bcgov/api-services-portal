import type { GatewayAdminService } from '../gateway-admin-service.js';
import type { RuntimeGroup } from '../../clients/sdx-member/index.js';
import { BadRequestError } from '../../errors/api-errors.js';

/** Counter-signing requires published organization keys in the selected environment. */
export async function requireOrganizationSigning(
  gatewayAdmin: GatewayAdminService | undefined,
  member: { memberClass: string; memberId: string },
  runtime: RuntimeGroup
): Promise<void> {
  const identity = `${member.memberClass}.${member.memberId}`.toLowerCase();
  if (!gatewayAdmin) throw new BadRequestError('Cannot validate organization signing configuration');
  if (!runtime.name || !runtime.environment) {
    throw new BadRequestError('Cannot validate organization signing configuration without a runtime group name and environment');
  }
  const result = await gatewayAdmin.getKeys(
    `sdx-o-${member.memberClass}-${member.memberId}`.toLowerCase(),
    runtime.environment, undefined, `sdx.org.${identity}.${runtime.environment}`
  );
  const ready = result.keys.length > 0 ||
    result.key_sets.some((set) => (set.keys?.length ?? 0) > 0);
  if (!ready) {
    throw new BadRequestError(
      `Counter-sign requires organization signing for ${identity} on runtime group '${runtime.name}' in '${runtime.environment}'. Publish organization keys in that environment before enabling counter-sign.`
    );
  }
}
