import Model from 'can/model/';

var AllInvoices = Model.extend({
  // using findAll instead of resource because I don't want to be able to save.
  findAll: 'GET /allInvoices'
  /*findAll: function(params){
  	return $.ajax({
  		
  		url: 'http://ma-rinst-lap01.corp.apple.com:10634/PreviewExcel/fetchpreviewExcel1',
  		type: 'GET',
  		headers: { 'Access-Control-Allow-Origin': '*' },
  		datatype: 'jsonp',
  		crossDomain: true,
        success: function () { alert('it works') },
        error: function() {alert('it doesnt work')},
        data: params 
  	});
  }*/
}, {});

export default AllInvoices;