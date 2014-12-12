import Model from 'can/model/';

import RinsCommon from 'utils/';

var Analytics = Model.extend({

  findOne: function(params){
      return $.ajax({
          url: RinsCommon.UI_SERVICE_URL +'getLicensorDetails',
          type: 'POST',
          data: JSON.stringify(params),
          dataType:'json',
          contentType: 'application/json'
        });
    }, 


  findById: function(params){
        return $.ajax({
            url: RinsCommon.UI_SERVICE_URL +'getLicensorDetailsById',
            type: 'POST',
            data: JSON.stringify(params),
            dataType:'json',
            contentType: 'application/json'
          });
   }, 

  create: function(params){
        return $.ajax({
            url: RinsCommon.UI_SERVICE_URL +'insertLicensorDetails',
            type: 'POST',
            data: JSON.stringify(params),
            dataType:'json',
            contentType: 'application/json'
          });
   }, 

   getInvoiceDetails : function(params){
        return $.ajax({
            url: RinsCommon.UI_SERVICE_URL +'getInvoiceDetailTypes',
            type: 'POST',
            data: JSON.stringify(params),
            dataType:'json',
            contentType: 'application/json'
          });
   }

}, {});

export default Analytics;
