const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5555',
      changeOrigin: true,
    })
  );
  app.use(
    '/oauth2',
    createProxyMiddleware({
      target: 'http://localhost:5555',
      changeOrigin: true,
    })
  );
};
