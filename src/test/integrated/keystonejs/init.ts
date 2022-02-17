/*
node dist/test/integrated/keystonejs/test.js
*/
import { syncRecords } from '../../../batch/feed-worker';

export default async function InitKeystone() {
  const yaml = require('js-yaml');
  const { Keystone } = require('@keystonejs/keystone');
  const { GraphQLApp } = require('@keystonejs/app-graphql');

  const session = require('express-session');
  //const MongoStore = require('connect-mongo')(session);

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

  for (const _list of [
    'Application',
    'BrokeredIdentity',
    'Organization',
    'OrganizationUnit',
    'Dataset',
    'Legal',
    'User',
    'CredentialIssuer',
    'Product',
    'Environment',
    'GatewayService',
    'GatewayRoute',
    'GatewayPlugin',
    'GatewayConsumer',
    'ServiceAccess',
    'Label',
  ]) {
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
  // for (const _list of ['OrganizationGroup']) {
  //   const list = require('../../../lists/extensions/' + _list);
  //   if ('extensions' in list) {
  //     console.log('Registering Extension!');
  //     list.extensions.map((ext: any) => ext(keystone));
  //   }
  // }

  const apps = [new GraphQLApp()];

  await keystone.prepare({
    apps: apps,
    dev: process.env.NODE_ENV !== 'production',
  });
  await keystone.connect();

  return keystone;
  //const context = keystone.createContext({ skipAccessControl: true });

  //  const record = await getRecord(context, 'Environment', '123');

  //  console.log(yaml.dump(record));
  //await keystone.disconnect();
}
