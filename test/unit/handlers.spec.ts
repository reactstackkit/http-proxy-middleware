import { getHandlers } from '../../lib/handlers';

describe('handlers factory', function() {
  var handlersMap;

  it('should return default handlers when no handlers are provided', function() {
    handlersMap = getHandlers(undefined);
    expect(typeof handlersMap.error).toBe('function');
    expect(typeof handlersMap.close).toBe('function');
  });

  describe('custom handlers', function() {
    beforeEach(function() {
      var fnCustom = function() {
        return 42;
      };

      var proxyOptions = {
        target: 'http://www.example.org',
        onError: fnCustom,
        onOpen: fnCustom,
        onClose: fnCustom,
        onProxyReq: fnCustom,
        onProxyReqWs: fnCustom,
        onProxyRes: fnCustom,
        onDummy: fnCustom,
        foobar: fnCustom
      };

      handlersMap = getHandlers(proxyOptions);
    });

    it('should only return http-proxy handlers', function() {
      expect(typeof handlersMap.error).toBe('function');
      expect(typeof handlersMap.open).toBe('function');
      expect(typeof handlersMap.close).toBe('function');
      expect(typeof handlersMap.proxyReq).toBe('function');
      expect(typeof handlersMap.proxyReqWs).toBe('function');
      expect(typeof handlersMap.proxyRes).toBe('function');
      expect(handlersMap.dummy).toBeUndefined();
      expect(handlersMap.foobar).toBeUndefined();
      expect(handlersMap.target).toBeUndefined();
    });

    it('should use the provided custom handlers', function() {
      expect(handlersMap.error()).toBe(42);
      expect(handlersMap.open()).toBe(42);
      expect(handlersMap.close()).toBe(42);
      expect(handlersMap.proxyReq()).toBe(42);
      expect(handlersMap.proxyReqWs()).toBe(42);
      expect(handlersMap.proxyRes()).toBe(42);
    });
  });
});

describe('default proxy error handler', function() {
  var mockError = {
    code: 'ECONNREFUSED'
  };

  var mockReq = {
    headers: {
      host: 'localhost:3000'
    },
    url: '/api'
  };

  var proxyOptions = {
    target: {
      host: 'localhost.dev'
    }
  };

  var httpErrorCode;
  var errorMessage;

  var mockRes = {
    writeHead: function(v) {
      httpErrorCode = v;
      return v;
    },
    end: function(v) {
      errorMessage = v;
      return v;
    },
    headersSent: false
  };

  var proxyError;

  beforeEach(function() {
    var handlersMap = getHandlers(undefined);
    proxyError = handlersMap.error;
  });

  afterEach(function() {
    httpErrorCode = undefined;
    errorMessage = undefined;
  });

  var codes = [
    ['HPE_INVALID_FOO', 502],
    ['HPE_INVALID_BAR', 502],
    ['ECONNREFUSED', 504],
    ['ENOTFOUND', 504],
    ['ECONNREFUSED', 504],
    ['any', 500]
  ];

  codes.forEach(function(item) {
    var msg = item[0];
    var code = item[1];
    it(
      'should set the http status code for ' + msg + ' to: ' + code,
      function() {
        proxyError({ code: msg }, mockReq, mockRes, proxyOptions);
        expect(httpErrorCode).toBe(code);
      }
    );
  });

  it('should end the response and return error message', function() {
    proxyError(mockError, mockReq, mockRes, proxyOptions);
    expect(errorMessage).toBe(
      'Error occured while trying to proxy to: localhost:3000/api'
    );
  });

  it('should not set the http status code to: 500 if headers have already been sent', function() {
    mockRes.headersSent = true;
    proxyError(mockError, mockReq, mockRes, proxyOptions);
    expect(httpErrorCode).toBeUndefined();
  });

  it('should end the response and return error message', function() {
    mockRes.headersSent = true;
    proxyError(mockError, mockReq, mockRes, proxyOptions);
    expect(errorMessage).toBe(
      'Error occured while trying to proxy to: localhost:3000/api'
    );
  });
});
