import Model from 'can/model/';

var Country = Model.extend({
  // using findAll instead of resource because I don't want to be able to save.
  findAll: 'GET /countries'
}, {});

export default Country;
