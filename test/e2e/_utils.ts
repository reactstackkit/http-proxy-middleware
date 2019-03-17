import * as express from 'express';

export const proxyMiddleware = require('../../dist/index');

export function createServer(portNumber, middleware, path?) {
  var app = express();

  if (middleware && path) {
    app.use(path, middleware);
  } else if (middleware) {
    app.use(middleware);
  }

  var server = app.listen(portNumber);

  return server;
}
