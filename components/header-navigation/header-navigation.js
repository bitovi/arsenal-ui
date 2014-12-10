import Component from 'can/component/';

import template from './template.stache!';
import styles from './header-navigation.less!';

import GlobalParameterBar from 'components/global-parameter-bar/';


var headerNavigation = Component.extend({
    tag: 'header-navigation',
    template: template,
    scope: {
        appstate: undefined,// this gets passed in
        show:true
    },
    events:{
     '#homemenu li a click':function(btn){
        var mainmenu_txt = btn.text();
        if(btn.attr('id')){
          $('#dynamicmenu').hide();
          $('#homemenu').show();

        }
        changeMenu(mainmenu_txt);
      },
      '#show click':function(btn){
         $('#dropdown').slideToggle('slow');
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
            }
      }
  },
    helpers: {
        isActive: function(pageName) { console.log(pageName);
            $('.popover').popover('destroy');/*To remove popover when going to other page*/
            return 'class="' + (pageName === this.appstate.attr('page') ? 'active' : '') + '"'
        },
        renderGlobalSearch: function(){
            //Used for appear/di-appear of the Global search, whic is based appstate.renderGlobalSearch
            return 'style="' + (this.appstate.attr('renderGlobalSearch') ? '' : 'display:none') + '"'
        }
    }
});
var changeMenu = function(mainmenu_txt){
    var test = '<li><ul id="dropdown"></ul></li>',addcls;
    var temp ='<li class="show active"><a id="show">'+mainmenu_txt+'</a></li>'+$(test).html();
        $.each(menu,function(i,el){
            if(el.value==mainmenu_txt){
             if(el.submenu!=undefined && el.submenu.length>0){
                $('#dynamicmenu, #dynhide').show();
                $('#homemenu').hide();
                $.each(el.submenu,function(i,el){
                    if(i==0) addcls ='submenuactive';
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
      {"value": "Licensor", "id": "licensor"},
      {"value": "Entity", "id": "entity"},
      {"value": "Country", "id": "ref-country"},
      {"value": "Licensor Entity", "id": "licensorentity"},
      {"value": "Pricing Model", "id": "pricing-models"}
   ]
},{
  "id": "analytics",
  "value": "Analytics",
   "submenu": [
      {"value": "Payment Bundle Review", "id": "paymentbundlereview"},
      {"value": "Claim Review", "id": "claimreview"},
      {"value": "Global Revenue", "id": "globalrevenue"},
      /*{"value": "Monthly Billings Reconciliation", "id": "monthlybillingsreconciliation"},*/
      {"value": "Unclaimed Stats Config", "id": "unclaimedstatsconfig"},
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
