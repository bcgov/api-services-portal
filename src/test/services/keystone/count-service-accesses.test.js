import { countOtherServiceAccessesByConsumer } from '../../../services/keystone/service-access';

function contextReturning(result) {
  return { executeGraphQL: jest.fn().mockResolvedValue(result) };
}

it('counts the consumer service accesses other than the given one', async function () {
  const context = contextReturning({
    data: { allServiceAccesses: [{ id: 'sa-2' }, { id: 'sa-3' }] },
  });

  await expect(
    countOtherServiceAccessesByConsumer(context, 'consumer-1', 'sa-1')
  ).resolves.toBe(2);

  const { query, variables } = context.executeGraphQL.mock.calls[0][0];
  expect(query).toContain('id_not: $serviceAccessId');
  expect(variables).toEqual({
    consumerId: 'consumer-1',
    serviceAccessId: 'sa-1',
  });
});

it('fails on GraphQL errors', async function () {
  const context = contextReturning({ errors: [{ message: 'boom' }] });

  await expect(
    countOtherServiceAccessesByConsumer(context, 'consumer-1', 'sa-1')
  ).rejects.toThrow('boom');
});
