import Model from 'can/model/';

import RinsCommon from 'utils/urls';

var Bookmark = Model.extend({
    findOne: function(params){
     	return $.ajax({
      		url: RinsCommon.UI_SERVICE_URL+'bookmarks',
      		type: 'POST',
      		data: JSON.stringify(params),
      		dataType:'json',
      		contentType: 'application/json'
      	});
    },
    update: function(params,type){
      if(type=="DELETE"){
       return $.ajax({
            url: RinsCommon.UI_SERVICE_URL+'deleteBookmark',
            type: 'POST',
            datatype:'json',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(params)
          })
      } else { 
        return $.ajax({
            url: RinsCommon.UI_SERVICE_URL+'saveBookmark',
            type: 'POST',
            datatype:'json',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(params)
          })
      }
    }
}, {});


/* able to get data in ajax done function*/

export default Bookmark;
