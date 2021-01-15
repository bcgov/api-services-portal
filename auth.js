/*
  TODO:
    - work out how (and when) to validate the username and password fields
    - allow a validateUser() hook to be provided in config
*/
const express = require('express')
const session = require('express-session')

const querystring = require('querystring')

const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const proxy = process.env.EXTERNAL_URL
const authLogoutUrl = process.env.OIDC_ISSUER + "/protocol/openid-connect/logout?redirect_uri=" + querystring.escape(proxy)

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
        app = express()
        app.set('trust proxy', true);

        const jwtCheck = jwksRsa.expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: process.env.JWKS_URL
        })
        
        const verifyJWT = jwt({ 
            secret: jwtCheck, 
            algorithms: ['RS256'], 
            credentialsRequired: false, 
            requestProperty: 'oauth_user', 
            getToken: (req) => ('x-forwarded-access-token' in req.headers) ? req.headers['x-forwarded-access-token'] : null
        })

        const checkExpired = (err, req, res, next) => {
            console.log("CHECK EXPIRED!! " + err);

            if (err) {
                if (err.name === 'UnauthorizedError') {
                    console.log("CODE = "+err.code);
                    console.log("INNER = "+err.inner);
                    res.redirect('/oauth2/sign_out?rd=' + querystring.escape(authLogoutUrl))
                }
                next(err)
            } else {
                //
                next();
            }
        }

        app.get('/', [verifyJWT, checkExpired], async (req, res, next) => {
            if (req.oauth_user) {
                const jti = req['oauth_user']['jti'] // JWT ID - Unique Identifier for the token
                console.log("SESSION USER = " + req.user)
                if (req.user) {
                    if (jti != req.user.jti) {
                        console.log("Looks like a different credential.. ")
                        await this._sessionManager.endAuthedSession(req);
                        res.redirect('/admin/signin')
                        // this.register_user(req, res)
                        return
                    }
                } else {
                    res.redirect('/admin/signin')
                    return
                    // this.register_user(req,res)
                    // return
                }
            }
            next();
        });

        app.get('/admin/home', [verifyJWT, checkExpired], async (req, res, next) => {
            res.redirect('/home')
        })

        app.get('/admin/session', async (req, res, next) => {
            const toJson = (val) => val ? JSON.parse(val) : null;

            const response = req && req.user ? {anonymous: false, user: req.user } : {anonymous:true}
            response.groups = toJson(response.groups)
            response.roles = toJson(response.roles)
            res.json(response)
        })

        app.get('/admin/signout', [verifyJWT, checkExpired], async (req, res, next) => {
            console.log("Signing out")
            if (req.oauth_user) {
                if (req.user) {
                    await this._sessionManager.endAuthedSession(req);
                }
            }
            res.redirect('/oauth2/sign_out?rd=' + querystring.escape(authLogoutUrl))
        })

        app.get('/admin/signin', [verifyJWT, checkExpired], async (req, res, next) => {
            this.register_user(req,res)
        })
        return app
    }

    async register_user(req, res, next) {
        const _users = this.keystone.getListByKey('User')
        const users = this.keystone.getListByKey(this.listKey)

        // If no user in session but we are authenticated, then redirect to /admin/signin
        const allRoles = ['developer', 'api-manager', 'api-owner', 'aps-admin', 'credential-admin']
        const oauthUser = req['oauth_user']

        // The SessionManager is expecting an Authorization header, so give it one
        //req['headers']['authorization'] = 'Bearer ' + req.headers['x-forwarded-access-token']
        const jti = oauthUser['jti'] // JWT ID - Unique Identifier for the token
        const sub = oauthUser['sub'] // Subject ID - Whom the token refers to

        const name = oauthUser['name']
        const email = oauthUser['email']
        const namespace = oauthUser['namespace']
        const groups = JSON.stringify(oauthUser['groups'])
        let roles = JSON.stringify(allRoles)
        console.log(JSON.stringify(oauthUser, null, 4))
        try {
            roles = JSON.stringify(oauthUser.realm_access.roles.filter(r => allRoles.includes(r)))
        } catch (e) {
            console.log(e)

        }
        /*
            Roles:
            credential-admin : Application for authenticating with an OIDC Auth provider for the purposes of client registration.  The Credential Issuer will generate the new credentials and provide a mechanism for the Developer to retrieve them.
            api-manager      : The API Manager makes APIs available for consumption with supporting documentation.  They approve requests for access.
            api-owner        : Does the technical deployment of the API on the Gateway under a particular Namespace - Gateway Services.
            developer        : A Developer discovers APIs, requests access if required and consumes them - everyone has 'developer' role
            aps-admin        : Someone from the APS team with elevated privileges.
        */

        const username = oauthUser['preferred_username']

        let _results = await _users.adapter.find({ 'username': username })

        let userId = _results.length == 1 ? _results[0].id : null;

        if (_results.length == 0) {
            // auto-create a user record
            const { data, errors } = await this.keystone.executeGraphQL({
                context: this.keystone.createContext({ skipAccessControl: true }),
                query: `mutation ($name: String, $email: String, $username: String) {
                        createUser(data: {name: $name, username: $username, email: $email, isAdmin: false }) {
                            id
                    } }`,
                variables: { name, email, username },
            })
            if (errors) {
                console.log("NO! Something went wrong creating user " + errors)
                throw new Error("Error creating user " + errors)
            }
            console.log("USER CREATE " + JSON.stringify(data, null, 4))

            userId = data.createUser.id
        }

        let results = await users.adapter.find({ 'jti': jti })

        var operation = "update"
        console.log("Auth "+jti+sub);

        if (results.length == 0) {
            console.log("Temporary Credential NOT FOUND - CREATING AUTOMATICALLY")
            const { errors } = await this.keystone.executeGraphQL({
                context: this.keystone.createContext({ skipAccessControl: true }),
                query: `mutation ($jti: String, $sub: String, $name: String, $email: String, $username: String, $namespace: String, $groups: String, $roles: String, $userId: String) {
                        createTemporaryIdentity(data: {jti: $jti, sub: $sub, name: $name, username: $username, email: $email, isAdmin: false, namespace: $namespace, groups: $groups, roles: $roles, userId: $userId }) {
                            id
                    } }`,
                variables: { jti, sub, name, email, username, namespace, groups, roles, userId },
            })
            if (errors) {
                console.log("NO! Something went wrong " + errors)
            }
            results = await users.adapter.find({ ['jti']: jti })       
            operation = "create"
        }

        const user = results[0]
        console.log("USER = "+JSON.stringify(user, null, 4))
        await this._authenticateItem(user, null, operation === 'create', req, res, next);
    }

    async _authenticateItem(item, accessToken, isNewItem, req, res, next) {
        const token = await this._sessionManager.startAuthedSession(req, {
            item,
            list: this._getList(),
        });
        // console.log("Created session " + JSON.stringify(req.session, null, 3))

        req.session.oauth_user = req.oauth_user
        
        this._onAuthenticated({ token, item, isNewItem }, req, res, next);
    }

    _getList() {
        return this.keystone.lists[this.listKey];
    }

    async _getItem(list, args, secretFieldInstance) {
      // Match by identity
      const { identityField } = this.config;
      const identity = args[identityField];
      const results = await list.adapter.find({ [identityField]: identity });
      // If we failed to match an identity and we're protecting existing identities then combat timing
      // attacks by creating an arbitrary hash (should take about as long has comparing an existing one)
      if (results.length !== 1 && this.config.protectIdentities) {
        // TODO: This should call `secretFieldInstance.compare()` to ensure it's
        // always consistent.
        // This may still leak if the workfactor for the password field has changed
        const hash = await secretFieldInstance.generateHash(
          'simulated-password-to-counter-timing-attack'
        );
        await secretFieldInstance.compare('', hash);
        return { success: false, message: '[passwordAuth:failure] Authentication failed' };
      }
  
      // Identity failures with helpful errors
      if (results.length === 0) {
        const key = '[passwordAuth:identity:notFound]';
        const message = `${key} The ${identityField} provided didn't identify any ${list.plural}`;
        return { success: false, message };
      }
      if (results.length > 1) {
        const key = '[passwordAuth:identity:multipleFound]';
        const message = `${key} The ${identityField} provided identified ${results.length} ${list.plural}`;
        return { success: false, message };
      }
      const item = results[0];
      return { success: true, item };
    }
  
    async _matchItem(item, args, secretFieldInstance) {
      const { secretField } = this.config;
      const secret = args[secretField];
      if (item[secretField]) {
        const success = await secretFieldInstance.compare(secret, item[secretField]);
        return {
          success,
          message: success
            ? 'Authentication successful'
            : `[passwordAuth:secret:mismatch] The ${secretField} provided is incorrect`,
        };
      }
  
      const hash = await secretFieldInstance.generateHash(
        'simulated-password-to-counter-timing-attack'
      );
      await secretFieldInstance.compare(secret, hash);
      return {
        success: false,
        message:
          '[passwordAuth:secret:notSet] The item identified has no secret set so can not be authenticated',
      };
    }
  
    getAdminMeta() {
      const { listKey, gqlNames } = this;
      const { identityField, secretField } = this.config;
      return { listKey, gqlNames, identityField, secretField };
    }
  }
  
  // Need to keep this as 'password' otherwise the admin-ui won't work!
  Oauth2ProxyAuthStrategy.authType = 'password';
  
  module.exports = { Oauth2ProxyAuthStrategy };