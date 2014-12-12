import Model from 'can/model/';
import RinsCommon from 'utils/urls';



var pricingMethods = Model.extend({
  findAll: function(params){
    return $.ajax({
      url: RinsCommon.UI_SERVICE_URL +'getPricingMethodList',
      type: 'POST',
      data: JSON.stringify(params),
      dataType:'json',
      contentType: 'application/json'
    });
  }
}, {});

export default pricingMethods;
