import Model from 'can/model/';

var ContentType = Model.extend({
  // using finaAll instead of resource because I don't want to be able to save.
 /* findAll: function(){
  	return $.ajax({
  		url: 'http://127.0.0.1:8090/rins/common/getInvoiceTypes',
  		type: 'GET',
  		dataType: 'json'
  	})
  }*/
findAll: 'GET /contentType'

}, {});

/* able to get data in ajax done function*/

export default ContentType;