var adapter = require('./adapter');
var promisesAplusTests = require('promises-aplus-tests');

promisesAplusTests(adapter, function(err){
  console.log(err);
});
