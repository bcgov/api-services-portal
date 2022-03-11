import { lookupConsumerPlugins } from '../../../services/keystone';

import Context from '../../../mocks/handlers/keystone';

const context = Context('default');

describe('KeystoneJS', function () {
  describe('test lookupConsumerPlugins', function () {
    it('it should be successful', async function () {
      const consumer = await lookupConsumerPlugins(
        context,
        '6125e341423a8b576188bc4f'
      );
      expect(consumer.plugins.length).toBe(3);
    });
  });
});
