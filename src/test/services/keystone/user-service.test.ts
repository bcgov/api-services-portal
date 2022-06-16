import { lookupUsersByUsernames } from '../../../services/keystone';

import Context from '../../mocks/handlers/keystone';

const context = Context('default');

describe('KeystoneJS', function () {
  describe('test lookupUsersByUsernames', function () {
    it('it should be successful', async function () {
      const usernames = ['platform'];
      const accesses = await lookupUsersByUsernames(context, usernames);
      expect(accesses.length).toBe(1);
    });
  });
});
