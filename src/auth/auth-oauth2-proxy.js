/*
  TODO:
    - work out how (and when) to validate the username and password fields
    - allow a validateUser() hook to be provided in config
*/
const express = require('express');
const session = require('express-session');

const querystring = require('querystring');

const { maintenance } = require('../services/maintenance');

const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const { deriveRoleFromIdP, scopesToRoles } = require('./scope-role-utils');

const proxy = process.env.EXTERNAL_URL;
const authLogoutUrl =
  process.env.OIDC_ISSUER +
  '/protocol/openid-connect/logout?redirect_uri=' +
  querystring.escape(proxy + '/signout');

const { Logger } = require('../logger');

const { UMA2TokenService } = require('../services/uma2');
const { getUma2FromIssuer, Uma2WellKnown } = require('../services/keycloak');
const {
  clearNamespace,
  assignNamespace,
  switchTo,
} = require('../services/keystone');
const { MigrateAuthzUser, MigratePortalUser } = require('../services/workflow');

const toJson = (val) => (val ? JSON.parse(val) : null);

const logger = Logger('auth');

class Oauth2ProxyAuthStrategy {
  constructor(keystone, listKey, config) {
    this.keystone = keystone;
    this.listKey = listKey;
    this._sessionManager = keystone._sessionManager;
    this._onAuthenticated = config.onAuthenticated || (() => {});

    this.gqlNames = {}; // Set by the auth provider
    this.config = {
      identityField: 'email',
      secretField: 'password',
      protectIdentities: true,
      ...config,
    };
  }

  getList() {
    return this.keystone.lists[this.listKey];
  }

  getInputFragment() {
    return `
        ${this.config.identityField}: String
        ${this.config.secretField}: String
      `;
  }

