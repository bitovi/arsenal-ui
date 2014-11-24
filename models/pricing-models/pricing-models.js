import Model from 'can/model/';
import RinsCommon from 'utils/';

var pricingModels = Model.extend({
  // using findAll instead of resource because I don't want to be able to save.
 findAll: 'GET /pricingModels',
 findOne: 'GET /pricingModelsFindOne'
 
}, {});

export default pricingModels;


