const express = require('express');

const router = express.Router();

router.put('/switch/:id', (req, res) => {
  const { db } = req.app.locals;
  const namespace = db.get('namespaces').find((n) => n.id === req.params.id)
    .name;
  const user = db.get('user');

  db.set('user', { ...user, namespace });
  res.json({ switch: true });
});

router.get('/session', (req, res) => {
  const user = req.app.locals.db.get('user');
  res.json({
    user,
  });
});

module.exports = router;
