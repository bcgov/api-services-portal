import {
  parseJsonString,
  syncRecords,
  parseBlobString,
  transformAllRefID,
  removeEmpty,
  removeKeys,
  dot,
  replaceKey,
} from '../../../batch/feed-worker';
import YAML from 'js-yaml';

describe('Batch Utilities', function () {
  it('creates a JSON blob and connects it to personal activity', async function () {
    const request = { requester: { email: 'jane@example.gov.bc.ca' } };
    const payload = JSON.stringify(request);
    const context = {
      executeGraphQL: jest.fn()
        .mockResolvedValueOnce({ data: { allActivities: [] } })
        .mockResolvedValueOnce({ data: { allBlobs: [] } })
        .mockResolvedValueOnce({ data: { createBlob: { id: 'saved-blob' } } })
        .mockResolvedValueOnce({ data: { createActivity: { id: 'saved-activity' } } }),
    };

    const result = await syncRecords(context, 'Activity', 'activity-id', {
      name: 'Integration access request',
      type: 'IntegrationAccessRequest',
      action: 'create',
      result: 'success',
      refId: 'submission-id',
      filterKey1: 'personal:jane@example.gov.bc.ca',
      blob: [{ id: 'blob-ref', type: 'json', blob: payload }],
    });

    expect(result).toMatchObject({ status: 200, id: 'saved-activity' });
    expect(context.executeGraphQL).toHaveBeenNthCalledWith(3, {
      query: expect.stringContaining('createBlob'),
      variables: { data: { ref: 'blob-ref', type: 'json', blob: payload } },
    });
    expect(context.executeGraphQL).toHaveBeenNthCalledWith(4, {
      query: expect.stringContaining('createActivity'),
      variables: {
        data: expect.objectContaining({ blob: { connect: { id: 'saved-blob' } } }),
      },
    });
  });

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
      blob: [['tag1', 'tag2']],
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

  it('should replace key', async function () {
    const input = {
      gatewayId: 'gw-1234',
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
      block: {
        type: 'bland',
      },
      nested: {
        id: '000011',
        another: null,
      },
      namespace: 'gw-1234',
    };

    const result = replaceKey(input, 'gatewayId', 'namespace');
    expect(JSON.stringify(result)).toBe(JSON.stringify(output));
  });
});
