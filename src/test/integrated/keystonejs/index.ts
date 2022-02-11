/*
node dist/test/integrated/keystonejs/index.js

*/
import { getRecord, syncRecords } from '../../../batch/feed-worker';

const yaml = require('js-yaml');
const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');
const mongooseAdapterConfig = {
  mongoUri: process.env.MONGO_URL,
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASSWORD,
};

const keystone = new Keystone({
  adapter: new MongooseAdapter(mongooseAdapterConfig),
  cookieSecret: process.env.COOKIE_SECRET,
  cookie: {
    secure: process.env.COOKIE_SECURE === 'true', // Default to true in production
    //maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    sameSite: true,
  },
});

for (const _list of ['Legal', 'User']) {
  const list = require('../../../lists/' + _list);
  if ('extensions' in list) {
    console.log('Registering Extension!');
    list.extensions.map((ext: any) => ext(keystone));
  }
  list.access = () => true;
  Object.keys(list.fields).forEach((f) => {
    list.fields[f].access = () => true;
  });
  keystone.createList(_list, list);
}
for (const _list of ['OrganizationGroup']) {
  const list = require('../../../lists/extensions/' + _list);
  if ('extensions' in list) {
    console.log('Registering Extension!');
    list.extensions.map((ext: any) => ext(keystone));
  }
}

const apps = [new GraphQLApp()];

(async () => {
  await keystone.prepare({
    apps: apps,
    dev: process.env.NODE_ENV !== 'production',
  });
  await keystone.connect();

  const context = keystone.createContext({ skipAccessControl: true });

  if (false) {
    const r = await getRecord(context, 'Legal', 'abc');
    console.log(JSON.stringify(r, null, 4));
    const body = {
      reference: 'legal-test',
      isActive: false,
      title: 'Legal Test',
      link: 'http://api.gov.bc.ca',
      document: 'general',
      version: 1,
    };
    const batchResult = await syncRecords(
      context,
      'Legal',
      body.reference,
      body,
      false
    ).catch((e: any) => {
      console.log('ERRR! ' + e);
    });
    console.log(JSON.stringify(batchResult, null, 4));
  }

  if (true) {
    const body = {
      name: 'abcxx',
      parent: '/ddd',
      roles: JSON.stringify([
        {
          name: 'data-custodians',
          members: [{ username: 'acope@idir' }],
          permissions: [
            {
              resource: 'ddd',
              scopes: ['Scope1', 'Scope2'],
            },
          ],
        },
      ]),
    };
    const batchResult = await syncRecords(
      context,
      'OrganizationGroup',
      body.name,
      body,
      false
    );
    console.log(JSON.stringify(batchResult, null, 4));
  }

  const record = await getRecord(context, 'OrganizationGroup', '123');

  console.log(yaml.dump(record));
  await keystone.disconnect();
})();
