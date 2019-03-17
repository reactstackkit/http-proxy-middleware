import * as contextMatcher from '../../lib/context-matcher';

describe('Context Matching', function() {
  let fakeReq = {};

  describe('String path matching', function() {
    var result;

    describe('Single path matching', function() {
      it('should match all paths', function() {
        result = contextMatcher.match(
          '',
          'http://localhost/api/foo/bar',
          fakeReq
        );
        expect(result).toBe(true);
      });

      it('should match all paths starting with forward-slash', function() {
        result = contextMatcher.match(
          '/',
          'http://localhost/api/foo/bar',
          fakeReq
        );
        expect(result).toBe(true);
      });

      it('should return true when the context is present in url', function() {
        result = contextMatcher.match(
          '/api',
          'http://localhost/api/foo/bar',
          fakeReq
        );
        expect(result).toBe(true);
      });

      it('should return false when the context is not present in url', function() {
        result = contextMatcher.match(
          '/abc',
          'http://localhost/api/foo/bar',
          fakeReq
        );
        expect(result).toBe(false);
      });

      it('should return false when the context is present half way in url', function() {
        result = contextMatcher.match(
          '/foo',
          'http://localhost/api/foo/bar',
          fakeReq
        );
        expect(result).toBe(false);
      });

      it('should return false when the context does not start with /', function() {
        result = contextMatcher.match(
          'api',
          'http://localhost/api/foo/bar',
          fakeReq
        );
        expect(result).toBe(false);
      });
    });

    describe('Multi path matching', function() {
      it('should return true when the context is present in url', function() {
        result = contextMatcher.match(
          ['/api'],
          'http://localhost/api/foo/bar',
          fakeReq
        );
        expect(result).toBe(true);
      });

      it('should return true when the context is present in url', function() {
        result = contextMatcher.match(
          ['/api', '/ajax'],
          'http://localhost/ajax/foo/bar',
          fakeReq
        );
        expect(result).toBe(true);
      });

      it('should return false when the context does not match url', function() {
        result = contextMatcher.match(
          ['/api', '/ajax'],
          'http://localhost/foo/bar',
          fakeReq
        );
        expect(result).toBe(false);
      });

      it('should return false when empty array provided', function() {
        result = contextMatcher.match(
          [],
          'http://localhost/api/foo/bar',
          fakeReq
        );
        expect(result).toBe(false);
      });
    });
  });

  describe('Wildcard path matching', function() {
    describe('Single glob', function() {
      var url;

      beforeEach(function() {
        url = 'http://localhost/api/foo/bar.html';
      });

      describe('url-path matching', function() {
        it('should match any path', function() {
          expect(contextMatcher.match('**', url, fakeReq)).toBe(true);
          expect(contextMatcher.match('/**', url, fakeReq)).toBe(true);
        });

        it('should only match paths starting with "/api" ', function() {
          expect(contextMatcher.match('/api/**', url, fakeReq)).toBe(true);
          expect(contextMatcher.match('/ajax/**', url, fakeReq)).toBe(false);
        });

        it('should only match paths starting with "foo" folder in it ', function() {
          expect(contextMatcher.match('**/foo/**', url, fakeReq)).toBe(true);
          expect(contextMatcher.match('**/invalid/**', url, fakeReq)).toBe(
            false
          );
        });
      });

      describe('file matching', function() {
        it('should match any path, file and extension', function() {
          expect(contextMatcher.match('**', url, fakeReq)).toBe(true);
          expect(contextMatcher.match('**/*', url, fakeReq)).toBe(true);
          expect(contextMatcher.match('**/*.*', url, fakeReq)).toBe(true);
          expect(contextMatcher.match('/**', url, fakeReq)).toBe(true);
          expect(contextMatcher.match('/**/*', url, fakeReq)).toBe(true);
          expect(contextMatcher.match('/**/*.*', url, fakeReq)).toBe(true);
        });

        it('should only match .html files', function() {
          expect(contextMatcher.match('**/*.html', url, fakeReq)).toBe(true);
          expect(contextMatcher.match('/**/*.html', url, fakeReq)).toBe(true);
          expect(contextMatcher.match('/*.htm', url, fakeReq)).toBe(false);
          expect(contextMatcher.match('/*.jpg', url, fakeReq)).toBe(false);
        });

        it('should only match .html under root path', function() {
          var pattern = '/*.html';
          expect(
            contextMatcher.match(
              pattern,
              'http://localhost/index.html',
              fakeReq
            )
          ).toBe(true);
          expect(
            contextMatcher.match(
              pattern,
              'http://localhost/some/path/index.html',
              fakeReq
            )
          ).toBe(false);
        });

        it('should ignore query params', function() {
          expect(
            contextMatcher.match(
              '/**/*.php',
              'http://localhost/a/b/c.php?d=e&e=f',
              fakeReq
            )
          ).toBe(true);
          expect(
            contextMatcher.match(
              '/**/*.php?*',
              'http://localhost/a/b/c.php?d=e&e=f',
              fakeReq
            )
          ).toBe(false);
        });

        it('should only match any file in root path', function() {
          expect(
            contextMatcher.match('/*', 'http://localhost/bar.html', fakeReq)
          ).toBe(true);
          expect(
            contextMatcher.match('/*.*', 'http://localhost/bar.html', fakeReq)
          ).toBe(true);
          expect(
            contextMatcher.match('/*', 'http://localhost/foo/bar.html', fakeReq)
          ).toBe(false);
        });

        it('should only match .html file is in root path', function() {
          expect(
            contextMatcher.match(
              '/*.html',
              'http://localhost/bar.html',
              fakeReq
            )
          ).toBe(true);
          expect(
            contextMatcher.match(
              '/*.html',
              'http://localhost/api/foo/bar.html',
              fakeReq
            )
          ).toBe(false);
        });

        it('should only match .html files in "foo" folder', function() {
          expect(contextMatcher.match('**/foo/*.html', url, fakeReq)).toBe(
            true
          );
          expect(contextMatcher.match('**/bar/*.html', url, fakeReq)).toBe(
            false
          );
        });

        it('should not match .html files', function() {
          expect(contextMatcher.match('!**/*.html', url, fakeReq)).toBe(false);
        });
      });
    });

    describe('Multi glob matching', function() {
      describe('Multiple patterns', function() {
        it('should return true when both path patterns match', function() {
          var pattern = ['/api/**', '/ajax/**'];
          expect(
            contextMatcher.match(
              pattern,
              'http://localhost/api/foo/bar.json',
              fakeReq
            )
          ).toBe(true);
          expect(
            contextMatcher.match(
              pattern,
              'http://localhost/ajax/foo/bar.json',
              fakeReq
            )
          ).toBe(true);
          expect(
            contextMatcher.match(
              pattern,
              'http://localhost/rest/foo/bar.json',
              fakeReq
            )
          ).toBe(false);
        });
        it('should return true when both file extensions pattern match', function() {
          var pattern = ['/**/*.html', '/**/*.jpeg'];
          expect(
            contextMatcher.match(
              pattern,
              'http://localhost/api/foo/bar.html',
              fakeReq
            )
          ).toBe(true);
          expect(
            contextMatcher.match(
              pattern,
              'http://localhost/api/foo/bar.jpeg',
              fakeReq
            )
          ).toBe(true);
          expect(
            contextMatcher.match(
              pattern,
              'http://localhost/api/foo/bar.gif',
              fakeReq
            )
          ).toBe(false);
        });
      });

      describe('Negation patterns', function() {
        it('should not match file extension', function() {
          var url = 'http://localhost/api/foo/bar.html';
          expect(contextMatcher.match(['**', '!**/*.html'], url, fakeReq)).toBe(
            false
          );
          expect(contextMatcher.match(['**', '!**/*.json'], url, fakeReq)).toBe(
            true
          );
        });
      });
    });
  });

  describe('Use function for matching', function() {
    var testFunctionAsContext = function(val) {
      return contextMatcher.match(fn, 'http://localhost/api/foo/bar', fakeReq);

      function fn(path, req) {
        return val;
      }
    };

    describe('truthy', function() {
      it('should match when function returns true', function() {
        expect(testFunctionAsContext(true)).toBeTruthy();
        expect(testFunctionAsContext('true')).toBeTruthy();
      });
    });

    describe('falsy', function() {
      it('should not match when function returns falsy value', function() {
        expect(testFunctionAsContext(undefined)).toBeFalsy();
        expect(testFunctionAsContext(false)).toBeFalsy();
        expect(testFunctionAsContext('')).toBeFalsy();
      });
    });
  });

  describe('Test invalid contexts', function() {
    var testContext;

    beforeEach(function() {
      testContext = function(context) {
        return function() {
          contextMatcher.match(
            context,
            'http://localhost/api/foo/bar',
            fakeReq
          );
        };
      };
    });

    describe('Throw error', function() {
      it('should throw error with undefined', function() {
        expect(testContext(undefined)).toThrowError(Error);
      });

      it('should throw error with null', function() {
        expect(testContext(null)).toThrowError(Error);
      });

      it('should throw error with object literal', function() {
        expect(testContext(fakeReq)).toThrowError(Error);
      });

      it('should throw error with integers', function() {
        expect(testContext(123)).toThrowError(Error);
      });

      it('should throw error with mixed string and glob pattern', function() {
        expect(testContext(['/api', '!*.html'])).toThrowError(Error);
      });
    });

    describe('Do not throw error', function() {
      it('should not throw error with string', function() {
        expect(testContext('/123')).not.toThrowError(Error);
      });

      it('should not throw error with Array', function() {
        expect(testContext(['/123'])).not.toThrowError(Error);
      });
      it('should not throw error with glob', function() {
        expect(testContext('/**')).not.toThrowError(Error);
      });

      it('should not throw error with Array of globs', function() {
        expect(testContext(['/**', '!*.html'])).not.toThrowError(Error);
      });

      it('should not throw error with Function', function() {
        expect(testContext(function() {})).not.toThrowError(Error);
      });
    });
  });
});
