import Model from 'can/model/';
import Urls from 'utils/urls';

var Recon = Model.extend({
  findOne: function(params){
       return $.ajax({
         url: Urls.DOMAIN_SERVICE_URL+'detailInvoice/fetch',
         type: 'POST',
         data: JSON.stringify(params),
         dataType: 'json',
         contentType: 'application/json'
       })
   },
   reject: function(params){
     return $.ajax({
       url: Urls.DOMAIN_SERVICE_URL+ 'detailInvoice/delete',
       type: 'POST',
       data: JSON.stringify(params),
       dataType: 'json',
       contentType: 'application/json'
     })
   },
   ingest: function(params){
     return $.ajax({
       url: Urls.DOMAIN_SERVICE_URL+'detailInvoice/ingest',
       type: 'POST',
       data: JSON.stringify(params),
       dataType: 'json',
       contentType: 'application/json'
     })
   }
}, {});
export default Recon;
