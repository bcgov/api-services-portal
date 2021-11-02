import { lookupConsumerPlugins } from '../../../services/keystone';

const queries = [
  {
    name: 'GetConsumerPlugins',
    data: {
      data: {
        allGatewayConsumers: [
          {
            id: '6125e341423a8b576188bc4f',
            username: 'DBA44A4F-06C16D06EB334F7D',
            aclGroups: '[]',
            customId: 'DBA44A4F-06C16D06EB334F7D',
            extForeignKey: '85a9bdba-5bc4-434a-895b-a3decabd389f',
            namespace: null as string,
            plugins: [
              {
                id: '6172f0b81955bb79b67279d6',
                name: 'ip-restriction',
                config: '{"allow":["2.2.2.2"],"deny":null}',
                service: { id: '6120467ba988d4127e1d483c', name: 'aps-authz' },
                route: null as string,
              },
              {
                id: '6172f0c11955bb79b67279d8',
                name: 'rate-limiting',
                config:
                  '{"hide_client_headers":false,"minute":null,"policy":"local","month":null,"redis_timeout":2000,"limit_by":"consumer","redis_password":"****","second":5,"day":null,"redis_database":0,"year":null,"hour":null,"redis_host":"****","redis_port":6379,"header_name":null,"fault_tolerant":true}',
                service: { id: '6120467ba988d4127e1d4844', name: 'aps-portal' },
                route: null,
              },
              {
                id: '6172f0cc1955bb79b67279da',
                name: 'rate-limiting',
                config:
                  '{"hide_client_headers":false,"minute":100,"policy":"redis","month":null,"redis_timeout":2000,"limit_by":"consumer","redis_password":"****","second":null,"day":null,"redis_database":0,"year":null,"hour":null,"redis_host":"****","redis_port":6379,"header_name":null,"fault_tolerant":true}',
                service: null as string,
                route: { id: '6120467ba988d4127e1d4868', name: 'aps-portal' },
              },
            ],
            tags: '["aps-portal"]',
            createdAt: '2021-08-25T06:29:21.200Z',
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
