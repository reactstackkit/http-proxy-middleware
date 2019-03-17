import * as _ from 'lodash';
import { getInstance } from './logger';
const logger = getInstance();

export function init(proxy, option) {
  var handlers = getHandlers(option);

  for (let eventName in handlers) {
    proxy.on(eventName, handlers[eventName]);
  }

  logger.debug('[HPM] Subscribed to http-proxy events: ', _.keys(handlers));
}

export function getHandlers(options) {
  // https://github.com/nodejitsu/node-http-proxy#listening-for-proxy-events
  var proxyEvents = [
    'error',
    'proxyReq',
    'proxyReqWs',
    'proxyRes',
    'open',
    'close'
  ];
  var handlers: any = {};

  for (let event of proxyEvents) {
    // all handlers for the http-proxy events are prefixed with 'on'.
    // loop through options and try to find these handlers
    // and add them to the handlers object for subscription in init().
    var eventName = _.camelCase('on ' + event);
    var fnHandler = _.get(options, eventName);

    if (_.isFunction(fnHandler)) {
      handlers[event] = fnHandler;
    }
  }

  // add default error handler in absence of error handler
  if (!_.isFunction(handlers.error)) {
    handlers.error = defaultErrorHandler;
  }

  // add default close handler in absence of close handler
  if (!_.isFunction(handlers.close)) {
    handlers.close = logClose;
  }

  return handlers;
}

function defaultErrorHandler(err, req, res) {
  var host = req.headers && req.headers.host;
  var code = err.code;

  if (res.writeHead && !res.headersSent) {
    if (/HPE_INVALID/.test(code)) {
      res.writeHead(502);
    } else {
      switch (code) {
        case 'ECONNRESET':
        case 'ENOTFOUND':
        case 'ECONNREFUSED':
          res.writeHead(504);
          break;
        default:
          res.writeHead(500);
      }
    }
  }

  res.end('Error occured while trying to proxy to: ' + host + req.url);
}

function logClose(req, socket, head) {
  // view disconnected websocket connections
  logger.info('[HPM] Client disconnected');
}
