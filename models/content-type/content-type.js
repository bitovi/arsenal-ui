import Model from 'can/model/';

var ContentType = Model.extend({
  // using finaAll instead of resource because I don't want to be able to save.
  findAll: 'GET /contentTypes'
}, {});

export default ContentType;
