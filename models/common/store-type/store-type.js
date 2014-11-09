import Model from 'can/model/';

import RinsCommon from 'utils/';
var StoreType = Model.extend({
    findAll: 'POST ' +  RinsCommon.UI_SERVICE_URL+'getStoreTypes'
}, {});

export default StoreType;
