export const allProductsByNamespaceHandler = (req, res, ctx) => {
  return res(
    ctx.data({
      allProductsByNamespace: [
        {
          id: 'p1',
          name: 'Product 1',
          environments: [
            {
              id: 'e1',
              name: 'prod',
            },
            {
              id: 'e2',
              name: 'dev',
            },
          ],
        },
      ],
    })
  );
};
