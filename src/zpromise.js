
  'use strict';

  var PENDING   = 0;
  var FULFILLED = 1;
  var REJECTED  = 2;

  function Zpromise(resolver){
    var state = PENDING;
    var value = null;
    var done = false;

    var callbacks = [];

    var self = this;
    function resolve(x){
      try{
        if(self === x){ reject(new TypeError('Promise and x refer to the same object')); }
        else if(x instanceof Zpromise){
          x.then(function(v){
            fulfill(v);
          }, function(r){
            reject(r);
          });
        }else if((typeof x === 'object' || typeof x === 'function')
          && x && typeof x.then === 'function'){
          //typeof null === 'object'
          x.then(function(y){
            if(done) return;
            done = true;
            resolve(y);
          }, function(r){
            if(done) return;
            done = true;
            reject(r);
          });
        }else{
          fulfill(x);
        }
      }catch(e){
        if(!done) reject(e);
      }
    }

    function fulfill(v){
      if(state === PENDING){
        state === FULFILLED;
        value = v;
        runCallbacks();
      }
    }

    function reject(r){
      if(state === PENDING){
        state === REJECTED;
        value = r;
        runCallbacks();
      }
    }

    function runCallbacks(){
      if(state === PENDING) return;
      setTimeout(function(){
        while(callbacks.length){
          var callback = callbacks.shift();
          var resolveThat = callback.resolveThat;
          var rejectThat = callback.rejectThat;

          var handler = state === FULFILLED ? callback.onFulfilled : callback.onRejected;
          if( typeof handler === 'function'){
            try{ resolveThat(handler(value)); }
            catch(e){ rejectThat(e); }
          }else{ (state === FULFILLED ? resolveThat : rejectThat)(value); }
        }
      }, 0);
    }

    function promise(onFulfilled, onRejected, resolveThat, rejectThat) {
      callbacks.push({
        onFulfilled: onFulfilled,
        onRejected: onRejected,
        resolveThat: resolveThat,
        rejectThat: rejectThat
      });
      runCallbacks();
    };

    Object.defineProperty(this, 'promise', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: promise
    });
    //execute the resolver
    resolver(resolve, reject);
  }

  Zpromise.prototype.then = function(onFulfilled, onRejected){
    var that = this;
    return new Zpromise(function(resolve, reject){
      that.promise(onFulfilled, onRejected, resolve, reject);
    });
  };

  Zpromise.prototype.catch = function(onRejected){
    var that = this;
    return new Zpromise(function(resolve, reject){
      that.promise(void 0, onRejected, resolve, reject);
    });
  };

  Zpromise.all = function(iterable){
  };

  Zpromise.race = function(iterable){
  };

  Zpromise.reject = function(reason){
    return new Zpromise(function(resolve, reject){
      reject(reason);
    });
  };

  Zpromise.resolve = function(value){
    return new Zpromise(function(resolve, reject){
      resolve(value);
    });
  };

  module.exports = Zpromise;
