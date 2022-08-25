import { Logger } from '../../logger';
import { Activity } from './types';
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
  blob: any = {}
) {
  const userId = context.authedItem.userId;
  const namespace = context.authedItem.namespace;
  const name = `${action} ${type}[${refId}]`;
  logger.debug('[recordActivityWithBlob] userid=%s name=%s', userId, name);

  const actor = userId ? 'actor: { connect: { id : $userId }} }' : '';

  const activity = await context.executeGraphQL({
    query: `mutation ($name: String, $namespace: String, $type: String, $action: String, $refId: String, $message: String, $result: String, $activityContext: String, $blob: String, $blobRef: String) {
                createActivity(data: {
                  type: $type, 
                  name: $name, 
                  namespace: $namespace, 
                  action: $action, 
                  refId: $refId, 
                  message: $message, 
                  result: $result, 
                  context: $activityContext, 
                  blob: {
                    create: {
                      ref: $blobRef,
                      type: "json",
                      blob: $blob
                    }
                  }
                }
            ) {
                    id
            } }`,
    variables: {
      name,
      namespace,
      type,
      action,
      refId,
      message,
      result,
      activityContext,
      blob: JSON.stringify(blob),
      blobRef: `${name} ${uuidv4()}`,
    },
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
    query: `mutation ($id: ID!, $activityContext: String!, $result: String!) {
                updateActivity(id: $id, data: {
                  context: $activityContext, 
                  result: $result
                })
            }`,
    variables: {
      id,
      result,
      activityContext,
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
  productNamespace: string = undefined
) {
  const userId = context.authedItem.userId;
  const namespace = productNamespace
    ? productNamespace
    : context.authedItem.namespace;
  const name = `${action} ${type}[${refId}]`;
  logger.debug('[recordActivity] userid=%s name=%s', userId, name);

  const activity = context.executeGraphQL({
    query: `mutation ($name: String, $namespace: String, $type: String, $action: String, $refId: String, $message: String, $result: String, $activityContext: String, $userId: String) {
                createActivity(data: { type: $type, name: $name, namespace: $namespace, action: $action, refId: $refId, message: $message, result: $result, context: $activityContext, actor: { connect: { id : $userId }} }) {
                    id
            } }`,
    variables: {
      name,
      namespace,
      type,
      action,
      refId,
      message,
      result,
      activityContext,
      userId,
    },
  });

  return activity.catch((e: any) => {
    logger.error('Activity Recording Error %s', e);
  });
}

export async function getActivity(
  context: any,
  namespaces: string[],
  first: number = 10,
  skip: number = 0
): Promise<Activity[]> {
  logger.debug('[getActivity] %d / %d', first, skip);

  const activities = await context.executeGraphQL({
    query: `query NamespaceActivities($namespaces: [String]!, $first: Int, $skip: Int) {
              allActivities(where: { namespace_in: $namespaces }, first:$first, skip: $skip, sortBy: createdAt_DESC) {
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
                createdAt
                updatedAt
              }
            }
      `,
    variables: { namespaces, first, skip },
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
                actor {
                  name
                }
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
