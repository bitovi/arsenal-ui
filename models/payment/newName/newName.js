import Model from 'can/model/';

import RinsCommon from 'models/rinsCommon/';

var NewPBName = Model.extend({

  findAll: function(param){
    return $.ajax({
      url: RinsCommon.DOMAIN_SERVICE_URL+'paymentBundle/newName',
      type: 'POST',
      params: param,
      dataType: 'json'
    })
  }
}, {});

/* able to get data in ajax done function*/

export default NewPBName;
