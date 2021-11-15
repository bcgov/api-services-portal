import { lookupServiceAccessesByNamespace } from '../../../services/keystone';

const queries = [
  {
    name: 'GetServiceAccessByNamespace',
    data: {
      data: {
        allServiceAccesses: [
          {
            id: '3335e34140008b576188bc23',
            consumer: {
              username: 'DBA44A4F-06C16D06EB334F7D',
            },
          },
        ],
      },
    },
  },
];

describe('KeystoneJS', function () {
  const context = {
    executeGraphQL: (q: any) => {
      const queryDef = queries
        .filter((queryDef) => q.query.indexOf(queryDef.name) != -1)
        .pop();
      return queryDef.data;
    },
  };

  describe('test lookupServiceAccessesByNamespace', function () {
    it('it should be successful', async function () {
      const accesses = await lookupServiceAccessesByNamespace(context, 'ns123');
      expect(accesses.length).toBe(1);
      expect(accesses[0].consumer.username).toBe('DBA44A4F-06C16D06EB334F7D');
    });
  });
});
