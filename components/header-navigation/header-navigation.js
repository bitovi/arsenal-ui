import Component from 'can/component/';
import Control from 'can/control/';
import Counter from 'models/common/getCounter/';
import _ from 'lodash';
import stache from 'can/view/stache/';
import template from './template.stache!';
import styles from './header-navigation.less!';
import roles from 'models/roles/';
import GlobalParameterBar from 'components/global-parameter-bar/';
import Bookmark from 'components/bookmark/';
import Notification from 'components/notifications/';
import UserReq from 'utils/request/';
import RinsCommon from 'utils/urls';
import logout from 'models/common/logout/';
import commonUtils from 'utils/commonUtils';
import pagelogout from 'components/page-logout/';

var headerNavigation = Component.extend({
    tag: 'header-navigation',
    template: template,
    scope: {
        appstate: undefined,// this gets passed in
        counter:{
            bookmark:undefined,
            notifications:undefined
        },
        show:true,
        roles: [],
        allowedScreenId : []
    },
    init: function() {
      var self = this;
      var genObj = {};

      Promise.all([
        roles.findAll(UserReq.formRequestDetails(genObj))
      ]).then(function(values) {
          var role = {
            permissions: values[0]
          };
          //added
          self.scope.appstate.userInfo.permissions = role;

          //end
          self.scope.appstate.userInfo.attr(role);
          self.scope.roles.replace(values[0]);
          self.scope.appstate.userInfo.attr("displayName",role.permissions[0].firstName +" "+role.permissions[0].lastName);
          self.scope.appstate.userInfo.attr("prsId",role.permissions[0].userId);
          //Remove the existing role, if any
          if(self.scope.appstate.userInfo.roleIds !=undefined ){
            self.scope.appstate.userInfo.roleIds.splice(0);
            self.scope.appstate.userInfo.roleIds.push(role.permissions[0].roleId);
          }else{
            var roleIds = [];
            roleIds.push(role.permissions[0].roleId);
            self.scope.appstate.userInfo.attr("roleIds",roleIds);
          }

          var screenId= [] ;
          for(var i = 0, size = role.permissions.length; i < size ; i++)
          {
              screenId.push(role.permissions[i].screenId) ;
          }
          self.scope.attr("allowedScreenId",screenId );

            var appstate = self.scope.appstate;
            var counter = self.scope.counter;
            $('.gParamSearchbar').append(stache('<global-parameter-bar appstate="{appstate}"></global-parameter-bar>')({appstate}));
            $('.bookMarkPalceHolder').append(stache('<book-mark appstate={appstate}  counter={counter}></book-mark>')({appstate,counter}));
            $('.notificationPlaceHolder').append(stache('<rn-notifications appstate="{appstate}" counter={counter}></rn-notifications>')({appstate,counter}));


        });
        
        // Bookmark and Notification Counter Poller
        var CounterControl = Control.extend({
          init: function (){
              this.interval = setInterval(function () {
                  var getCounterRequest = {};
                  
                  Promise.all([
                      Counter.findOne(UserReq.formRequestDetails(getCounterRequest))
                    ]).then(function(values) {
                      self.scope.counter.attr('bookmark', values[0].bookmarks);
                      self.scope.counter.attr('notifications', values[0].notifications);
                  });
              }, 20000);
          },

          destroy: function () {
              removeInterval(this.interval);
          }
        });

        new CounterControl();
    },
    events:{
      'inserted':function(){
          var self = this;
      },
      '#appleLogo click':function(){
          commonUtils.navigateTo("dashboard");
      },
      '.bookmark click':function(){
          $('book-mark').slideToggle('fast');
      },
      '.notification click':function(){
          $('rn-notifications').slideToggle('fast');
          this.element.find('rn-notifications').scope().notificationTriggered(this.element.find('rn-notifications').scope());
      },
      '.dropdown-menu li a click':function(el){

         //console.log(" I am heer "+el.data('screenid'));
         this.scope.appstate.screenLookup.attr("screenid",el.data('screenid'));

            // if(btn.attr('id')!='show' && btn.attr('id')==undefined){
            //    $('#dynamicmenu li a').removeClass('submenuactive');
            //     btn.addClass('submenuactive');
            //     if($("#dropdown").is(':visible')){
            //       $("#dropdown").hide();
            //     }
            // }
      },
      '{document}  click':function(el,e){
        if ($(e.target).closest("#dynamicmenu").length === 0) {
          $("#dropdown").hide();
        }
      },
      '{document} keydown':function(el, ev){
        if(ev.which==27 && $('#dropdown').is(':visible')){
            $("#dropdown").hide();
        }
      },
      '.logout click':function(){
        logout.find().done(function(data){
          if(data.responseCode == 'LOGGEDOUT') {
            commonUtils.navigateTo("logout");

            document.getElementById("navigation-bar").style.display = 'none';
            document.getElementById("globalFilterContainer").style.display = 'none';
            //window.location.href = "";
          }
        }).fail(function(data){
         console.log("failed ");
         commonUtils.navigateTo("logout");

         document.getElementById("navigation-bar").style.display = 'none';
         document.getElementById("globalFilterContainer").style.display = 'none';

    }) ;

        //console.log("Logout");
      },


  },
    helpers: {
        isActive: function(pageName) { console.log(pageName);
            $('.popover').popover('destroy');/*To remove popover when going to other page*/
            return 'class="' + (pageName === this.appstate.attr('page') ? 'active' : '') + '"'
        },
        renderGlobalSearch: function(){
            //Used for appear/di-appear of the Global search, whic is based appstate.renderGlobalSearch
            return 'style="' + (this.appstate.attr('renderGlobalSearch') ? '' : 'display:none') + '"'
        },
        isScreenEnabled:function(screenId){
           var index = _.indexOf(this.attr("allowedScreenId"), screenId);
           var isEnable = 'style="display:' + ( index == -1 ? 'none' : 'block') + '"';
        //
        return isEnable
        //return "abc";

        },
        url: function(){
            return RinsCommon.RINS_OLD_URL;
        }
    }
});
export default headerNavigation;
