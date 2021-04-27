
const express = require('express');

class ApiHealthApp {
    constructor(state) {
      this.state = state;
    }
  
    prepareMiddleware() {
      const app = express();
      app.get('/xx/health', (req, res) => {
          if (this.state.connected) {
              res.json({status: 'ready'})
          } else {
              res.status(503).json({status: 'loading'})
          }
      })
      return app;
    }
  }
  
  module.exports = {
      ApiHealthApp
  }