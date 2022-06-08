import {
  parseJsonString,
  parseBlobString,
  transformAllRefID,
  removeEmpty,
  removeKeys,
  dot,
} from '../../../batch/feed-worker';
import YAML from 'js-yaml';

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

    const result = parseJsonString(input, ['tags']);

    expect(JSON.stringify(result)).toBe(JSON.stringify(output));
  });

  it('should get correct json blob result', async function () {
    const input = {
      name: 'sample name',
      blob: {
        type: 'json',
        blob: JSON.stringify(['tag1', 'tag2']),
      },
    };
    const output = {
      name: 'sample name',
      blob: ['tag1', 'tag2'],
    };

    const result = parseBlobString(input, ['blob']);

    expect(JSON.stringify(result)).toBe(JSON.stringify(output));
  });

  it('should get correct yaml blob result', async function () {
    const input = {
      name: 'sample name',
      blob: {
        type: 'yaml',
        blob: YAML.dump(['tag1', 'tag2']),
      },
    };
    const output = {
      name: 'sample name',
      blob: ['tag1', 'tag2'],
    };

    const result = parseBlobString(input);

    expect(JSON.stringify(result)).toBe(JSON.stringify(output));
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

    const result = removeEmpty(input);

    expect(JSON.stringify(result)).toBe(JSON.stringify(output));
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

    const result = removeKeys(input, ['id', 'block']);
    expect(JSON.stringify(result)).toBe(JSON.stringify(output));
  });

  it('should test dot', async function () {
    const value = {
      name: 'joe',
      child: {
        name: 'bill',
      },
    };
    expect(dot(value, 'child.name')).toBe('bill');
    expect(dot(value, 'child.invalid')).toBe(undefined);
    expect(dot(value, 'name')).toBe('joe');
    expect(dot(value, '.nowhere')).toBe(null);
    expect(dot(value, 'a.b.c')).toBe(null);
  });
});
