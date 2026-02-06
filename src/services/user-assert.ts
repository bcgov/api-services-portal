import { Logger } from '../logger';

const logger = Logger('assert');

export class UserAssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserAssertionError';
  }
}

/**
 * A simplified version of assert.strictEqual that throws a UserAssertionError instead of
 * an AssertionError, and logs the actual and expected values.
 *
 * It is to avoid getting the "false !== true" kind of message appended to the message in the assertion.
 *
 *
 * @throws {UserAssertionError} when actual !== expected
 * @param actual
 * @param expected
 * @param message
 */
function strictEqual(actual: any, expected: any, message?: string) {
  if (actual !== expected) {
    logger.warn(
      'strictEqual assertion failed: %j !== %j : %s',
      actual,
      expected,
      message
    );

    throw new UserAssertionError(message);
  }
}

export default {
  strictEqual,
};
