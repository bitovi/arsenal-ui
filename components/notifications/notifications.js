import Component from 'can/component/';
import template from './template.stache!';
import styles from './notifications.less!';
import Notification from 'models/common/notifications/';
import UserReq from 'utils/request/';

import commonUtils from 'utils/commonUtils';

var notification = Component.extend({
  tag: 'rn-notifications',
  template: template,
  scope: {
    appstate: undefined,
    counter:undefined,//passed in
    count: 0,
    notificationList : new can.List(),
    showUserPref: false,
    showNotification:false,
    pref: new can.Map(),
    fetchedPref: new can.Map(),
    isAnyNotification : can.compute(function() { return false;/*this.notificationList.attr('length') > 0*/ }),
    notificationTriggered: function(self){
       var notificationRequest = {};
      if(self.attr("count") > 0) {
        notificationRequest["notificationList"] =[];
        for(var i = 0 ;i < self.attr("count");i++) {
          notificationRequest["notificationList"].push(self.attr("notificationList")[i].notificationId);
        }
        Promise.all([
          Notification.createNotificationViewed(UserReq.formRequestDetails(notificationRequest))
          ]).then(function(values) {
            console.log("Return data from notification viewed save call:"+JSON.stringify(values));
          });
          self.attr("count",0)
      }
    }
 },
  init:function(){
    var self = this;
    fetchNotifications(self);
   },
  events:{
      '{document} keydown':function(el, ev){
        if(ev.which==27 && $('.notificationContainer').is(':visible')){
          $('rn-notifications').hide('fast');
          /*if(!$('.showMore').is(":visible")){
            $('.showButton').trigger('click')
          }*/
        }
      },
      '{document}  click':function(el,e){
        if($(e.target).closest(".notification").length === 0 && $(e.target).closest("rn-notifications").length === 0 && $('rn-notifications').css('display') === "block"){
          $('rn-notifications').hide('fast');
        }
      },
      '{notificationtriggered} change':function(el, e){
          console.log('Notification <Triggered></Triggered>');
      },
      '.showButton click':function(el,e){
        if($(el).is(":visible")){
          $('.autoscroll').css('overflow-y','scroll');
          $(el).parent().hide();
        }else{
          $('.autoscroll').scrollTop();
          $('.autoscroll').css('overflow-y','hidden');
          $(el).parent().show();
        }
      },
      '.notification_settings_icon click':function(el,e){
        var self = this, userPrefRequest = {}, notificationOptionTemplate='', notificationTypes='', allTypesSelected = true;

        Promise.all([Notification.findOne(UserReq.formRequestDetails(userPrefRequest))]).then(function(values) {
          self.scope.pref = values[0]["userPreference"].attr();
          self.scope.fetchedPref = values[0]["userPreference"].attr();
          if(Object.getOwnPropertyNames(self.scope.pref).length > 0){
            for(var items in self.scope.pref){
              if(self.scope.pref[items]=='I'){
                allTypesSelected = false;
              }
              notificationOptionTemplate = notificationOptionTemplate + '<div class="notificationItems"><input type="checkbox" class="'+items+'" '+((self.scope.pref[items]=='A')?'checked="checked"':'')+'/> '+items+'</div>';
            }
            notificationOptionTemplate = '<div class="notification_options"><div class="notificationItems"><input type="checkbox" class ="selectall" '+((allTypesSelected)?'checked="checked"':'')+'/> <strong>Show Notification For </strong></div>'+notificationOptionTemplate+'</div>';
            $(".notification_settings_options .autoscroll").html(notificationOptionTemplate);
            $('.listofnotification').slideUp('fast');
            $('.notification_settings_options').slideDown('fast');
          }else{
            $(".notification_settings_options .autoscroll").html('No User Preferences');
            $('.listofnotification').slideUp('fast');
            $('.notification_settings_options').slideDown('fast');
            $('#notification_settings_save').attr('disabled', true)
            console.log("There is no User Preferences");
          }
        });
      },
      '#notification_settings_cancel click':function(el, e){
        $('.listofnotification').slideDown('fast');
        $('.notification_settings_options').slideUp('fast');
      },
      '#notification_settings_save click':function(el, e){
        var self = this, userPrefRequest = {}, preference = self.scope.pref;
        userPrefRequest["type"] = [];
        userPrefRequest["type"].push(preference);

        Promise.all([Notification.create(UserReq.formRequestDetails(userPrefRequest))]).then(function(values) {
          fetchNotifications(self)
        });
        $('.listofnotification').slideDown('fast');
        $('.notification_settings_options').slideUp('fast');
      },
      '.notification_options input:checkbox click':function(el, e){
          var self = this, notificationItemsCheckboxes = $('.notificationItems input:checkbox:not(".selectall")');
          if($(el).hasClass('selectall')){
            if($(el).is(':checked')){
              notificationItemsCheckboxes.each(function(){
                $(this).prop('checked', true);
                self.scope.pref[$(this).attr('class')] = 'A';
              });
            }else{
               notificationItemsCheckboxes.each(function(el, e){
                $(this).prop('checked', false);
                self.scope.pref[$(this).attr('class')] = 'I';
              });
            }
          }else{
            if($(el).is(':checked')){
              self.scope.pref[$(el).attr('class')] = 'A';
              if($('.notification_options input:checkbox:checked:not(.selectall)').length === notificationItemsCheckboxes.length){
                $('.selectall').prop('checked',true);
              }
            }else{
              self.scope.pref[$(el).attr('class')] = 'I';
              $('.selectall').prop('checked',false);
            }
          }
      }
   },
  helpers:function(){

  }

});
var fetchNotifications = function(self){
    var notificationRequest = {};
    Promise.all([
        Notification.findAll(UserReq.formRequestDetails(notificationRequest))
      ]).then(function(values) {
        var count = values[0].length;
        //self.scope.attr("count", values[0].length);
        if(count > 0) {
          self.scope.notificationList.replace(values[0]);
          // $(".notification").html("<span class='notification-bubble'>"+self.scope.attr("count")+"</span>");
          self.scope.counter.attr('notifications',count);
        }
    });
}
export default notification;
