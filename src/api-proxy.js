
const express = require('express');
const pathModule = require('path');

const { createProxyMiddleware } = require('http-proxy-middleware');

class ApiProxyApp {
  constructor({ gwaApiUrl }) {
    this._gwaApiUrl = gwaApiUrl;
  }

  prepareMiddleware({ keystone }) {
    const app = express();
    const apiProxy = createProxyMiddleware({ 
        target: this._gwaApiUrl, 
        changeOrigin: true,
        pathRewrite: { '^/gw/api/': '/v2/' },
        onProxyReq: (proxyReq, req) => {
            // console.log(req.headers)
            // proxyReq.removeHeader("cookie");
            proxyReq.removeHeader("cookie");
            proxyReq.setHeader('Accept', 'application/json')
            proxyReq.setHeader('Authorization', `Bearer ${req.header('x-forwarded-access-token')}`) },
        onError:(err, req, res, target) => {
            console.log(err)
            res.writeHead(400, {
              'Content-Type': 'text/plain',
            });
            res.end('error reaching api');
        }
    })
    app.all(/^\/gw\/api\//, apiProxy)


    async function call (user, q, vars = {}) {
        return await keystone.executeGraphQL({
            context: keystone.createContext({authentication : { item : user }}),
            query: q,
            variables: vars
        })
    }

    return app;
  }
}

module.exports = {
    ApiProxyApp,
};