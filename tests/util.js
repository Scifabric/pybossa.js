(function() {
  "use strict";

  var bind,
    slice = [].slice;
  // check for missing features
  if (typeof bind !== 'function') {
    // adapted from Mozilla Developer Network example at
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
    bind = function bind(obj) {
      var args = slice.call(arguments, 1),
        self = this,
        Nop = function() {
        },
        bound = function() {
          return self.apply(this instanceof Nop ? this : (obj || {}), args.concat(slice.call(arguments)));
        };
      Nop.prototype = this.prototype || {}; // Firefox cries sometimes if prototype is undefined
      bound.prototype = new Nop();
      return bound;
    };
    Function.prototype.bind = bind;
  }
})();
