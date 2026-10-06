import { isSdxViewer } from '../../../services/keystone/temporary-identity';

function contextWithSubsystems(subsystems) {
  return {
    executeGraphQL: jest
      .fn()
      .mockResolvedValue({ data: { allSubsystems: subsystems } }),
  };
}

it('is an SDX viewer with Namespace.View on a subsystem gateway', async function () {
  const context = contextWithSubsystems([{ id: '1' }]);

  await expect(
    isSdxViewer(context, 'sdx-gw-abc12', ['Namespace.View', 'Subsystem.Manage'])
  ).resolves.toBe(true);
  expect(context.executeGraphQL.mock.calls[0][0].variables).toEqual({
    namespace: 'sdx-gw-abc12',
  });
});

it('is not an SDX viewer on a gateway without a subsystem', async function () {
  await expect(
    isSdxViewer(contextWithSubsystems([]), 'gw-abc12', ['Namespace.View'])
  ).resolves.toBe(false);
});

it('is not an SDX viewer without Namespace.View or with manage scopes', async function () {
  const context = contextWithSubsystems([{ id: '1' }]);

  await expect(
    isSdxViewer(context, 'sdx-gw-abc12', ['Subsystem.Manage'])
  ).resolves.toBe(false);
  await expect(
    isSdxViewer(context, 'sdx-gw-abc12', ['Namespace.View', 'Namespace.Manage'])
  ).resolves.toBe(false);
  await expect(
    isSdxViewer(context, 'sdx-gw-abc12', ['Namespace.View', 'Access.Manage'])
  ).resolves.toBe(false);
  await expect(isSdxViewer(context, null, ['Namespace.View'])).resolves.toBe(
    false
  );
  expect(context.executeGraphQL).not.toHaveBeenCalled();
});
