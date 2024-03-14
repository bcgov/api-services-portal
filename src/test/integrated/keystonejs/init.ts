/*
node dist/test/integrated/keystonejs/test.js
*/
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

  const { KnexAdapter } = require('@keystonejs/adapter-knex');
  const knexAdapterConfig = {
    knexOptions: {
      debug: process.env.LOG_LEVEL === 'debug' ? false : false,
      connection: {
        host: process.env.KNEX_HOST,
        port: process.env.KNEX_PORT,
        user: process.env.KNEX_USER,
        password: process.env.KNEX_PASSWORD,
        database: process.env.KNEX_DATABASE,
      },
    },
  };

  const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');
  const mongooseAdapterConfig = {
    mongoUri: process.env.MONGO_URL,
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASSWORD,
  };

  const adapter = process.env.ADAPTER ? process.env.ADAPTER : 'mongoose';

  const keystone = new Keystone({
    adapter:
      adapter == 'knex'
        ? new KnexAdapter(knexAdapterConfig)
        : new MongooseAdapter(mongooseAdapterConfig),
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
