import Model from 'can/model/';
import RinsCommon from 'utils/urls';
import getUtility from 'utils/getUtility' ;

var Country = Model.extend({
findAll: function(params){

  var getURLParams = getUtility.createGetURL(params);

 	return $.ajax({
     url: RinsCommon.UI_SERVICE_URL +'getCountries'+"/?"+getURLParams,
  		type: 'GET',
  		contentType: 'application/json'
  	});
},

findAllCountriesByLicenesor: function(params){

  var getURLParams = getUtility.createGetURL(params);

 	return $.ajax({
     url: 'http://10.249.20.99:10645/api/v1/rinsui/' +'getCountriesForLicensorCountry'+"?"+getURLParams,
  		type: 'GET',
  		contentType: 'application/json'
  	});
}

}, {});

export default Country;
