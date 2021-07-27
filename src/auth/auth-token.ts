import { UnauthorizedError } from 'express-jwt';
import { strict as assert } from 'assert';

export default function getSubjectToken(req: any): string {
  var token;
  assert.strictEqual(Boolean(req), true, 'request is missing');
  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
      var scheme = parts[0];
      var credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      } else {
        throw new UnauthorizedError('credentials_bad_scheme', {
          message: 'Format is Authorization: Bearer [token]',
        });
      }
    } else {
      throw new UnauthorizedError('credentials_bad_format', {
        message: 'Format is Authorization: Bearer [token]',
      });
    }
  } else if ('x-forwarded-access-token' in req.headers) {
    token = req.headers['x-forwarded-access-token'];
  } else {
    throw new UnauthorizedError('credentials_required', {
      message: 'No authorization token was found',
    });
  }
  return token;
}
