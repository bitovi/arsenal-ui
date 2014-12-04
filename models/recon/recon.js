import Model from 'can/model/';

var Recon = Model.extend({

  findOne: function(params){
      return $.ajax({
        url: 'detailInvoice/fetch',
        type: 'POST',
        //data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json'
      })
    }

}, {});

export default Recon;
