import Model from 'can/model/';
import RinsCommon from 'utils/';

var ContentType = Model.extend({
findAll: 'POST ' +  RinsCommon.UI_SERVICE_URL+'getContentTypes'
}, {});


/* able to get data in ajax done function*/

export default ContentType;
