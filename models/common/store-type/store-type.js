import Model from 'can/model/';

import RinsCommon from 'models/rinsCommon/';
var StoreType = Model.extend({
  // using finaAll instead of resource because I don't want to be able to save.

findAll: function(){
  return $.ajax({
    url: RinsCommon.UI_SERVICE_URL+'getStoreTypes',
    type: 'POST'
  })
}

//findAll: 'GET /licensor'

}, {});

/* able to get data in ajax done function*/

export default StoreType;
