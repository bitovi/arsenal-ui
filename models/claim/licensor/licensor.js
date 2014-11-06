import Model from 'can/model/';
import RinsCommon from 'models/rinsCommon/';

var claimLicensorInvoices = Model.extend({
  // using findAll instead of resource because I don't want to be able to save.
  findAll: 'GET /GetClaimLicensor'
  /*findAll: function(params){
    return $.ajax({
      url: RinsCommon.DOMAIN_SERVICE_URL+'invoice/get',
      type: 'POST',
      data: JSON.stringify(params)
    })
  }*/
}, {});

export default claimLicensorInvoices;
