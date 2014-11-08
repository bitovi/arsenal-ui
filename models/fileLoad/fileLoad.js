import Model from 'can/model/';

var FileLoad = Model.extend({
	 
    update: function(params) {
    	alert("Passing file name and contents to  rest call");
		return $.ajax({
	    				url: '/rins/upLoad',
	    				type: 'POST',
	    				dataType: 'json',
	    				data: JSON.stringify(params)

					});
	   	
	}

 } ,{});

export default FileLoad;