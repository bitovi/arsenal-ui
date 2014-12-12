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
          document.getElementById("regionsFilter").selectedIndex = 2;
      },
     '{periodFrom} change': function(el, ev) {
         var comp ='from';
         this.scope.attr('errorMessage','');
         console.log("Period: "+periodWidgetHelper.getFiscalPeriod(this.scope.attr('periodFrom')[0]));
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
        self.scope.licensors.replace(values[1]);
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
      if(selected != null)
        this.scope.appstate.attr('contentType', selected);
      else
        this.scope.appstate.removeAttr('contentType');
    } ,
    '#globalSearch click':function(){       
      var self = this;
//      self.scope.appstate.attr('periodFrom', $('#periodFrom').val());
//      self.scope.appstate.attr('periodTo', $('#periodTo').val());
      var message = validateFilters(this.scope.appstate)
      self.scope.attr('errorMessage',message);

      if(message.length==0){
        if(this.scope.appstate.attr('globalSearch')){
           this.scope.appstate.attr('globalSearch', false);
        }else{
          this.scope.appstate.attr('globalSearch', true);
        }
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
   //var message = showErrorMsg(periodFrom,periodTo,appstate.attr('periodType'));
    if(periodFrom.length == 0 || periodFrom.trim().length == 0){
      return 'Invalid PeriodFrom !';
    }else if(periodTo.length == 0 || periodTo.trim().length == 0){
      return 'Invalid PeriodTo !';
    }else{
      return '';
    }
}

var showErrorMsg = function(periodFrom,periodTo){
       var showFlg=false;
       var from = periodFrom,to = periodTo; 
       if(from!=undefined &&  to!=undefined){
            
          var periodObj = { "P01":"09", "P02":"10", "P03":"11", "P04":"00", "P05":"01", "P06":"02", "P07":"03", "P08":"04", "P09":"05", "P10":"06", "P11":"07", "P12":"08" };
         
          var fromYear = parseInt(from.slice(-2));
          var toYear = parseInt(to.slice(-2));

          var yearFrom = "20" + fromYear;
          var yearTo = "20" + toYear;

          var monthFrom = periodFrom.substr(0, 3);
          var monthTo = periodTo.substr(0, 3);

          var fromDate = "", toDate = "";

          if (periodObj.hasOwnProperty(monthFrom)) {
            fromDate = yearFrom + ", " + periodObj[monthFrom] + ", 01";
          }

          if (periodObj.hasOwnProperty(monthTo)) {
            toDate = yearTo + ", " + periodObj[monthTo] + ", 01";
          }

          var mnthDiff = monthDiff(new Date(fromDate), new Date(toDate));
   
          //Condition to check the year
          if ( toYear < fromYear) showFlg = true;

          //Condition to check the month (to be in range of 12 )
          if (mnthDiff > 11) showFlg = true;

          //Condition to check the quaters(to be in range of 12 )
          var quarterFrom = periodFrom.substr(0,2); //Q1, Q2, Q3, Q4
          var quarterTo = periodTo.substr(0,2); //Q1, Q2, Q3, Q4

          if( (quarterFrom === quarterTo) && (fromYear !== toYear) ) showFlg = true; //condition: Q1-2014 != Q1-2015

          if (quarterFrom === "Q1" && (fromYear !== toYear)) showFlg = true; //condition: from: Q1 && 2014 != 2015

          var qFrom = parseInt(quarterFrom.slice(-1));
          var qTo = parseInt(quarterTo.slice(-1));

          var qArray = [2,3,4];
          
          if ( $.inArray(qFrom, qArray) && ((toYear - fromYear) == 1) && (qTo === (qFrom - 1)) ) showFlg = true;//condition: fromQ (2,3,4) && 2015 - 2014 === 1 && toQ === (fromQ - 1)

        }
        if(showFlg){
          return 'Invalid Period !';
        }else{
          return "";
        }
          
}

function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}


export default GlobalParameterBar;
