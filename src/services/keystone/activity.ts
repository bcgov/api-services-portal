import { Logger } from '../../logger';
import { Activity, ActivityWhereInput } from './types';
import { strict as assert } from 'assert';
import { v4 as uuidv4 } from 'uuid';

const logger = Logger('keystone.activity');

export interface TokenizedActivity {
  message: string;
  params: { [key: string]: string };
}

export async function recordActivityWithBlob(
  context: any,
  action: string,
  type: string,
  refId: string,
  message: string,
  result: string = '',
  activityContext: string = '',
  blob: any = {},
  ids: string[] = []
) {
  const userId = context.authedItem.userId;
  const namespace = context.authedItem.namespace;
  const name = `${action} ${type}[${refId}]`;
  logger.debug('[recordActivityWithBlob] userid=%s name=%s', userId, name);

  //const actor = userId ? 'actor: { connect: { id : $userId }} }' : '';

  const variables: { [key: string]: any } = {
    name,
    namespace,
    type,
    action,
    refId,
    message,
    result,
    activityContext,
    blob: typeof blob === 'string' ? blob : JSON.stringify(blob),
    blobRef: `${name} ${uuidv4()}`,
    blobType: typeof blob === 'string' ? 'yaml' : 'json',
    filterKey1: undefined,
    filterKey2: undefined,
    filterKey3: undefined,
    filterKey4: undefined,
  };
  ids.forEach((id: string, index: number) => {
    variables[`filterKey${index + 1}`] = id;
  });

  const activity = await context.executeGraphQL({
    query: `mutation ($name: String, $namespace: String, $type: String, $action: String, $refId: String, $message: String, $result: String, $activityContext: String, $filterKey1: String, $filterKey2: String, $filterKey3: String, $filterKey4: String, $blob: String, $blobType: String, $blobRef: String) {
                createActivity(data: {
                  type: $type, 
                  name: $name, 
                  namespace: $namespace, 
                  action: $action, 
                  refId: $refId, 
                  message: $message, 
                  result: $result, 
                  context: $activityContext, 
                  filterKey1: $filterKey1,
                  filterKey2: $filterKey2,
                  filterKey3: $filterKey3,
                  filterKey4: $filterKey4,
                  blob: {
                    create: {
                      ref: $blobRef,
                      type: $blobType,
                      blob: $blob
                    }
                  }
                }
            ) {
                    id
            } }`,
    variables,
  });
  logger.debug('[recordActivity] result %j', activity);
  if ('errors' in activity) {
    logger.error('[recordActivity] %j', activity);
  }
  assert.strictEqual(
    'errors' in activity,
    false,
    'Saving activity gave an error'
  );
  return activity.data.createActivity;
}

export async function updateActivity(
  context: any,
  id: string,
  result: string,
  activityContext: string = ''
) {
  // const userId = context.authedItem.userId;
  // const namespace = context.authedItem.namespace;
  logger.debug('[updateActivity] id=%s %s', id, result);

  const activity = await context.executeGraphQL({
    query: `mutation ($id: ID!, $result: String!) {
                updateActivity(id: $id, data: {
                  result: $result
                })
            }`,
    variables: {
      id,
      result,
    },
  });
  if ('errors' in activity) {
    logger.error('[updateActivity] %j', activity);
  }
  logger.debug('[updateActivity] result %j', activity);
  return activity.data.updateActivity;
}

export async function recordActivity(
  context: any,
  action: string,
  type: string,
  refId: string,
  message: string,
  result: string = '',
  activityContext: string = '',
  productNamespace: string = undefined,
  ids: string[] = []
) {
  const userId = context.authedItem.userId;
  const namespace = productNamespace
    ? productNamespace
    : context.authedItem.namespace;
  const name = `${action} ${type}[${refId}]`;
  logger.debug('[recordActivity] userid=%s name=%s', userId, name);

  const variables: { [key: string]: any } = {
    name,
    namespace,
    type,
    action,
    refId,
    message,
    result,
    activityContext,
    // userId,
    filterKey1: undefined,
    filterKey2: undefined,
    filterKey3: undefined,
    filterKey4: undefined,
  };
  ids.forEach((id: string, index: number) => {
    variables[`filterKey${index + 1}`] = id;
  });

  const activity = await context.executeGraphQL({
    query: `mutation ($name: String, $namespace: String, $type: String, $action: String, $refId: String, $message: String, $result: String, $activityContext: String, $userId: ID, $filterKey1: String, $filterKey2: String, $filterKey3: String, $filterKey4: String) {
                createActivity(data: { type: $type, name: $name, namespace: $namespace, action: $action, refId: $refId, message: $message, result: $result, context: $activityContext, filterKey1: $filterKey1, filterKey2: $filterKey2, filterKey3: $filterKey3, filterKey4: $filterKey4 }) {
                    id
            } }`,
    variables,
  });
  if (activity.errors) {
    logger.error('[recordActivity] %j', activity.errors);
  }

  return activity;
}

export async function getActivity(
  context: any,
  namespaces: string[],
  activityQuery: ActivityWhereInput,
  first: number = 10,
  skip: number = 0
): Promise<Activity[]> {
  logger.debug('[getActivity] %d / %d', first, skip);

  const where: ActivityWhereInput = {};
  if (activityQuery) {
    where['AND'] = [
      activityQuery,
      {
        namespace_in: namespaces,
      },
    ];
  } else {
    where.namespace_in = namespaces;
  }

  logger.debug('[getActivity] where: %j', where);

  const activities = await context.executeGraphQL({
    query: `query NamespaceActivities($where: ActivityWhereInput!, $first: Int, $skip: Int) {
              allActivities(where: $where, first:$first, skip: $skip, sortBy: createdAt_DESC) {
                id
                type
                name
                namespace
                action
                refId
                result
                message
                context
                actor {
                  name
                }
                blob {
                  type
                  blob
                }
                filterKey1
                createdAt
                updatedAt
              }
            }
      `,
    variables: { where, first, skip },
  });
  logger.debug(
    '[getActivity] returned=%d',
    activities.data.allActivities.length
  );
  return activities.data.allActivities;
}

export async function getActivityByRefId(
  context: any,
  refId: string,
  first: number = 10,
  skip: number = 0
): Promise<any[]> {
  logger.debug('[getActivityByRefId] %d / %d %s', first, skip, refId);

  const activities = await context.executeGraphQL({
    query: `query RefActivities($refId: String!, $first: Int, $skip: Int) {
              allActivities(where: { refId: $refId }, first:$first, skip: $skip, sortBy: createdAt_DESC) {
                type
                name
                namespace
                action
                refId
                result
                message
                context
                blob {
                  type
                  blob
                }
                createdAt
                updatedAt
              }
            }
      `,
    variables: { refId, first, skip },
  });
  logger.debug(
    '[getActivityByRefId] returned=%d',
    activities.data.allActivities.length
  );
  return activities.data.allActivities;
}

export function format(
  stringWithPlaceholders: string,
  replacements: { [key: string]: string }
) {
  return stringWithPlaceholders.replace(
    /{(\w+)}/g,
    (placeholderWithDelimiters, placeholderWithoutDelimiters) =>
      replacements.hasOwnProperty(placeholderWithoutDelimiters)
        ? replacements[placeholderWithoutDelimiters]
        : placeholderWithDelimiters
  );
}
