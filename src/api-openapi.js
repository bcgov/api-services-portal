const fs = require('fs')
const express = require('express');
const { RegisterRoutes } = require("./controllers/routes")
const Keycloak = require('keycloak-connect')
const specFile = fs.realpathSync('controllers/swagger.yaml')
const spec = fs.readFileSync(specFile)

const { Register } = require('./controllers/ioc/registry')

class ApiOpenapiApp {
  constructor() {
  }

  prepareMiddleware({ keystone }) {
    const app = express();
    app.use(express.json());

    let kcConfig = {
        clientId: process.env.GWA_RES_SVR_CLIENT_ID,
        secret: process.env.GWA_RES_SVR_CLIENT_SECRET,
        public: false,
        bearerOnly: true,
        serverUrl: process.env.KEYCLOAK_AUTH_URL,
        realm: process.env.KEYCLOAK_REALM,
        verifyTokenAudience: false
    }

    let keycloak = new Keycloak({ }, kcConfig)

    Register(keystone)

    app.use('/ds/api/namespaces/:ns/contents', (req, res, next) => 
        keycloak.enforcer(`${req.params.ns}:Content.Publish`)(req, res, next))
    app.use('/ds/api/namespaces/:ns/datasets', (req, res, next) => 
        keycloak.enforcer(`${req.params.ns}:Namespace.Manage`)(req, res, next))
    app.use('/ds/api/namespaces/:ns/products', (req, res, next) => 
        keycloak.enforcer(`${req.params.ns}:Namespace.Manage`)(req, res, next))

    RegisterRoutes(app)

    app.get('/ds/api/swagger.yaml', (req, res) => {
        res.setHeader('Content-Type', 'application/yaml')
        res.send(spec)
    })

    return app;
  }
}

module.exports = {
    ApiOpenapiApp,
};