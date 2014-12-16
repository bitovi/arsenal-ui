import Component from 'can/component/';

// Models
import StoreType from 'models/common/store-type/';
import Region from 'models/common/region/';
import Country from 'models/common/country/';
import Licensor from 'models/common/licensor/';
import ContentType from 'models/common/content-type/';
import PeriodFrom from 'models/common/periodFrom/';
import PeriodTo from 'models/common/periodTo/';
import UserReq from 'utils/request/';

import bootstrapmultiselect from 'bootstrap-multiselect';
import css_bootstrapmultiselect from 'bootstrap-multiselect.css!';

import template from './template.stache!';
import styles from './global-parameter-bar.less!';

import periodCalendar from 'components/period-calendar/';
import periodWidgetHelper from 'utils/periodWidgetHelpers';
import moment from 'moment';

var GlobalParameterBar = Component.extend({
  tag: 'global-parameter-bar',
  template: template,
  scope: {
    appstate: undefined, // this gets passed in
    periodFrom: [],
    periodTo : [],
    storeTypes: [],
    regions: [],
    countries: [],
    licensors: [],
    allContentTypes: [],
    contentTypes:[],
    selectedperiod:[],
    errorMessage:"@",
  },
  helpers: {
    isSelected: function(parameterName, modelID) {
      if(this.appstate.attr(parameterName) && this.appstate.attr(parameterName).id === modelID()) {
        return 'selected="selected"';
      } else {
        return '';
      }
    }
  },
  events: {
     '.updatePeroid focus':function(el){
       $(el).closest('.calendarcls').find('.box-modal').show().trigger( "focus" );
     },
      '{selectedperiod} change':function(val){
          val[0].which=='periodFrom' ? this.scope.periodFrom.replace(val[0].value):this.scope.periodTo.replace(val[0].value);
       },
     'inserted': function(){
      var self = this;
          document.getElementById("regionsFilter").selectedIndex = 2;
          var periodFrom =getDefaultPeriodFrom('');
          var periodTo = getDefaultPeriodTo();
          $('#periodFrom').val(periodFrom);
         $('#periodTo').val(periodTo);
          self.scope.appstate.attr('periodFrom', periodWidgetHelper.getFiscalPeriod(periodFrom));
          self.scope.appstate.attr('periodTo', periodWidgetHelper.getFiscalPeriod(periodTo));
          this.scope.appstate.attr('periodType','P');
      },
     '{periodFrom} change': function(el, ev) {
      //console.log("period from change "+ this.scope.appstate.attr('periodFrom'));
         var comp ='from';
         this.scope.attr('errorMessage','');
         this.scope.appstate.attr('periodFrom', periodWidgetHelper.getFiscalPeriod(this.scope.attr('periodFrom')[0]));
         this.scope.appstate.attr('periodType',periodWidgetHelper.getPeriodType(this.scope.attr('periodFrom')[0]));
         this.scope.attr('errorMessage',showErrorMsg(this.scope.attr('periodFrom')[0],this.scope.attr('periodTo')[0]));
     },
     '{periodTo} change': function(el, ev) {
          var comp ='to';
          this.scope.attr('errorMessage','');
          this.scope.appstate.attr('periodTo', periodWidgetHelper.getFiscalPeriod(this.scope.attr('periodTo')[0]));
          this.scope.attr('errorMessage',showErrorMsg(this.scope.attr('periodFrom')[0],this.scope.attr('periodTo')[0]));
     },
    '#store-type select change': function(el, ev) {
      var selected = $(el[0].selectedOptions).data('storetype');
      this.scope.appstate.attr('storeType', selected);

      /* Change the Content types based on Store Type */
      var allContentTypes = this.scope.allContentTypes.attr();
      if(selected!=undefined){
        var newContentTypes = [];
        for(var i=0;i<allContentTypes.length;i++){
          if(allContentTypes[i]["serviceTypeId"]==selected.id){
            newContentTypes.push(allContentTypes[i]);
          }
        }
        this.scope.contentTypes.replace(newContentTypes);
      } else {
        this.scope.contentTypes.replace(allContentTypes);
      }
      setTimeout(function(){
            $("#contentTypesFilter").multiselect('rebuild');
      },1000);

      /* This is to reset the contentType attr in 'appstate' variable  */
      this.scope.appstate.removeAttr('contentType');
    },
    '#region select change': function(el, ev) {
      var self = this;
      self.scope.attr('errorMessage','');
      var selected = $(el[0].selectedOptions).data('region');
      self.scope.appstate.attr('region', selected);
      //console.log("region id is "+JSON.stringify(selected.id));
      Promise.all([
        Country.findAll(UserReq.formRequestDetails({"regionId":selected.id})),
        Licensor.findAll(UserReq.formRequestDetails({"regionId":selected.id}))
      ]).then(function(values) {
        if(values[0].length == 0 && values[1].length==0){
          self.scope.attr('errorMessage',' No data available for search criteria !');
        }
        self.scope.countries.replace(values[0]);
        self.scope.licensors.replace(values[1]["entities"]);
        setTimeout(function(){
              $("#countriesFilter").multiselect('rebuild');
              $("#licensorsFilter").multiselect('rebuild');
        },2000);
      });

    },
    '#country select change': function(el, ev) {

      //var selected = $(el[0].selectedOptions).data('country');
      //console.log("Country sel id is "+$(el[0]).val());
      var selected = $(el[0]).val();
      if(selected != null)
        this.scope.appstate.attr('country', selected);
      else
        this.scope.appstate.removeAttr('country');
    },
    '#licensor select change': function(el, ev) {
      //var selected = $(el[0].selectedOptions).data('licensor');
      var selected = $(el[0]).val();
      if(selected != null)
        this.scope.appstate.attr('licensor', selected);
      else
        this.scope.appstate.removeAttr('licensor');
    },
    '#contentType select change': function(el, ev) {
      //var selected = $(el[0].selectedOptions).data('contenttype');
      var selected = $(el[0]).val();
      var formatSelected = [];

      if(selected != null){
        for(var i=0;i<selected.length;i++){
            formatSelected.push(selected[i].split(":")[0]);
        }
        this.scope.appstate.attr('contentType', formatSelected);
      } else
        this.scope.appstate.removeAttr('contentType');
    } ,
    '#globalSearch click':function(){
      var self = this;
//      self.scope.appstate.attr('periodFrom', $('#periodFrom').val());
//      self.scope.appstate.attr('periodTo', $('#periodTo').val());
      var message = validateFilters(self.scope.appstate)
      self.scope.attr('errorMessage',message);

      if(message.length==0){
        if(this.scope.appstate.attr('globalSearch')){
           this.scope.appstate.attr('globalSearch', false);
        }else{
          this.scope.appstate.attr('globalSearch', true);
        }
      }

    },
    '{scope.appstate} page': function() {
      if(this.scope.appstate.attr('page') == 'on-account'){
        var quart = getDefaultPeriodFrom('ONACCOUNT');
         $('#periodFrom').val(quart);
         $('#periodTo').val(quart);
         this.scope.appstate.attr('periodFrom', periodWidgetHelper.getFiscalPeriod(quart));
        this.scope.appstate.attr('periodTo', periodWidgetHelper.getFiscalPeriod(quart));
        this.scope.appstate.attr('periodType','Q');
      }
    }
  },
  init: function() {
    var self = this;
    var genObj = {};
    Promise.all([
      StoreType.findAll(UserReq.formRequestDetails(genObj)),
      Region.findAll(UserReq.formRequestDetails(genObj)),
      Country.findAll(UserReq.formRequestDetails(genObj)),
      Licensor.findAll(UserReq.formRequestDetails(genObj)),
      ContentType.findAll(UserReq.formRequestDetails(genObj))
     ]).then(function(values) {
      self.scope.storeTypes.replace(values[0]);
      self.scope.regions.replace(values[1]);
      self.scope.countries.replace(values[2]);
      self.scope.licensors.replace(values[3]["entities"][0]);
      /* allContentTypes - Holds all content types, this is used for "On change store type, load respective Content types"
         contentTypes - holds the values to be displayed in drop down box */
      self.scope.allContentTypes.replace(values[4]["contentTypes"]); 
      self.scope.contentTypes.replace(values[4]["contentTypes"]);
      //self.scope.periodFrom.replace(values[5]);
      //self.scope.periodTo.replace(values[6]);
      

        setTimeout(function(){


          $("#countriesFilter").multiselect({
              numberDisplayed: 1,
              includeSelectAllOption: true,
              selectAllText: 'Select All',
              maxHeight: 200,
              onChange: function(option, checked, select) {
                 // $("#country .multiselect-all .checkbox").find("input[type='checkbox']").is(':checked')?
                 //   $("#country .dropdown-menu li").addClass("active"):$("#country .dropdown-menu li").removeClass("active");
                 $("#countriesFilter").multiselect("refresh");
             }

         });
          $("#licensorsFilter").multiselect({
              numberDisplayed: 1,
              includeSelectAllOption: true,
              selectAllText: 'Select All',
              maxHeight: 200,
              onChange: function(option, checked, select) {
               //  $("#licensor .multiselect-all .checkbox").find("input[type='checkbox']").is(':checked')?
               //    $("#licensor .dropdown-menu li").addClass("active"):$("#licensor .dropdown-menu li").removeClass("active");
               $("#licensorsFilter").multiselect("refresh");
             }

         });
          $("#contentTypesFilter").multiselect({
              numberDisplayed: 1,
              includeSelectAllOption: true,
              selectAllText: 'Select All',
              maxHeight: 200,
              onChange: function(option, checked, select) {
                 //$("#contentType .multiselect-all .checkbox").find("input[type='checkbox']").is(':checked')?
                 //  $("#contentType .dropdown-menu li").addClass("active"):$("#contentType .dropdown-menu li").removeClass("active");
                 $("#contentTypesFilter").multiselect("refresh");
             }

         });
        },2000);
    });
  }
});

