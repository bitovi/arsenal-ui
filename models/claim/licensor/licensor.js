import Model from 'can/model/';
import RinsCommon from 'utils/urls';

var claimLicensorInvoices = Model.extend({
  findOne: function(params){
    return $.ajax({
      url: RinsCommon.DOMAIN_SERVICE_URL+'rinsui/getClaimReviews',
      type: 'POST',
      datatype:'json',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(params)
    })
  }
}, {});

export default claimLicensorInvoices;
