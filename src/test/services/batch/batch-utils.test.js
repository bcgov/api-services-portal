import {
  parseJsonString,
  transformAllRefID,
  removeEmpty,
  removeKeys,
} from '../../../batch/feed-worker';

describe('Batch Utilities', function () {
  it('should get correct json result', async function () {
    const input = {
      name: 'sample name',
      tags: JSON.stringify(['tag1', 'tag2']),
    };
    const output = {
      name: 'sample name',
      tags: ['tag1', 'tag2'],
    };

    expect(JSON.stringify(parseJsonString(input, ['tags']))).toBe(
      JSON.stringify(output)
    );
  });

  it('should transform reference IDs', async function () {
    const input = {
      name: 'sample name',
      owner: { foreignKey: 'fk_of_child' },
      nested: {
        child: { name: 'nested name' },
      },
    };
    const output = {
      name: 'sample name',
      owner: 'fk_of_child',
      nested: {
        child: 'nested name',
      },
    };

    expect(JSON.stringify(transformAllRefID(input, ['owner', 'child']))).toBe(
      JSON.stringify(output)
    );
  });

  it('should remove null values', async function () {
    const input = {
      name: 'sample name',
      attribute: null,
      nested: {
        another: null,
      },
    };
    const output = {
      name: 'sample name',
      nested: {},
    };

    expect(JSON.stringify(removeEmpty(input))).toBe(JSON.stringify(output));
  });

  it('should remove keys', async function () {
    const input = {
      id: '12345',
      name: 'sample name',
      attribute: null,
      block: {
        type: 'bland',
      },
      nested: {
        id: '000011',
        another: null,
      },
    };
    const output = {
      name: 'sample name',
      attribute: null,
      nested: {
        another: null,
      },
    };

    expect(JSON.stringify(removeKeys(input, ['id', 'block']))).toBe(
      JSON.stringify(output)
    );
  });
});
