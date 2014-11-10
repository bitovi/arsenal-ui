import Model from 'can/model/';

import RinsCommon from 'utils/';

var Licensor = Model.extend({

    findAll: 'POST ' + RinsCommon.UI_SERVICE_URL + 'getLicensors',
    findOne: 'POST ' + RinsCommon.UI_SERVICE_URL + 'getLicensorsRegion'

}, {});


/* able to get data in ajax done function*/

export default Licensor;
