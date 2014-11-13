import Model from 'can/model/';

var FileLoad = Model.extend({
	
    findOne: function(params) {
    	return $.ajax({
			url: 'http://http://ma-rinsd-lapp01.corp.apple.com:10645/api/v1/rinsui/uploadFiles',
	    		type: 'POST',
	 				contentType: 'multipart/form-data;boundary=xxx' ,
	    				processData: false,
	    				data: params

					});
	   	
	}

 } ,{});



export default FileLoad;