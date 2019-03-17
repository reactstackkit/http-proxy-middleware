import { createPathRewriter } from '../../lib/path-rewriter';

describe('Path rewriting', function() {
  var rewriter;
  var result;
  var config;

  describe('Rewrite rules configuration and usage', function() {
    beforeEach(function() {
      config = {
        '^/api/old': '/api/new',
        '^/remove': '',
        invalid: 'path/new',
        '/valid': '/path/new',
        '/some/specific/path': '/awe/some/specific/path',
        '/some': '/awe/some'
      };
    });

    beforeEach(function() {
      rewriter = createPathRewriter(config);
    });

    it('should rewrite path', function() {
      result = rewriter('/api/old/index.json');
      expect(result).toBe('/api/new/index.json');
    });

    it('should remove path', function() {
      result = rewriter('/remove/old/index.json');
      expect(result).toBe('/old/index.json');
    });

    it('should leave path intact', function() {
      result = rewriter('/foo/bar/index.json');
      expect(result).toBe('/foo/bar/index.json');
    });

    it('should not rewrite path when config-key does not match url with test(regex)', function() {
      result = rewriter('/invalid/bar/foo.json');
      expect(result).toBe('/path/new/bar/foo.json');
      expect(result).not.toBe('/invalid/new/bar/foo.json');
    });

    it('should rewrite path when config-key does match url with test(regex)', function() {
      result = rewriter('/valid/foo/bar.json');
      expect(result).toBe('/path/new/foo/bar.json');
    });

    it('should return first match when similar paths are configured', function() {
      result = rewriter('/some/specific/path/bar.json');
      expect(result).toBe('/awe/some/specific/path/bar.json');
    });
  });

  describe('Rewrite rule: add base path to requests', function() {
    beforeEach(function() {
      config = {
        '^/': '/extra/base/path/'
      };
    });

    beforeEach(function() {
      rewriter = createPathRewriter(config);
    });

    it('should add base path to requests', function() {
      result = rewriter('/api/books/123');
      expect(result).toBe('/extra/base/path/api/books/123');
    });
  });

  describe('Rewrite function', function() {
    var rewriter;

    beforeEach(function() {
      rewriter = function(fn) {
        var rewriteFn = createPathRewriter(fn);
        var requestPath = '/123/456';
        return rewriteFn(requestPath);
      };
    });

    it('should return unmodified path', function() {
      var rewriteFn = function(path) {
        return path;
      };

      expect(rewriter(rewriteFn)).toBe('/123/456');
    });

    it('should return alternative path', function() {
      var rewriteFn = function(path) {
        return '/foo/bar';
      };

      expect(rewriter(rewriteFn)).toBe('/foo/bar');
    });

    it('should return replaced path', function() {
      var rewriteFn = function(path) {
        return path.replace('/456', '/789');
      };

      expect(rewriter(rewriteFn)).toBe('/123/789');
    });
  });

  describe('Invalid configuration', function() {
    var badFn;

    beforeEach(function() {
      badFn = function(config) {
        return function() {
          createPathRewriter(config);
        };
      };
    });

    it('should return undefined when no config is provided', function() {
      expect(badFn()()).toBeUndefined();
      expect(badFn(null)()).toBeUndefined();
      expect(badFn(undefined)()).toBeUndefined();
    });

    it('should throw when bad config is provided', function() {
      expect(badFn(123)).toThrowError(Error);
      expect(badFn('abc')).toThrowError(Error);
      expect(badFn([])).toThrowError(Error);
      expect(badFn([1, 2, 3])).toThrowError(Error);
    });

    it('should not throw when empty Object config is provided', function() {
      expect(badFn({})).not.toThrowError(Error);
    });

    it('should not throw when function config is provided', function() {
      expect(badFn(function() {})).not.toThrowError(Error);
    });
  });
});
