const { Keystone } = require('@keystonejs/keystone');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { Text, Checkbox, Password } = require('@keystonejs/fields');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const initialiseData = require('./initial-data');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);

const { Strategy, Issuer, Client } = require('openid-client');

const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');
const PROJECT_NAME = 'app2';
const adapterConfig = { mongoUri: process.env.MONGO_URL, user: process.env.MONGO_USER, pass: process.env.MONGO_PASSWORD };

require('dotenv').config()

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
    sameSite: false,
  },
//   sessionStore: new MongoStore({ url: process.env.MONGO_URL, mongoOptions: { auth: { user: process.env.MONGO_USER, password: process.env.MONGO_PASSWORD } } })
});

// Access control functions
const userIsAdmin = ({ authentication: { item: user } }) => Boolean(user && user.isAdmin);
const userOwnsItem = ({ authentication: { item: user } }) => {
  if (!user) {
    return false;
  }

  // Instead of a boolean, you can return a GraphQL query:
  // https://www.keystonejs.com/api/access-control#graphqlwhere
  return { id: user.id };
};

const userIsAdminOrOwner = auth => {
  const isAdmin = access.userIsAdmin(auth);
  const isOwner = access.userOwnsItem(auth);
  return isAdmin ? isAdmin : isOwner;
};

const access = { userIsAdmin, userOwnsItem, userIsAdminOrOwner };

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: {
      type: Text,
      isUnique: true,
    },
    isAdmin: {
      type: Checkbox,
      // Field-level access controls
      // Here, we set more restrictive field access so a non-admin cannot make themselves admin.
      access: {
        update: access.userIsAdmin,
      },
    },
    password: {
      type: Password,
    },
  },
  // List-level access controls
  access: {
    read: access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: access.userIsAdmin,
    delete: access.userIsAdmin,
    auth: true,
  },
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

// const Oauth2Strategy = new OAuth2Strategy({
//     authorizationURL: 'https://authz-apps-gov-bc-ca.dev.apsgw.xyz/auth/realms/aps/protocol/openid-connect/auth',
//     tokenURL: 'https://authz-apps-gov-bc-ca.dev.apsgw.xyz/auth/realms/aps/protocol/openid-connect/token',
//     clientID: EXAMPLE_CLIENT_ID,
//     clientSecret: EXAMPLE_CLIENT_SECRET,
//     callbackURL: "http://localhost:3000/callback"
//   },
//   function(accessToken, refreshToken, profile, cb) {
//       return cb(err, {name: "My name!"})
//     // User.findOrCreate({ exampleId: profile.id }, function (err, user) {
//     //   return cb(err, user);
//     // });
//   }
// );

// const oidcAuthStrategy = (async () => {
//     const issuer = await Issuer.discover('https://authz-apps-gov-bc-ca.dev.apsgw.xyz/auth/realms/aps');
//     const Client = issuer.Client;
//     return keystone.createAuthStrategy({
//         type: Oauth2Strategy,
//         list: 'User',
//         config: {
//             idField: 'preferred_username',
//             options: {
//                 client: Client
//             },
//             onAuthenticated: ({ token, item, isNewItem }, req, res) => {
//                 console.log(token);
//                 res.redirect('/');
//             },
        
//             // If there was an error during any of the authentication flow, this
//             // callback is executed
//             onError: (error, req, res) => {
//                 console.error(error);
//                 res.redirect('/?error=Uh-oh');
//             },
//             verify: (d) => {
//                 console.log("VERIFY " + JSON.stringify(d, null, 3))
//             }
//         },
//     });    
    
//   })()


const TodoSchema = require('./lists/Todo.js');
keystone.createList('Todo', TodoSchema);

const ContentSchema = require('./lists/Content.js');
keystone.createList('Content', ContentSchema);

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp({
      name: PROJECT_NAME,
      enableDefaultRoute: true,
      authStrategy,
    }),
  ],
  configureExpress: app => {
    app.set('trust proxy', true);
  }
}
