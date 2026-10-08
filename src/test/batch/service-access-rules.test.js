const { metadata } = require('../../batch/data-rules');
const { connectOne } = require('../../batch/transformations/connectOne');

describe('ServiceAccess data rules', () => {
  const transformInfo = metadata.ServiceAccess.transformations.application;

  it('connects the application by name and namespace', async () => {
    const context = {
      executeGraphQL: jest.fn().mockResolvedValue({
        data: { allApplications: [{ id: 'app-1' }] },
      }),
    };

    const result = await connectOne(
      context,
      transformInfo,
      null,
      {
        name: 'conn-1:my-service',
        application: { name: 'my-subsystem', namespace: 'gw-client' },
      },
      'application'
    );

    expect(result).toEqual({ connect: { id: 'app-1' } });

    const { query, variables } = context.executeGraphQL.mock.calls[0][0];
    expect(query).toContain(
      'allApplications(where: { name: $application_name, namespace: $application_namespace })'
    );
    expect(variables).toEqual({
      application_name: 'my-subsystem',
      application_namespace: 'gw-client',
    });
  });

  it('fails when the application does not exist', async () => {
    const context = {
      executeGraphQL: jest.fn().mockResolvedValue({
        data: { allApplications: [] },
      }),
    };

    await expect(
      connectOne(
        context,
        transformInfo,
        null,
        { application: { name: 'missing', namespace: 'gw-client' } },
        'application'
      )
    ).rejects.toThrow('Record not found [application]');
  });

  it('fails when the namespace is missing', async () => {
    const context = { executeGraphQL: jest.fn() };

    await expect(
      connectOne(
        context,
        transformInfo,
        null,
        { application: { name: 'my-subsystem' } },
        'application'
      )
    ).rejects.toThrow('Missing value for key application.namespace');
    expect(context.executeGraphQL).not.toHaveBeenCalled();
  });
});
