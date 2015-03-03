import Model from 'can/model/';

var StoreType = Model.extend({
  // using finaAll instead of resource because I don't want to be able to save.
  findAll: 'GET /storeTypes'
}, {});

export default StoreType;
