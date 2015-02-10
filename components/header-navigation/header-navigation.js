import Component from 'can/component/';

import stache from 'can/view/stache/';
import template from './template.stache!';
import styles from './header-navigation.less!';
import roles from 'models/roles/';
import GlobalParameterBar from 'components/global-parameter-bar/';
import Bookmark from 'components/bookmark/';
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
            //added to show only the permitted screens
            //method starts here
            for(var i=0; i<menu.length; i++)
            {
              var removeId = [] ;
                for(var x=0; x< menu[i].submenu.length; x++)
                {

                  if(screenId.indexOf(menu[i].submenu[x].screenId) == -1)
                  {
                    removeId.push(x);

                  }
                }
                for (var y = removeId.length-1; y >= 0; y--)
                {
                  menu[i].submenu.splice(removeId[y],1);
                }
            }
            //ends here
            var appstate = self.scope.appstate;
            $('.gParamSearchbar').append(stache('<global-parameter-bar appstate="{appstate}"></global-parameter-bar>')({appstate}));
            $('.bookMarkPalceHolder').append(stache('<book-mark appstate="{appstate}"></book-mark>')({appstate}));

          });
        },
    events:{
      '.bookmark click':function(){
          $('book-mark').slideToggle('fast');
      },
     '#homemenu li a click':function(btn){
        var mainmenu_txt = btn.text();
        if(btn.attr('id')){
          $('#dynamicmenu').hide();
          $('#homemenu').show();

        }
        //changeMenu(mainmenu_txt);
      },
      '#show click':function(btn){
         $('#dropdown').slideToggle('fast');
      },
      '#dropdown li click':function(btn){
           var mainmenu_txt = $.trim(btn.text());
           if(mainmenu_txt=='Dashboard'){
             $('#dynamicmenu').hide();
             $('#homemenu').show();
           }
           // else changeMenu(mainmenu_txt);
      },
      '#dynamicmenu li a click':function(btn){
            if(btn.attr('id')!='show' && btn.attr('id')==undefined){
               $('#dynamicmenu li a').removeClass('submenuactive');
                btn.addClass('submenuactive');
                if($("#dropdown").is(':visible')){
                  $("#dropdown").hide();
                }
            }
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
      '{appstate} change':function(el){
        if(el.navigationRequired) traverseSubMenu(el.page);
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

          return isEnable

        },
        url: function(){
            return RinsCommon.RINS_OLD_URL;
        }
    }
});

var changeMenu = function(mainmenu_txt){
    var test = '<li><ul id="dropdown"></ul></li>',addcls;
    var temp ='<li class="show active"><a id="show">'+mainmenu_txt+'<span class="activemenu">></span>'+'</a></li>'+$(test).html();
        $.each(menu,function(i,el){
            if(el.value==mainmenu_txt){
             if(el.submenu!=undefined && el.submenu.length>0){
                $('#dynamicmenu, #dynhide').show();
                $('#homemenu').hide();
                $.each(el.submenu,function(i,el){
                    if(i==0) addcls ='';//submenuactive
                    else addcls ='';
                    if(el.url != undefined){
                      temp+='<li {{isActive '+el.id+'}}><a  class="'+addcls+'" href="'+el.url+'" target="_blank">'+el.value+'</a></li>';
                    } else {
                      temp+='<li {{isActive '+el.id+'}}><a  class="'+addcls+'" href="'+el.id+'">'+el.value+'</a></li>';
                    }
               });
              }
            }
        });



       $('#dynamicmenu').empty().append(temp);
       $('#dropdown').empty().append($('#homemenu').html());
       $( "#dropdown li[name*='"+mainmenu_txt+"']").hide()

};

//traverseSubMenu is need to look for the mainMenu to looked and and sub menu to be selected.
// This will only be trigerred when the appstate.navigationRequired is set true
var traverseSubMenu = function(pageLoad){
  if(pageLoad == "null") return false;

  var mainMenu = "";
  var subMenu = "";


  if(pageLoad == "dashboard"){
    mainMenu = pageLoad;
  }else{
    $.each(menu,function(i,el){
        if(el.submenu != undefined)
        {
            $.each(el.submenu,function(i,el){
              if(el.id == pageLoad){
                subMenu = el.value;
                return false;
              }
            });

          if(subMenu != ""){
            mainMenu = el.value;
            console.log("Page : Main : "+mainMenu+", subMenu:> "+subMenu)
            return false;
          }
        }
    });
  }

  // changeMenu(mainMenu);
  $('#dynamicmenu li a[href$="'+pageLoad+'"]').addClass('submenuactive');

};//------traverseSubMenu: end


