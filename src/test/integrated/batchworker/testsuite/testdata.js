export default {
  tests: [
    {
      name: 'create a new product',
      entity: 'Product',
      data: {
        name: 'Refactor time test',
        namespace: 'refactortime',
        environments: [{ name: 'dev', appId: '0A021EB0' }],
      },
      expected: {
        payload: {
          status: 200,
          result: 'created',
          childResults: [],
        },
      },
    },
    {
      name: 'update same product',
      entity: 'Product',
      data: {
        name: 'Refactor time test',
        namespace: 'refactortime',
        environments: [{ name: 'dev', appId: '0A021EB0' }],
      },
      expected: {
        payload: {
          status: 200,
          result: 'no-change',
          childResults: [
            { status: 200, result: 'no-change', childResults: [] },
          ],
        },
      },
    },
    {
      name: 'update same product but with invalid appId',
      entity: 'Product',
      data: {
        name: 'Refactor time test',
        namespace: 'refactortime',
        environments: [{ name: 'dev', appId: '22021EB0' }],
      },
      expected: {
        payload: {
          status: 400,
          result: 'update-failed',
          reason: 'Failed updating children',
          childResults: [
            {
              status: 400,
              result: 'update-failed',
              reason: 'Unexpected appId',
              childResults: [],
            },
          ],
        },
      },
    },
    {
      name: 'update description of same product',
      entity: 'Product',
      data: {
        name: 'Refactor time test',
        description: 'Good info to have',
        namespace: 'refactortime',
        environments: [{ name: 'dev', appId: '0A021EB0' }],
      },
      expected: {
        payload: {
          status: 200,
          result: 'updated',
          childResults: [
            { status: 200, result: 'no-change', childResults: [] },
          ],
        },
      },
    },
    {
      name: 'update same product add environment',
      entity: 'Product',
      data: {
        name: 'Refactor time test',
        description: 'Good info to have',
        namespace: 'refactortime',
        environments: [
          { name: 'dev', appId: '0A021EB0' },
          { name: 'test', appId: '0A021FB0' },
        ],
      },
      expected: {
        payload: {
          status: 200,
          result: 'updated',
          childResults: [
            { status: 200, result: 'no-change', childResults: [] },
            { status: 200, result: 'created', childResults: [] },
          ],
        },
      },
    },
    {
      name: 'update same product remove environment',
      entity: 'Product',
      data: {
        name: 'Refactor time test',
        description: 'Good info to have',
        namespace: 'refactortime',
        environments: [{ name: 'test', appId: '0A021FB0' }],
      },
      expected: {
        payload: {
          status: 200,
          result: 'updated',
          childResults: [
            { status: 200, result: 'no-change', childResults: [] },
          ],
        },
      },
    },
    {
      name: 'try updating product from different namespace',
      entity: 'Product',
      data: {
        name: 'Refactor time test',
        namespace: 'diffnamespace',
        environments: [{ name: 'test', appId: '0A021FB0' }],
      },
      expected: {
        payload: {
          status: 400,
          result: 'create-failed',
          reason:
            'Unable to create and/or connect 1 Product.environments<Environment>',
          childResults: [],
        },
      },
    },
    {
      name: 'create a new product with no environments',
      entity: 'Product',
      data: {
        name: 'Refactor number two',
        namespace: 'refactortime',
      },
      expected: {
        payload: {
          status: 200,
          result: 'created',
          childResults: [],
        },
      },
    },
    {
      name: 'create a new product with same name as before but diff appId',
      entity: 'Product',
      data: {
        name: 'Refactor number two',
        appId: '040FA2D8138D',
        namespace: 'refactortime',
      },
      expected: {
        payload: {
          status: 400,
          result: 'update-failed',
          reason: 'Unexpected appId',
          childResults: [],
        },
      },
    },
    {
      name: 'create a new product with no name or appId',
      entity: 'Product',
      data: {
        namespace: 'refactortime',
      },
      expected: { exception: 'Missing value for key name' },
    },
    {
      name: 'create a new product with lots of environments',
      entity: 'Product',
      data: {
        name: 'All Env Product',
        namespace: 'refactortime',
        environments: [
          { name: 'dev', appId: '1B021EB0' },
          { name: 'test', appId: '2B021EB0' },
          { name: 'prod', appId: '3B021EB0' },
        ],
      },
      expected: {
        payload: {
          status: 200,
          result: 'created',
          childResults: [],
        },
      },
    },
    {
      name: 'update product just created',
      entity: 'Product',
      data: {
        name: 'All Env Product',
        namespace: 'refactortime',
        environments: [
          { name: 'dev', appId: '1B021EB0' },
          { name: 'test', appId: '2B021EB0' },
          { name: 'prod', appId: '3B021EB0' },
        ],
      },
      expected: {
        payload: {
          status: 200,
          result: 'no-change',
          childResults: [
            { status: 200, result: 'no-change', childResults: [] },
            { status: 200, result: 'no-change', childResults: [] },
            { status: 200, result: 'no-change', childResults: [] },
          ],
        },
      },
    },

    {
      name: 'update product just created using no appIds',
      entity: 'Product',
      data: {
        name: 'All Env Product',
        namespace: 'refactortime',
        environments: [{ name: 'dev' }, { name: 'test' }, { name: 'prod' }],
      },
      expected: {
        payload: {
          status: 200,
          result: 'no-change',
          childResults: [
            { status: 200, result: 'no-change', childResults: [] },
            { status: 200, result: 'no-change', childResults: [] },
            { status: 200, result: 'no-change', childResults: [] },
          ],
        },
      },
    },
    {
      name: 'create a new product with missing appIds',
      entity: 'Product',
      data: {
        name: 'All Env Product New',
        namespace: 'refactortime',
        environments: [{ name: 'dev' }, { name: 'test' }, { name: 'prod' }],
      },
      expected: {
        payload: {
          status: 200,
          result: 'created',
          childResults: [],
        },
      },
    },
    {
      name: 'create a product with invalid name',
      entity: 'Product',
      data: {
        name: '@#$&(#@&$*(#@&',
        namespace: 'refactortime',
      },
      expected: {
        payload: {
          status: 400,
          result: 'create-failed',
          reason:
            "Product name must be between 3 and 100 alpha-numeric characters (including special characters ' {}&-')",
          childResults: [],
        },
      },
    },
    {
      name: 'create an invalid product with short name',
      entity: 'Product',
      data: {
        name: 'tw',
        namespace: 'refactortime',
      },
      expected: {
        payload: {
          status: 400,
          result: 'create-failed',
          reason:
            "Product name must be between 3 and 100 alpha-numeric characters (including special characters ' {}&-')",
          childResults: [],
        },
      },
    },
    {
      name: 'create a product with all good characters',
      entity: 'Product',
      data: {
        name: 'abc (ABC) & 123',
        namespace: 'refactortime',
      },
      expected: {
        payload: {
          status: 200,
          result: 'created',
          childResults: [],
        },
      },
    },
    {
      name: 'create a product with an environment with no appId',
      entity: 'Product',
      data: {
        name: 'Prod with a dev env',
        namespace: 'refactortime',
        environments: [{ name: 'dev' }],
      },
      expected: {
        payload: {
          status: 200,
          result: 'created',
          childResults: [],
        },
      },
    },
    {
      name: 'update a product with an environment with no appId',
      entity: 'Product',
      data: {
        name: 'Prod with a dev env',
        namespace: 'refactortime',
        environments: [{ name: 'dev' }],
      },
      expected: {
        payload: {
          status: 200,
          result: 'no-change',
          childResults: [
            { status: 200, result: 'no-change', childResults: [] },
          ],
        },
      },
    },
  ],
};
