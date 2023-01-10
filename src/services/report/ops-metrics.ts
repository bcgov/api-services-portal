import { Keystone } from '@keystonejs/keystone';
//import prom, { Gauge } from 'prom-client';
import { BatchService } from '../keystone/batch-service';
import {
  Activity,
  Environment,
  GatewayConsumer,
  Namespace,
  ServiceAccess,
  TemporaryIdentity,
} from '../keystone/types';
import {
  getGwaProductEnvironment,
  injectResSvrAccessTokenToContext,
} from '../workflow';
import {
  getEnvironmentContext,
  getNamespaceResourceSetDetails,
} from '../workflow/get-namespaces';
import { getNamespaceAccess } from './data';
import { Gauge } from './gauge';
import { Logger } from '../../logger';
import {
  getIssuerEnvironmentConfig,
  checkIssuerEnvironmentConfig,
} from '../../services/workflow/types';
import { lookupProductEnvironmentServicesBySlug } from '../keystone';
// import {
//   getEnvironmentContext,
//   getNamespaceResourceSets,
// } from '../../lists/extensions/Common';
import { ResourceSet, UMAResourceRegistrationService } from '../uma2';
import {
  getAllNamespaces,
  transformOrgAndOrgUnit,
} from '../keycloak/namespace-details';
import {
  calculateStats,
  getAllConsumerDailyMetrics,
} from '../keystone/metrics';
import { dateRange } from '../utils';

const logger = Logger('report.OpsMetrics');

export class OpsMetrics {
  keystone: any;
  gNamespaces: Gauge;
  gNamespaceAccess: Gauge;
  gEmailList: Gauge;
  gActivity: Gauge;
  gConsumers: Gauge;
  gProducts: Gauge;

  constructor(keystone: Keystone) {
    this.keystone = keystone;
  }

  public initialize() {
    // const collectDefaultMetrics = prom.collectDefaultMetrics;
    // const Registry = prom.Registry;
    // const register = new Registry();
    // collectDefaultMetrics({ register });

    this.gNamespaces = new Gauge({
      name: 'ops_metrics_namespaces',
      help: 'namespace counts',
      labelNames: [
        'namespace',
        'org',
        'org_unit',
        'org_enabled',
        'data_plane',
        'prod_in_directory',
      ],
    });

    this.gNamespaceAccess = new Gauge({
      name: 'ops_metrics_namespace_access',
      help: 'namespace access counts',
      labelNames: ['namespace', 'subject', 'permission'],
    });

    this.gEmailList = new Gauge({
      name: 'ops_metrics_email_list',
      help: 'email list for distribution',
      labelNames: ['namespace', 'email', 'provider'],
    });

    this.gActivity = new Gauge({
      name: 'ops_metrics_activity_summary',
      help: 'Activity Summary',
      labelNames: ['namespace', 'actor', 'activity', 'date'],
    });

    this.gProducts = new Gauge({
      name: 'ops_metrics_products',
      help: 'Product information for tracking API Directory',
      labelNames: [
        'namespace',
        'product',
        'environment',
        'flow',
        'issuer',
        'enabled',
      ],
    });

    this.gConsumers = new Gauge({
      name: 'ops_metrics_consumers',
      help: 'Consumer Access',
      labelNames: [
        'consumer',
        'consumerType',
        'application',
        'application_owner',
        'namespace',
        'dataset',
        'product',
        'environment',
        'flow',
        'issuer',
        'requests_30_day',
        'date',
      ],
    });
  }

  // public getRegister() {
  //   return prom.register;
  // }

  public async generateMetrics() {
    await this.generateAccessMetrics();
    await this.generateEmailList();
    await this.generateNamespaceMetrics();
    await this.generateActivityMetrics();
    await this.generateConsumerMetrics();
    await this.generateProductMetrics();
  }

