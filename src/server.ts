/// <reference types="node" />
/// <reference types="express" />
import 'reflect-metadata';
const { formatError } = require('./services/keystone_overrides/formatError');
const { Keystone } = require('@keystonejs/keystone');
const { Oauth2ProxyAuthStrategy } = require('./auth/auth-oauth2-proxy');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { generate } = require('@graphql-codegen/cli');
const { NextApp } = require('@keystonejs/app-next');
const { ApiProxyApp } = require('./api-proxy');
const { ApiGraphqlWhitelistApp } = require('./api-graphql-whitelist');
const { ApiHealthApp } = require('./api-health');
const { MaintenanceApp } = require('./api-maintpage');
const { ApiOpenapiApp } = require('./api-openapi');
const { ApiDSProxyApp } = require('./api-proxy-ds');

const { OpsMetrics } = require('./services/report/ops-metrics');

const initialiseData = require('./initial-data');
const session = require('express-session');

const redis = require('redis');
let RedisStore = require('connect-redis')(session);

const {
  putFeedWorker,
  deleteFeedWorker,
  getFeedWorker,
} = require('./batch/feed-worker');
const { Retry } = require('./services/tasked');

const { EnforcementPoint } = require('./authz/enforcement');

const { loadRulesAndWatch } = require('./authz/enforcement');

const { logger } = require('./logger');

const apiPath = '/gql/api';
const PROJECT_NAME = 'APS Service Portal';

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

// GraphQL TypeScript codegen. Will output a `types.d.ts` file to `./src`
async function generateTypes() {
  await Promise.all(
    ['/nextapp/shared/types/query.types.ts', '/services/keystone/types.ts'].map(
      async (path: string) => {
        await generate(
          {
            schema: `http://localhost:3000${apiPath}`,
            generates: {
              [process.cwd() + path]: {
                plugins: ['typescript'],
              },
            },
          },
          true
        );
      }
    )
  );
}

const adapter = process.env.ADAPTER ? process.env.ADAPTER : 'mongoose';

require('dotenv').config();

loadRulesAndWatch(process.env.NODE_ENV);

const state = { connected: false };

const keystone = new Keystone({
  onConnect(keystone: any) {
    if (process.env.NODE_ENV === 'development') {
      generateTypes();
    }
    if (process.env.CREATE_TABLES !== 'true') {
      initialiseData(keystone);
    }
    console.log('CONNECTED!');
    state.connected = true;
  },
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
  sessionStore:
    process.env.SESSION_STORE === 'redis'
      ? new RedisStore({
          client: redis.createClient({
            url: process.env.REDIS_URL,
            password: process.env.REDIS_PASSWORD,
          }),
        })
      : null,
});

const yamlReport = [];
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
  'Label',
  'Legal',
  'Metric',
  'Organization',
  'OrganizationUnit',
  'Product',
  'ServiceAccess',
  'TemporaryIdentity',
  'User',
]) {
  const list = require('./lists/' + _list);
  if ('extensions' in list) {
    console.log('Registering Extension!');
    list.extensions.map((ext: any) => ext(keystone));
  }
  logger.info(' %s', _list);

  list.access = EnforcementPoint;
  for (const entry of Object.entries(list.fields)) {
    logger.info('      %s', entry[0]);
    //list.fields[entry[0]].access = FieldEnforcementPoint
  }
  const out = { list: _list, fields: Object.keys(list.fields).sort() };
  yamlReport.push(out);
  keystone.createList(_list, list);
}
const report = require('js-yaml').dump(yamlReport);

