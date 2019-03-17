import * as util from 'util';
import * as _ from 'lodash';

var loggerInstance;

var defaultProvider = {
  log: console.log,
  debug: console.log, // use .log(); since console does not have .debug()
  info: console.info,
  warn: console.warn,
  error: console.error
};

// log level 'weight'
enum LEVELS {
  debug = 10,
  info = 20,
  warn = 30,
  error = 50,
  silent = 80
}

export function getInstance() {
  if (!loggerInstance) {
    loggerInstance = new Logger();
  }

  return loggerInstance;
}

class Logger {
  logLevel;
  provider;

  constructor() {
    this.setLevel('info');
    this.setProvider(() => defaultProvider);
  }

  // log will log messages, regardless of logLevels
  log() {
    this.provider.log(this._interpolate.apply(null, arguments));
  }

  debug() {
    if (this._showLevel('debug')) {
      this.provider.debug(this._interpolate.apply(null, arguments));
    }
  }

  info() {
    if (this._showLevel('info')) {
      this.provider.info(this._interpolate.apply(null, arguments));
    }
  }

  warn() {
    if (this._showLevel('warn')) {
      this.provider.warn(this._interpolate.apply(null, arguments));
    }
  }

  error() {
    if (this._showLevel('error')) {
      this.provider.error(this._interpolate.apply(null, arguments));
    }
  }

  setLevel(v) {
    if (this.isValidLevel(v)) {
      this.logLevel = v;
    }
  }

  setProvider(fn) {
    if (fn && this.isValidProvider(fn)) {
      this.provider = fn(defaultProvider);
    }
  }

  /**
   * Decide to log or not to log, based on the log levels 'weight'
   * @param  {String}  showLevel [debug, info, warn, error, silent]
   * @return {Boolean}
   */
  private _showLevel(showLevel) {
    var result = false;
    var currentLogLevel = LEVELS[this.logLevel];

    if (currentLogLevel && currentLogLevel <= LEVELS[showLevel]) {
      result = true;
    }

    return result;
  }

  // make sure logged messages and its data are return interpolated
  // make it possible for additional log data, such date/time or custom prefix.
  private _interpolate() {
    var fn = _.spread(util.format);
    var result = fn(_.slice(arguments));

    return result;
  }

  isValidProvider(fnProvider) {
    var result = true;

    if (fnProvider && !_.isFunction(fnProvider)) {
      throw new Error('[HPM] Log provider config error. Expecting a function.');
    }

    return result;
  }

  isValidLevel(levelName) {
    var validLevels = Object.keys(LEVELS);
    var isValid = validLevels.includes(levelName);

    if (!isValid) {
      throw new Error('[HPM] Log level error. Invalid logLevel.');
    }

    return isValid;
  }
}

/**
 * -> normal proxy
 * => router
 * ~> pathRewrite
 * ≈> router + pathRewrite
 *
 * @param  {String} originalPath
 * @param  {String} newPath
 * @param  {String} originalTarget
 * @param  {String} newTarget
 * @return {String}
 */
export function getArrow(originalPath, newPath, originalTarget, newTarget) {
  var arrow = ['>'];
  var isNewTarget = originalTarget !== newTarget; // router
  var isNewPath = originalPath !== newPath; // pathRewrite

  if (isNewPath && !isNewTarget) {
    arrow.unshift('~');
  } else if (!isNewPath && isNewTarget) {
    arrow.unshift('=');
  } else if (isNewPath && isNewTarget) {
    arrow.unshift('≈');
  } else {
    arrow.unshift('-');
  }

  return arrow.join('');
}
