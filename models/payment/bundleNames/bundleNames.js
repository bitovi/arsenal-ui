import Model from 'can/model/';

var BundleNames = Model.extend({

  findAll: function(){
    return $.ajax({
      url: 'http://localhost:8090/paymentBundle/names',
      type: 'POST',
      dataType: 'json'
    })
  }
  //findAll: 'GET /invoiceType'
}, {});

/* able to get data in ajax done function*/

export default BundleNames;