  public async store() {
    const ctx = this.keystone.createContext({
      skipAccessControl: true,
      authentication: { item: {} },
    });
    const batch = new BatchService(ctx);

    for (const metric of [
      this.gEmailList,
      this.gNamespaces,
      this.gNamespaceAccess,
      this.gActivity,
      this.gProducts,
      this.gConsumers,
    ]) {
      const existing = await batch.lookup('allBlobs', 'ref', metric.name(), []);
      if (existing) {
        await batch.update('Blob', existing.id, {
          ref: metric.name(),
          type: 'json',
          blob: JSON.stringify(metric.data()),
        });
      } else {
        await batch.create('Blob', {
          ref: metric.name(),
          type: 'json',
          blob: JSON.stringify(metric.data()),
        });
      }
    }
  }

  async generateEmailList() {
    const { gEmailList } = this;
    const ctx = this.keystone.createContext({
      skipAccessControl: true,
      authentication: { item: {} },
    });
    const batch = new BatchService(ctx);

    async function recurse(skip = 0) {
      const users = await batch.listAll(
        'allTemporaryIdentities',
        ['email', 'namespace', 'provider'],
        undefined,
        skip,
        50
      );
      users.forEach((user: TemporaryIdentity) => {
        gEmailList.set(
          {
            email: user.email,
            namespace: user.namespace,
            provider: user.provider,
          },
          1
        );
      });
      if (users.length == 50) {
        await recurse(skip + 50);
      }
    }
    await recurse();
  }

  async generateActivityMetrics() {
    const { gActivity } = this;
    const ctx = this.keystone.createContext({
      skipAccessControl: true,
      authentication: { item: {} },
    });
    const batch = new BatchService(ctx);

    gActivity.reset();

    async function recurse(skip = 0) {
      const data = await batch.listAll(
        'allActivities',
        ['namespace', 'action', 'type', 'context', 'createdAt'],
        undefined,
        skip,
        50
      );

      data.forEach((data: Activity) => {
        const context =
          Boolean(data.context) == false
            ? { message: data.message }
            : JSON.parse(data.context);
        const actor = Boolean(context.params?.actor)
          ? context.params.actor
          : 'unknown';

        const activity = Boolean(context?.params?.action)
          ? `${context.params.action} ${context.params.entity}`
          : `${data.action} ${data.type}`;
        if (Boolean(activity) == false) {
          logger.warn("Context didn't produce anything meaningful %j", data);
        }
        gActivity.inc(
          {
            actor,
            namespace: data.namespace,
            activity,
            date: new Date(data.createdAt).toISOString(),
          },
          1
        );
      });
      if (data.length == 50) {
        await recurse(skip + 50);
      }
    }
    await recurse();
  }

  async generateAccessMetrics() {
    const ctx = this.keystone.createContext({
      skipAccessControl: true,
      authentication: { item: {} },
    });

    // ctx.executeGraphQL(``);
    const envCtx = await getGwaProductEnvironment(ctx, false);

    await injectResSvrAccessTokenToContext(envCtx);

    envCtx.subjectToken = envCtx.accessToken;

    const nsList = await getNamespaceResourceSetDetails(envCtx);

    //const nsList = await getMyNamespaces(envCtx);
    //console.log(nsList);
    const nsResList = nsList.map((r) => ({
      resource_id: r.rsid,
      name: r.rsname,
    }));

    const result = await getNamespaceAccess(ctx, envCtx, nsResList);

    result.forEach((r) => {
      this.gNamespaceAccess.set(
        {
          namespace: r.namespace,
          subject: r.subjectName ? r.subjectName : r.subject,
          permission: r.scope,
        },
        1
      );
    });
  }

  async generateNamespaceMetrics() {
    const ctx = this.keystone.createContext({
      skipAccessControl: true,
      authentication: { item: {} },
    });
    //const envCtx = await getGwaProductEnvironment(ctx, false);
    const result = await getNamespaces(ctx);

    const allEnvs = await getAllProdEnvironments(ctx);
    const nsInDirectory: { [key: string]: boolean } = {};
    allEnvs.forEach((env: Environment) => {
      nsInDirectory[env.product?.namespace] = true;
    });

    result.forEach((r) => {
      this.gNamespaces.set(
        {
          namespace: r.name,
          org: r.org?.title,
          org_unit: r.orgUnit?.title,
          org_enabled: r.orgEnabled,
          data_plane: r.permDataPlane,
          prod_in_directory: r.name in nsInDirectory,
        },
        1
      );
    });
  }

