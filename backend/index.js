const { Keystone } = require('@keystonejs/keystone');
const { Oauth2ProxyAuthStrategy } = require('./auth');
const { Text, Checkbox, Password, Select } = require('@keystonejs/fields');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const initialiseData = require('./initial-data');
const { startAuthedSession } = require('@keystonejs/session');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

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
    sameSite: true,
  },
//   sessionStore: new MongoStore({ url: process.env.MONGO_URL, mongoOptions: { auth: { user: process.env.MONGO_USER, password: process.env.MONGO_PASSWORD } } })
});

// Access control functions
const userIsAdmin = ({ authentication: { item: user } }) => {
    console.log("IsAdmin?" + user.isAdmin)
    return Boolean(user && user.isAdmin);
}

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
    groups: { type: Select, emptyOption: true, options: [
        { value: 'superuser', label: 'Superuser'}
      ]
    }
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
  type: Oauth2ProxyAuthStrategy,
  list: 'User',
  config: {
    onAuthenticated: ({ token, item, isNewItem }, req, res) => {
        console.log("Token = "+token);
        console.log("Redirecting to /admin")
        res.redirect('/admin');
    }      
  }
});


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
      isAccessAllowed: (user) => {
        console.log("isALlowed?")
        console.log(JSON.stringify(user))
        return true
      },
      authStrategy
    })
  ]
}
