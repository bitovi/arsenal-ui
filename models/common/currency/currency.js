import Model from 'can/model/';
import RinsCommon from 'utils/';

var Currency = Model.extend({
	//findAll: 'POST ' + RinsCommon.UI_SERVICE_URL + 'getCountries'
    findAll: 'POST ' + RinsCommon.UI_SERVICE_URL + 'getCurrencies',
    findOne: 'POST ' + RinsCommon.UI_SERVICE_URL + 'getCurrenciesLicensor' 
/* Enabling above code shows this error"XMLHttpRequest cannot load http://ma-rinsd-lapp01.corp.apple.com:8090/rins/common/getCurrencies. No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://0.0.0.0:8082' is therefore not allowed access. */
//findAll: 'GET /licensor'
}, {});


export default Currency;