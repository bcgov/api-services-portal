import { strict as assert } from 'assert';
import { ActivityQueryFilter, ActivitySummary } from './types';
import { Logger } from '../../logger';
import { format, getActivity, recordActivity } from '../keystone/activity';
import {
  AccessRequest,
  Activity,
  Application,
  ConsumerProdEnvAccess,
  Environment,
  GatewayConsumer,
  GatewayService,
  Product,
  ServiceAccess,
  User,
} from '../keystone/types';

const logger = Logger('wf.Activity');
export interface ActivityDataInput {
  accessRequest?: AccessRequest;
  application?: Application;
  environment?: Environment;
  product?: Product;
  serviceAccess?: ServiceAccess;
  prodEnvAccessItem?: ConsumerProdEnvAccess;
  consumer?: GatewayConsumer;
  consumerUsername?: string;
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

  mapDataInputToParams(
    dataInput: ActivityDataInput,
    params: { [key: string]: string }
  ) {
    Object.keys(dataInput).forEach((key) => {
      switch (key) {
        case 'application':
          params[key] = dataInput.application.name;
          break;
        case 'product':
          params[key] = dataInput.product.name;
          break;
        case 'environment':
          params[key] = dataInput.environment.name;
          break;
        case 'consumer':
          params[key] = dataInput.consumer.username;
          break;
        case 'consumerUsername':
          params['consumer'] = dataInput.consumerUsername;
          break;
        case 'prodEnvAccessItem':
          params[key] = dataInput.prodEnvAccessItem.productName;
          break;
      }
    });
  }

  mapDataInputToIDs(idKeys: string[], dataInput: ActivityDataInput): string[] {
    return idKeys.map((key) => (dataInput as any)[key].id);
  }

  public async logApproveAccess(
    success: boolean,
    dataInput: ActivityDataInput
  ) {
    const { actor } = this;
    const message =
      '{actor} {action} {entity} for {application} ({consumer}) to access {product} {environment}';
    const params = {
      actor: actor.name,
      action: 'approved',
      entity: 'access request',
    };
    this.mapDataInputToParams(dataInput, params);

    return this.recordActivity(
      success,
      message,
      params,
      this.mapDataInputToIDs(
        ['accessRequest', 'application', 'environment'],
        dataInput
      )
    );
  }

  public async logRejectAccess(success: boolean, dataInput: ActivityDataInput) {
    const { actor } = this;
    const message =
      '{actor} {action} {entity} for {application} ({consumer}) to access {product} {environment}';
    const params = {
      actor: actor.name,
      action: 'rejected',
      entity: 'access request',
    };
    this.mapDataInputToParams(dataInput, params);

    return this.recordActivity(
      success,
      message,
      params,
      this.mapDataInputToIDs(
        ['accessRequest', 'application', 'environment'],
        dataInput
      )
    );
  }

  public async logCollectedCredentials(
    success: boolean,
    dataInput: ActivityDataInput,
    pendingApproval: boolean
  ) {
    const { actor } = this;
    const message =
      '{actor} {action} for {application} ({consumer}) to access {product} {environment} ({note})';
    const params = {
      actor: actor.name,
      action: 'received credentials',
      entity: 'access',
      note: pendingApproval ? 'access pending approval' : 'auto approved',
    };
    this.mapDataInputToParams(dataInput, params);

    return this.recordActivity(
      success,
      message,
      params,
      this.mapDataInputToIDs(
        ['accessRequest', 'application', 'environment'],
        dataInput
      )
    );
  }

  public async logGrantRevokeConsumerAccess(
    success: boolean,
    grant: boolean,
    dataInput: ActivityDataInput
  ) {
    const { actor } = this;
    const params = {
      actor: actor.name,
      action: grant ? 'granted' : 'revoked',
      entity: 'access',
    };
    this.mapDataInputToParams(dataInput, params);

    const ids = this.mapDataInputToIDs(['consumer'], dataInput);

    return this.recordActivity(
      success,
      grant
        ? '{actor} {action} {consumer} {entity} to {product} {environment}'
        : '{actor} {action} {entity} to {product} {environment} from {consumer}',
      params,
      ids
    );
  }

  public async logRevokeAllConsumerAccess(
    success: boolean,
    dataInput: ActivityDataInput
  ) {
    const { actor } = this;

    const params = {
      actor: actor.name,
      action: 'revoked all',
      entity: 'access',
    };
    this.mapDataInputToParams(dataInput, params);

    const ids = this.mapDataInputToIDs(['consumer'], dataInput);

    return this.recordActivity(
      success,
      '{actor} {action} {entity} from {consumer}',
      params,
      ids
    );
  }

  public async logUpdateConsumerAccess(
    success: boolean,
    dataInput: ActivityDataInput,
    accessUpdate: string
  ) {
    const { actor } = this;

    const message =
      '{actor} {action} {entity} (Product:{product} {environment}, Consumer: {consumer}) to: {accessUpdate}';
    const params = {
      actor: actor.name,
      action: 'updated',
      entity: 'ConsumerProductAccess',
      accessUpdate,
    };

    this.mapDataInputToParams(dataInput, params);

    //const ids = this.mapDataInputToIDs(['consumer'], dataInput);

    return this.recordActivity(success, message, params, [
      `ConsumerProdEnvAccess=${dataInput.consumer.id}.${dataInput.prodEnvAccessItem.environment.id}`,
      `Consumer.username=${dataInput.consumer.username}`,
      `Product=${dataInput.prodEnvAccessItem.productName}`,
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
    return this.recordActivity(success, message, params, [
      `consumerUsername: ${consumerUsername}`,
    ]);
  }

  public async logDeleteAccess(success: boolean, dataInput: ActivityDataInput) {
    const nsServiceAccount =
      dataInput.environment.appId === process.env.GWA_PROD_ENV_SLUG;

    const { actor } = this;

    if (nsServiceAccount) {
      const message = '{actor} {action} {entity} ({consumer})';
      const params = {
        actor: actor.name,
        action: 'deleted',
        entity: 'namespace service account',
      };
      this.mapDataInputToParams(dataInput, params);

      return this.recordActivity(success, message, params, [
        `consumerUsername: ${dataInput.consumerUsername}`,
      ]);
    } else {
      const message =
        '{actor} {action} {entity} to {product} {environment} from {consumer}';
      const params = {
        actor: actor.name,
        action: 'revoked',
        entity: 'access',
      };
      this.mapDataInputToParams(dataInput, params);

      return this.recordActivity(success, message, params, [
        `consumerUsername: ${dataInput.consumerUsername}`,
      ]);
    }
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

export async function getFilteredNamespaceActivity(
  context: any,
  ns: string,
  first: number,
  skip: number,
  filter: ActivityQueryFilter
): Promise<ActivitySummary[]> {
  logger.debug('[getFilteredNamespaceActivity] %s %j', ns, filter);

  const activities = await getActivity(context, [ns], first, skip);

  return activities
    .map((a) => {
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
    })
    .map((a) => {
      if (!('actor' in a.params)) {
        a.params['actor'] = 'Unknown Actor';
      }
      return a;
    });
}
