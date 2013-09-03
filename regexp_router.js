var RegExpRouterResult = function() {
  this.warning = null;
  this.params = null;
  this.handlerFn = null;
};

var RegExpRouter = module.exports = function() {
  this._router = [];
  this._routerKeys = [];
};

RegExpRouter.prototype.add = function(path, method, handleFn) {
  if (!this._router[path]) {
    this._router[path] = {};
    this._routerKeys.push(path);
  }

  this._router[path][method.toLowerCase()] = handleFn;
};

RegExpRouter.prototype.find = function(path, method) {
  var routerKey;
  var found = false;
  var params = {};
  method = method.toLowerCase();

  this._routerKeys.forEach(function(key) {
    if (found || key === '*') {
      return;
    }

    var re = new RegExp(key);
    var testMatch = re.test(path);

    if (!routerKey && key !== '*' && testMatch) {
      found = true;
      routerKey = key;
      params = re.exec(path);
    }
  });

  if (!routerKey && this._router['*']) {
    routerKey = '*';
  }

  if (routerKey &&
      (!this._router[routerKey][method] &&
       !this._router[routerKey]['*'])) {
    var result = new RegExpRouterResult();
    result.warning = 'MethodNotSupported';
    return result;
  }

  if (routerKey &&
      (this._router[routerKey][method] ||
       this._router[routerKey]['*'])) {

    var fn = this._router[routerKey][method] ? this._router[routerKey][method] 
      : this._router[routerKey]['*'];

    var result = new RegExpRouterResult();
    result.params = params;
    result.handlerFn = fn;
    return result;
  }

  var result = new RegExpRouterResult();
  result.warning = 'NotFound';
  return result;
};

RegExpRouter.prototype.truncate = function(path, pattern) {
  if (pattern !== '*') {
    if (pattern[0] !== '^') {
      pattern = '^' + pattern; // make sure it's a prefix
    }

    var re = new RegExp(pattern);

    return path.replace(re, '');
  } else {
    return path;
  }
};

RegExpRouter.create = function() {
  return new RegExpRouter();
};
