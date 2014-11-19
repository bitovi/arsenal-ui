import Model from 'can/model/';
import RinsCommon from 'models/rinsCommon/';

var highchart = Model.extend({
findOne: function(params){
 	return $.ajax({
 		url: RinsCommon.UI_SERVICE_URL+'getHighChart',
  		type: 'POST',
  		data: JSON.stringify(params),
  		dataType:'json',
  		contentType: 'application/json'
  	});
}
}, {});

export default highchart;
