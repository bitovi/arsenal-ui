import Model from 'can/model/';

var proposedOnAccount = Model.extend({
  // using finaAll instead of resource because I don't want to be able to save.
  findAll: 'GET /proposedOnAccount'
}, {});

export default proposedOnAccount;
