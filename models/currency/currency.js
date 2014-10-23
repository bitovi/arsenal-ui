import Model from 'can/model/';

var Currency = Model.extend({
  // using finaAll instead of resource because I don't want to be able to save.
/*  findAll: function(){
  	return $.ajax({
  		url: 'http://ma-rinsd-lapp01.corp.apple.com:8090/rins/common/getCurrencies',
  		type: 'POST',
  		dataType: 'json',
  		data: {"ids":["GBR","USA"],"appId":"1234","prsId":2002005722,"token":"3B9LrucRihXmNuM6","timeStamp":0}
  	})
  }*/
findAll: 'GET /currency'  /* Enabling above code shows this error"XMLHttpRequest cannot load http://ma-rinsd-lapp01.corp.apple.com:8090/rins/common/getCurrencies. No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://0.0.0.0:8082' is therefore not allowed access. */

}, {});



export default Currency;