import Model from 'can/model/';

import RinsCommon from 'utils/';

var Licensor = Model.extend({

    findAll: 'POST ' + RinsCommon.UI_SERVICE_URL + 'getLicensors'

}, {});


/* able to get data in ajax done function*/

export default Licensor;
