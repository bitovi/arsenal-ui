import Model from 'can/model/';
import RinsCommon from 'utils/';

var GLaccounts = Model.extend({
        findAll: 'POST ' +  RinsCommon.UI_SERVICE_URL+'getGlAccounts'
    }, {});

export default GLaccounts;
