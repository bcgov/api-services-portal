import { getServiceMetrics, calculateStats } from '../../../services/keystone';
import numeral from 'numeral';

import Context from '../../mocks/handlers/keystone';

const context = Context('default');

describe('KeystoneJS', function () {
  describe('test getServiceMetrics', function () {
    it('it should be successful', async function () {
      const days = [
        '2021-10-21',
        '2021-10-20',
        '2021-10-19',
        '2021-10-18',
        '2021-10-17',
      ];
      const services = ['aps-authz'];

      const metrics = await getServiceMetrics(context, services, days);
      expect(metrics.length).toBe(5);

      const { totalRequests } = calculateStats(metrics);
      expect(totalRequests).toBe(2010);

      const daily = numeral(totalRequests).format('0.0a');
      expect(daily).toBe('2.0k');
    });
  });
});
