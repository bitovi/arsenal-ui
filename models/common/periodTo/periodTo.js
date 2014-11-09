import Model from 'can/model/';
import RinsCommon from 'utils/';

var PeriodTo = Model.extend({
    findAll: 'POST ' + RinsCommon.UI_SERVICE_URL + 'getPeriods'

}, {});

export default PeriodTo;
