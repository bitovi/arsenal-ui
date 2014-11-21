import Model from 'can/model/';

var OnAccountBalance = Model.extend({
  // using finaAll instead of resource because I don't want to be able to save.
  findAll: 'GET /onAccountBalance'
}, {});

export default OnAccountBalance;
