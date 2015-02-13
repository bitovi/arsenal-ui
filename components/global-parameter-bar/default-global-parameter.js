import Model from 'can/map/';
import periodWidgetHelper from 'utils/periodWidgetHelpers';

/**
 * Config file for Default Global Parameters
 *
 **/

var defaultGlobalParameters = {
		"PeriodFrom": getDefaultPeriodFrom(),
		"PeriodTo": getDefaultPeriodTo(),
		"StoreType":{id:1, value:"iTunes Downloads"}, /* use {id:1, value:"iTunes Downloads"} if u want to select iTunes Downloads by default */
		"Region":{id:2, value:"Europe"},
		"Country":"ALL",//["AUT"], /* To select all pass "ALL" or "-1" as a string not in array, for multi select pass ["AUT","BEL", ...]*/
		"Licensor":"ALL",//["17"], /* To select all pass "ALL" or "-1" as a string not in array, for multi select pass ["17","32", ...], 17 is for CELAS */
		"ContentType":"-1" /* To select all pass "ALL" or "-1" as a string not in array, for multi select pass ["3:1","1:1", ...], 3:1 is for MUSIC */
    },

    DefaultGlobalParameters = new can.Map(defaultGlobalParameters);

function getDefaultPeriodFrom(from) {
  var defaultDate = moment().month(moment().month() - 3);
  var year = defaultDate.year() + '';
  if (from == 'ONACCOUNT') {
    return 'Q' + defaultDate.quarter() + 'FY' + year.substring(2, year.length);
  }
  var periodFrom = periodWidgetHelper.quarterToPeriod('Q' + defaultDate.quarter());
  return 'P' + periodFrom + 'FY' + year.substring(2, year.length);
}

function getDefaultPeriodTo() {
  var toPeriods = {
    "Q1": "03",
    "Q2": "06",
    "Q3": "09",
    "Q4": "12"
  };
  var defaultDate = moment().month(moment().month() - 3);
  var year = defaultDate.year() + '';
  var periodTo = toPeriods['Q' + defaultDate.quarter()];
  return 'P' + periodTo + 'FY' + year.substring(2, year.length);
}

export default DefaultGlobalParameters;
