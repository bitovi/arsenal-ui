import Model from 'can/model/';

import RinsCommon from 'utils/urls';
import getUtility from 'utils/getUtility' ;

var Bookmarkusers = Model.extend({
    findOne: function(params){

      var getURL = getUtility.createGetURL(params);
     	return $.ajax({
      		url: RinsCommon.UI_SERVICE_URL+'bookMarkUsers'+"/?"+getURL,
      		type: 'GET',
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
