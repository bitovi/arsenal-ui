import Model from 'can/model/';

import RinsCommon from 'utils/';
var Region = Model.extend({

    findAll: 'POST ' +  RinsCommon.UI_SERVICE_URL+'getRegions'
}, {});

export default Region;
