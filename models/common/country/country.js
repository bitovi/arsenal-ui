import Model from 'can/model/';
import RinsCommon from 'utils/';

var Country = Model.extend({
    findAll: 'POST ' + RinsCommon.UI_SERVICE_URL + 'getCountries',
    findOne: 'POST ' + RinsCommon.UI_SERVICE_URL + 'getCountriesRegion'

}, {});

export default Country;
