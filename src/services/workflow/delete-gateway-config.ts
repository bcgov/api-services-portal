import { strict as assert } from 'assert';

import { deleteRecord, deleteRecords } from '../keystone';
import { Logger } from '../../logger';
import { BatchService } from '../keystone/batch-service';
import { GatewayPlugin, GatewayRoute } from '../keystone/types';

const logger = Logger('wf.DeleteGatewayConfig');

export const DeleteGatewayConfig = async (
  context: any,
  operation: any,
  keys: any
) => {
  logger.debug('Deleting config for %j', keys);

  const batchService = new BatchService(context);

  if ('service' in keys) {
    const recordReferences = await batchService.list(
      'allGatewayServices',
      'id',
      keys.service,
      ['extForeignKey', 'extRecordHash', 'plugins { id }', 'routes { id }']
    );

    await batchService.removeAll(
      'GatewayRoute',
      recordReferences[0].routes.map((gr: GatewayRoute) => gr.id)
    );

    await batchService.removeAll(
      'GatewayPlugin',
      recordReferences[0].plugins.map((pg: GatewayPlugin) => pg.id)
    );

    // cleanup the Consumer related plugins for this service
    const consumerPlugins = await batchService.listRelated(
      'allGatewayPlugins',
      'service',
      keys.service,
      []
    );
    await batchService.removeAll(
      'GatewayPlugin',
      consumerPlugins.map((pg: GatewayPlugin) => pg.id)
    );
  } else {
    const recordReferences = await batchService.list(
      'allGatewayRoutes',
      'id',
      keys.route,
      ['extForeignKey', 'extRecordHash', 'plugins { id }']
    );

    await batchService.removeAll(
      'GatewayPlugin',
      recordReferences[0].plugins.map((pg: GatewayPlugin) => pg.id)
    );

    // cleanup the Consumer related plugins for this route
    const consumerPlugins = await batchService.listRelated(
      'allGatewayPlugins',
      'route',
      keys.route,
      []
    );
    await batchService.removeAll(
      'GatewayPlugin',
      consumerPlugins.map((pg: GatewayPlugin) => pg.id)
    );
  }
};
