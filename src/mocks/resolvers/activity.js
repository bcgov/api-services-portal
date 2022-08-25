export const getActivityHandler = (req, res, ctx) => {
  const { first, skip } = req.variables;

  return res(
    ctx.data({
      getFilteredNamespaceActivity: [
        {
          id: 'a1',
          message:
            '{actor} <strong>{action}</strong> {entity} to {product} {env} from {consumer}',
          params: {
            actor: 'Aidan Cope',
            action: 'revoked',
            entity: 'access',
            product: 'refactortime API',
            env: 'test',
            consumer: '7AFFF375-E0ECE4972BC',
          },
          activityAt: '2022-08-25T06:05:05.596Z',
          blob: null,
        },
        {
          id: 'a2',
          message:
            '{actor} <strong>{action}</strong> {consumer} {entity} to {product} {env}',
          params: {
            actor: 'Aidan Cope',
            action: 'granted',
            entity: 'access',
            product: 'refactortime API',
            env: 'test',
            consumer: '7AFFF375-E0ECE4972BC',
          },
          activityAt: '2022-08-25T06:05:00.299Z',
          blob: null,
        },
        {
          id: 'a3',
          message: 'received credentials',
          params: {},
          activityAt: '2022-08-25T06:04:16.903Z',
          blob: null,
        },
        {
          id: 'a4',
          message: '',
          params: {},
          activityAt: '2022-08-25T06:04:15.498Z',
          blob: null,
        },
        {
          id: 'a5',
          message: 'requested access',
          params: {},
          activityAt: '2022-08-25T06:04:09.896Z',
          blob: null,
        },
      ],
    })
  );
};
