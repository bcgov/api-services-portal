/*
node dist/test/integrated/keystonejs/test.js
*/
import { syncRecords } from '../../../batch/feed-worker';

import { loadRulesAndWatch } from '../../../authz/enforcement';

loadRulesAndWatch(false);

export default async function InitKeystone(
  disableAccessControl: boolean = false
) {
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
    'Activity',
    'Application',
    'AccessRequest',
    'Blob',
    'Content',
    'Organization',
    'OrganizationUnit',
    'Dataset',
    'Legal',
    'User',
    'Metric',
    'CredentialIssuer',
    'Product',
    'Environment',
    'GatewayService',
    'GatewayRoute',
    'GatewayPlugin',
    'GatewayConsumer',
    'ServiceAccess',
    'TemporaryIdentity',
    'Label',
  ]) {
    const list = require('../../../lists/' + _list);
    if ('extensions' in list) {
      console.log('Registering Extension!');
      list.extensions.map((ext: any) => ext(keystone));
    }
    if (disableAccessControl) {
      list.access = () => true;
      Object.keys(list.fields).forEach((f) => {
        list.fields[f].access = () => true;
      });
    }
    keystone.createList(_list, list);
  }

  for (const _list of ['AliasedQueries']) {
    const list = require('../../../lists/extensions/' + _list);
    if ('extensions' in list) {
      console.log('Registering Extension!');
      list.extensions.map((ext: any) => ext(keystone));
    }
  }

  for (const _list of [
    'AliasedQueries',
    'BusinessProfile',
    'ConsumerGroups',
    'ConsumerProducts',
    'ConsumerScopesAndRoles',
    'CredentialIssuerExt',
    'Namespace',
    'NamespaceActivity',
    'OrganizationPolicy',
    'ServiceAccess',
    'ServiceAccount',
    'UMAPolicy',
    'UMAResourceSet',
    'UMAPermissionTicket',
  ]) {
    const list = require('../../../lists/extensions/' + _list);
    if ('extensions' in list) {
      console.log('Registering Extension!');
      list.extensions.map((ext: any) => ext(keystone));
    }
  }

  const apps = [new GraphQLApp()];

  await keystone.prepare({
    apps: apps,
    dev: process.env.NODE_ENV !== 'production',
  });
  await keystone.connect();

  return keystone;
}
