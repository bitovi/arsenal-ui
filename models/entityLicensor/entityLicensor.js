import Model from 'can/model/';

import RinsCommon from 'utils/urls';

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
   },
   propose : function(params){
        return $.ajax({
            url: RinsCommon.UI_SERVICE_URL + 'proposeLicensorDetails',
            type: 'POST',
            data: JSON.stringify(params),
            dataType:'json',
            contentType: 'application/json'
          });
   },

   approve : function(params){
        return $.ajax({
            url: RinsCommon.UI_SERVICE_URL +'approveLicensorDetails',
            type: 'POST',
            data: JSON.stringify(params),
            dataType:'json',
            contentType: 'application/json'
          });
   },

   reject : function(params){
        return $.ajax({
            url: RinsCommon.UI_SERVICE_URL +'rejectLicensor',
            type: 'POST',
            data: JSON.stringify(params),
            dataType:'json',
            contentType: 'application/json'
          });
   }

}, {});

export default Analytics;
