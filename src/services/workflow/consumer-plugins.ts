import { Logger } from '../../logger';
import { FeederService } from '../feeder';
import { lookupKongRouteIds, lookupKongServiceIds } from '../keystone';
import { GatewayConsumer } from '../keystone/types';
import { KongObjectID, KongPlugin } from '../gwaapi';
import { ConsumerPlugin } from './types';
import { strict as assert } from 'assert';
import { ConsumerPluginsService } from '../gwaapi';
import getSubjectToken from '../../auth/auth-token';

const logger = Logger('wf.ConsumerPlugins');

export async function syncPlugins(
  context: any,
  ns: string,
  consumer: GatewayConsumer,
  plugins: ConsumerPlugin[]
) {
  logger.debug('[syncPlugins] %j', plugins);

  assert.strictEqual(
    'plugins' in consumer,
    true,
    'Plugins must be defined in consumer.'
  );

  const kongIdMapper: any = {};

  assert.strictEqual(
    plugins.filter((plugin) => !plugin.route && !plugin.service).length == 0,
    true,
    'All plugins must have a service or route'
  );

  const routeIds: any = plugins
    .filter((plugin) => plugin.route)
    .map((plugin) => plugin.route.id);
  (await lookupKongRouteIds(context, routeIds)).map((r) => {
    kongIdMapper[`r:${r.id}`] = r.extForeignKey;
  });

  const serviceIds: any = plugins
    .filter((plugin) => plugin.service)
    .map((plugin) => plugin.service.id);
  (await lookupKongServiceIds(context, serviceIds)).map((s) => {
    kongIdMapper[`s:${s.id}`] = s.extForeignKey;
  });

  const subjectToken = getSubjectToken(context.req);

  const promises: Promise<KongObjectID | void>[] = [];

  // add new
  promises.push(
    ...plugins
      .filter((plugin) => !plugin.id)
      .map(async (plugin) => {
        const newPlugin: KongPlugin = {
          name: plugin.name,
          config: plugin.config,
        };
        if (plugin.service) {
          newPlugin.service = { id: kongIdMapper[`s:${plugin.service.id}`] };
        }
        if (plugin.route) {
          newPlugin.route = { id: kongIdMapper[`r:${plugin.route.id}`] };
        }
        return AddPluginToConsumer(
          subjectToken,
          ns,
          consumer.extForeignKey,
          newPlugin
        );
      })
  );

  // update
  promises.push(
    ...consumer.plugins
      .filter(
        (plugin) =>
          plugins.filter(
            (p) =>
              p.id === plugin.id &&
              p.name === plugin.name &&
              JSON.stringify(p.config) != JSON.stringify(plugin.config)
          ).length == 1
      )
      .map(async (oldPlugin) => {
        const plugin: ConsumerPlugin = plugins
          .filter((p) => p.id === oldPlugin.id)
          .pop();

        const newPlugin: KongPlugin = {
          name: plugin.name,
          config: plugin.config,
        };
        if (plugin.service) {
          newPlugin.service = { id: kongIdMapper[`s:${plugin.service.id}`] };
        }
        if (plugin.route) {
          newPlugin.route = { id: kongIdMapper[`r:${plugin.route.id}`] };
        }

        await UpdatePluginForConsumer(
          subjectToken,
          ns,
          consumer.extForeignKey,
          oldPlugin.extForeignKey,
          newPlugin
        );
      })
  );

  // delete
  promises.push(
    ...consumer.plugins
      .filter((plugin) => plugins.filter((p) => p.id === plugin.id).length == 0)
      .map(async (plugin) => {
        await DeletePluginFromConsumer(
          subjectToken,
          ns,
          consumer.extForeignKey,
          plugin.extForeignKey
        );
      })
  );

  const allResults = await Promise.all(promises);
  logger.debug('[syncPlugins] Result = %j', allResults);

  if (allResults.length > 0) {
    const feederApi = new FeederService(process.env.FEEDER_URL);
    await feederApi.forceSync('kong', 'consumer', consumer.extForeignKey);
  }
}

// context.req.user.namespace
async function AddPluginToConsumer(
  subjectToken: string,
  ns: string,
  kongConsumerPK: string,
  plugin: KongPlugin
): Promise<KongObjectID> {
  const kongApi = new ConsumerPluginsService(process.env.GWA_API_URL);
  return kongApi.addPluginToConsumer(subjectToken, kongConsumerPK, plugin, ns);
}

async function UpdatePluginForConsumer(
  subjectToken: string,
  ns: string,
  kongConsumerPK: string,
  kongPluginId: string,
  plugin: KongPlugin
) {
  const kongApi = new ConsumerPluginsService(process.env.GWA_API_URL);
  return await kongApi.updateConsumerPlugin(
    subjectToken,
    kongConsumerPK,
    kongPluginId,
    plugin,
    ns
  );
}

async function DeletePluginFromConsumer(
  subjectToken: string,
  ns: string,
  kongConsumerPK: string,
  kongPluginId: string
) {
  const kongApi = new ConsumerPluginsService(process.env.GWA_API_URL);
  return await kongApi.deleteConsumerPlugin(
    subjectToken,
    kongConsumerPK,
    kongPluginId,
    ns
  );
}
