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

var Keycloak = require("keycloak-connect");

const initialiseData = require('./initial-data');
const { startAuthedSession } = require('@keystonejs/session');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const { Strategy, Issuer, Client } = require('openid-client');

const { staticRoute, staticPath, distDir } = require('./config');

const { PutFeed, DeleteFeed } = require('./batch/feedWorker');
const Tasked = require('./services/tasked')

const apiPath = '/admin/api';
const PROJECT_NAME = 'APS Service Portal';

const { KnexAdapter } = require('@keystonejs/adapter-knex');
const knexAdapterConfig = {
    knexOptions: {
        connection: {
            host : process.env.KNEX_HOST,
            port : process.env.KNEX_PORT,
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
  'Alert',
  'Application',
  'Blob',
  'Content',
  'CredentialIssuer',
  'Dataset',
  'Environment',
  'GatewayConsumer',
  'GatewayGroup',
  'GatewayPlugin',
  'GatewayRoute',
  'GatewayService',
  'Group',
  'Legal',
  'MemberRole',
  'Metric',
  'Namespace',
  'Organization',
  'OrganizationUnit',
  'Product',
  'ResourceSet',
  'ServiceAccess',
  'TemporaryIdentity',
  'Todo',
  'User',
]) {
  const list = require('./lists/' + _list)
  if ('extensions' in list) {
      console.log("Registering Extension!")
      list.extensions.map (ext => ext(keystone))
  }
  keystone.createList(_list, list);
}
for (_list of [
    'UMAResourceSet',
    'UMAPermissionTicket',
  ]) {
    const list = require('./lists/extensions/' + _list)
    if ('extensions' in list) {
        console.log("Registering Extension!")
        list.extensions.map (ext => ext(keystone))
    }
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
const tasked = require('./services/tasked');

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

    // app.get('/', (req, res, next) => {
    //     console.log(req.path)
    //     req.path == "/" ? res.redirect('/home') : next()
    // })
    app.put('/feed/:entity', (req, res) => PutFeed(keystone, req, res).catch (err => {
        console.log(err)
        res.status(400).json({result: 'error', error: "" + err})
    }))
    app.put('/feed/:entity/:id', (req, res) => PutFeed(keystone, req, res).catch (err => res.status(400).json({result: 'error', error: "" + err})))
    app.delete('/feed/:entity/:id', (req, res) => DeleteFeed(keystone, req, res))
    app.put('/tasked/:id', async (req, res) => {
        tasked = new Tasked(process.env.WORKING_PATH, req.params['id'])
        await tasked.start()
        res.status(200).json({result: 'ok'})
    })

    var keycloak = new Keycloak({
        cookies: false
    }, { 
        clientId: "gwa-api",
        secret: "66919256-e415-47a8-b468-40b0d8161f85",
        authServerUrl: "https://authz-apps-gov-bc-ca.dev.api.gov.bc.ca/auth", 
        realm: "aps-v2"});
    
    app.get('/protected', ((req, res, next) => {
        console.log("Reset " + req.headers['x-forwarded-access-token'])
        req.headers['authorization'] = "Bearer " + req.headers['x-forwarded-access-token']
        next()
    }), keycloak.enforcer(['namespace-dds-map:viewer'], {
        resource_server_id: 'gwa-api'
      }), function (req, res) {
        res.send("Settings resource accessed")
     })

  },
  distDir,
};
