'use strict';

var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;

var Fallback = {
    onFulfilled: function(v) {
        return v;
    },
    onRejected: function(r) {
        throw r;
    }
};

function Zpromise(resolver) {
    var state = PENDING;
    var value = null;

    var callbacks = [];

    var self = this;

    function resolve(x) {
        if (self === x) {
            reject(new TypeError('Promise and x refer to the same object.'));
        } else if (x instanceof Zpromise) {
            x.then(function(v) {
                resolve(v);
            }, function(r) {
                reject(r);
            });
        } else if (typeof x === 'object' || typeof x === 'function') {
            var called = false;
            var then = null;
            try{
                if (x && typeof (then = x.then) === 'function') {
                    then.bind(x)(function resolvePromise(y) {
                        if (called) return;
                        called = true;
                        resolve(y);
                    }, function rejectPromise(r) {
                        if (called) return;
                        called = true;
                        reject(r);
                    });
                } else {
                    fulfill(x);
                }
            }catch(e){
                if(!called) reject(e);
            }
        } else {
            fulfill(x);
        }
    }

    function fulfill(v) {
        if (state === PENDING) {
            state = FULFILLED;
            value = v;
            done();
            self.s = state;
        }
    }

    function reject(r) {
        if (state === PENDING) {
            state = REJECTED;
            value = r;
            done();
            self.s = state;
        }
    }

    function done() {
        if (state === PENDING) return;
        setTimeout(function(){
            while (callbacks.length) {
                var callback = callbacks.shift();
                var resolveThat = callback.resolveThat;
                var rejectThat = callback.rejectThat;

                var handler = state === FULFILLED ? callback.onFulfilled : callback.onRejected;
                var fallback = state === FULFILLED ? Fallback.onFulfilled : Fallback.onRejected;
                handler = handler || fallback;
                try {
                    resolveThat(handler(value));
                } catch (e) {
                    rejectThat(e);
                }
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
        done();
    };

    Object.defineProperty(this, 'promise', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: promise
    });
    //execute the resolver
    try {
        resolver(resolve, reject);
    } catch (e) {
        reject(e);
    }
}

Zpromise.prototype.then = function(onFulfilled, onRejected) {
    var that = this;
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    onRejected = typeof onRejected === 'function' ? onRejected : null;
    return new Zpromise(function(resolve, reject) {
        that.promise(onFulfilled, onRejected, resolve, reject);
    });
};

Zpromise.prototype.catch = function(onRejected) {
    this.then(void 0, onRejected);
};

Zpromise.all = function(iterable) {};

Zpromise.race = function(iterable) {};

Zpromise.reject = function(reason) {
    return new Zpromise(function(resolve, reject) {
        reject(reason);
    });
};

Zpromise.resolve = function(value) {
    return new Zpromise(function(resolve, reject) {
        resolve(value);
    });
};

module.exports = Zpromise;
