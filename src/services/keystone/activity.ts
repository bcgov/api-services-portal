import { Logger } from '../../logger'

const assert = require('assert').strict;
const logger = Logger('keystone.activity')

export async function recordActivity (context: any, action: string, type: string, refId: string, message: string, result:string = "", activityContext:string = "") {
    const userId = context.authedItem.userId
    const namespace = context.authedItem.namespace
    const name = `${action} ${type}[${refId}]`
    logger.debug("[recordActivity] userid=%s name=%s", userId, name)

    const activity = context.executeGraphQL({
        query: `mutation ($name: String, $namespace: String, $type: String, $action: String, $refId: String, $message: String, $result: String, $activityContext: String, $userId: String) {
                createActivity(data: { type: $type, name: $name, namespace: $namespace, action: $action, refId: $refId, message: $message, result: $result, context: $activityContext, actor: { connect: { id : $userId }} }) {
                    id
            } }`,
        variables: { name, namespace, type, action, refId, message, result, activityContext, userId },
    })
    logger.debug("[recordActivity] result %j", activity)
    return activity.catch((e:any) => {logger.error("Activity Recording Error %s", e)})
}
