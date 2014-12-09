import Model from 'can/model/';
import RinsCommon from 'models/rinsCommon/';

var claimLicensorInvoices = Model.extend({
  // using findAll instead of resource because I don't want to be able to save.
  //findAll: 'GET /claimLicensorInvoices'
  findOne: function(params){
    return $.ajax({
      url: RinsCommon.DOMAIN_SERVICE_URL+'claims/get/entity',
      //url: RinsCommon.DOMAIN_SERVICE_URL+'rinsui/getClaimReviews',
      type: 'POST',
      datatype:'json',
      //contentType: 'application/json; charset=utf-8',
      //data: JSON.stringify(params)
    })
  }
}, {});

export default claimLicensorInvoices;
