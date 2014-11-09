import Model from 'can/model/';
import RinsCommon from 'utils/';

var Country = Model.extend({
    findAll: 'POST ' + RinsCommon.UI_SERVICE_URL + 'getCountries'

}, {});

export default Country;
