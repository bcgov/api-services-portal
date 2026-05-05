/**
 * sdx-opal-data
 *
 * This pattern will create a data source entry
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

export interface OPALDataPatternConfig extends Record<string, any> {
  organization: string;
  subsystem_id: string;
  name: string;
  upstream_url: string;
}

export interface OPALDataPatternData {
  gateway_id: string;
  client: SubsystemEntry;
}

/**
 * This pattern will provision the default route policies for a consumer of an SDX service
 *
 */
export const OPALDataPattern = {
  id: 'opal-data-source.r1',
  requiredParams: ['organization', 'subsystem_id', 'upstream_url', 'name'],

  inject: async (ctx: any, inputs: OPALDataPatternConfig) => {
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

    return {
      gateway_id: client.gateway.id,
      client,
    };
  },

  eval: (inputs: Record<string, any>, data: OPALDataPatternData) => {
    const subsystemLocator = data.client.clientId;

    const tags = [
      `ns.${data.gateway_id}.${subsystemLocator}.${inputs.name}.ds`,
      'sdx',
    ];
    const name = `sdx.opal.ds.${subsystemLocator}.${inputs.name}`;

    const config = {
      kind: 'PolicyDataSource',
      name,
      url: inputs.upstream_url,
      topics: ['tenant_data'],
      dst_path: `/tenant/${subsystemLocator}/${inputs.name}`,
      tags: [...tags, `client:${subsystemLocator}`],
    } as any;

    return [config] as any[];
  },
};
