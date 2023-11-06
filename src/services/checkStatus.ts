import { logger } from '../logger';

import {
  IssuerMisconfigDetail,
  IssuerMisconfigError,
} from './issuerMisconfigError';

export async function checkStatus(res: any) {
  if (res.ok) {
    return res;
  } else {
    const error: IssuerMisconfigDetail = {
      reason: 'unknown_error',
      description: '',
      status: `${res.status} ${res.statusText}`,
    };
    logger.error('Error - %d %s', res.status, res.statusText);
    const body = await res.text();

    logger.error('ERROR ' + body);
    try {
      const errors = JSON.parse(body);
      error.reason = errors?.error ?? '';
      error.description = errors?.error_description ?? '';
      logger.error('Added reason to error: %j', error);
    } catch (e) {
      logger.error('Not able to parse error response (%s)', e);
    }
    throw new IssuerMisconfigError(error);
  }
}
