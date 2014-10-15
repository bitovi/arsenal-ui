import Model from 'can/model/';

var Licensor = Model.extend({
  // using finaAll instead of resource because I don't want to be able to save.
  findAll: 'GET /licensors'
}, {});

export default Licensor;
