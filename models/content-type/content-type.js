import Model from 'can/model/';

var ContentType = Model.extend({
  // using finaAll instead of resource because I don't want to be able to save.
  findAll: function(){
  	return $.ajax({
  		url: 'http://ma-rinsd-lapp01.corp.apple.com:8090/getContentTypes',
  		type: 'POST'
  		
  	})
  }
//findAll: 'GET /contentType'

}, {});

/* able to get data in ajax done function*/

export default ContentType;