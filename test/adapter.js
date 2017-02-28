var Zpromise = require('../src/zpromise');

module.exports = {
  resolved: function(value){
    return Zpromise.resolve(value);
  },

  rejected: function(reason){
    return Zpromise.reject(reason);
  },

  deferred: function(){
    var resolve, reject;

    return {
      promise: new Zpromise(function(rslv, rjct){
        resolve = rslv;
        reject = rjct;
      }),
      resolve: resolve,
      reject: reject
    };
  }
};
