import Model from 'can/model/';
import RinsCommon from 'utils/urls';

var FileUpLoader = Model.extend({
    create: function(params) {

		return $.ajax({
	        url: RinsCommon.UI_SERVICE_URL+'uploadFiles',
				type: 'POST',
				contentType: 'multipart/form-data;boundary=' + RinsCommon.BOUNDARY +';' ,
				processData: false,
				data: params
		});

	}

 } ,{});
	export default FileUpLoader;
