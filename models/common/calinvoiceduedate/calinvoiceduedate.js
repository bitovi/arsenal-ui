import Model from 'can/model/';
import RinsCommon from 'utils/urls';

var CalDueDate = Model.extend({
findOne: function(params){
 	return $.ajax({
 		url: RinsCommon.UI_SERVICE_URL +'getCalInvoiceDueDate',
  		type: 'POST',
  		data: JSON.stringify(params),
  		dataType:'json',
  		contentType: 'application/json'
  	});
}
}, {});

export default CalDueDate;