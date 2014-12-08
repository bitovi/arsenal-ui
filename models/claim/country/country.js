import Model from 'can/model/';
import RinsCommon from 'models/rinsCommon/';

var claimCountryInvoices = Model.extend({
  // using findAll instead of resource because I don't want to be able to save.
  //findAll: 'GET /claimLicensorInvoices'
  findAll: function(params){
    return $.ajax({
      url: RinsCommon.DOMAIN_SERVICE_URL+'claims/get/entity',
      type: 'POST'
      //data: JSON.stringify(params)
    })
  }
}, {});

export default claimCountryInvoices;
