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
    limit: 10,
    offset: 0,
    recordsAvailable: false,
    notificationList : new can.List(),
    showUserPref: false,
    showNotification:false,
    notificationType: '@',
    defaultUserPref: '@',
    selectedUserPref: new can.Map(),
    notificationTriggered: function(self, notificationList){
       var notificationRequest = {};
      if(self.scope.attr("count") > 0) {
        notificationRequest["notificationList"] =[];
        for(var i = 0 ;i < notificationList.length;i++) {
          if(notificationList[i].isViewed === "N"){
            notificationRequest["notificationList"].push(self.scope.attr("notificationList")[i].notificationId);
          }
        }
        if(notificationRequest["notificationList"].length > 0){
            Promise.all([
              Notification.createNotificationViewed(UserReq.formRequestDetails(notificationRequest))
              ]).then(function(values) {
                $('header-navigation').scope().getCounter()
                console.log("Return data from notification viewed save call:"+JSON.stringify(values));
              });
        }
      }
    }
 },
  init:function(){
    var self = this, notificationRequest = {limit: self.scope.limit, offset: self.scope.offset};
    fetchNotifications(self, notificationRequest);
   },
  events:{
      '{document} keydown':function(el, ev){
        if(ev.which==27 && $('.notificationContainer').is(':visible')){
          $('rn-notifications').hide('fast');
          if(!$('.showMore').is(":visible")){
            $('.showButton').trigger('click')
          }
        }
      },
      '{document}  click':function(el,e){
        if($(e.target).closest(".notification").length === 0 && $(e.target).closest("rn-notifications").length === 0 && $('rn-notifications').css('display') === "block"){
          $('rn-notifications').hide('fast');
        }
      },
      // ShowMore functionality
      '.showButton click':function(el,e){
          var self = this, notificationRequest = {};

          self.scope.offset = self.scope.offset+1;
          notificationRequest = {limit: self.scope.limit, offset: self.scope.offset};
          fetchNotifications(self, notificationRequest);
      },
      // Method to show Notfication User Preferences
      '.notification_settings_icon click':function(el,e){
        var self = this, userPrefRequest = {reqType: 'getNotificationType'};

        $('.notification_loader').show();
        // Fetch Notification Type Master List
        Promise.all([
            Notification.findOne(UserReq.formRequestDetails(userPrefRequest))
          ]).then(function(values) {
            self.scope.notificationType = values[0].notificationType;
            if(self.scope.notificationType.length > 0){
              self.scope["defaultUserPref"] = {};
              for(var i = 0; i < self.scope.notificationType.length; i++){
                self.scope["defaultUserPref"][self.scope.notificationType[i].type] = "I";
              }
              fetchUserPreferences(self, userPrefRequest);
            }
        });
      },
      // Method to cancel Notfication User Preferences changes
      '#notification_settings_cancel click':function(el, e){
        $('.listofnotification').slideDown('fast');
        $('.notification_settings_options').slideUp('fast');
      },
      // Method to save Notfication User Preferences changes
      '#notification_settings_save click':function(el, e){
        var self = this, userPrefRequest = {}, preference = self.scope.defaultUserPref, notificationRequest = {};

        userPrefRequest["type"] = [];
        userPrefRequest["type"].push(preference);
        self.scope.offset = 0;
        notificationRequest = {limit: self.scope.limit, offset: self.scope.offset}
        $('.notification_loader').show();
        Promise.all([Notification.create(UserReq.formRequestDetails(userPrefRequest))]).then(function(values) {
          $('.notification_loader').hide();
          $('header-navigation').scope().getCounter()
          fetchNotifications(self, notificationRequest);
        });
        $('.listofnotification').slideDown('fast');
        $('.notification_settings_options').slideUp('fast');
      },
      // Method to update user preference variable on user checkbox click action
      '.notification_options input:checkbox click':function(el, e){
          var self = this, notificationItemsCheckboxes = $('.notificationItems input:checkbox:not(".selectall")');
          if($(el).hasClass('selectall')){
            if($(el).is(':checked')){
              notificationItemsCheckboxes.each(function(){
                $(this).prop('checked', true);
                self.scope.defaultUserPref[$(this).attr('class')] = 'A';
              });
            }else{
               notificationItemsCheckboxes.each(function(el, e){
                $(this).prop('checked', false);
                self.scope.defaultUserPref[$(this).attr('class')] = 'I';
              });
            }
          }else{
            if($(el).is(':checked')){
              self.scope.defaultUserPref[$(el).attr('class')] = 'A';
              if($('.notification_options input:checkbox:checked:not(.selectall)').length === notificationItemsCheckboxes.length){
                $('.selectall').prop('checked',true);
              }
            }else{
              self.scope.defaultUserPref[$(el).attr('class')] = 'I';
              $('.selectall').prop('checked',false);
            }
          }
      }
   },
  helpers:{
    isViewedStyle: function(isViewed){
      return (isViewed() === "N")?' new':'';
    }
  }
});
var fetchNotifications = function(self, notificationRequest){
    $('.notification_loader').show();
    Promise.all([
        Notification.findAll(UserReq.formRequestDetails(notificationRequest))
      ]).then(function(values) {
        self.scope.attr("count", values[0].notificationCount);
        self.scope.attr("recordsAvailable", values[0].recordsAvailable);

        if(self.scope.attr("count") > 0 && self.scope.offset > 0){
          $.merge(self.scope.notificationList, values[0]);
          self.scope.notificationList.replace(self.scope.notificationList);
        }else{
          self.scope.notificationList.replace(values[0]);
        }
        
        if( self.scope.attr("count") > 0) {
          self.scope.notificationTriggered(self, values[0]);
        }
        $('.notification_loader').hide();
    });
};
var fetchUserPreferences = function(self){
  var userPrefRequest = {reqType: 'getUserPreference'}, notificationOptionTemplate='', allTypesSelected = true;
  
  // Map and render Notification Type Master List with selected user preferences
  Promise.all([Notification.findOne(UserReq.formRequestDetails(userPrefRequest))]).then(function(values) {
    self.scope.selectedUserPref = values[0]["userPreference"].attr();
    if(Object.getOwnPropertyNames(self.scope.defaultUserPref).length > 0){
      for(var items in self.scope.defaultUserPref){
        if(self.scope["selectedUserPref"][items]){
          self.scope["defaultUserPref"][items] = self.scope["selectedUserPref"][items];
        }
        if(self.scope.defaultUserPref[items]=='I'){
          allTypesSelected = false;
        }
        notificationOptionTemplate = notificationOptionTemplate + '<div class="notificationItems"><input type="checkbox" class="'+items+'" '+((self.scope.defaultUserPref[items]=='A')?'checked="checked"':'')+'/> '+items+'</div>';
      }
      notificationOptionTemplate = '<div class="notification_options"><div class="notificationItems"><input type="checkbox" class ="selectall" '+((allTypesSelected)?'checked="checked"':'')+'/> <strong>Show Notification For </strong></div>'+notificationOptionTemplate+'</div>';
      $(".notification_settings_options .autoscroll").html(notificationOptionTemplate);
      $('.listofnotification').slideUp('fast');
      $('.notification_loader').slideUp('fast');
      $('.notification_settings_options').slideDown('fast');
    }else{
      $(".notification_settings_options .autoscroll").html('No User Preferences');
      $('.listofnotification').slideUp('fast');
      $('.notification_loader').slideUp('fast');
      $('.notification_settings_options').slideDown('fast');
      $('#notification_settings_save').attr('disabled', true)
      console.log("There is no User Preferences");
    }
  });
};
export default notification;
