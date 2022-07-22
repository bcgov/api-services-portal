const casual = require('casual-browserify');
const kebabCase = require('lodash/kebabCase');

const data = require('./example-data');

/*
 * This is a simple Map wrapper that has some convenience methods for seeding the
 * database as well as simple CRUD functions.
 */
class MockDatabase {
  role = 'api-owner';

  constructor(role = 'api-owner', namespace = null) {
    this.role = role;
    this.db = new Map();
    this.db.set('user', {
      id: casual.uuid,
      userId: casual.uuid,
      name: 'Nathaniel Merriweather',
      username: 'nmerriweather',
      businessName: 'SmithCorp Inc.',
      email: 'nmerriweather@hbms.com',
      roles: [role, 'portal-user'],
      isAdmin: false,
      namespace: null,
      groups: null,
      legalsAgreed: '[]',
      sub: 'sub',
    });
    this.db.set(
      'namespaces',
      data.namespaces.map((n) => ({ name: n, id: casual.uuid }))
    );
    this.db.set(
      'products',
      data.products.map((p) => ({ name: p, id: casual.uuid, environments: [] }))
    );
    this.db.set(
      'datasets',
      data.datasets.map((d) => ({
        title: d,
        id: casual.uuid,
        name: kebabCase(d),
      }))
    );
  }

  create(key, payload) {
    const payloadWithId = { ...payload, id: casual.uuid };
    if (this.db.has(key)) {
      const items = this.db.get(key);
      this.db.set(key, [...items, payloadWithId]);
    } else {
      this.db.set(key, [payloadWithId]);
    }

    return payloadWithId;
  }

  get(key) {
    return this.db.get(key);
  }

  set(key, value) {
    this.db.set(key, value);
    return this.db;
  }
}

module.exports = MockDatabase;
