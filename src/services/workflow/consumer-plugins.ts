import { Logger } from '../../logger';
import { FeederService } from '../feeder';
import { lookupKongRouteIds, lookupKongServiceIds } from '../keystone';
import {
  Environment,
  GatewayConsumer,
  GatewayRoute,
  GatewayService,
} from '../keystone/types';
import { KongObjectID, KongPlugin } from '../gwaapi';
import { ConsumerPlugin, ConsumerPluginInput } from './types';
import { strict as assert } from 'assert';
import { ConsumerPluginsService } from '../gwaapi';
import getSubjectToken from '../../auth/auth-token';
import { removeAllButKeys } from '../../batch/feed-worker';
import { StructuredActivityService } from './namespace-activity';

const logger = Logger('wf.ConsumerPlugins');

export async function syncPlugins(
  context: any,
  ns: string,
  consumer: GatewayConsumer,
  prodEnv: Environment,
  plugins: ConsumerPlugin[]
) {
  logger.debug('[syncPlugins] %j', plugins);

  assert.strictEqual(
    'plugins' in consumer,
    true,
    'Plugins must be defined in consumer.'
  );

  assert.strictEqual(
    plugins.filter((plugin) => !plugin.route && !plugin.service).length == 0,
    true,
    'All plugins must have a service or route'
  );

  // quick mapping of KeystoneJS ID to Kong ID
  // for Service and Route
  const kongIdMapper: { [key: string]: GatewayRoute | GatewayService } = {};

  const routeIds: any = plugins
    .filter((plugin) => plugin.route)
    .map((plugin) => plugin.route.id);
  (await lookupKongRouteIds(context, routeIds)).map((r) => {
    kongIdMapper[`r:${r.id}`] = r;
  });

  const serviceIds: any = plugins
    .filter((plugin) => plugin.service)
    .map((plugin) => plugin.service.id);
  (await lookupKongServiceIds(context, serviceIds)).map((s) => {
    kongIdMapper[`s:${s.id}`] = s;
  });

  const subjectToken = getSubjectToken(context.req);

  const promises: Promise<ConsumerPluginInput>[] = [];

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
          newPlugin.service = {
            id: kongIdMapper[`s:${plugin.service.id}`].extForeignKey,
          };
        }
        if (plugin.route) {
          newPlugin.route = {
            id: kongIdMapper[`r:${plugin.route.id}`].extForeignKey,
          };
        }
        await AddPluginToConsumer(
          subjectToken,
          ns,
          consumer.extForeignKey,
          newPlugin
        );
        return {
          operation: 'added',
          name: plugin.name,
          serviceOrRouteName:
            kongIdMapper[`s:${plugin.service?.id}`]?.name ||
            kongIdMapper[`r:${plugin.route?.id}`]?.name,
          config: plugin.config,
        } as ConsumerPluginInput;
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
              keyDiffs(p.config, JSON.parse(plugin.config))
          ).length == 1
      )
      .map(async (oldPlugin) => {
        const plugin: ConsumerPlugin = plugins
          .filter((p) => p.id === oldPlugin.id)
          .pop();

        logger.debug(
          '[update] %s %s',
          trimPlugin(oldPlugin.config),
          JSON.stringify(plugin.config)
        );

        const newPlugin: KongPlugin = {
          name: plugin.name,
          config: plugin.config,
        };
        if (plugin.service) {
          newPlugin.service = {
            id: kongIdMapper[`s:${plugin.service.id}`].extForeignKey,
          };
        }
        if (plugin.route) {
          newPlugin.route = {
            id: kongIdMapper[`r:${plugin.route.id}`].extForeignKey,
          };
        }

        await UpdatePluginForConsumer(
          subjectToken,
          ns,
          consumer.extForeignKey,
          oldPlugin.extForeignKey,
          newPlugin
        );
        return {
          operation: 'updated',
          name: plugin.name,
          serviceOrRouteName:
            kongIdMapper[`s:${plugin.service?.id}`]?.name ||
            kongIdMapper[`r:${plugin.route?.id}`]?.name,
          config: plugin.config,
        } as ConsumerPluginInput;
      })
  );

  // delete
  promises.push(
    ...consumer.plugins
      .filter((plugin) => plugins.filter((p) => p.id === plugin.id).length == 0)
      .map(
        async (plugin): Promise<ConsumerPluginInput> => {
          await DeletePluginFromConsumer(
            subjectToken,
            ns,
            consumer.extForeignKey,
            plugin.extForeignKey
          );
          return {
            operation: 'removed',
            name: plugin.name,
            serviceOrRouteName: plugin.service?.name || plugin.route?.name,
            config: plugin.config,
          } as ConsumerPluginInput;
        }
      )
  );

  const allResults = await Promise.all(promises);
  if (allResults.length == 0) {
    logger.debug('[syncPlugins] No Change');
  } else {
    const feederApi = new FeederService(process.env.FEEDER_URL);
    await feederApi.forceSync('kong', 'consumer', consumer.extForeignKey);

    const activityPromises = allResults.map(
      async (pluginSummary: ConsumerPluginInput): Promise<void> => {
        await new StructuredActivityService(
          context.sudo(),
          ns
        ).logConsumerPluginUpdate(
          true,
          { consumer, environment: prodEnv, product: prodEnv.product },
          pluginSummary
        );
      }
    );
    await Promise.all(activityPromises);

    logger.debug('[syncPlugins] Result = %j', allResults);
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

export function trimPlugin(_plugin: string) {
  return JSON.stringify(trimPluginObject(JSON.parse(_plugin)));
}

function trimPluginObject(plugin: any) {
  removeAllButKeys(plugin, [
    'deny',
    'allow',
    'second',
    'minute',
    'hour',
    'day',
    'month',
    'year',
    'policy',
  ]);
  return plugin;
}

function keyDiffs(source: any, target: any) {
  return (
    Object.keys(source).filter(
      (key) =>
        !(key in target) ||
        JSON.stringify(source[key]) != JSON.stringify(target[key])
    ).length > 0
  );
}
