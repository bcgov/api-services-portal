import { Keystone } from '@keystonejs/keystone';
import prom, { Gauge } from 'prom-client';
import { BatchService } from '../keystone/batch-service';
import { Activity, TemporaryIdentity } from '../keystone/types';
import {
  getGwaProductEnvironment,
  injectResSvrAccessTokenToContext,
} from '../workflow';
import { getNamespaceResourceSetDetails } from '../workflow/get-namespaces';
import { getNamespaceAccess } from './data';

export class PromMetrics {
  keystone: any;
  gNamespaces: Gauge;
  gNamespaceAccess: Gauge;
  gEmailList: Gauge;
  gActivity: Gauge;

  constructor(keystone: Keystone) {
    this.keystone = keystone;
  }

  public initialize() {
    const collectDefaultMetrics = prom.collectDefaultMetrics;
    const Registry = prom.Registry;
    const register = new Registry();
    collectDefaultMetrics({ register });

    this.gNamespaces = new prom.Gauge({
      name: 'namespaces',
      help: 'namespace counts',
      labelNames: ['namespace'],
    });

    this.gNamespaceAccess = new prom.Gauge({
      name: 'namespace_access',
      help: 'namespace access counts',
      labelNames: ['namespace', 'subject', 'permission'],
    });

    this.gEmailList = new prom.Gauge({
      name: 'email_list',
      help: 'email list for distribution',
      labelNames: ['namespace', 'email', 'provider'],
    });

    this.gActivity = new prom.Gauge({
      name: 'activity_summary',
      help: 'activity_summary',
      labelNames: ['namespace', 'actor', 'activity', 'date'],
    });
  }

  public getRegister() {
    return prom.register;
  }

  public async generateEmailList() {
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

  public async generateActivityMetrics() {
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
            date: new Date(data.createdAt).toISOString().substring(0, 7),
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

  public async generateMetrics() {
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
