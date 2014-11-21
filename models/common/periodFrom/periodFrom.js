import Model from 'can/model/';
import RinsCommon from 'utils/';

var PeriodFrom = Model.extend({
 findAll: 'POST ' + RinsCommon.UI_SERVICE_URL + 'getPeriods'

}, {});

export default PeriodFrom;