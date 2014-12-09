import Model from 'can/model/';

import RinsCommon from 'utils/';

var BundleNames = Model.extend({

  findOne: function(params){
    //  console.log(JSON.stringify(params));
    return $.ajax({
      url: RinsCommon.DOMAIN_SERVICE_URL+'paymentBundle/names',
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType:'json',
      data: JSON.stringify(params)
    })
  },
  create: function(params){
    //  console.log(JSON.stringify(params));
    return $.ajax({
      url: RinsCommon.DOMAIN_SERVICE_URL+'paymentBundle/manage',
      type: 'POST',
      data: JSON.stringify(params),
      dataType:'json',
      contentType: 'application/json'
    })
  }
  //findAll: 'GET /invoiceType'
}, {});

/* able to get data in ajax done function*/

export default BundleNames;
