const { Keystone } = require('@keystonejs/keystone');
const { Text, Checkbox, Password, Select } = require('@keystonejs/fields');
const { Oauth2ProxyAuthStrategy } = require('./auth/auth-oauth2-proxy');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
//const { AdminUIApp } = require('@keystone-next/admin-ui');
const { StaticApp } = require('@keystonejs/app-static');
const { NextApp } = require('@keystonejs/app-next');

const initialiseData = require('./initial-data');
const { startAuthedSession } = require('@keystonejs/session');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);


const { Strategy, Issuer, Client } = require('openid-client');

const { staticRoute, staticPath, distDir } = require('./config');

const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');
const PROJECT_NAME = 'APS Service Portal';
const adapterConfig = {
  mongoUri: process.env.MONGO_URL,
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASSWORD,
};

require('dotenv').config();

// const session = expressSession({
//     secret: process.env.COOKIE_SECRET,
//     proxy: true,
//     key: 'keystone.sid',
//     cookie: {secure: false},
//     store: new sessionStore()
//  })

const keystone = new Keystone({
  adapter: new Adapter(adapterConfig),
  onConnect: process.env.CREATE_TABLES !== 'true' && initialiseData,
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
  'User',
  'Group',
  'Activity',
  'Consumer',
  'CredentialIssuer',
  'TemporaryIdentity',
  'Dataset',
  'DatasetGroup',
  'Gateway',
  'Organization',
  'OrganizationUnit',
  'Plugin',
  'ServiceRoute',
  'Content',
  'Todo',
]) {
  keystone.createList(_list, require('./lists/' + _list));
}
const strategyType = (process.env.AUTH_STRATEGY || "Password")
console.log("Auth Strategy: " + strategyType)

const authStrategy = strategyType === "Password"
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
      apiPath: '/admin/api',
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
  configureExpress: app => {
  },
  distDir,
};
