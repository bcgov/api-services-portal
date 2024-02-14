/*eslint-disable */
if (
  process.env.NEXT_PUBLIC_MOCKS === 'on' &&
  (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')
) {
  if (typeof window === 'undefined') {
    const { server } = require('./server');
    server.listen();
  } else {
    const { worker } = require('./browser');
    worker.start();
  }
}
