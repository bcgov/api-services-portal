import { graphql, rest } from 'msw';

export default [
  rest.get('*/hello', (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'hello',
      })
    );
  }),
];
