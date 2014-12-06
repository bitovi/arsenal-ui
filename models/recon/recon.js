import Model from 'can/model/';

var Recon = Model.extend({
  findOne: function(params){
      console.log("Type is "+params.searchRequest.type);
       return $.ajax({
         url: 'detailInvoice/fetch',
         type: 'POST',
         //data: JSON.stringify(params),
         dataType: 'json',
         contentType: 'application/json'
       })
   },
   reject: function(params){
     return $.ajax({
       url: 'detailInvoice/delete',
       type: 'POST',
       //data: JSON.stringify(params),
       dataType: 'json',
       contentType: 'application/json'
     })
   },
   ingest: function(params){
     return $.ajax({
       url: 'detailInvoice/ingest',
       type: 'POST',
       //data: JSON.stringify(params),
       dataType: 'json',
       contentType: 'application/json'
     })
   }
}, {});
export default Recon;
