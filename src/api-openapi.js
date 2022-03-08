const fs = require('fs');
const express = require('express');
const YAML = require('yamljs');
const { ValidateError } = require('tsoa');
const swaggerUi = require('swagger-ui-express');
const { Logger } = require('./logger');

var options = {
  explorer: true,
};

const { Register } = require('./controllers/ioc/registry');
const { UnauthorizedError } = require('express-jwt');
const { AssertionError } = require('assert');

class ApiOpenapiApp {
  constructor() {}

  prepareV1(app) {
    const { RegisterRoutes } = require('./controllers/v1/routes');
    const specFile = fs.realpathSync('controllers/v1/openapi.yaml');
    const spec = fs.readFileSync(specFile);

    RegisterRoutes(app);

    // RFC 8631 service-desc link relation
    // https://datatracker.ietf.org/doc/html/rfc8631
    app.get('/ds/api', (req, res) => {
      res.setHeader('Link', '</ds/api/openapi.yaml>; rel="service-desc"');
      res.status(204).end();
    });

    app.get('/ds/api/openapi.yaml', (req, res) => {
      res.setHeader('Content-Type', 'application/yaml');
      res.send(spec);
    });
  }

  prepareV2(app) {
    const { RegisterRoutes } = require('./controllers/v2/routes');
    const specFile = fs.realpathSync('controllers/v2/openapi.yaml');
    const spec = fs.readFileSync(specFile);

    RegisterRoutes(app);

    // RFC 8631 service-desc link relation
    // https://datatracker.ietf.org/doc/html/rfc8631
    app.get('/ds/api/v2', (req, res) => {
      res.setHeader('Link', '</ds/api/openapi.yaml>; rel="service-desc"');
      res.status(204).end();
    });

    app.get('/ds/api/v2/openapi.yaml', (req, res) => {
      res.setHeader('Content-Type', 'application/yaml');
      res.send(spec);
    });

    app.use(
      '/ds/api/v2/console',
      swaggerUi.serve,
      swaggerUi.setup(YAML.load(specFile), options)
    );
  }

  prepareMiddleware({ keystone }) {
    const logger = Logger('dsapi');

    const app = express();
    app.use(express.json());

    Register(keystone);

    this.prepareV2(app);
    this.prepareV1(app);

    app.use(function errorHandler(err, req, res, next) {
      if (err instanceof UnauthorizedError) {
        return res.status(err.status).json({
          code: err.code,
          message: err.message,
        });
      }
      if (err instanceof ValidateError) {
        console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
        return res.status(422).json({
          message: 'Validation Failed',
          details: err?.fields,
        });
      }
      if (err instanceof AssertionError) {
        logger.error('Assertion Error (%s)', req.path, err);
        return res.status(422).json({
          message: err.message,
        });
      }

      if (err instanceof Error) {
        console.error(err);
        logger.error('Unexpected Error (%s)', req.path, err);
        return res.status(500).json({
          message: 'Internal Server Error',
        });
      }

      next();
    });

    return app;
  }
}

module.exports = {
  ApiOpenapiApp,
};
