import Model from 'can/model/';
import URLs from 'utils/urls';

var ReminderEmail = Model.extend({
  create: function(params) {
    return $.ajax({
      url: URLs.EMAIL_SERVICE_URL,
      type: 'POST',
      datatype:'json',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(params)
    })
  }
}, {});

export default ReminderEmail;
