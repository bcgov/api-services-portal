const fs = require('fs');
const express = require('express');
const YAML = require('js-yaml');
const { ValidateError } = require('tsoa');
const swaggerUi = require('swagger-ui-express');
const { Logger } = require('./logger');

var options = {
  explorer: false,
};

const { Register } = require('./controllers/ioc/registry');
const { UnauthorizedError } = require('express-jwt');
const { AssertionError } = require('assert');
const { BatchSyncException } = require('./batch/types');

class ApiOpenapiApp {
  constructor() {}

  prepareV1(app) {
    const { RegisterRoutes } = require('./controllers/v1/routes');
    const specFile = fs.realpathSync('controllers/v1/openapi.yaml');
    const spec = fs.readFileSync(specFile);

    RegisterRoutes(app);

    app.get('/ds/api/openapi.yaml', (req, res) => {
      res.setHeader('Content-Type', 'application/yaml');
      res.send(spec);
    });
  }

  prepareV2(app) {
    const { RegisterRoutes } = require('./controllers/v2/routes');
    const specFile = fs.realpathSync('controllers/v2/openapi.yaml');
    const specObject = YAML.load(fs.readFileSync(specFile));

    /*
      The 'tokenUrl' should be set with the 'OIDC_ISSUER' = '/protocol/openid-connect/token'

      securitySchemes:
        jwt:
            type: oauth2
            description: 'Authz Client Credential'
            flows:
                clientCredentials:
                    tokenUrl
    */
    specObject.components.securitySchemes.jwt.flows.clientCredentials.tokenUrl = `${process.env.OIDC_ISSUER}/protocol/openid-connect/token`;

    specObject.components.securitySchemes.openid.openIdConnectUrl = `${process.env.OIDC_ISSUER}/.well-known/openid-configuration`;

    RegisterRoutes(app);

    app.get('/ds/api/v2/openapi.yaml', (req, res) => {
      res.setHeader('Content-Type', 'application/yaml');
      res.send(YAML.dump(specObject));
    });

    app.use(
      '/ds/api/v2/console',
      swaggerUi.serve,
      swaggerUi.setup(specObject, options)
    );
  }

  prepareMiddleware({ keystone }) {
    const logger = Logger('dsapi');

    const app = express();
    app.use(express.json());

    Register(keystone);

    this.prepareV2(app);
    this.prepareV1(app);

    // RFC 8631 service-desc link relation
    // https://datatracker.ietf.org/doc/html/rfc8631
    app.get('/ds/api', (req, res) => {
      res.setHeader('Link', '</ds/api/v2/openapi.yaml>; rel="service-desc"');
      res.status(204).end();
    });

    app.use(function errorHandler(err, req, res, next) {
      if (err instanceof UnauthorizedError) {
        return res.status(err.status).json({
          code: err.code,
          message: err.message,
        });
      } else if (err instanceof ValidateError) {
        console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
        return res.status(422).json({
          message: 'Validation Failed',
          details: err?.fields,
        });
      } else if (err instanceof AssertionError) {
        // For some reason `message` is what the `stack` is normally
        // so just grab the first line and return that
        const response = {
          message: 'Failed an assertion',
        };
        try {
          logger.warn('Error message %s', err.message);
          response.message = err.message.split('\n')[0];
        } catch (e) {
          logger.warn('Failed to parse error message %s', e);
        }
        return res.status(422).json(response);
      } else if (err instanceof SyntaxError) {
        logger.error(err);
        logger.error('Syntax Error PATH: %s', req.path);
        return res.status(422).json({
          message: 'Syntax Error Parsing JSON',
        });
      } else if (err instanceof BatchSyncException) {
        logger.error(err);
        logger.error('BatchSync PATH: %s', req.path);
        return res.status(400).json(err.result);
      } else if (err instanceof Error) {
        logger.error(err);
        logger.error('Error PATH: %s', req.path);
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
