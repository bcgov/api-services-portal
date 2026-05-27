const {
  diffGatewayKeys,
  parseGatewayKeysFromYamlBlob,
} = require('../../../services/gateway-patterns/gateway-key-diff');

const orgScopes = ['organization'];

const scopedKey = (name, publicKey, scope) => ({
  name,
  tags: [`type:${scope}`, 'name:my-org'],
  pem: { public_key: publicKey },
});

const orgKey = (name, publicKey) =>
  scopedKey(name, publicKey, 'organization');

describe('diffGatewayKeys', () => {
  it('detects add when slot is new', () => {
    const after = [orgKey('sdx.keys.min.citz.org:0', 'pem-a')];
    expect(
      diffGatewayKeys([], after, orgScopes)
    ).toEqual({
      keysAdded: ['sdx.keys.min.citz.org:0'],
      keysRotated: [],
      keysRemoved: [],
    });
  });

  it('detects rotate when name is unchanged but public key material changes', () => {
    const before = [orgKey('sdx.keys.min.citz.org:0', 'pem-a')];
    const after = [orgKey('sdx.keys.min.citz.org:0', 'pem-b')];
    expect(
      diffGatewayKeys(before, after, orgScopes)
    ).toEqual({
      keysAdded: [],
      keysRotated: ['sdx.keys.min.citz.org:0'],
      keysRemoved: [],
    });
  });

  it('detects no change when material is the same', () => {
    const before = [orgKey('sdx.keys.min.citz.org:0', 'pem-a')];
    const after = [orgKey('sdx.keys.min.citz.org:0', 'pem-a')];
    expect(
      diffGatewayKeys(before, after, orgScopes)
    ).toEqual({
      keysAdded: [],
      keysRotated: [],
      keysRemoved: [],
    });
  });

  it('detects remove when slot disappears', () => {
    const before = [orgKey('sdx.keys.min.citz.org:0', 'pem-a')];
    expect(
      diffGatewayKeys(before, [], orgScopes)
    ).toEqual({
      keysAdded: [],
      keysRotated: [],
      keysRemoved: ['sdx.keys.min.citz.org:0'],
    });
  });

  it('ignores keys outside the requested scopes', () => {
    const before = [
      scopedKey('sdx.keys.edge.rg:0', 'pem-a', 'runtime-group'),
    ];
    const after = [orgKey('sdx.keys.min.citz.org:0', 'pem-b')];
    expect(
      diffGatewayKeys(before, after, orgScopes)
    ).toEqual({
      keysAdded: ['sdx.keys.min.citz.org:0'],
      keysRotated: [],
      keysRemoved: [],
    });
  });

  it('parses keys from a published gateway config yaml blob', () => {
    const blob = `services: []
---
keys:
  - name: sdx.keys.min.citz.org:0
    tags:
      - type:organization
    pem:
      public_key: pem-a
`;
    expect(parseGatewayKeysFromYamlBlob(blob)).toEqual([
      {
        name: 'sdx.keys.min.citz.org:0',
        tags: ['type:organization'],
        pem: { public_key: 'pem-a' },
      },
    ]);
  });

  it('can diff client-scoped keys when that scope is requested', () => {
    const clientScopes = ['client'];
    const before = [
      scopedKey('sdx.keys.lab.min.food.sys:0', 'pem-a', 'client'),
    ];
    const after = [
      scopedKey('sdx.keys.lab.min.food.sys:0', 'pem-b', 'client'),
    ];
    expect(diffGatewayKeys(before, after, clientScopes)).toEqual({
      keysAdded: [],
      keysRotated: ['sdx.keys.lab.min.food.sys:0'],
      keysRemoved: [],
    });
  });
});
