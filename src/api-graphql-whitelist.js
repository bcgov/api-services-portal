const express = require('express');
const { graphqlUploadExpress } = require('graphql-upload');
const { GraphQLPlaygroundApp } = require('@keystonejs/app-graphql-playground');

const { GraphQLApp, validation } = require('@keystonejs/app-graphql');

const { parse, print } = require("graphql/language")

const {
  checkWhitelist,
  loadWhitelistAndWatch,
  addToWhitelist,
} = require('./authz/whitelist');

class ApiGraphqlWhitelistApp {
  constructor({
    apiPath = '/admin/api',
    graphiqlPath = '/admin/graphiql',
    schemaName = 'public',
    apollo = {},
  } = {}) {
    this._apiPath = apiPath;
    this._graphiqlPath = graphiqlPath;
    this._apollo = apollo;
    this._schemaName = schemaName;
  }

  prepareMiddleware({ keystone, dev }) {
    loadWhitelistAndWatch(true);

    const server = keystone.createApolloServer({
      apolloConfig: this._apollo,
      schemaName: this._schemaName,
      dev,
    });
    const apiPath = this._apiPath;
    const graphiqlPath = this._graphiqlPath;
    const app = express();

    if (dev && graphiqlPath) {
      // This is a convenience to make the out of the box experience slightly simpler.
      // We should reconsider support for this at some point in the future. -TL
      app.use(
        new GraphQLPlaygroundApp({ apiPath, graphiqlPath }).prepareMiddleware({
          keystone,
          dev,
        })
      );
    }

    app.use(this._apiPath, (req, res, next) => {
       try {
        const p = parse(req.body.query)
        //console.log(print(p))
      } catch (err) {
        console.log("ERR parsing query " + err)
      }
      if (checkWhitelist(req.body.query)) {
        next();
      } else if (process.env.NODE_ENV === 'production') {
        res.status(403).json({ error: 'invalid_query' });
      } else {
        addToWhitelist(req.body.operation, req.body.query);
        next();
      }
    });

    const maxFileSize =
      (this._apollo && this._apollo.maxFileSize) || 200 * 1024 * 1024;
    const maxFiles = (this._apollo && this._apollo.maxFileSize) || 5;
    app.use(graphqlUploadExpress({ maxFileSize, maxFiles }));
    // { cors: false } - prevent ApolloServer from overriding Keystone's CORS configuration.
    // https://www.apollographql.com/docs/apollo-server/api/apollo-server.html#ApolloServer-applyMiddleware
    app.use(server.getMiddleware({ path: apiPath, cors: false }));
    return app;
  }
  build() {}
}

module.exports = {
  ApiGraphqlWhitelistApp,
  validation,
}
