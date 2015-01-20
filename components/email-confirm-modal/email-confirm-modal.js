import Component from 'can/component/';

import ReminderEmail from 'models/reminder-email/';

import template from './template.stache!';
import './email-confirm-modal.less!';
import UserReq from 'utils/request/';

var EmailConfirmModal = can.Component.extend({
  tag: 'rn-email-confirm-modal',
  template: template,
  scope: {
    approval: null
  },
  events: {
    init: function() {
      $('rn-email-confirm-modal').remove();
    },
    inserted: function(el, ev) {
      this.element.find('.modal').modal({keyboard: false, backdrop: false});
    },
    '.cancel click': function(el, ev) {
      this.element.find('.modal').modal('hide');
      this.element.remove();
    },
    '.submit click': function(el, ev) {
     
     var approvalObj = {"emailDetails":[  
        {  
           "emailType":"reminder",
           "mailingList":{  
              "groupId":null,
              "roleId":null,
              "to":[  
                 "abc@apple.com"
              ],
              "bcc":null,
              "cc":null
           },
           "attachments" : null,
           "dynamicContents": {
            "Subject": "Reminder for " + this.scope.approval.description,
            "paymentBundle": this.scope.approval.description,
            "noOfDaysPending": this.scope.approval.daysPending
          }
        }
     ]};
      
      Promise.all([ReminderEmail.create(UserReq.formRequestDetails(approvalObj))]).then(function(values) {

        if((typeof values[0] === "defined") && (values[0]["status"]=="SUCCESS")){

               var msg = "Reminder was sent successfully."
                $("#messageDiv").html("<label class='successMessage'>"+msg+"</label>")
                $("#messageDiv").show();
                setTimeout(function(){
                    $("#messageDiv").hide();
                 },5000)

                
                  //success or fail
              }
              else{
                var msg = "Reminder was not sent successfully."
                $("#messageDiv").html("<label class='errorMessage'>"+msg+"</label>")
                $("#messageDiv").show();
                setTimeout(function(){
                    $("#messageDiv").hide();
                 },5000)

              }
        

      });

      this.element.find('.modal').modal('hide');
      this.element.remove();
    }
  }
});

export default EmailConfirmModal;
