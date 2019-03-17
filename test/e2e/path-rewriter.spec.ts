import * as http from 'http';
import { createServer, proxyMiddleware } from './_utils';

describe('E2E pathRewrite', function() {
  var targetMiddleware;
  var targetData;

  beforeEach(function() {
    targetData = {};
    targetMiddleware = function(req, res, next) {
      targetData.url = req.url; // store target url.
      targetData.headers = req.headers; // store target headers.
      res.write(req.url); // respond with target url.
      res.end();
    };
  });

  var proxyServer;
  var targetServer;

  beforeEach(function() {
    targetServer = createServer(8000, targetMiddleware);
  });

  afterEach(function() {
    proxyServer && proxyServer.close();
    targetServer.close();
  });

  describe('Rewrite paths with rules table', function() {
    beforeEach(function() {
      var proxyConfig = {
        target: 'http://localhost:8000',
        pathRewrite: {
          '^/foobar/api/': '/api/'
        }
      };
      var proxy = proxyMiddleware(proxyConfig);
      proxyServer = createServer(3000, proxy);
    });

    beforeEach(function(done) {
      http.get('http://localhost:3000/foobar/api/lorum/ipsum', function(res) {
        done();
      });
    });

    it('should remove "/foobar" from path', function() {
      expect(targetData.url).toBe('/api/lorum/ipsum');
    });
  });

  describe('Rewrite paths with function', function() {
    var originalPath;
    var pathRewriteReqObject;

    beforeEach(function() {
      var proxyConfig = {
        target: 'http://localhost:8000',
        pathRewrite: function(path, req) {
          originalPath = path;
          pathRewriteReqObject = req;
          return path.replace('/foobar', '');
        }
      };
      var proxy = proxyMiddleware(proxyConfig);
      proxyServer = createServer(3000, proxy);
    });

    beforeEach(function(done) {
      http.get('http://localhost:3000/foobar/api/lorum/ipsum', function(res) {
        done();
      });
    });

    it('should remove "/foobar" from path', function() {
      expect(targetData.url).toBe('/api/lorum/ipsum');
    });

    it('should provide the `path` parameter with the unmodified path value', function() {
      expect(originalPath).toBe('/foobar/api/lorum/ipsum');
    });

    it('should provide the `req` object as second parameter of the rewrite function', function() {
      expect(pathRewriteReqObject.method).toBe('GET');
      expect(pathRewriteReqObject.url).toBe('/api/lorum/ipsum');
    });
  });
});
