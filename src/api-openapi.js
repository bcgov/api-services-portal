
const fs = require('fs')
const express = require('express');
const { RegisterRoutes } = require("./controllers/routes")
const specFile = fs.realpathSync('controllers/swagger.yaml')
const spec = fs.readFileSync(specFile)

class ApiOpenapiApp {
  constructor() {
  }

  prepareMiddleware({ keystone }) {
    const app = express();
    
    app.use(express.json());
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