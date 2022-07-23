import { logger } from '../logger';

import { IssuerMisconfigError } from './issuerMisconfigError';

export async function checkStatus(res: any) {
  if (res.ok) {
    return res;
  } else {
    const error = {
      reason: 'unknown_error',
      status: `${res.status} ${res.statusText}`,
    };
    logger.error('Error - %d %s', res.status, res.statusText);
    const body = await res.text();

    logger.error('ERROR ' + body);
    try {
      const errors = JSON.parse(body);
      error['reason'] = errors['error'];
      logger.error('Added reason to error: %j', error);
    } catch (e) {
      logger.error('Not able to parse error response (%s)', e);
    }
    throw new IssuerMisconfigError(error);
  }
}
