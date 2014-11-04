import Model from 'can/model/';
import RinsCommon from 'models/rinsCommon/';

var GetAllInvoices = Model.extend({
  // using findAll instead of resource because I don't want to be able to save.
  findAll: function(params){
    return $.ajax({
      url: RinsCommon.DOMAIN_SERVICE_URL+'invoice/get',
      type: 'POST',
      data: JSON.stringify(params)
    })
  }
}, {});

export default GetAllInvoices;
