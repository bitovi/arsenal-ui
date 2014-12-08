import Model from 'can/model/';
<<<<<<< HEAD
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
=======

var highchart = Model.extend({
 findAll: 'GET /highchart'
>>>>>>> <rdar://problem/18718561> UI Interface -Historical Graphs PBR/CR
}, {});

export default highchart;
