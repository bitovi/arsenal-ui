import $ from 'jquery';
import Model from 'can/model/';
import URLs from 'utils/urls';

var ReminderEmail = Model.extend({
  create: function(params) {
    return $.ajax({
      url: URLs.DOMAIN_SERVICE_URL + 'rinsemail/sendEmail',
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
          "Subject": "Reminder for " + params.approval.description,
          "paymentBundle": params.approval.description,
          "noOfDaysPending": params.approval.daysPending
        },
        "attachments" : null
      }
    })
  }
}, {});

export default ReminderEmail;
