/*eslint-disable */
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  if (typeof window === 'undefined') {
    const { server } = require('./server');
    server.listen();
  } else {
    const { worker } = require('./browser');
    worker.start();
  }
}
