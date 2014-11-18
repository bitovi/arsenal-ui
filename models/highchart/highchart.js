import Model from 'can/model/';
import RinsCommon from 'models/rinsCommon/';

var highchart = Model.extend({
findOne: function(params){
 	return $.ajax({
 		url: 'http://localhost:10645/api/v1/rinsui/getHighChart',
  		type: 'POST',
  		data: JSON.stringify(params),
  		dataType:'json',
  		contentType: 'application/json'
  	});
}
}, {});

export default highchart;
