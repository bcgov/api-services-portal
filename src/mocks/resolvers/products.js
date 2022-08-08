export const allProductsByNamespaceHandler = (req, res, ctx) => {
  return res(
    ctx.data({
      allProductsByNamespace: [
        {
          id: 'p1',
          name: 'PharmaNet Electronic Prescribing',
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
        {
          id: 'p2',
          name: 'PharmaNet API',
          environments: [
            {
              id: 'e11',
              name: 'test',
            },
            {
              id: 'e21',
              name: 'other',
            },
          ],
        },
      ],
    })
  );
};
