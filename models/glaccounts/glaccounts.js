import Model from 'can/model/';
import RinsCommon from 'utils/';

var GLaccounts = Model.extend({
  // using finaAll instead of resource because I don't want to be able to save.
findAll: function(){
	  	return $.ajax({
	  		url: RinsCommon.UI_SERVICE_URL+'getGlAccounts',
	  		type: 'POST'

	  	})
  }
//findAll: 'GET /invoiceType'  /* To remove the error. Please commemnt above return statement and uncoment this line.*/

}, {});

/* able to get data in ajax done function*/

export default GLaccounts;
