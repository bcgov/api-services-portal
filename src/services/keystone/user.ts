import { Logger } from '../../logger';
import { User } from './types';

const assert = require('assert').strict;
const logger = Logger('keystone.user');

export interface LegalAgreed {
  reference: string;
  agreedTimestamp: string;
}

export async function lookupUserLegals(
  context: any,
  id: string
): Promise<LegalAgreed[]> {
  const result = await context.executeGraphQL({
    query: `query GetUser($id: ID!) {
                    User(where: {id: $id}) {
                        legalsAgreed
                    }
                }`,
    variables: { id: id },
  });
  logger.debug('Query [lookupUserLegals] result %j', result);
  assert.strictEqual(result.data.User != null, true, 'User not found');
  result.data.User.legalsAgreed == null &&
    (result.data.User.legalsAgreed = '[]');
  return JSON.parse(result.data.User.legalsAgreed);
}

export async function updateUserLegalAccept(
  context: any,
  userId: string,
  legalReference: string
): Promise<LegalAgreed[]> {
  const legalsAgreed: LegalAgreed[] = await lookupUserLegals(context, userId);

  if (
    legalsAgreed.filter((ag) => ag.reference === legalReference).length == 0
  ) {
    legalsAgreed.push({
      reference: legalReference,
      agreedTimestamp: new Date().toISOString(),
    });
    const result = await context.executeGraphQL({
      query: `mutation UpdateUserWithLegalAccept($userId: ID!, $legalsAgreed: String!) {
                        updateUser(id: $userId, data: { legalsAgreed: $legalsAgreed } ) {
                            legalsAgreed
                        }
                    }`,
      variables: { userId, legalsAgreed: JSON.stringify(legalsAgreed) },
    });
    logger.debug('[updateUserLegalAccept] RESULT %j', result);
    assert.strictEqual(
      result.data.updateUser != null,
      true,
      'Failed to update legal terms for user'
    );
    return JSON.parse(result.data.updateUser.legalsAgreed);
  } else {
    logger.warn(
      "[updateUserLegalAccept] User '%s' already agreed to '%s' terms",
      userId,
      legalReference
    );
    return legalsAgreed;
  }
}

export async function lookupUserByUsername(
  context: any,
  username: string
): Promise<[User]> {
  const result = await context.executeGraphQL({
    query: `query GetUserWithUsername($username: String!) {
                    allUsers(where: {username: $username}) {
                        id
                        name
                        username
                        email
                    }
                }`,
    variables: { username: username },
  });
  logger.debug('Query [lookupUserByUsername] result %j', result);
  assert.strictEqual(result.data.allUsers.length, 1, 'UserNotFound');
  return result.data.allUsers;
}
