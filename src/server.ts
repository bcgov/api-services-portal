/// <reference types="node" />
/// <reference types="express" />
import express from "express";
import request from "graphql-request";
import { AnyCnameRecord } from "node:dns";
const { Keystone } = require('@keystonejs/keystone');
const { Checkbox, Password, Select } = require('@keystonejs/fields');
//import Oauth2ProxyAuthStrategy from './auth/auth-oauth2-proxy'
const { Oauth2ProxyAuthStrategy } = require('./auth/auth-oauth2-proxy');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { generate } = require('@graphql-codegen/cli');
//const { AdminUIApp } = require('@keystone-next/admin-ui');
const { StaticApp } = require('@keystonejs/app-static');
const { NextApp } = require('@keystonejs/app-next');
const { ApiProxyApp } = require('./api-proxy');
const { ApiGraphqlWhitelistApp } = require('./api-graphql-whitelist');
const { ApiHealthApp } = require('./api-health');

var Keycloak = require("keycloak-connect");

const initialiseData = require('./initial-data');
const { startAuthedSession } = require('@keystonejs/session');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const { Strategy, Issuer, Client } = require('openid-client');

const { staticRoute, staticPath, distDir } = require('./config');

const { PutFeed, DeleteFeed } = require('./batch/feedWorker');
const { Retry } = require('./services/tasked')

const { FieldEnforcementPoint, EnforcementPoint } = require('./authz/enforcement')

const { loadRulesAndWatch } = require('./authz/enforcement')

const { logger } = require('./logger')

const apiPath = '/gql/api';
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

loadRulesAndWatch(process.env.NODE_ENV)

const state = { connected : false }

const keystone = new Keystone({
    onConnect(keystone: any) {
      if (process.env.NODE_ENV === 'development') {
        generateTypes();
      }
      if (process.env.CREATE_TABLES !== 'true') {
        initialiseData(keystone);
      }
      console.log("CONNECTED!")
      state.connected = true
    },
    adapter: adapter == "knex" ? new KnexAdapter(knexAdapterConfig) : new MongooseAdapter(mongooseAdapterConfig),
    cookieSecret: process.env.COOKIE_SECRET,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Default to true in production
      //maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      maxAge: 1000 * 60 * 15, // 15 minute
      sameSite: true,
    },
    //   sessionStore: new MongoStore({ url: process.env.MONGO_URL, mongoOptions: { auth: { user: process.env.MONGO_USER, password: process.env.MONGO_PASSWORD } } })
  });

  const yamlReport = []
  for (const _list of [
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
    'Legal',
    'Metric',
    'Organization',
    'OrganizationUnit',
    'Product',
    'ServiceAccess',
    'TemporaryIdentity',
    'User',
  ]) {
    const list = require('./lists/' + _list)
    if ('extensions' in list) {
        console.log("Registering Extension!")
        list.extensions.map ((ext:any) => ext(keystone))
    }
    logger.info(" %s", _list)
    
    list.access = EnforcementPoint
    for (  const entry of Object.entries(list.fields) ) {
        logger.info("      %s", entry[0])
        //list.fields[entry[0]].access = FieldEnforcementPoint
    }
    const out = { list: _list, fields: Object.keys(list.fields).sort()}
    yamlReport.push(out)
    keystone.createList(_list, list);
  }
  const report = require('js-yaml').dump(yamlReport)

  for (const _list of [
      'AliasedQueries',
      'ServiceAccount',
      'UMAPolicy',
      'UMAResourceSet',
      'UMAPermissionTicket',
    ]) {
      const list = require('./lists/extensions/' + _list)
      if ('extensions' in list) {
          console.log("Registering Extension!")
          list.extensions.map ((ext:any) => ext(keystone))
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
            onAuthenticated: ({ token, item, isNewItem }:any, req:any, res:any) => {
              console.log('Token = ' + token);
              console.log('Redirecting to /home');
              res.redirect(302, '/home');
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
            }: any) => {
              console.log('AFTER AUTH');
              console.log('ctx = ' + context.session);
            },
          },
        });
  
const { pages } = require('./admin-hooks.js');
//const tasked = require('./services/tasked');

const { checkWhitelist, loadWhitelistAndWatch, addToWhitelist } = require('./authz/whitelist')

const apps = [
    //new ApiHealthApp(state),
    new ApiGraphqlWhitelistApp({
        apiPath
    }),
    new AdminUIApp({
      name: PROJECT_NAME,
      adminPath: '/admin',
      apiPath,
      signinPath: 'oauth2/sign_in',
      authStrategy,
      pages: pages,
      enableDefaultRoute: false,
      isAccessAllowed: (user: any) => {
        // console.log('isAllowed?');
        // console.log(JSON.stringify(user));
        return true;
      },
    }),
    new ApiProxyApp({ gwaApiUrl: process.env.GWA_API_URL }),
    //new NextApp({ dir: 'nextapp' }),
]

const dev = process.env.NODE_ENV !== 'production'

const configureExpress = (app:any) => {
    const express = require('express')
    app.use(express.json())

    // app.get('/', (req, res, next) => {
    //     console.log(req.path)
    //     req.path == "/" ? res.redirect('/home') : next()
    // })
    app.put('/feed/:entity', (req : any, res : any) => PutFeed(keystone, req, res).catch ((err : any) => {
        console.log(err)
        res.status(400).json({result: 'error', error: "" + err})
    }))
    app.put('/feed/:entity/:id', (req : any, res : any) => PutFeed(keystone, req, res).catch ((err : any) => res.status(400).json({result: 'error', error: "" + err})))
    app.delete('/feed/:entity/:id', (req : any, res : any) => DeleteFeed(keystone, req, res))

    // Added for handling failed calls that require orchestrating multiple changes
    app.put('/tasked/:id', async (req : any, res : any) => {
        const tasked = new Retry(process.env.WORKING_PATH, req.params['id'])
        await tasked.start()
        res.status(200).json({result: 'ok'})
    })    
}

export { keystone, apps, dev, configureExpress }