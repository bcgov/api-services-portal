import { Logger } from '../../logger';
import { Activity } from './types';
import { strict as assert } from 'assert';
import { v4 as uuidv4 } from 'uuid';

const logger = Logger('keystone.activity');

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

  const activity = await context.executeGraphQL({
    query: `mutation ($name: String, $namespace: String, $type: String, $action: String, $refId: String, $message: String, $result: String, $activityContext: String, $userId: String, $blob: String, $blobRef: String) {
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
                      blob: $blob
                    }
                  }
                  actor: { connect: { id : $userId }} }) {
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
      blob: JSON.stringify(blob),
      blobRef: `${name} ${uuidv4()}`,
    },
  });
  if ('errors' in activity) {
    logger.error('[recordActivity] %j', activity);
  }
  logger.debug('[recordActivity] result %j', activity);
  return activity.data.createActivity;
}

export async function recordActivity(
  context: any,
  action: string,
  type: string,
  refId: string,
  message: string,
  result: string = '',
  activityContext: string = ''
) {
  const userId = context.authedItem.userId;
  const namespace = context.authedItem.namespace;
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
  first: number = 10,
  skip: number = 0
): Promise<any[]> {
  logger.debug('[getActivity] %d / %d', first, skip);

  const activities = await context.executeGraphQL({
    query: `query NamespaceActivities($first: Int, $skip: Int) {
              allActivities(first:$first, skip: $skip, sortBy: createdAt_DESC) {
                type
                name
                action
                refId
                result
                message
                context
                actor {
                  name
                }
                blob {
                  blob
                }
                createdAt
                updatedAt
              }
            }
      `,
    variables: { first, skip },
  });
  logger.debug(
    '[getActivity] returned=%d',
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
