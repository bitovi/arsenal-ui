import Model from 'can/model/';

var FileLoad = Model.extend({
	 
    update: function(params) {
    	alert("Params"+JSON.stringify(params))
		return $.ajax({
	    				url: '/rins/upLoad',
	    				type: 'POST',
	    				dataType: 'json',
	    				data: JSON.stringify(params)

					});
	   	
	}

 } ,{});

export default FileLoad;