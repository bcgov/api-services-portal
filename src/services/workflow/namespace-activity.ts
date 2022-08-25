import { strict as assert } from 'assert';
import { ActivityQueryFilter, ActivitySummary } from './types';
import { Logger } from '../../logger';
import { format, getActivity, recordActivity } from '../keystone/activity';
import { Environment, GatewayConsumer, User } from '../keystone/types';

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
    const struct =
      a.type === 'structured'
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

  constructor(context: any, namespace: string, actor: User) {
    this.context = context;
    this.namespace = namespace;
    this.actor = actor;
  }

  public async grantRevokeConsumerAccess(
    grant: boolean,
    success: boolean,
    env: Environment,
    consumer: GatewayConsumer
  ) {
    const { actor } = this;
    this.recordActivity(
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

  public async revokeAllConsumerAccess(
    success: boolean,
    consumer: GatewayConsumer
  ) {
    const { actor } = this;
    this.recordActivity(
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

  async recordActivity(
    success: boolean,
    message: string,
    params: { [key: string]: string },
    ids: string[]
  ) {
    const { context, namespace } = this;

    const activityContext = JSON.stringify({
      message,
      params,
    });
    logger.info('[recordActivity] %s %j', message, params);

    const result = await recordActivity(
      context,
      params.action,
      'structured',
      ids[0],
      format(message, params),
      success ? 'success' : 'failed',
      activityContext,
      namespace
    );
    if (result.errors) {
      logger.error('[recordActivity] %s %j %j', message, params, result);
    }
  }
}
