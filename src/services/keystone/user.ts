import { Logger } from "../../logger"
import { User } from "./types"

const assert = require('assert').strict;
const logger = Logger('keystone.user')

export interface LegalsAgreed {
    reference: string,
    agreedTimestamp: string
}

async function lookupUserLegals (context: any, id: string) : Promise<User> {
    const result = await context.executeGraphQL({
        query: `query GetUser($id: ID!) {
                    User(where: {id: $id}) {
                        legalsAgreed
                    }
                }`,
        variables: { id: id },
    })
    logger.debug("Query [lookupUserLegals] result %j", result)
    assert.strictEqual(result.data.User != null, true, "User not found")
    result.data.User.legalsAgreed == null && (result.data.User.legalsAgreed = '[]')
    return result.data.User
}

export async function updateUserLegalAccept (context: any, userId: string, legalReference: string) : Promise<User> {

    const user = await lookupUserLegals (context, userId)
    const legalsAgreed : LegalsAgreed[] = JSON.parse(user.legalsAgreed)

    if (legalsAgreed.filter((ag:LegalsAgreed) => ag.reference === legalReference).length == 0) {
        legalsAgreed.push({
            reference: legalReference,
            agreedTimestamp: new Date().toISOString()
        })
        const result = await context.executeGraphQL({
            query: `mutation UpdateUserWithLegalAccept($userId: ID!, $legalsAgreed: String!) {
                        updateUser(id: $userId, data: { legalsAgreed: $legalsAgreed } ) {
                            legalsAgreed
                        }
                    }`,
            variables: { userId, legalsAgreed: JSON.stringify(legalsAgreed) },
        })
        logger.debug("[updateUserLegalAccept] RESULT %j", result)
        assert.strictEqual(result.data.updateUser != null, true, "Failed to update legal terms for user")
        return result.data.updateUser
    } else {
        logger.warn("[updateUserLegalAccept] User '%s' already agreed to '%s' terms", userId, legalReference)
        return user
    }
}