for (const _list of [
  'AliasedQueries',
  'BusinessProfile',
  'ConsumerGroups',
  'ConsumerProducts',
  'ConsumerScopesAndRoles',
  'CredentialRegenerate',
  'CredentialIssuerExt',
  'Namespace',
  'NamespaceActivity',
  'OrganizationPolicy',
  'ServiceAccount',
  'UMAPolicy',
  'UMAResourceSet',
  'UMAPermissionTicket',
  'UserExt',
]) {
  const list = require('./lists/extensions/' + _list);
  if ('extensions' in list) {
    console.log('Registering Extension!');
    list.extensions.map((ext: any) => ext(keystone));
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
          onAuthenticated: (
            { token, item, isNewItem }: any,
            req: any,
            res: any
          ) => {
            const redirect = req.query?.f ? req.query.f : '/';
            // Doing a 302 redirect does not set the cookie properly because it is SameSite 'Strict'
            // and the Origin of the request was from an IdP
            res.header('Content-Type', 'text/html');
            res.send(
              `<html><head><meta http-equiv="refresh" content="0;URL='${redirect}'"></head></html>`
            );
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

const apps = [
  new ApiHealthApp(state),
  new ApiOpenapiApp(),
  new MaintenanceApp(),
  new ApiGraphqlWhitelistApp({
    apiPath,
    apollo: {
      formatError: (err: any) => {
        logger.error('GraphQL Error: %s', err);
        const error = formatError(err);

        const data = error.extensions?.exception?.response?.data;
        if (!dev && error.extensions?.exception) {
          logger.warn('Removing exception details from error response');
          delete error.extensions['exception'];
        }
        if (data) {
          logger.error('  %s', data);
        }
        return error;
      },
    },
  }),
  new AdminUIApp({
    name: PROJECT_NAME,
    adminPath: '/admin',
    apiPath,
    signinPath: 'oauth2/sign_in',
    authStrategy,
    pages: pages,
    enableDefaultRoute: false,
  }),
  new ApiDSProxyApp({ url: process.env.SSR_API_ROOT }),
  new ApiProxyApp({ gwaApiUrl: process.env.GWA_API_URL }),
  new NextApp({ dir: 'nextapp' }),
];

const dev = process.env.NODE_ENV !== 'production';

const configureExpress = (app: any) => {
  const express = require('express');
  app.use(express.json());

  // app.get('/', (req, res, next) => {
  //     console.log(req.path)
  //     req.path == "/" ? res.redirect('/home') : next()
  // })
  app.get('/feed/:entity/:refKey/:refKeyValue', (req: any, res: any) => {
    const context = keystone.createContext({ skipAccessControl: true });
    getFeedWorker(context, req, res).catch((err: any) => {
      console.log(err);
      res.status(400).json({ result: 'error', error: '' + err });
    });
  });
  app.put('/feed/:entity', (req: any, res: any) => {
    const context = keystone.createContext({
      skipAccessControl: true,
      authentication: { item: { name: 'Feeder Bot' } },
    });
    putFeedWorker(context, req, res).catch((err: any) => {
      console.log(err);
      res.status(400).json({ result: 'error', error: '' + err });
    });
  });
  app.put('/feed/:entity/:id', (req: any, res: any) => {
    const context = keystone.createContext({ skipAccessControl: true });
    putFeedWorker(context, req, res).catch((err: any) =>
      res.status(400).json({ result: 'error', error: '' + err })
    );
  });
  app.delete('/feed/:entity/:id', (req: any, res: any) => {
    const context = keystone.createContext({ skipAccessControl: true });
    deleteFeedWorker(context, req, res);
  });

  app.put('/migration/import', async (req: any, res: any) => {
    const { MigrationFromV1 } = require('./batch/migrationV1');
    await new MigrationFromV1(keystone).report(req.body);
    await new MigrationFromV1(keystone)
      .migrate(req.body)
      .then(() => {
        res.status(200).json({ result: 'migrated' });
      })
      .catch((err: any) => {
        console.log('Error Migrating ' + err);
        res.status(400).json({ result: 'failed' });
      });
  });

  app.post('/migration/report', async (req: any, res: any) => {
    const { MigrationFromV1 } = require('./batch/migrationV1');
    await new MigrationFromV1(keystone)
      .report(req.body)
      .then(() => {
        res.status(200).json({ result: 'reported' });
      })
      .catch((err: any) => {
        console.log('Error Migrating ' + err);
        res.status(400).json({ result: 'failed' });
      });
  });

  // Added for handling failed calls that require orchestrating multiple changes
  app.put('/tasked/:id', async (req: any, res: any) => {
    const tasked = new Retry(process.env.WORKING_PATH, req.params['id']);
    await tasked.start();
    res.status(200).json({ result: 'ok' });
  });

  const opsMetrics = new OpsMetrics(keystone);
  opsMetrics.initialize();

  app.get('/metrics', async (req: any, res: any) => {
    await opsMetrics.generateMetrics();
    await opsMetrics.store();

    res.set('Content-Type', 'text/plain');
    res.end('');
  });

  app.get('/about', (req: any, res: any) => {
    res.status(200).json({
      version: process.env.NEXT_PUBLIC_APP_VERSION,
      revision: process.env.NEXT_PUBLIC_APP_REVISION,
      cluster: process.env.NEXT_PUBLIC_KUBE_CLUSTER,
      identities: {
        developer: (process.env.NEXT_PUBLIC_DEVELOPER_IDS || '').split(','),
        provider: (process.env.NEXT_PUBLIC_PROVIDER_IDS || '').split(','),
      },
      identityContent: require('./auth/methods.json'),
      accountLinks: {
        bceidUrl: process.env.NEXT_PUBLIC_ACCOUNT_BCEID_URL,
        bcscUrl: process.env.NEXT_PUBLIC_ACCOUNT_BCSC_URL,
      },
      helpLinks: {
        helpDeskUrl: process.env.NEXT_PUBLIC_HELP_DESK_URL,
        helpChatUrl: process.env.NEXT_PUBLIC_HELP_CHAT_URL,
        helpIssueUrl: process.env.NEXT_PUBLIC_HELP_ISSUE_URL,
        helpApiDocsUrl: process.env.NEXT_PUBLIC_HELP_API_DOCS_URL,
        helpSupportUrl: process.env.NEXT_PUBLIC_HELP_SUPPORT_URL,
        helpReleaseUrl: process.env.NEXT_PUBLIC_HELP_RELEASE_URL,
        helpStatusUrl: process.env.NEXT_PUBLIC_HELP_STATUS_URL,
        helpAddOrgUrl: process.env.NEXT_PUBLIC_HELP_ADD_ORG_URL,
        helpChangeOrgUrl: process.env.NEXT_PUBLIC_CHANGE_ORG_URL,
      },
    });
  });

  // const { NotificationService } = require('./services/notification/notification.service')

  // const nc = new NotificationService(new ConfigService())

  // nc.notify ({email: "aidan.cope@gmail.com", name: "Aidan Cope"}, { template: 'email-template', subject: 'Yeah!'}).then ((answer:any) => {
  //     console.log("DONE!")
  //     console.log("ANSWER = " + JSON.stringify(answer))
  // }).catch ((err: any) => {
  //     console.log("ERROR ! " + err)
  // })
};

export { keystone, apps, dev, configureExpress };
