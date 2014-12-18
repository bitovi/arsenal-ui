import Component from 'can/component/';

import template from './template.stache!';
import styles from './header-navigation.less!';
import roles from 'models/roles/';
import GlobalParameterBar from 'components/global-parameter-bar/';
import Bookmark from 'components/bookmark/';


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

      Promise.all([
        roles.findAll()

        ]).then(function(values) {

          var role = {
            permissions: values[0]
          };
          self.scope.appstate.userInfo.attr(role);

          console.log("role="+ role);

          self.scope.roles.replace(values[0]);
          var screenId= [] ;
          for(var i = 0, size = role.permissions.length; i < size ; i++)
            {

              screenId.push(role.permissions[i].screenId) ;

            }
            self.scope.attr("allowedScreenId",screenId );
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
        changeMenu(mainmenu_txt);
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
           else changeMenu(mainmenu_txt);


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
                    temp+='<li {{isActive '+el.id+'}}><a  class="'+addcls+'" href="/'+el.id+'">'+el.value+'</a></li>';
               });
              }
            }
        });
       $('#dynamicmenu').empty().append(temp);
       $('#dropdown').empty().append($('#homemenu').html());
       $( "#dropdown li[name*='"+mainmenu_txt+"']").hide()

};
var  menu =[{
    "id": "dashboard",
   "value": "Dashboard",
  },{
  "id": "approvals",
  "value": "Approvals",
   "submenu": [
      {"value": "Accrual Journal Voucher", "id": "accrualjournalvoucher"},
      {"value": "Accrual Details", "id": "accrualdetails"},
      {"value": "Accruals Aging Report", "id": "accrualsagingreport"},
      {"value": "Accrual Trueup", "id": "accrualtrueup"},
       {"value": "Accrual Analysis", "id": "accrualanalysis"}
   ]
},{
  "id": "invoices",
  "value": "Invoices",
   "submenu": [
      {"value": "Invoice Entry", "id": "create-invoice"},
      {"value": "iCSV Entry", "id": "icsv"},
      {"value": "Search Invoice", "id": "invoices"},
      {"value": "Recon Stats", "id": "recon"},
      {"value": "Recon Stats Other", "id": "reconOther"},
      {"value": "On Account", "id": "on-account"}
   ]
},{
  "id": "reference",
  "value": "Reference",
   "submenu": [
  //    {"value": "Licensor", "id": "licensor"},
      {"value": "Licensor", "id": "analytics"},
      {"value": "Country", "id": "ref-country"},
      {"value": "Country Licensor", "id": "ref-licensorcountry"},
      {"value": "Pricing Model", "id": "pricing-models"}
   ]
},{
  "id": "analytic",
  "value": "Analytics",
   "submenu": [
      {"value": "Analytics", "id": "anal"},
      {"value": "Payment Bundle Review", "id": "payment-bundles"},
      {"value": "Claim Review", "id": "claimreview"},
      {"value": "Global Revenue", "id": "globalrevenue"},
      /*{"value": "Monthly Billings Reconciliation", "id": "monthlybillingsreconciliation"},*/
      {"value": "Unclaimed Summary", "id": "unclaimedsummary"},
   ]
},{
  "id": "system",
  "value": "System",
   "submenu": [
      {"value": "Job Statistics", "id": "jobstatistics"},
      {"value": "Report Downloads", "id": "reportdownloads"}
   ]
},{
  "id": "approvalhistory",
  "value": "Approval History",
   "submenu": [
      {"value": "Accrual", "id": "accrual"},
      {"value": "Ref Data", "id": "refdata"},
      {"value": "Recon/Payment", "id": "reconpayment"},
      {"value": "Sales Report", "id": "salesreport"},
      /*{"value": "Payment Report", "id": "paymentreport"},
      {"value": "Unclaimed Report", "id": "unclaimedreport"},*/
      {"value": "On Account", "id": "onaccount"},
      {"value": "Dispute Report", "id": "disputereport"},
      {"value": "Accrual Rerun", "id": "accrualrerun"},
   ]
}];
export default headerNavigation;
