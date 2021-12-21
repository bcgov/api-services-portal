const express = require('express');
const { maintenance } = require('./services/maintenance');

class MaintenanceApp {
  constructor(state) {
    this.state = state;
  }

  prepareMiddleware() {
    const app = express();
    app.get('/maintenance', async (req, res) => {
      res.json({ state: await maintenance.get() });
    });
    app.put('/maintenance/:state', async (req, res) => {
      await maintenance.set(req.params.state == 'true');
      res.json({ state: await maintenance.get() });
    });
    return app;
  }
}

module.exports = {
  MaintenanceApp,
};
