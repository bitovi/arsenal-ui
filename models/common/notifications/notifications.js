import Model from 'can/model/';
import RinsCommon from 'utils/urls';

var Notifications = Model.extend({

  parseModels:function(data) {
    return data.notificationList;
  },

  findAll: function(params) {
    console.log(params);
    return $.ajax({
      url: RinsCommon.UI_SERVICE_URL+'notifications',
      type: 'POST',
      contentType:'application/json',
      dataType: 'json',
      data: JSON.stringify(params)
    })
  },
  create: function(params){
    return $.ajax({
      url: RinsCommon.UI_SERVICE_URL+'saveUserPreference',
      type: 'POST',
      contentType:'application/json',
      dataType: 'json',
      data: JSON.stringify(params)
    })
  },
  findOne: function(params) {
    if(params.reqType === 'getUserPreference'){
      delete params.reqType;
      return $.ajax({
        url: RinsCommon.UI_SERVICE_URL+'getUserPreference',
        type: 'POST',
        contentType:'application/json',
        dataType: 'json',
        data: JSON.stringify(params)
      })
    }else{
      delete params.reqType;
      return $.ajax({
        url: RinsCommon.UI_SERVICE_URL+'getNotificationType',
        type: 'POST',
        contentType:'application/json',
        dataType: 'json',
        data: JSON.stringify(params)
      })
    }
    
  },
  createNotificationViewed: function(params){
    return $.ajax({
      url: RinsCommon.UI_SERVICE_URL+'notificationViewed',
      type: 'POST',
      contentType:'application/json',
      dataType: 'json',
      data: JSON.stringify(params)
    })
  }
}, {});

export default Notifications;
