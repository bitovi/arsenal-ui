import $ from 'jquery';
import Model from 'can/model/';
import URLs from 'utils/urls';

var ReminderEmail = Model.extend({
  create: function(params) {
    return $.ajax({
      url: DOMAIN_SERVICE_URL + 'rinsemail/sendEmail',
      type: 'POST',
      data: {
        "emailType": "reminder",
        "mailingList": {
          "roleId": [ "1" ],
          "cc": null,
          "bcc": null,
          "sender": "abcd@apple.com",
          "senderName": null
        },
        "dynamicContents": {
          "Subject": "Reminder for " + params.bundleName,
          "paymentBundle": params.bundleName,
          "noOfDaysPending": params.daysPending
        },
        "attachments" : null
      }
    })
  }
}, {});

export default ReminderEmail;
