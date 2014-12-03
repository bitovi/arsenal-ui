import Model from 'can/model/';
import RinsCommon from 'utils/';

// var proposedOnAccount = Model.extend({
//   // using finaAll instead of resource because I don't want to be able to save.
//   findAll: 'GET /proposedOnAccount'
// }, {});


var proposedOnAccount = Model.extend({
   findOne: function(params){
 	return $.ajax({
 		url: RinsCommon.DOMAIN_SERVICE_URL +'onaccount/get',
  		type: 'POST',
  		data: JSON.stringify(params),
  		dataType:'json',
  		contentType: 'application/json'
  	});
},
update: function(params,type){
    if(type=="Delete"){
     return $.ajax({
          url: RinsCommon.DOMAIN_SERVICE_URL+'onaccount/delete',
          type: 'POST',
          datatype:'json',
          contentType: 'application/json; charset=utf-8',
          data: JSON.stringify(params)
        })
    } else {
      return $.ajax({
          url: RinsCommon.DOMAIN_SERVICE_URL+'onaccount/update',
          type: 'POST',
          datatype:'json',
          contentType: 'application/json; charset=utf-8',
          data: JSON.stringify(params)
        })
    }
  }
}, {});

export default proposedOnAccount;
