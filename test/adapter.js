var Zpromise = require('../src/zpromise');

module.exports = {
    deferred: function() {
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
