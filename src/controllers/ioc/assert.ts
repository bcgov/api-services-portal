import { strict as assert } from 'assert';
import { ValidateError, FieldErrors } from 'tsoa';

export function assertEqual(
  condition: any,
  match: any,
  field: string,
  message: string
) {
  try {
    assert.strictEqual(condition, match, message);
  } catch (e) {
    var fieldErrors: FieldErrors = {};
    fieldErrors[field] = {
      message,
    };
    throw new ValidateError(fieldErrors, '');
  }
}
