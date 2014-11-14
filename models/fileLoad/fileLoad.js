import Model from 'can/model/';
import RinsCommon from 'utils/';

var FileLoad = Model.extend({
	
    findOne: function(params) {
    	return $.ajax({
    		            url: RinsCommon.UPLOAD_SERVICE_URL,
	    				type: 'POST',
	    				contentType: 'multipart/form-data;boundary=' + RinsCommon.BOUNDARY +';' ,
	    				processData: false,
	    				data: params

					});
	   	
	}

 } ,{});



export default FileLoad;