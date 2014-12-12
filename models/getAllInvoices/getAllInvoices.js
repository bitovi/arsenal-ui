import Model from 'can/model/';
import RinsCommon from 'utils/urls';

var Invoices = Model.extend({
  // using findAll instead of resource because I don't want to be able to save.
  findOne: function(params){
    return $.ajax({
      url: RinsCommon.DOMAIN_SERVICE_URL+'invoice/get',
      type: 'POST',
      datatype:'json',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(params)
    })
  }
}, {});

export default Invoices;
