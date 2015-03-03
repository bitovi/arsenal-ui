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

       var approvalObj = {
          "notificationType":"bundle_reminder",
          "screenId":1,
          "groupId":this.scope.approval.pendingGroupId,
          "text":"Reminder",
          "region": this.scope.approval.region,
          "roleId":null,
          "sendEmail":"true",
          "settings":{
            "PAYMENT_BUNDLE_NAME": this.scope.approval.description,
            "PENDING_DAYS": this.scope.approval.pendingDays,
            "GROUP_NAME":this.scope.approval.pendingGroupName
           },
          }

        console.log(approvalObj)
        Promise.all([ReminderEmail.create(UserReq.formRequestDetails(approvalObj))]).then(function(values) {

        if(values[0]["status"]=="SUCCESS"){

                var msg = "Reminder was sent successfully."
                $("#messageDiv").html("<label class='successMessage'>"+msg+"</label>")
                $("#messageDiv").show();
                setTimeout(function(){
                    $("#messageDiv").hide();
                 },5000)

                
                  //success or fail
              }
              else{
                var msg = "Reminder was not sent."
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
