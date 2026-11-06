const mockFindHosted = jest.fn();
jest.mock('../../../services/batch/runtime-group', () => ({
  RuntimeGroupService: jest.fn(() => ({ findHostedRuntimeGroupsByName: mockFindHosted })),
}));
const mockCreateNamespace = jest.fn();
jest.mock('../../../services/workflow/create-namespace', () => ({ CreateNamespace: mockCreateNamespace }));
const { CreateNamespaceForSubsystem } = require('../../../services/workflow/create-namespace-sdx');
test('rejects a runtime that does not host the subsystem organization before any side effects', async () => {
  mockFindHosted.mockResolvedValue([]);
  const context = { createContext: jest.fn() };
  await expect(CreateNamespaceForSubsystem(context, {
    subsystem: { organization: { name: 'ministry-of-tech' } }, runtimeGroupName: 'share0',
  })).rejects.toThrow("Runtime group 'share0' does not host organization 'ministry-of-tech'");
  expect(context.createContext).not.toHaveBeenCalled();
  expect(mockCreateNamespace).not.toHaveBeenCalled();
});
