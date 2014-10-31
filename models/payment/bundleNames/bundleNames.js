import Model from 'can/model/';

import RinsCommon from 'models/rinsCommon/';

var BundleNames = Model.extend({

  findAll: function(){
    return $.ajax({
      url: RinsCommon.DOMAIN_SERVICE_URL+'paymentBundle/names',
      type: 'POST'

    })
  }
  //findAll: 'GET /invoiceType'
}, {});

/* able to get data in ajax done function*/

export default BundleNames;
