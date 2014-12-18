import Model from 'can/model/';

import RinsCommon from 'utils/urls';

var Bookmarkusers = Model.extend({
    findOne: function(params){
     	return $.ajax({
      		url: RinsCommon.UI_SERVICE_URL+'bookMarkUsers',
      		type: 'POST',
      		data: JSON.stringify(params),
      		dataType:'json',
      		contentType: 'application/json'
      	});
    },
    update: function(params,type){
         return $.ajax({
            url: RinsCommon.UI_SERVICE_URL+'saveBookmarkShared',
            type: 'POST',
            datatype:'json',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(params)
          })
      
    }
}, {});


/* able to get data in ajax done function*/

export default Bookmarkusers;
