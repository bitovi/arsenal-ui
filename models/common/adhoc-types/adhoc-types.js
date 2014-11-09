import Model from 'can/model/';
import RinsCommon from 'utils/';

var AdhocType = Model.extend({
  findAll: 'POST ' +  RinsCommon.UI_SERVICE_URL+'getAdhocTypes'
}, {});

/* able to get data in ajax done function*/

export default AdhocType;
