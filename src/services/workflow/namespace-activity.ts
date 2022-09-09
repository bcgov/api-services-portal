import { strict as assert } from 'assert';
import { ActivityQueryFilter, ActivitySummary } from './types';
import { Logger } from '../../logger';
import { format, getActivity, recordActivity } from '../keystone/activity';
import {
  AccessRequest,
  Application,
  ConsumerProdEnvAccess,
  Environment,
  GatewayConsumer,
  GatewayService,
  User,
} from '../keystone/types';

const logger = Logger('wf.Activity');

export async function getFilteredNamespaceActivity(
  context: any,
  ns: string,
  first: number,
  skip: number,
  filter: ActivityQueryFilter
): Promise<ActivitySummary[]> {
  logger.debug('[getFilteredNamespaceActivity] %s %j', ns, filter);

  const activities = await getActivity(context, [ns], first, skip);

  return activities.map((a) => {
    const struct = a.filterKey1
      ? JSON.parse(a.context)
      : { message: a.message, params: {} };

    return {
      id: a.id,
      message: struct.message,
      params: struct.params,
      activityAt: a.createdAt,
      blob: a.blob,
    } as ActivitySummary;
  });
}

export class StructuredActivityService {
  context: any;
  namespace: string;
  actor: User;

  constructor(context: any, namespace: string) {
    this.context = context;
    this.namespace = namespace;
    this.actor = this.context.authedItem;
  }

  public async logApproveAccess(
    success: boolean,
    accessRequest: AccessRequest,
    env: Environment,
    app: Application,
    consumerUsername: string
  ) {
    const { actor } = this;
    const message = success
      ? '{actor} {action} {entity} for {application} ({consumer}) to access {product} {environment}'
      : 'Failed to {action} {entity} for {application} ({consumer}) to access {product} {environment} (user: {actor})';
    const params = {
      actor: actor.name,
      action: success ? 'approved' : 'approve',
      entity: 'access request',
      application: app.name,
      product: env.product.name,
      environment: env.name,
      consumer: consumerUsername,
    };
    return this.recordActivity(success, message, params, [
      `accessRequest:${accessRequest.id}`,
      `application:${app.id}`,
      `environment:${env.id}`,
    ]);
  }

  public async logRejectAccess(
    success: boolean,
    accessRequest: AccessRequest,
    env: Environment,
    app: Application,
    consumerUsername: string
  ) {
    const { actor } = this;
    const message = success
      ? '{actor} {action} {entity} for {application} ({consumer}) to access {product} {environment}'
      : 'Failed to {action} {entity} for {application} ({consumer}) to access {product} {environment} (user: {actor})';
    const params = {
      actor: actor.name,
      action: success ? 'rejected' : 'reject',
      entity: 'access request',
      application: app.name,
      product: env.product.name,
      environment: env.name,
      consumer: consumerUsername,
    };
    return this.recordActivity(success, message, params, [
      `accessRequest:${accessRequest.id}`,
      `application:${app.id}`,
      `environment:${env.id}`,
    ]);
  }

  public async logCollectedCredentials(
    env: Environment,
    app: Application,
    consumerUsername: string,
    pendingApproval: boolean
  ) {
    const { actor } = this;
    const message =
      '{actor} {action} for {application} ({consumer}) to access {product} {environment} ({note})';
    const params = {
      actor: actor.name,
      action: 'received credentials',
      entity: 'access',
      application: app.name,
      product: env.product.name,
      environment: env.name,
      consumer: consumerUsername,
      note: pendingApproval ? 'access pending approval' : 'auto approved',
    };
    return this.recordActivity(true, message, params, [
      `application:${app.id}`,
      `user:${actor.id}`,
    ]);
  }

  public async logGrantRevokeConsumerAccess(
    grant: boolean,
    success: boolean,
    env: Environment,
    consumer: GatewayConsumer
  ) {
    const { actor } = this;
    return this.recordActivity(
      success,
      grant
        ? '{actor} {action} {consumer} {entity} to {product} {env}'
        : '{actor} {action} {entity} to {product} {env} from {consumer}',
      {
        actor: actor.name,
        action: grant ? 'granted' : 'revoked',
        entity: 'access',
        product: env.product.name,
        env: env.name,
        consumer: consumer.username,
      },
      [`consumer:${consumer.id}`]
    );
  }

  public async logRevokeAllConsumerAccess(
    success: boolean,
    consumer: GatewayConsumer
  ) {
    const { actor } = this;
    return this.recordActivity(
      success,
      '{actor} {action} {entity} from {consumer}',
      {
        actor: actor.name,
        action: 'revoked all',
        entity: 'access',
        consumer: consumer.username,
      },
      [`consumer:${consumer.id}`]
    );
  }

  public async logUpdateConsumerAccess(
    prodEnvAccessItem: ConsumerProdEnvAccess,
    consumer: GatewayConsumer,
    accessUpdate: string
  ) {
    const { actor } = this;

    const message =
      '{actor} {action} {entity} (Product:{product} {environment}, Consumer: {consumer}) to: {accessUpdate}';
    const params = {
      actor: actor.name,
      action: 'updated',
      entity: 'ConsumerProductAccess',
      product: prodEnvAccessItem.productName,
      environment: prodEnvAccessItem.environment.name,
      accessUpdate,
      consumer: consumer.username,
    };
    return this.recordActivity(true, message, params, [
      `ConsumerProdEnvAccess=${consumer.id}.${prodEnvAccessItem.environment.id}`,
      `Consumer.username=${consumer.username}`,
      `Product=${prodEnvAccessItem.productName}`,
    ]);
  }

  public async logCreateServiceAccount(
    success: boolean,
    permissions: string[],
    consumerUsername: string
  ) {
    const { actor } = this;
    const message =
      '{actor} {action} {entity} ({consumer}) with permissions: {permissions}';
    const params = {
      actor: actor.name,
      action: 'created',
      entity: 'namespace service account',
      permissions: permissions.join(', '),
      consumer: consumerUsername,
    };
    return this.recordActivity(true, message, params, [
      `consumerUsername: ${consumerUsername}`,
    ]);
  }

  async recordActivity(
    success: boolean,
    message: string,
    params: { [key: string]: string },
    ids: string[]
  ) {
    const { context, namespace } = this;

    assert.strictEqual(
      ids.length > 0 && ids.length < 4,
      true,
      'Must be atleast one id and no more than 3'
    );

    const activityContext = JSON.stringify({
      message,
      params,
    });

    const formattedMessage = format(message, params);
    logger.info('%s', formattedMessage);

    const result = await recordActivity(
      context,
      params.action,
      params.entity,
      ids[0],
      formattedMessage,
      success ? 'success' : 'failed',
      activityContext,
      namespace,
      ids
    );
    if (result.errors) {
      logger.error('[recordActivity] %s %j %j', message, params, result);
    }
    return result;
  }
}
