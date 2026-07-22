import { FastifyBaseLogger } from 'fastify/types/logger.js';
import type {
  RuntimeGroup,
  SdxMemberApiClient,
  SubsystemEntry,
} from '../../clients/sdx-member/index.js';
import { PatternProcessor } from '../patterns-evaluator.js';

export interface SDXSubsystemConfig {
  clientId: string;
}

interface SDXSubsystemPatternData {
  gatewayId: string;
  subsystem: SubsystemEntry;
}

/**
 * This pattern will provision default routes for the subsystem
 *
 */
export class SDXSubsystemPattern implements PatternProcessor {
  static ID = 'sdx-subsystem.r1';
  static requiredParams = ['clientId'];

  constructor(
    private readonly api: SdxMemberApiClient,
    private readonly logger?: FastifyBaseLogger
  ) {}

  id = () => SDXSubsystemPattern.ID;
  requiredParams = () => SDXSubsystemPattern.requiredParams;
  deleteHandling = () => 'delete' as const;

  async inject(inputs: SDXSubsystemConfig): Promise<SDXSubsystemPatternData> {
    const { api } = this;

    const subsystem = await api.getCatalogSubsystem(inputs.clientId);

    const subsystemClient = await api.getSubsystemClient(
      subsystem.organization!.name,
      subsystem.name
    );

    return {
      gatewayId: subsystemClient.gateway?.id!,
      subsystem: subsystemClient,
    };
  }

  eval(_inputs: SDXSubsystemConfig, data: SDXSubsystemPatternData) {
    const subsystem = data.subsystem;

    let tags = [
      `ns.${data.gatewayId}.sys-${subsystem.name}`,
      `subsystem:${subsystem.clientId}`,
      'sdx',
    ];

    const apsResources = [
      {
        kind: 'Application',
        name: subsystem.name,
        namespace: subsystem.gateway?.id,
        description: subsystem.description || `${subsystem.clientId} subsystem`,
      },
      {
        kind: 'Product',
        name: subsystem.name,
        organization: subsystem.organization?.name,
        description: subsystem.description || `${subsystem.clientId} subsystem`,
        environments: [
          {
            name: 'dev',
            flow: 'protected-externally',
          },
          {
            name: 'test',
            flow: 'protected-externally',
          },
          {
            name: 'prod',
            flow: 'protected-externally',
          },
        ] as any[],
      },
    ];

    return apsResources;
  }
}
