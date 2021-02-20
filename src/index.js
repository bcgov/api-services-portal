const { Keystone } = require('@keystonejs/keystone');
const { Text, Checkbox, Password, Select } = require('@keystonejs/fields');
const { Oauth2ProxyAuthStrategy } = require('./auth/auth-oauth2-proxy');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { generate } = require('@graphql-codegen/cli');
//const { AdminUIApp } = require('@keystone-next/admin-ui');
const { StaticApp } = require('@keystonejs/app-static');
const { NextApp } = require('@keystonejs/app-next');

const initialiseData = require('./initial-data');
const { startAuthedSession } = require('@keystonejs/session');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const { Strategy, Issuer, Client } = require('openid-client');

const { staticRoute, staticPath, distDir } = require('./config');

const { PutFeed, DeleteFeed } = require('./batch/feedWorker');

const apiPath = '/admin/api';
const PROJECT_NAME = 'APS Service Portal';

const { KnexAdapter } = require('@keystonejs/adapter-knex');
const knexAdapterConfig = {
    knexOptions: {
        connection: {
            host : process.env.KNEX_HOST,
            user : process.env.KNEX_USER,
            password : process.env.KNEX_PASSWORD,
            database : process.env.KNEX_DATABASE
          }        
    }
  };
  
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');
const mongooseAdapterConfig = {
  mongoUri: process.env.MONGO_URL,
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASSWORD,
};

// GraphQL TypeScript codegen. Will output a `types.d.ts` file to `./src`
async function generateTypes() {
  try {
    const generatedFiles = await generate(
      {
        schema: `http://localhost:3000${apiPath}`,
        generates: {
          [process.cwd() + '/nextapp/shared/types/query.types.ts']: {
            plugins: ['typescript'],
          },
        },
      },
      true
    );
  } catch (err) {
    throw new Error(err);
  }
}

const adapter = process.env.ADAPTER ? process.env.ADAPTER : "mongoose"

require('dotenv').config();

// const session = expressSession({
//     secret: process.env.COOKIE_SECRET,
//     proxy: true,
//     key: 'keystone.sid',
//     cookie: {secure: false},
//     store: new sessionStore()
//  })

const keystone = new Keystone({
  onConnect(keystone) {
    if (process.env.NODE_ENV === 'development') {
      generateTypes();
    }
    if (process.env.CREATE_TABLES !== 'true') {
      initialiseData(keystone);
    }
  },
  adapter: adapter == "knex" ? new KnexAdapter(knexAdapterConfig) : new MongooseAdapter(mongooseAdapterConfig),
  cookieSecret: process.env.COOKIE_SECRET,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Default to true in production
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    sameSite: true,
  },
  //   sessionStore: new MongoStore({ url: process.env.MONGO_URL, mongoOptions: { auth: { user: process.env.MONGO_USER, password: process.env.MONGO_PASSWORD } } })
});

for (_list of [
  'AccessRequest',
  'Activity',
  'Application',
  'Consumer',
  'Content',
  'CredentialIssuer',
  'Dataset',
  'Environment',
  'Gateway',
  'GatewayMetric',
  'GatewayRoute',
  'GatewayService',
  'Group',
  'Organization',
  'OrganizationUnit',
  'Package',
  'Plugin',
  'ServiceRoute',
  'TemporaryIdentity',
  'Todo',
  'User',
]) {
  keystone.createList(_list, require('./lists/' + _list));
}
const strategyType = process.env.AUTH_STRATEGY || 'Password';
console.log('Auth Strategy: ' + strategyType);

const authStrategy =
  strategyType === 'Password'
    ? keystone.createAuthStrategy({
        type: PasswordAuthStrategy,
        list: 'User',
      })
    : keystone.createAuthStrategy({
        type: Oauth2ProxyAuthStrategy,
        list: 'TemporaryIdentity',
        signinPath: 'oauth2/sign_in',

        config: {
          onAuthenticated: ({ token, item, isNewItem }, req, res) => {
            console.log('Token = ' + token);
            console.log('Redirecting to /home');
            res.redirect(302, '/admin/home');
          },
        },
        hooks: {
          afterAuth: async ({
            operation,
            item,
            success,
            message,
            token,
            originalInput,
            resolvedData,
            context,
            listKey,
          }) => {
            console.log('AFTER AUTH');
            console.log('ctx = ' + context.session);
          },
        },
      });

const { pages } = require('./admin-hooks.js');

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new StaticApp({ path: '/site', src: 'public' }),
    new AdminUIApp({
      name: PROJECT_NAME,
      adminPath: '/admin',
      apiPath,
      signinPath: 'oauth2/sign_in',
      authStrategy,
      pages: pages,
      enableDefaultRoute: false,
      isAccessAllowed: (user) => {
        // console.log('isAllowed?');
        // console.log(JSON.stringify(user));
        return true;
      },
    }),
    new NextApp({ dir: 'nextapp' }),
  ],
  configureExpress: (app) => {
    const express = require('express')
    app.use(express.json())

    app.put('/feed/:entity', (req, res) => PutFeed(keystone, req, res).catch (err => res.json({result: 'error', error: "" + err})))
    app.put('/feed/:entity/:id', (req, res) => PutFeed(keystone, req, res).catch (err => res.json({result: 'error', error: "" + err})))
    app.delete('/feed/:entity/:id', (req, res) => DeleteFeed(keystone, req, res))
  },
  distDir,
};
