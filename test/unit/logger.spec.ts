import { getInstance, getArrow } from '../../lib/logger';

describe('Logger', function() {
  var logger;
  var logMessage, debugMessage, infoMessage, warnMessage, errorMessage;

  beforeEach(function() {
    logMessage = undefined;
    debugMessage = undefined;
    infoMessage = undefined;
    warnMessage = undefined;
    errorMessage = undefined;
  });

  beforeEach(function() {
    logger = getInstance();
  });

  beforeEach(function() {
    logger.setProvider(function(provider) {
      provider.log = function(message) {
        logMessage = message;
      };
      provider.debug = function(message) {
        debugMessage = message;
      };
      provider.info = function(message) {
        infoMessage = message;
      };
      provider.warn = function(message) {
        warnMessage = message;
      };
      provider.error = function(message) {
        errorMessage = message;
      };

      return provider;
    });
  });

  describe('logging with different levels', function() {
    beforeEach(function() {
      logger.log('log');
      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      logger.error('error');
    });

    describe('level: debug', function() {
      beforeEach(function() {
        logger.setLevel('debug');
      });

      it('should log .log() messages', function() {
        expect(logMessage).toBe('log');
      });
      it('should log .debug() messages', function() {
        expect(debugMessage).toBe('debug');
      });
      it('should log .info() messages', function() {
        expect(infoMessage).toBe('info');
      });
      it('should log .warn() messages', function() {
        expect(warnMessage).toBe('warn');
      });
      it('should log .error() messages', function() {
        expect(errorMessage).toBe('error');
      });
    });

    describe('level: info', function() {
      beforeEach(function() {
        logger.setLevel('info');
      });

      it('should log .log() messages', function() {
        expect(logMessage).toBe('log');
      });
      it('should not log .debug() messages', function() {
        expect(debugMessage).toBeUndefined();
      });
      it('should log .info() messages', function() {
        expect(infoMessage).toBe('info');
      });
      it('should log .warn() messages', function() {
        expect(warnMessage).toBe('warn');
      });
      it('should log .error() messages', function() {
        expect(errorMessage).toBe('error');
      });
    });

    describe('level: warn', function() {
      beforeEach(function() {
        logger.setLevel('warn');
      });

      it('should log .log() messages', function() {
        expect(logMessage).toBe('log');
      });
      it('should not log .debug() messages', function() {
        expect(debugMessage).toBeUndefined();
      });
      it('should not log .info() messages', function() {
        expect(infoMessage).toBeUndefined();
      });
      it('should log .warn() messages', function() {
        expect(warnMessage).toBe('warn');
      });
      it('should log .error() messages', function() {
        expect(errorMessage).toBe('error');
      });
    });

    describe('level: error', function() {
      beforeEach(function() {
        logger.setLevel('error');
      });

      it('should log .log() messages', function() {
        expect(logMessage).toBe('log');
      });
      it('should not log .debug() messages', function() {
        expect(debugMessage).toBeUndefined();
      });
      it('should not log .info() messages', function() {
        expect(infoMessage).toBeUndefined();
      });
      it('should log .warn() messages', function() {
        expect(warnMessage).toBeUndefined();
      });
      it('should log .error() messages', function() {
        expect(errorMessage).toBe('error');
      });
    });

    describe('level: silent', function() {
      beforeEach(function() {
        logger.setLevel('silent');
      });

      it('should log .log() messages', function() {
        expect(logMessage).toBe('log');
      });
      it('should not log .debug() messages', function() {
        expect(debugMessage).toBeUndefined();
      });
      it('should not log .info() messages', function() {
        expect(infoMessage).toBeUndefined();
      });
      it('should not log .warn() messages', function() {
        expect(warnMessage).toBeUndefined();
      });
      it('should not log .error() messages', function() {
        expect(errorMessage).toBeUndefined();
      });
    });

    describe('Interpolation', function() {
      // make sure all messages are logged
      beforeEach(function() {
        logger.setLevel('debug');
      });

      beforeEach(function() {
        logger.log('log %s %s', 123, 456);
        logger.debug('debug %s %s', 123, 456);
        logger.info('info %s %s', 123, 456);
        logger.warn('warn %s %s', 123, 456);
        logger.error('error %s %s', 123, 456);
      });

      it('should interpolate .log() messages', function() {
        expect(logMessage).toBe('log 123 456');
      });
      it('should interpolate .debug() messages', function() {
        expect(debugMessage).toBe('debug 123 456');
      });
      it('should interpolate .info() messages', function() {
        expect(infoMessage).toBe('info 123 456');
      });
      it('should interpolate .warn() messages', function() {
        expect(warnMessage).toBe('warn 123 456');
      });
      it('should interpolate .error() messages', function() {
        expect(errorMessage).toBe('error 123 456');
      });
    });
  });

  describe('Erroneous usage.', function() {
    var fn;

    describe('Log provider is not a function', function() {
      beforeEach(function() {
        fn = function() {
          logger.setProvider({});
        };
      });

      it('should throw an error', function() {
        expect(fn).toThrowError(Error);
      });
    });

    describe('Invalid logLevel', function() {
      beforeEach(function() {
        fn = function() {
          logger.setLevel('foo');
        };
      });

      it('should throw an error', function() {
        expect(fn).toThrowError(Error);
      });
    });
  });
});

describe('getArrow', function() {
  var arrow;
  // scenario = [originalPath, newPath, originalTarget, newTarget]

  describe('default arrow', function() {
    beforeEach(function() {
      arrow = getArrow('/api', '/api', 'localhost:1337', 'localhost:1337');
    });

    it('should return arrow:  "->"', function() {
      expect(arrow).toBe('->');
    });
  });

  describe('"pathRewrite" arrow', function() {
    beforeEach(function() {
      arrow = getArrow('/api', '/rest', 'localhost:1337', 'localhost:1337');
    });

    it('should return arrow:  "~>"', function() {
      expect(arrow).toBe('~>');
    });
  });

  describe('"router" arrow', function() {
    beforeEach(function() {
      arrow = getArrow('/api', '/api', 'localhost:1337', 'localhost:8888');
    });

    it('should return arrow:  "=>"', function() {
      expect(arrow).toBe('=>');
    });
  });

  describe('"pathRewrite" + "router" arrow', function() {
    beforeEach(function() {
      arrow = getArrow('/api', '/rest', 'localhost:1337', 'localhost:8888');
    });

    it('should return arrow:  "≈>"', function() {
      expect(arrow).toBe('≈>');
    });
  });
});
