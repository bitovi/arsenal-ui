import Model from 'can/model/';

var pricingModels = Model.extend({
  // using findAll instead of resource because I don't want to be able to save.
  findAll: 'GET /pricingModels'
}, {});

export default pricingModels;
