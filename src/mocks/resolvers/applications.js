const applications = new Map([
  [
    'app1',
    {
      id: 'app1',
      appId: 'ABC123',
      description: '',
      name: 'Demo App',
      owner: {
        name: 'Mark Smith',
      },
    },
  ],
  [
    'app2',
    {
      id: 'app2',
      appId: 'ABC123',
      description: '',
      name: 'Shoppers Drug Mart 112',
      owner: {
        name: 'Mark Smith',
      },
    },
  ],
  [
    'app3error',
    {
      id: 'app3error',
      appId: 'ABC123',
      description: '',
      name: 'Easy Mart Store 123',
      owner: {
        name: 'Carter Schleifer',
      },
    },
  ],
]);

export const allApplicationsHandler = (req, res, ctx) => {
  return res(
    ctx.data({
      myApplications: Array.from(applications.values()),
      allTemporaryIdentities: [
        {
          id: 'u1',
          userId: '1',
        },
      ],
    })
  );
};

export const removeApplicationHandler = (req, res, ctx) => {
  const { id } = req.variables;

  if (id === 'app3error') {
    return res(
      ctx.data({
        errors: [
          { message: 'You do not have permission to delete this application' },
        ],
      })
    );
  }

  const application = applications.get(id);
  applications.delete(id);
  return res(
    ctx.data({
      deleteApplication: application,
    })
  );
};
