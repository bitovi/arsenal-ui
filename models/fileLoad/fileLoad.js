import Model from 'can/model/';

var FileLoad = Model.extend({
	
    findOne: function(params) {
    	return $.ajax({
	    				url: 'http://localhost:10645/api/v1/rinsui/uploadFiles',
	    				type: 'POST',
	    				contentType: 'multipart/form-data;boundary=xxx' ,
	    				processData: false,
	    				data: params

					});
	   	
	}

 } ,{});



export default FileLoad;