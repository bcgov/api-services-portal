import casual from 'casual-browserify';

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

export const getApplicationServicesHandler = (req, res, ctx) => {
  if (req.variables.appId !== 'ABC123') {
    return res(
      ctx.data({
        myServiceAccesses: [],
      })
    );
  }
  return res(
    ctx.data({
      myServiceAccesses: [
        {
          id: 'sa1',
          name: '123123-123ADSFSD',
          active: true,
          application: {
            name: 'Demo App',
          },
          productEnvironment: {
            id: 'pe1',
            name: 'dev',
            product: {
              name: 'My Pharma API',
            },
          },
        },
      ],
    })
  );
};

export const createApplicationHandler = (req, res, ctx) => {
  if (req.variables.name === 'error') {
    return res(
      ctx.data({
        errors: [{ message: 'You do not have permission' }],
      })
    );
  }

  const record = {
    id: `app1${applications.size + 1}`,
    appId: casual.uuid,
    ...req.variables,
  };
  applications.set(record.id, record);
  return res(
    ctx.data({
      createApplication: record,
    })
  );
};

export const updateApplicationHandler = (req, res, ctx) => {
  const { id, data } = req.variables;
  const cached = applications.get(id);

  applications.set(id, {
    ...cached,
    ...data,
  });

  return res(
    ctx.data({
      updateApplication: {
        id,
      },
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
