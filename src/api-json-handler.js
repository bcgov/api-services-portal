const express = require('express');

/**
 * JsonHandlerApp is a simple Express middleware that handles requests to the /ds/api endpoint.
 * It responds with a 404 status code and a JSON message indicating that the resource was not found.
 * This is a catch-all handler for any requests that do not match other defined routes,
 * ensuring that clients receive a consistent JSON response for undefined endpoints.
 * Without this, the Next.js app would handle the request and return an HTML 404 page,
 * which is not suitable for API clients expecting JSON responses.
 */
class JsonHandlerApp {
  constructor() {}

  prepareMiddleware() {
    const app = express.Router();

    app.use('/ds/api', (req, res) => {
      res.status(404).json({ message: 'Resource not found' });
    });
    return app;
  }
}

module.exports = {
  JsonHandlerApp,
};
