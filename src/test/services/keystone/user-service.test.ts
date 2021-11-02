import { lookupUsersByUsernames } from '../../../services/keystone';

const queries = [
  {
    name: 'GetUsersWithUsernames',
    data: {
      data: {
        allUsers: [
          {
            id: '60a2ec5185ff5040b3cf3636',
            name: 'Platform F Platform L',
            username: 'platform',
            email: 'platform@nowhere',
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

  describe('test lookupUsersByUsernames', function () {
    it('it should be successful', async function () {
      const usernames = ['platform'];
      const accesses = await lookupUsersByUsernames(context, usernames);
      expect(accesses.length).toBe(1);
    });
  });
});
