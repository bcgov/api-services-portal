import { createError } from 'apollo-errors'
import { EnforcementPoint } from '../../../authz/enforcement'
import { logger } from '../../../logger'

import { AliasConfig } from './types'

const AccessDeniedError = createError('AccessDeniedError', {
  message: 'You do not have access to this resource',
  options: { showPath: true },
});

export const EvalAccessControl = async (alias : AliasConfig, item : any, args : any, context : any, info : any) => {
    const access : any = { 'public' : EnforcementPoint }
    // authorize using the authenticed context
    const accessAnswer = await context.getCustomAccessControlForUser(item, args, context, info, access, alias.gqlName)
    if (!accessAnswer) {
        logger.debug('Access statically or implicitly denied %s', alias.gqlName);
        logger.info('Access Denied %s', alias.gqlName);
        // If the client handles errors correctly, it should be able to
        // receive partial data (for the fields the user has access to),
        // and then an `errors` array of AccessDeniedError's
        const type = alias.list
        throw new AccessDeniedError({
          data: { type, target: alias.gqlName },
          internalData: {
            authedId: context.authedItem && context.authedItem.id,
            authedListKey: context.authedListKey,
          },
        })
    }
    return accessAnswer
}