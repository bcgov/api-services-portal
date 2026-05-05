/**
 * sdx-opal-policy
 *
 * This pattern will create a policy
 *
 */

import assert from '../../../user-assert';
import { SubsystemService } from '../../../batch/subsystem';
import {
  EnrichWithRuntimeGroup,
  GetCatalogByName,
  GetSubsystemEntryForSubsystem,
  ServiceCatalogEntry,
  ServiceClient,
  SubsystemEntry,
} from '../../catalog';
import { getRoutePathPrefix } from '../../../utils';

export interface OPALPolicyPatternConfig extends Record<string, any> {
  organization: string;
  subsystem_id: string;
  name: string;
  policy: string;
}

export interface OPALPolicyPatternData {
  gateway_id: string;
  client: SubsystemEntry;
  packageName: string;
}

/**
 * This pattern will provision the default route policies for a consumer of an SDX service
 *
 */
export const OPALPolicyPattern = {
  id: 'opal-policy.r1',
  requiredParams: ['organization', 'subsystem_id', 'policy'],

  inject: async (ctx: any, inputs: OPALPolicyPatternConfig) => {
    // retrieve the catalog items for
    const subsysService = new SubsystemService();
    const subsystem = await subsysService.findSubsystemByClientId(
      ctx,
      inputs.subsystem_id
    );

    assert.strictEqual(
      subsystem.organization.name === inputs.organization,
      true,
      'Client subsystem does not belong to the specified organization'
    );

    const client = GetSubsystemEntryForSubsystem(subsystem);
    await EnrichWithRuntimeGroup(ctx, client);

    // make sure the policy package in first line matches
    const policyLines = inputs.policy.split('\n');
    assert.strictEqual(
      policyLines.length > 0,
      true,
      'Policy must be a non-empty string'
    );

    const packageName = `${client.clientId.replace(/\.|-/g, '_')}.${
      inputs.name
    }`;

    const packageLine = policyLines[0].trim();

    assert.strictEqual(
      packageLine === `package ${packageName}`,
      true,
      `Unexpected package name - expecting \`package ${packageName}\`, found \'${packageLine}\'`
    );
    return {
      gateway_id: client.gateway.id,
      client,
      packageName,
    };
  },

  eval: (inputs: Record<string, any>, data: OPALPolicyPatternData) => {
    const subsystemLocator = data.client.clientId;

    const tags = [`ns.${data.gateway_id}.${subsystemLocator}.pol`, 'sdx'];
    const name = `sdx.opal.pol.${subsystemLocator}.${inputs.name}`;

    const config = {
      kind: 'RegoPolicy',
      name,
      package: data.packageName,
      policy: inputs.policy,
      tags: [...tags, `client:${subsystemLocator}`],
    } as any;

    return [config] as any[];
  },
};
