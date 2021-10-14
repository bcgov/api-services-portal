const express = require('express');
const pathModule = require('path');

const { createProxyMiddleware } = require('http-proxy-middleware');

class ApiDSProxyApp {
  constructor({ url }) {
    this._url = url;
  }

  prepareMiddleware({ keystone }) {
    const app = express();

    const apiProxy = createProxyMiddleware({
      target: this._url,
      changeOrigin: true,
      pathRewrite: { '^/int/api/': '/ds/api/' },
      onProxyReq: (proxyReq, req) => {
        proxyReq.removeHeader('cookie');
        proxyReq.setHeader('Accept', 'application/json');
        proxyReq.setHeader(
          'Authorization',
          `Bearer ${req.header('x-forwarded-access-token')}`
        );
        console.log(proxyReq.headers);
      },
      onError: (err, req, res, target) => {
        console.log('CAUGHT ERROR!');
        console.log(err);
        res.writeHead(400, {
          'Content-Type': 'text/plain',
        });
        res.end('error reaching api');
      },
    });
    app.all(/^\/int\/api\//, apiProxy);

    return app;
  }
}

module.exports = {
  ApiDSProxyApp,
};
