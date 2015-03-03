import Model from 'can/model/';
import RinsCommon from 'utils/urls';

var PeriodFrom = Model.extend({
  findAll: 'POST ' + RinsCommon.UI_SERVICE_URL + 'getPeriods',

  format: function(periodDescriptor) {
    var pStr = '' + periodDescriptor,
        year = pStr.substr(2, 2),
        period = pStr.substr(4, 2);

    return 'P' + period + 'FY' + year;
  }

}, {});

export default PeriodFrom;
