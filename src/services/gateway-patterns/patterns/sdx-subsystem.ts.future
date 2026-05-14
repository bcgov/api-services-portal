import crypto from 'crypto';
import { Logger } from '../../../logger';
import { SubsystemService } from '../../batch/subsystem';
import assert from '../../user-assert';
import {
  EnrichWithRuntimeGroup,
  GetSubsystemEntryForSubsystem,
  SubsystemEntry,
} from '../catalog';

const logger = Logger('sdx-subsystem-pattern');

export interface SDXSubsystemConfig extends Record<string, any> {
  organization: string;
  subsystem_id: string;
  azp: string;
}

interface SDXSubsystemsPatternData {
  gateway_id: string;
  client: SubsystemEntry;
}

/**
 * This pattern will provision default routes for the subsystem
 *
 */
export const SDXSubsystemsPattern = {
  id: 'sdx-subsystem.r1',
  requiredParams: ['organization'],

  inject: async (
    ctx: any,
    inputs: Record<string, any>
  ): Promise<SDXSubsystemsPatternData> => {
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

  eval: (inputs: Record<string, string>, data: SDXSubsystemsPatternData) => {
    let tags = [
      `ns.${data.gateway_id}.sys-${data.client.name}`,
      `subsystem:${data.client.clientId}`,
      'sdx',
    ];

    let hashedClientId = crypto
      .createHash('sha256')
      .update(data.client.clientId)
      .digest('hex')
      .substring(0, 16);

    let consumerName = `${hashedClientId}-${inputs.azp}`;
    return [
      ...[
        {
          kind: 'GatewayConsumer',
          custom_id: consumerName,
          tags,
        },
      ],
    ];
  },
};
