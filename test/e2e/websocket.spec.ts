import * as http from 'http';
import * as WebSocket from 'ws';
import { Server as WebSocketServer } from 'ws';
import { createServer, proxyMiddleware } from './_utils';

describe('E2E WebSocket proxy', function() {
  var proxyServer, ws, wss;
  var responseMessage;
  var proxy;

  beforeEach(function() {
    proxy = proxyMiddleware('/', {
      target: 'http://localhost:8000',
      ws: true,
      pathRewrite: { '^/socket': '' }
    });

    proxyServer = createServer(3000, proxy);

    // @ts-ignore: Expected arguments error
    wss = new WebSocketServer({ port: 8000 });

    wss.on('connection', function connection(ws) {
      ws.on('message', function incoming(message) {
        ws.send(message); // echo received message
      });
    });
  });

  describe('option.ws', function() {
    beforeEach(function(done) {
      // need to make a normal http request,
      // so http-proxy-middleware can catch the upgrade request
      http.get('http://localhost:3000/', function() {
        // do a second http request to make
        // sure only 1 listener subscribes to upgrade request
        http.get('http://localhost:3000/', function() {
          // @ts-ignore: Expected arguments error
          ws = new WebSocket('ws://localhost:3000/socket');

          ws.on('message', function incoming(message) {
            responseMessage = message;
            done();
          });

          ws.on('open', function open() {
            ws.send('foobar');
          });
        });
      });
    });

    it('should proxy to path', function() {
      expect(responseMessage).toBe('foobar');
    });
  });

  describe('option.ws with external server "upgrade"', function() {
    beforeEach(function(done) {
      proxyServer.on('upgrade', proxy.upgrade);

      // @ts-ignore: Expected arguments error
      ws = new WebSocket('ws://localhost:3000/socket');

      ws.on('message', function incoming(message) {
        responseMessage = message;
        done();
      });

      ws.on('open', function open() {
        ws.send('foobar');
      });
    });

    it('should proxy to path', function() {
      expect(responseMessage).toBe('foobar');
    });
  });

  describe('option.ws with external server "upgrade" and shorthand usage', function() {
    beforeEach(function() {
      proxyServer.close();
      // override
      proxy = proxyMiddleware('ws://localhost:8000', {
        pathRewrite: { '^/socket': '' }
      });
      proxyServer = createServer(3000, proxy);
    });

    beforeEach(function(done) {
      proxyServer.on('upgrade', proxy.upgrade);

      // @ts-ignore: Expected arguments error
      ws = new WebSocket('ws://localhost:3000/socket');

      ws.on('message', function incoming(message) {
        responseMessage = message;
        done();
      });

      ws.on('open', function open() {
        ws.send('foobar');
      });
    });

    it('should proxy to path', function() {
      expect(responseMessage).toBe('foobar');
    });
  });

  describe('with router and pathRewrite', function() {
    beforeEach(function() {
      proxyServer.close();
      // override
      proxy = proxyMiddleware('ws://notworkinghost:6789', {
        router: { '/socket': 'ws://localhost:8000' },
        pathRewrite: { '^/socket': '' }
      });
      proxyServer = createServer(3000, proxy);
    });

    beforeEach(function(done) {
      proxyServer.on('upgrade', proxy.upgrade);

      // @ts-ignore: Expected arguments error
      ws = new WebSocket('ws://localhost:3000/socket');

      ws.on('message', function incoming(message) {
        responseMessage = message;
        done();
      });

      ws.on('open', function open() {
        ws.send('foobar');
      });
    });

    it('should proxy to path', function() {
      expect(responseMessage).toBe('foobar');
    });
  });

  afterEach(async () => {
    return new Promise(resolve => {
      proxyServer.close(resolve);
      wss.close();
      ws = null;
    });
  });
});