var validateFilters = function(appstate){
    var periodFrom = appstate.attr('periodFrom');
    var periodTo = appstate.attr('periodTo');
    var periodType = appstate.attr('periodType');
    var message = showErrorMsg(periodWidgetHelper.getDisplayPeriod(periodFrom,periodType),periodWidgetHelper.getDisplayPeriod(periodTo,periodType));
    if(periodFrom.length == 0 || periodFrom.trim().length == 0){
      return 'Invalid PeriodFrom !';
    }else if(periodTo.length == 0 || periodTo.trim().length == 0){
      return 'Invalid PeriodTo !';
    }else if(message != 0){
      return message;
    }else{
      return '';
    }
}
var getDefaultPeriodFrom = function(from){
    var defaultDate = moment().month(moment().month()-3);
    var year = defaultDate.year()+'';
    if(from == 'ONACCOUNT'){
      return 'Q'+defaultDate.quarter()+'FY'+year.substring(2,year.length);
    }
    var periodFrom = periodWidgetHelper.quarterToPeriod('Q'+defaultDate.quarter());
   return 'P'+periodFrom+'FY'+year.substring(2,year.length);
}
var getDefaultPeriodTo = function(){
     var toPeriods={
    "Q1":"03",
    "Q2":"06",
    "Q3":"09",
    "Q4":"12"
  };
   var defaultDate = moment().month(moment().month()-3);
    var year = defaultDate.year()+'';
    var periodTo = toPeriods['Q'+defaultDate.quarter()];
   return 'P'+periodTo+'FY'+year.substring(2,year.length);
}
var validateFiscalPeriod = function(periodFrom, periodTo){
    var qFrom = periodFrom.substring(1, 2);
    var qTo = periodTO.substring(1, 2);
    var yearFrom = periodFrom.substring(periodFrom.length, periodFrom.length-2);
    var yearTo = periodTO.substring(periodTO.length, periodTO.length-2); 
}
var showErrorMsg = function(periodFrom, periodTo) {

 var flag = false;
 var from = periodFrom || false;
 var to = periodTo || false;
 var message1 = 'Period from is greater than period to !';
 var message2 = 'Please select one year of data !';

 if (from && to) {
   var fromYear = parseInt(from.slice(-2));
   var toYear = parseInt(to.slice(-2));
   var yearDiff = parseInt(toYear - fromYear);
    if(fromYear > toYear){
      return message1;
    }

    if(from.charAt(0) === "P" && to.charAt(0) === "P"){
      var periodFromValue = periodFrom.substr(1, 2);
      var periodToValue = periodTo.substr(1, 2);
      if(yearDiff >= 1 && periodFromValue == periodToValue){
        return message2; 
      }else if(yearDiff == 0  && periodFromValue > periodToValue){
        return message1; 
      }    
   } else if (from.charAt(0) === "Q" && to.charAt(0) === "Q"){
      var quarterFromValue = periodFrom.substr(1, 1);
      var quarterToValue = periodTo.substr(1, 1);
      if(yearDiff >= 1 && quarterFromValue == quarterToValue){
        //if(quarterFromValue >= quarterToValue ){
          return message2;
        //}
      }else if( yearDiff == 0 && quarterFromValue > quarterToValue){
        return message1;
      }
   }

   // var yearDiff = parseInt(toYear - fromYear);

   // if (yearDiff > 1 || yearDiff < 0) flag = true;

   // if (!flag && from.charAt(0) === "P" && to.charAt(0) === "P") {

   //   var periodFromValue = periodFrom.substr(1, 2);
   //   var periodToValue = periodTo.substr(1, 2);

   //   flag = (yearDiff) ? (periodFromValue <= periodToValue) : (periodFromValue > periodToValue);

   // } else if (!flag && from.charAt(0) === "Q" && to.charAt(0) === "Q") {

   //   var quarterFromValue = periodFrom.substr(1, 1);
   //   var quarterToValue = periodTo.substr(1, 1);

   //   flag = (yearDiff) ? (quarterFromValue <= quarterToValue) : (quarterFromValue > quarterToValue);

   // }

 }
 return "";
}



export default GlobalParameterBar;