  /*
        'consumer',
        'application',
        'namespace',
        'product',
        'environment',
        'flow',
        'requests_30_day',
        'date',
  */
  async generateConsumerMetrics() {
    const ctx = this.keystone.createContext({
      skipAccessControl: true,
      authentication: { item: {} },
    });
    const allConsumers = await getAllConsumers(ctx);

    const days = dateRange(30);
    const metrics = await getAllConsumerDailyMetrics(ctx, days);

    //logger.debug(JSON.stringify(metrics, null, 5));
    function calcMetrics(ns: string, consumer: string) {
      const nsMetrics = metrics.filter((m) => {
        const metric = JSON.parse(m.metric);
        return metric.namespace === ns && metric.consumer === consumer;
      });

      return calculateStats(nsMetrics);
    }

    allConsumers
      .filter((sa: ServiceAccess) => sa.active)
      .forEach((sa: ServiceAccess) => {
        this.gConsumers.set(
          {
            consumer: sa.consumer?.username,
            consumerType: sa.consumerType,
            application: sa.application?.name,
            application_owner: sa.application?.owner?.name,
            namespace: sa.productEnvironment?.product?.namespace,
            dataset: sa.productEnvironment?.product?.dataset?.title,
            product: sa.productEnvironment?.product?.name,
            environment: sa.productEnvironment?.name,
            flow: sa.productEnvironment?.flow,
            requests_30_day: calcMetrics(
              sa.productEnvironment?.product?.namespace,
              sa.consumer?.username
            ).totalRequests,
            date: sa.createdAt,
          },
          1
        );
      });
  }

  /*
        'namespace',
        'product',
        'environment',
        'flow',
        'issuer',
        'enabled',
  */
  async generateProductMetrics() {
    const ctx = this.keystone.createContext({
      skipAccessControl: true,
      authentication: { item: {} },
    });
    const prods = await getAllEnvironments(ctx);
    prods.forEach((prodEnv: Environment) => {
      const env = prodEnv.credentialIssuer
        ? checkIssuerEnvironmentConfig(prodEnv.credentialIssuer, prodEnv.name)
        : null;

      const issuer = env ? env.issuerUrl : null;

      this.gProducts.set(
        {
          namespace: prodEnv.product?.namespace,
          product: prodEnv.product?.name,
          environment: prodEnv.name,
          flow: prodEnv.flow,
          issuer,
          enabled: prodEnv.active,
        },
        1
      );
    });
  }
}

export async function getNamespaces(context: any): Promise<Namespace[]> {
  const envCtx = await getGwaProductEnvironment(context, false);

  await injectResSvrAccessTokenToContext(envCtx);

  envCtx.subjectToken = envCtx.accessToken;
  //  const envCtx = await getEnvironmentContext(context, prodEnv.id, {}, false);

  const nsList = await getAllNamespaces(envCtx);
  return Promise.all(
    nsList.map(async (ns: any) => {
      if (ns.org) {
        await transformOrgAndOrgUnit(context, envCtx, ns, false);
      }
      return ns;
    })
  );
}

async function getAllProdEnvironments(ctx: any) {
  return (await getAllEnvironments(ctx)).filter(
    (env: Environment) => env.name === 'prod'
  );
}

async function getAllEnvironments(ctx: any) {
  const batch = new BatchService(ctx);

  // Limiting to 1000 is not great!  We should really recurse until we get to the end!
  const allEnvs = await batch.listAll(
    'allEnvironments',
    [
      'name',
      'flow',
      'active',
      'product { name, namespace }',
      'credentialIssuer { name, environmentDetails, inheritFrom { environmentDetails } }',
    ],
    undefined,
    0,
    1000
  );
  return allEnvs;
}

async function getAllConsumers(ctx: any) {
  const batch = new BatchService(ctx);

  // Limiting to 1000 is not great!  We should really recurse until we get to the end!
  const allConsumers = await batch.listAll(
    'allServiceAccesses',
    [
      'namespace',
      'active',
      'consumerType',
      'consumer { username }',
      'application { name, owner { name }}',
      'productEnvironment { namespace, name, flow, product { name, namespace, dataset { title } } }',
      'createdAt',
    ],
    undefined,
    0,
    1000
  );

  return allConsumers;
}
