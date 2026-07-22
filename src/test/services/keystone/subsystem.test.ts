import { lookupSubsystemNameById } from '../../../services/keystone/subsystem';

const subsystems = [
  { id: '1', name: 'MY-SUBSYS' },
  { id: '2', name: 'OTHER-SUBSYS' },
];

function mockContext(): any {
  return {
    executeGraphQL: jest.fn(({ query, variables }: any) => {
      if (query.includes('SubsystemNameById')) {
        const subsystem = subsystems.find((s) => s.id === variables.id);
        return {
          data: { allSubsystems: subsystem ? [{ name: subsystem.name }] : [] },
        };
      }
      return { errors: [{ message: 'Unexpected query' }] };
    }),
  };
}

describe('KeystoneJS subsystem', function () {
  describe('lookupSubsystemNameById', function () {
    it('looks up subsystem name by id', async function () {
      await expect(
        lookupSubsystemNameById(mockContext(), '1')
      ).resolves.toBe('MY-SUBSYS');
    });

    it('returns undefined when subsystem id is not found', async function () {
      await expect(
        lookupSubsystemNameById(mockContext(), 'missing')
      ).resolves.toBeUndefined();
    });
  });
});