  prepareMiddleware(app) {
    const sessionManager = this._sessionManager;
    app = express();
    app.set('trust proxy', true);

    const jwtCheck = jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: process.env.JWKS_URL,
    });

    const verifyJWT = jwt({
      secret: jwtCheck,
      algorithms: ['RS256'],
      credentialsRequired: false,
      requestProperty: 'oauth_user',
      getToken: (req) =>
        'x-forwarded-access-token' in req.headers
          ? req.headers['x-forwarded-access-token']
          : null,
    });
    // X-Auth-Request-Access-Token

    const checkExpired = async (err, req, res, next) => {
      logger.debug('[check-jwt-error] ' + err);

      if (err) {
        logger.error(
          '[check-jwt-error] ending session - oauth2 proxy should be refreshing this token!'
        );
        await sessionManager.endAuthedSession(req);

        if (err.name === 'UnauthorizedError') {
          logger.debug('[check-jwt-error] CODE = ' + err.code);
          logger.debug('[check-jwt-error] INNER = ' + err.inner);
        }
        res.status(401).json({ error: 'expired_token' });
        return;
      }
      next();
    };

    const detectSessionMismatch = async function (req, res, next) {
      // If there is a Keystone session, make sure it is not out of sync with the
      // OAuth proxy session
      if (req.user) {
        if (req.oauth_user) {
          if (req['oauth_user']['sub'] != req.user.sub) {
            logger.warn(
              '[detect-session-mismatch] Different subject (%s) detected!',
              req['oauth_user']['sub']
            );
            logger.warn('[detect-session-mismatch] ending session');
            await sessionManager.endAuthedSession(req);
            return res.status(401).json({ error: 'invalid_session' });
          } else {
            const jti = req['oauth_user']['jti']; // JWT ID - Unique Identifier for the token
            if (jti != req.user.jti) {
              logger.debug(
                '[detect-session-mismatch] Refreshed credential %s',
                jti
              );
            }
          }
        } else {
          logger.warn(
            '[detect-session-mismatch] OAuth session ended - ending Keystone session 403'
          );
          logger.warn('[detect-session-mismatch] ending session');
          await sessionManager.endAuthedSession(req);
          return res.status(401).json({ error: 'proxy_session_expired' });
        }
      }
      next();
    };

    app.get(
      '/admin/session',
      verifyJWT,
      detectSessionMismatch,
      checkExpired,
      async (req, res, next) => {
        const response =
          req && req.user
            ? { anonymous: false, user: req.user, maintenance: false }
            : { anonymous: true, maintenance: false };
        if (response.anonymous == false) {
          response.user.groups = toJson(response.user.groups);
          response.user.roles = toJson(response.user.roles);
          response.user.scopes = toJson(response.user.scopes);
        }
        response.maintenance = await maintenance.get();
        res.json(response);
      }
    );

    app.get('/admin/signout', async (req, res, next) => {
      if (req.user) {
        await this._sessionManager.endAuthedSession(req);
      }
      res.redirect('/oauth2/sign_out?rd=' + querystring.escape(authLogoutUrl));
    });

    app.get(
      '/admin/signin',
      [
        verifyJWT,
        (err, req, res, next) => {
          // If we are signing in and the token is not valid, then force a signout because
          // the Oauth2 Proxy is not refreshing the token properly
          if (err) {
            res.redirect('/admin/signout');
          }
        },
      ],
      async (req, res, next) => {
        await this.register_user(req, res, next);
      }
    );

    app.put(
      '/admin/switch',
      [verifyJWT, checkExpired],
      async (req, res, next) => {
        // Switch to "no namespace" - aka "clear namespace"
        try {
          const jti = req['oauth_user']['jti']; // JWT ID - Unique Identifier for the token
          const identityProvider = req['oauth_user']['identity_provider']; // Identity Provider included in token
          // The oauth2_proxy is handling the refresh token; so there can be a new jti
          logger.info(
            '[ns-clear] %s -> %s : %s',
            req.user.jti,
            jti,
            req.user.jti === jti ? 'SAME TOKEN' : 'REFRESHED TOKEN!'
          );
          const switched = await clearNamespace(
            this.keystone,
            req.user.jti,
            jti,
            identityProvider
          );

          res.json({ switch: switched });
        } catch (err) {
          logger.error('Error clearing namespace %s', err);
          res.status(400).json({ switch: false, error: 'ns_cleared_fail' });
        }
      }
    );

    app.put(
      '/admin/switch/:ns',
      [verifyJWT, checkExpired],
      async (req, res, next) => {
        // Switch namespace
        // - Get a Requestor Party Token for the particular Resource
        try {
          const result = await switchTo(this.keystone, req, req.params['ns']);
          res.status(200).json({ switch: result });
        } catch (err) {
          res.status(400).json({ switch: false, error: 'ns_assign_fail' });
        }
      }
    );
    return app;
  }

  async register_user(req, res, next) {
    const _users = this.keystone.getListByKey('User');
    const users = this.keystone.getListByKey(this.listKey);

    // If no user in session but we are authenticated, then redirect to /admin/signin
    const allRoles = [
      'developer',
      'api-manager',
      'api-owner',
      'aps-admin',
      'credential-admin',
    ];
    const oauthUser = req['oauth_user'];

    // The SessionManager is expecting an Authorization header, so give it one
    //req['headers']['authorization'] = 'Bearer ' + req.headers['x-forwarded-access-token']
    const jti = oauthUser['jti']; // JWT ID - Unique Identifier for the token
    const sub = oauthUser['sub']; // Subject ID - Whom the token refers to

    const name = oauthUser['name'];
    const identityProvider = oauthUser['identity_provider'];
    const providerUserGuid = oauthUser['provider_user_guid'];
    const providerUsername = oauthUser['provider_username'];
    const businessName = oauthUser['business_name'];
    const email = oauthUser['email'];
    const username = oauthUser['preferred_username'];
    const groups = JSON.stringify(oauthUser['groups']);
    const _roles = [];
    const clientId = process.env.GWA_RES_SVR_CLIENT_ID;

    if (
      'resource_access' in oauthUser &&
      clientId in oauthUser['resource_access']
    ) {
      try {
        logger.debug('register_user - Getting resources for [%s]', clientId);

        oauthUser['resource_access'][clientId].roles
          .filter((r) => allRoles.includes(r))
          .map((r) => _roles.push(r));

        logger.debug('register_user - Roles = %s', _roles);
      } catch (e) {
        logger.error(
          'register_user - error parsing resource_access roles %s - defaulting roles to none - %s',
          e
        );
      }
    }
    _roles.push('portal-user');
    _roles.push(deriveRoleFromIdP(identityProvider));

    const roles = JSON.stringify(_roles); // authenticated user gets developer role automatically

    /*
            A bit about namespace:
              We are moving away from the namespace being part of the JWT to where the namespace list is provided in the JWT
              and the selected namespace is updated into the TemporaryIdentity from within the APS Portal.
              For this to happen, changes on the Metrics/Auth Proxy will be necessary.
        */
    /*
            Roles:
            credential-admin : Application for authenticating with an OIDC Auth provider for the purposes of client registration.  The Credential Issuer will generate the new credentials and provide a mechanism for the Developer to retrieve them.
            api-manager      : The API Manager makes APIs available for consumption with supporting documentation.  They approve requests for access.
            api-owner        : Does the technical deployment of the API on the Gateway under a particular Namespace - Gateway Services.
            developer        : A Developer discovers APIs, requests access if required and consumes them - everyone has 'developer' role
            aps-admin        : Someone from the APS team with elevated privileges.
        */

    let _results = await _users.adapter.find({ username: username });

    if (
      _results.length == 0 &&
      username != `${providerUsername}@${identityProvider}`
    ) {
      logger.info(
        '[migration] %s not found.  Migrate %s@%s access to %s',
        username,
        providerUsername,
        identityProvider,
        username
      );
      try {
        _results = await _users.adapter.find({
          username: `${providerUsername}@${identityProvider}`,
        });
        if (_results.length == 1) {
          const oldUser = _results[0];
          const suctx = this.keystone.createContext({
            skipAccessControl: true,
          });
          // check to see if we need to migrate
          await MigrateAuthzUser(suctx, oldUser.username, username, true);
          await MigratePortalUser(suctx, oldUser.username, username);
        }
      } catch (err) {
        logger.error(
          '[migration] Error during migration (%s) %s',
          username,
          err
        );
        throw new Error('User migration error');
      }
    }

    let userId = _results.length == 0 ? null : _results[0].id;

    if (_results.length == 0) {
      // auto-create a user record
      const { data, errors } = await this.keystone.executeGraphQL({
        context: this.keystone.createContext({ skipAccessControl: true }),
        query: `mutation ($name: String, $email: String, $username: String, $identityProvider: String, $providerUserGuid: String, $providerUsername: String) {
                        createUser(data: {name: $name, username: $username, email: $email, provider: $identityProvider, providerUserGuid: $providerUserGuid, providerUsername: $providerUsername, isAdmin: false }) {
                            id
                    } }`,
        variables: {
          name,
          email,
          username,
          identityProvider,
          providerUserGuid,
          providerUsername,
        },
      });
      if (errors) {
        logger.error(
          'register_user - NO! Something went wrong creating user ' + errors
        );
        throw new Error('Error creating user ' + errors);
      }

      userId = data.createUser.id;
    } else {
      // update if "name" or "email" has changed
      const saved = _results[0];
      if (
        saved.name != name ||
        saved.email != email ||
        saved.identityProvider === null ||
        saved.providerUsername != providerUsername
      ) {
        logger.info(
          'register_user - updating name (%s), email (%s), provider (%s), providerUserGuid (%s), providerUsername (%s) for %s',
          name,
          email,
          identityProvider,
          providerUserGuid,
          providerUsername,
          username
        );
        const { data, errors } = await this.keystone.executeGraphQL({
          context: this.keystone.createContext({ skipAccessControl: true }),
          query: `mutation ($name: String, $email: String, $identityProvider: String, $providerUserGuid: String, $providerUsername: String, $userId: ID!) {
                          updateUser(id: $userId, data: {name: $name, email: $email, provider: $identityProvider, providerUserGuid: $providerUserGuid, providerUsername: $providerUsername }) {
                              id
                      } }`,
          variables: {
            name,
            email,
            identityProvider,
            providerUserGuid,
            providerUsername,
            userId,
          },
        });
        if (errors) {
          logger.error(
            'register_user - NO! Something went wrong creating user ' + errors
          );
          throw new Error('Error updating user ' + errors);
        }
      }
    }

    let results = await users.adapter.find({ jti: jti });

    var operation = 'update';

    if (results.length == 0) {
      logger.debug('Temporary Credential NOT FOUND - CREATING AUTOMATICALLY');
      const { errors } = await this.keystone.executeGraphQL({
        context: this.keystone.createContext({ skipAccessControl: true }),
        query: `mutation ($jti: String, $sub: String, $name: String, $email: String, $username: String, $identityProvider: String, $providerUserGuid: String, $providerUsername: String, $businessName: String, $groups: String, $roles: String, $scopes: String, $userId: String) {
                        createTemporaryIdentity(data: {jti: $jti, sub: $sub, name: $name, username: $username, provider: $identityProvider, providerUserGuid: $providerUserGuid, providerUsername: $providerUsername, businessName: $businessName, email: $email, isAdmin: false, groups: $groups, roles: $roles, scopes: $scopes, userId: $userId }) {
                            id
                    } }`,
        variables: {
          jti,
          sub,
          name,
          email,
          username,
          identityProvider,
          providerUserGuid,
          providerUsername,
          businessName,
          groups,
          roles,
          scopes: '[]',
          userId,
        },
      });
      if (errors) {
        logger.error('register_user - NO! Something went wrong %j', errors);
      }
      results = await users.adapter.find({ ['jti']: jti });
      operation = 'create';
    }

    const user = results[0];
    user.groups = toJson(user.groups);
    user.roles = toJson(user.roles);
    user.scopes = toJson(user.scopes);

    logger.debug('[register_user] USER = %j', user);
    await this._authenticateItem(
      user,
      null,
      operation === 'create',
      req,
      res,
      next
    );
  }

  async _authenticateItem(item, accessToken, isNewItem, req, res, next) {
    const token = await this._sessionManager.startAuthedSession(req, {
      item,
      list: this._getList(),
    });
    req.session.oauth_user = req.oauth_user;

    this._onAuthenticated({ token, item, isNewItem }, req, res, next);
  }

  _getList() {
    return this.keystone.lists[this.listKey];
  }

  // async _getItem(list, args, secretFieldInstance) {
  //   // Match by identity
  //   const { identityField } = this.config;
  //   const identity = args[identityField];
  //   const results = await list.adapter.find({ [identityField]: identity });
  //   // If we failed to match an identity and we're protecting existing identities then combat timing
  //   // attacks by creating an arbitrary hash (should take about as long has comparing an existing one)
  //   if (results.length !== 1 && this.config.protectIdentities) {
  //     // TODO: This should call `secretFieldInstance.compare()` to ensure it's
  //     // always consistent.
  //     // This may still leak if the workfactor for the password field has changed
  //     const hash = await secretFieldInstance.generateHash(
  //       'simulated-password-to-counter-timing-attack'
  //     );
  //     await secretFieldInstance.compare('', hash);
  //     return { success: false, message: '[passwordAuth:failure] Authentication failed' };
  //   }

  //   // Identity failures with helpful errors
  //   if (results.length === 0) {
  //     const key = '[passwordAuth:identity:notFound]';
  //     const message = `${key} The ${identityField} provided didn't identify any ${list.plural}`;
  //     return { success: false, message };
  //   }
  //   if (results.length > 1) {
  //     const key = '[passwordAuth:identity:multipleFound]';
  //     const message = `${key} The ${identityField} provided identified ${results.length} ${list.plural}`;
  //     return { success: false, message };
  //   }
  //   const item = results[0];
  //   console.log("_getItem with toJson..")
  //   item.groups = toJson(item.groups)
  //   item.roles = toJson(item.roles)

  //   return { success: true, item };
  // }

  // async _matchItem(item, args, secretFieldInstance) {
  //   const { secretField } = this.config;
  //   const secret = args[secretField];
  //   if (item[secretField]) {
  //     const success = await secretFieldInstance.compare(secret, item[secretField]);
  //     return {
  //       success,
  //       message: success
  //         ? 'Authentication successful'
  //         : `[passwordAuth:secret:mismatch] The ${secretField} provided is incorrect`,
  //     };
  //   }

  //   const hash = await secretFieldInstance.generateHash(
  //     'simulated-password-to-counter-timing-attack'
  //   );
  //   await secretFieldInstance.compare(secret, hash);
  //   return {
  //     success: false,
  //     message:
  //       '[passwordAuth:secret:notSet] The item identified has no secret set so can not be authenticated',
  //   };
  // }

  getAdminMeta() {
    const { listKey, gqlNames } = this;
    const { identityField, secretField } = this.config;
    return { listKey, gqlNames, identityField, secretField };
  }
}

// Need to keep this as 'password' otherwise the admin-ui won't work!
Oauth2ProxyAuthStrategy.authType = 'password';

module.exports = {
  Oauth2ProxyAuthStrategy,
};
