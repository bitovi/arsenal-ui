import Model from 'can/model/';

import RinsCommon from 'utils/urls';

var sharedBookmarks = Model.extend({
    findOne: function(params){
     	return $.ajax({
      		url: RinsCommon.UI_SERVICE_URL+'sharedPrsId',
      		type: 'POST',
      		data: JSON.stringify(params),
      		dataType:'json',
      		contentType: 'application/json'
      	});
    },
    update: function(params,type){
         return $.ajax({
            url: RinsCommon.UI_SERVICE_URL+'sharedPrsId',
            type: 'POST',
            datatype:'json',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(params)
          })
      
    }
}, {});


/* able to get data in ajax done function*/

export default sharedBookmarks;