var  menu =[
  {
    "id": "dashboard",
   "value": "Dashboard",
   "submenu":[]
  },
  {
  "id": "approvals",
  "value": "Approvals",
   "submenu": [
       {"value": "Accrual Journal Voucher", "id": "accrualjournalvoucher","screenId":11, "url":RinsCommon.RINS_OLD_URL+"accrualJV"},
       {"value": "Accrual Details", "id": "accrualdetails","screenId":12, "url":RinsCommon.RINS_OLD_URL+"accrualDetails"},
       {"value": "Accruals Aging Report", "id": "accrualsagingreport","screenId":13, "url":RinsCommon.RINS_OLD_URL+"accrualsAgingReport"},
       {"value": "Accrual Trueup", "id": "accrualtrueup","screenId":14, "url":RinsCommon.RINS_OLD_URL+"accrualTrueUp"},
       {"value": "Accrual Analysis", "id": "accrualanalysis","screenId":15, "url":RinsCommon.RINS_OLD_URL+"accrualAnalysis"}
   ]
},{
  "id": "invoices",
  "value": "Invoices",
   "submenu": [
       {"value": "Invoice Entry", "id": "create-invoice","screenId":3},
       {"value": "iCSV Entry", "id": "icsv","screenId":4},
       {"value": "Search Invoice", "id": "invoices","screenId":5},
       {"value": "Recon Stats", "id": "recon","screenId":7},
       {"value": "Incoming Other", "id": "reconOther","screenId":8},
       {"value": "On Account", "id": "on-account","screenId":9}
   ]
},{
  "id": "reference",
  "value": "Reference",
   "submenu": [
  //    {"value": "Licensor", "id": "licensor"},
    {"value": "Licensor", "id": "licensor","screenId":16},
      {"value": "Country", "id": "ref-country","screenId":17},
    {"value": "Country Licensor", "id": "ref-licensorcountry","screenId":18},
  {"value": "Pricing Model", "id": "pricing-models","screenId":19}
   ]
},{
  "id": "analytic",
  "value": "Analytics",
   "submenu": [
 {"value": "Analytics", "id": "analytic","screenId":20},
      {"value": "Payment Bundle Review", "id": "payment-bundles","screenId":21},
    {"value": "Claim Review", "id": "claimreview","screenId":22},
  {"value": "Global Revenue", "id": "globalrevenue","screenId":23, "url":RinsCommon.RINS_OLD_URL+"globalRevenue"},
      /*{"value": "Monthly Billings Reconciliation", "id": "monthlybillingsreconciliation"},*/
    {"value": "Unclaimed Summary", "id": "unclaimedsummary","screenId":24, "url":RinsCommon.RINS_OLD_URL+"unClaimedSummary"},
   ]
},{
  "id": "system",
  "value": "System",
   "submenu": [
 {"value": "Job Statistics", "id": "jobstatistics","screenId":25, "url":RinsCommon.RINS_OLD_URL+"jobStatistics"},
      {"value": "Report Downloads", "id": "reportdownloads","screenId":26, "url":RinsCommon.RINS_OLD_URL+"reportDownloads"}
   ]
},{
  "id": "approvalhistory",
  "value": "Approval History",
   "submenu": [
    {"value": "Accrual", "id": "accrual","screenId":27, "url":RinsCommon.RINS_OLD_URL+"accrualApprovalHistory"},
    {"value": "Ref Data", "id": "refdata","screenId":28},
    {"value": "Recon/Payment", "id": "reconpayment","screenId":29, "url":RinsCommon.RINS_OLD_URL+"reconPaymentHistory"},
    {"value": "Sales Report", "id": "salesreport","screenId":30, "url":RinsCommon.RINS_OLD_URL+"salesReportHistory"},
    {"value": "On Account", "id": "onaccount","screenId":31},
    {"value": "Dispute Report", "id": "disputereport","screenId":32, "url":RinsCommon.RINS_OLD_URL+"lineItemHistory"},
    {"value": "Accrual Rerun", "id": "accrualrerun","screenId":33, "url":RinsCommon.RINS_OLD_URL+"accrualRerunHistory"},
   ]
}];
export default headerNavigation;
