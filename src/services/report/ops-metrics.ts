import { Keystone } from '@keystonejs/keystone';
//import prom, { Gauge } from 'prom-client';
import { BatchService } from '../keystone/batch-service';
import { Activity, TemporaryIdentity } from '../keystone/types';
import {
  getGwaProductEnvironment,
  injectResSvrAccessTokenToContext,
} from '../workflow';
import { getNamespaceResourceSetDetails } from '../workflow/get-namespaces';
import { getNamespaceAccess } from './data';

import { Logger } from '../../logger';

const logger = Logger('report.OpsMetrics');

class Gauge {
  _name: string;
  _values: { [key: string]: any } = {};

  constructor(config: { name: string; help: string; labelNames: string[] }) {
    this._name = config.name;
  }

  public set(labels: any, value: number) {
    this._values[JSON.stringify(labels)] = { value, labels };
  }

  public inc(labels: any, inc: number = 1) {
    const val = this._values[JSON.stringify(labels)]
      ? this._values[JSON.stringify(labels)]
      : 0;
    this._values[JSON.stringify(labels)] = { value: val + inc, labels };
  }

  public reset() {
    this._values = {};
  }

  public name() {
    return this._name;
  }

  public data() {
    return Object.keys(this._values).map((k: string) => {
      const record: any = { value: this._values[k].value };
      for (const [key, value] of Object.entries(this._values[k].labels)) {
        record[key] = value;
      }
      return record;
    });
  }
}

export class OpsMetrics {
  keystone: any;
  gNamespaces: Gauge;
  gNamespaceAccess: Gauge;
  gEmailList: Gauge;
  gActivity: Gauge;

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
      labelNames: ['namespace'],
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
  }

  // public getRegister() {
  //   return prom.register;
  // }

  public async generateMetrics() {
    await this.generateAccessMetrics();
    await this.generateEmailList();
    await this.generateActivityMetrics();
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

    async function recurse(skip = 0) {
      const data = await batch.listAll(
        'allActivities',
        ['namespace', 'context', 'createdAt'],
        undefined,
        skip,
        50
      );
      gActivity.reset();

      data.forEach((data: Activity) => {
        const context =
          Boolean(data.context) == false ? {} : JSON.parse(data.context);
        const actor = Boolean(context.params?.actor)
          ? context.params.actor
          : 'unknown';

        const activity = Boolean(context?.params?.action)
          ? `${context.params.action} ${context.params.entity}`
          : context.message;
        console.log(activity);
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
      this.gNamespaces.set({ namespace: r.namespace }, 1);
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
}
