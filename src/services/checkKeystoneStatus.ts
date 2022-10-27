import { logger } from '../logger';
import { strict as assert } from 'assert';

export function checkKeystoneStatus(
  ref: string,
  errorMessage: string,
  result: any
): void {
  if ('errors' in result) {
    logger.error('[%s] %j', ref, result['errors']);
    assert.strictEqual(result['errors'].length, 0, errorMessage);
  }
}
