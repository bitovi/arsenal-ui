import Model from 'can/model/';

var BundleNames = Model.extend({

  findAll: function(){
    return $.ajax({
      url: 'http://ma-rinsd-lapp01.corp.apple.com:8090/paymentBundle/names',
      type: 'POST'
   
    })
  }
  //findAll: 'GET /invoiceType'
}, {});

/* able to get data in ajax done function*/

export default BundleNames;
