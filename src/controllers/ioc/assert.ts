import { strict as assert } from 'assert';
import { ValidateError, FieldErrors } from 'tsoa';

export function assertIsDefined<T>(
  value: T | undefined,
  field: string,
  message: string
): asserts value is T {
  if (value === undefined) {
    var fieldErrors: FieldErrors = {};
    fieldErrors[field] = {
      message,
    };
    throw new ValidateError(fieldErrors, 'Validation Failed');
  }
}
export function assertEqual(
  condition: any,
  match: any,
  field: string,
  message: string
) {
  if (condition !== match) {
    var fieldErrors: FieldErrors = {};
    fieldErrors[field] = {
      message,
    };
    throw new ValidateError(fieldErrors, 'Validation Failed');
  }
}
