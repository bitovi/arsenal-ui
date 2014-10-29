import Model from 'can/model/';

var Region = Model.extend({
  // using finaAll instead of resource because I don't want to be able to save.
  findAll: 'GET /global-regions'
}, {});

export default Region;
