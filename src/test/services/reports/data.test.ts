import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { Policy } from '../../../services/uma2';
import { getNamespaces, processPolicies } from '../../../services/report/data';
import { ReportProcessorService } from '../../../services/report/data/processor';

describe('Generate Namespace Reports', function () {
  const server = setupServer(
    rest.get('http://hello', (req, res, ctx) => {
      return res(
        ctx.json({
          message: 'hello',
        })
      );
    })
  );

  // Enable API mocking before tests.
  beforeAll(() => server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  describe('output namespace list', function () {
    it('it should generate report', async function () {
      const reporter = new ReportProcessorService('');
      reporter.getUser('abc');
      // const nsList: string[] = await getNamespaces();
      // nsList.forEach(nsHandler);
    });
  });
});

async function nsHandler(ns: string) {
  console.log('nsHandle', ns);

  const policies: Policy[] = [
    { users: ['a', 'b'], id: 'p', name: 'p', description: 'p', scopes: [] },
    { users: ['c', 'd'], id: 'p', name: 'p', description: 'p', scopes: [] },
    {
      clients: ['c1', 'c2', 'c3'],
      id: 'p',
      name: 'p',
      description: 'p',
      scopes: [],
    },
  ];
  processPolicies(policies);
}
