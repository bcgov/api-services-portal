import { lookupServiceAccessesByNamespace } from '../../../services/keystone';
import Context from '../../../mocks/handlers/keystone';

const context = Context('default');

describe('KeystoneJS', function () {
  describe('test lookupServiceAccessesByNamespace', function () {
    it('it should be successful', async function () {
      const accesses = await lookupServiceAccessesByNamespace(context, 'ns123');
      expect(accesses.length).toBe(1);
      expect(accesses[0].consumer.username).toBe('DBA44A4F-06C16D06EB334F7D');
    });
  });
});
