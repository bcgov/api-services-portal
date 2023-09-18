import fetch from 'node-fetch';
import { newNamespaceID } from '../../services/identifiers';

describe('Identifiers', function () {
  it('it should be a valid namespace', async function () {
    const result = newNamespaceID();
    expect(result).toHaveLength(8);
    expect(result.startsWith('gw-')).toBeTruthy();
    console.log(result);
  });
});
