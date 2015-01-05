import can from 'can/';
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
import token from 'models/common/token/';

import bootstrapmultiselect from 'bootstrap-multiselect';
import css_bootstrapmultiselect from 'bootstrap-multiselect.css!';
import commonUtils from 'utils/commonUtils';

import DefaultGlobalParameters from './default-global-parameter';
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
    periodTo: [],
    storeTypes: [],
    regions: [],
    countries: [],
    licensors: [],
    allContentTypes: [],
    contentTypes: [],
    selectedperiod: [],
    errorMessage: "@",

    changesToApply: {},
    applyChanges: function(changes, appstate) {
      can.batch.start();
      appstate.attr({
        periodFrom: changes.periodFrom,
        periodTo: changes.periodTo,
        periodType: changes.periodType,
        storeType: changes.storeType,
        region: changes.region
      });

      ['contentType', 'country', 'licensor'].forEach(function(prop) {
        if(! appstate[prop]) {
          appstate.attr(prop, []);
        }
        if(! changes[prop]) {
          changes.attr(prop, []);
        }
        appstate[prop].replace(changes[prop]);
      });
      can.batch.stop();
    }
  },
  helpers: {
    isSelected: function(parameterName, modelID) {
      if (this.changesToApply.attr(parameterName) && this.changesToApply.attr(parameterName).id === modelID()) {
        return 'selected="selected"';
      } else {
        return '';
      }
    }
  },
  events: { 
    '.updatePeriod focus': function(el) {
      $(el).closest('.calendarcls').find('.box-modal').show().trigger("focus");     
    },
    '{selectedperiod} change': function(val) {
      val[0].which == 'periodFrom' ? this.scope.periodFrom.replace(val[0].value) : this.scope.periodTo.replace(val[0].value);
    },
    'inserted': function() {
      var self = this;
      this.scope.applyChanges(this.scope.appstate, this.scope.changesToApply); // this looks backwards but it's right, I promise.
                                                                    // We need to set up changesToApply for the template to key off of
    },
    '{periodFrom} change': function(el, ev) {
      //console.log("period from change "+ this.scope.appstate.attr('periodFrom'));
      var comp = 'from';
      this.scope.attr('errorMessage', '');
      this.scope.changesToApply.attr('periodFrom', periodWidgetHelper.getFiscalPeriod(this.scope.attr('periodFrom')[0]));
      this.scope.changesToApply.attr('periodFromType', periodWidgetHelper.getPeriodType(this.scope.attr('periodFrom')[0]));

      var periodToValue = this.scope.attr('periodTo')[0] !== "undefined" ? this.scope.attr('periodTo')[0] : $('#periodFrom').val();

      this.scope.attr('errorMessage', showErrorMsg(this.scope.attr('periodFrom')[0], periodToValue));
    },
    '{periodTo} change': function(el, ev) {
      var comp = 'to';
      this.scope.attr('errorMessage', '');
      this.scope.changesToApply.attr('periodTo', periodWidgetHelper.getFiscalPeriod(this.scope.attr('periodTo')[0]));
      this.scope.changesToApply.attr('periodToType', periodWidgetHelper.getPeriodType(this.scope.attr('periodTo')[0]));

      var periodFromValue = this.scope.attr('periodFrom')[0] !== "undefined" ? this.scope.attr('periodFrom')[0] : $('#periodFrom').val();

      this.scope.attr('errorMessage', showErrorMsg(periodFromValue, this.scope.attr('periodTo')[0]));
    },
    '#store-type select change': function(el, ev) {
      var selected = $(el[0].selectedOptions).data('storetype');
      this.scope.changesToApply.attr('storeType', selected);

      /* Change the Content types based on Store Type */
      var allContentTypes = this.scope.allContentTypes.attr();
      var newContentTypes = [];
      if (selected != undefined) {
        for (var i = 0; i < allContentTypes.length; i++) {
          if (allContentTypes[i]["serviceTypeId"] == selected.id) {
            newContentTypes.push(allContentTypes[i]);
          }
        }
        this.scope.contentTypes.replace(newContentTypes);
      } else {
        this.scope.contentTypes.replace(allContentTypes);
      }
      setTimeout(function() {
        $("#contentTypesFilter").multiselect('rebuild');

        /* To show 'Select All' only if more than one options available */
        if(newContentTypes.length<=1)
          $("input[name='selAllContentType']").closest('li').hide();
        else
          $("input[name='selAllContentType']").closest('li').show();
      }, 1000);
      /* This is to reset the contentType attr in 'appstate' variable  */
      this.scope.changesToApply.removeAttr('contentType');
    },
    '#region select change': function(el, ev) {
      var self = this;
      self.scope.attr('errorMessage', '');
      var selected = $(el[0].selectedOptions).data('region');
      self.scope.changesToApply.attr('region', selected);
      //console.log("region id is "+JSON.stringify(selected));
      if(selected != undefined){
        Promise.all([
          Country.findAll(UserReq.formRequestDetails({
            "regionId": selected.id
          })),
          Licensor.findAll(UserReq.formRequestDetails({
            "regionId": selected.id
          }))
        ]).then(function(values) {
          //console.log(JSON.stringify(values[1]["entities"][0]['entities'].attr()));
          if (values[0].length == 0 && values[1].length == 0) {
            self.scope.attr('errorMessage', ' No data available for search criteria !');
          }
          self.scope.countries.replace(values[0]);
          self.scope.licensors.replace(values[1]["entities"]);
          $("#countriesFilter").multiselect('rebuild');
          $("#licensorsFilter").multiselect('rebuild');

          /* To show 'Select All' option only if more than one options available */
          if(values[0].length<=1)
            $("input[name='selAllCountry']").closest('li').hide();
          else
            $("input[name='selAllCountry']").closest('li').show();

          if(values[1]["entities"][0]['entities'].length<=1)
            $("input[name='selAllLicensor']").closest('li').hide();
          else
            $("input[name='selAllLicensor']").closest('li').show();
        });
      } else {
        self.scope.countries.replace([]);
        self.scope.licensors.replace([]);
        $("#countriesFilter").multiselect('rebuild');
        $("#licensorsFilter").multiselect('rebuild');
      }
      /* This is to reset the country & licensor attr in 'appstate' variable  */
      this.scope.changesToApply.removeAttr('country');
      this.scope.changesToApply.removeAttr('licensor');

    },
    '#country select change': function(el, ev) {

      //var selected = $(el[0].selectedOptions).data('country');
      console.log("Country sel id is "+$(el[0]).val());
      var selected = $(el[0]).val();
      if (selected != null) {
        this.scope.changesToApply.attr('country', selected);
      } else {
        this.scope.changesToApply.removeAttr('country');
      }
      if($("input[name='selAllCountry']").prop("checked"))
         this.scope.changesToApply.attr('country', ["ALL"]);
    },
    '#licensor select change': function(el, ev) {
      //var selected = $(el[0].selectedOptions).data('licensor');
      var selected = $(el[0]).val();
      if (selected != null)
        this.scope.changesToApply.attr('licensor', selected);
      else
        this.scope.changesToApply.removeAttr('licensor');

      if($("input[name='selAllLicensor']").prop("checked"))
         this.scope.changesToApply.attr('licensor', ["-1"]);
    },
    '#contentType select change': function(el, ev) {
      //var selected = $(el[0].selectedOptions).data('contenttype');
      var selected = $(el[0]).val();
      var formatSelected = [];

      if (selected != null) {
        for (var i = 0; i < selected.length; i++) {
          formatSelected.push(selected[i].split(":")[0]);
        }
        this.scope.changesToApply.attr('contentType', formatSelected);
      } else
        this.scope.changesToApply.removeAttr('contentType');

      if($("input[name='selAllContentType']").prop("checked"))
       this.scope.changesToApply.attr('contentType', ["-1"]);
    },
    '#globalSearch click': function() {
      var self = this;
      //      self.scope.appstate.attr('periodFrom', $('#periodFrom').val());
      //      self.scope.appstate.attr('periodTo', $('#periodTo').val());
      //$('.errorOnAccount').html('');
      var message = validateFilters(self.scope.changesToApply, false, true, false, false, false)
      self.scope.attr('errorMessage', message);

      if (message.length == 0) {
        this.scope.applyChanges(this.scope.changesToApply, this.scope.appstate);
        //this.scope.appstate.attr('globalSearch', !!this.scope.appstate.globalSearch);
        commonUtils.triggerGlobalSearch();
      }

    },
    '{scope.appstate} page': function() {
      if (this.scope.appstate.attr('page') == 'on-account' && this.scope.appstate.attr('periodType') != 'Q') {
        var quart = getDefaultPeriodFrom('ONACCOUNT');
        $('#periodFrom').val(quart);
        $('#periodTo').val(quart);
        // this.scope.appstate.attr('periodFrom', periodWidgetHelper.getFiscalPeriod(quart));
        // this.scope.appstate.attr('periodTo', periodWidgetHelper.getFiscalPeriod(quart));
        // this.scope.appstate.attr('periodType', 'Q');
        this.scope.changesToApply.attr('periodFrom', periodWidgetHelper.getFiscalPeriod(quart));
        this.scope.changesToApply.attr('periodTo', periodWidgetHelper.getFiscalPeriod(quart));
        this.scope.changesToApply.attr('periodType', 'Q');
      }
    },
    "#periodFrom blur":function(el,ev){
      var self = this;
      var message ='';
      if(isDate(el.val())){
        self.scope.changesToApply.attr('periodFrom', periodWidgetHelper.getFiscalPeriod(el.val()));
        self.scope.changesToApply.attr('periodType', periodWidgetHelper.getPeriodType(el.val()));
      }else{
          message = 'Invalid Period From';
      }
       self.scope.attr('errorMessage', message);
    },
    '#periodFrom keydown':function(el,ev){
      //$('.box-modal').hide();
      $(el).closest('.calendarcls').find('.box-modal').hide();
    },
    "#periodTo blur":function(el,ev){
      var self = this;
      var message ='';
      if(isDate(el.val())){
        var periodFrom=$('#periodFrom').val();
        var periodTo=el.val();
        var periodFromType = periodWidgetHelper.getPeriodType(periodFrom);
        var periodToType = periodWidgetHelper.getPeriodType(periodTo)
        if(periodFromType == periodToType){
          message = showErrorMsg(periodFrom,periodTo);
          if(message.length <= 0){
            self.scope.changesToApply.attr('periodTo', periodWidgetHelper.getFiscalPeriod(el.val()));
          }
        }else{
          message = 'Please select the similar type for periodFrom and periodTo';
        }
      }else{
        message = 'Invalid Period To';
      }
      self.scope.attr('errorMessage', message);
    },
    '#periodTo keydown':function(el,ev){
      //$('.box-modal').hide();
      $(el).closest('.calendarcls').find('.box-modal').hide();
    }
  },
  init: function() {
    var self = this;
    var genObj = {};
    var reqObj = {};
    if(DefaultGlobalParameters.Region!=undefined && DefaultGlobalParameters.Region!=""){
      reqObj.regionId = DefaultGlobalParameters.Region.id;
    }

    token.findAll();

    Promise.all([
      StoreType.findAll(UserReq.formRequestDetails(genObj)),
      Region.findAll(UserReq.formRequestDetails(genObj)),
      Country.findAll(UserReq.formRequestDetails(reqObj)),
      Licensor.findAll(UserReq.formRequestDetails(reqObj)),
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

      setTimeout(function() {

        $("#countriesFilter").multiselect({
          numberDisplayed: 1,
          includeSelectAllOption: true,
          selectAllText: 'Select All',
          //selectAllValue: 'selectAll',
          selectAllName: 'selAllCountry',
          maxHeight: 200,
          onChange: function(option, checked, select) {
            $("#countriesFilter").multiselect("refresh");
          }

        });


        $("#licensorsFilter").multiselect({
          numberDisplayed: 1,
          includeSelectAllOption: true,
          selectAllText: 'Select All',
          //selectAllValue: 'selectAll',
          selectAllName: 'selAllLicensor',
          maxHeight: 200,
          onChange: function(option, checked, select) {
            $("#licensorsFilter").multiselect("refresh");
          }

        });
        $("#contentTypesFilter").multiselect({
          numberDisplayed: 1,
          includeSelectAllOption: true,
          selectAllText: 'Select All',
          //selectAllValue: 'selectAll',
          selectAllName: 'selAllContentType',
          maxHeight: 200,
          onChange: function(option, checked, select) {
            $("#contentTypesFilter").multiselect("refresh");
          }

        });

        /* This is to set default global parameter values to appstate scope variable Starts here*/
          $('#periodFrom').val(DefaultGlobalParameters.PeriodFrom);
          $('#periodTo').val(DefaultGlobalParameters.PeriodTo);
          $('#storeTypesFilter').val(DefaultGlobalParameters.StoreType.value);
          $('#regionsFilter').val(DefaultGlobalParameters.Region.value);


          var defCountry = DefaultGlobalParameters.attr('Country');
          if(defCountry=="ALL" || defCountry=="-1"){
            $("#countriesFilter").multiselect('selectAll', false);
            $('#countriesFilter').multiselect('updateButtonText');
            setTimeout(function(){
              $("input[name='selAllCountry']").prop("checked",true);
              $("input[name='selAllCountry']").closest('li').addClass("active");
            }, 1000);
          } else {
            $("#countriesFilter").multiselect('select', DefaultGlobalParameters.Country.attr());
          }
          $("#countriesFilter").multiselect('rebuild');

          var defLicensor = DefaultGlobalParameters.attr('Licensor');
          if(defLicensor=="ALL" || defLicensor=="-1"){
            $("#licensorsFilter").multiselect('selectAll', false);
            $('#licensorsFilter').multiselect('updateButtonText');
            setTimeout(function(){
              $("input[name='selAllLicensor']").prop("checked",true);
              $("input[name='selAllLicensor']").closest('li').addClass("active");
            }, 1000);
          } else {
            $("#licensorsFilter").multiselect('select', DefaultGlobalParameters.Licensor.attr());
          }
          $("#licensorsFilter").multiselect('rebuild');

          setTimeout(function(){
            var allContentTypes = self.scope.allContentTypes.attr();
            if (DefaultGlobalParameters.attr("StoreType").id != "") {
              var newContentTypes = [];
              for (var i = 0; i < allContentTypes.length; i++) {
                if (allContentTypes[i]["serviceTypeId"] == DefaultGlobalParameters.attr("StoreType").id) {
                  newContentTypes.push(allContentTypes[i]);
                }
              }
              self.scope.contentTypes.replace(newContentTypes);
            }
            $("#contentTypesFilter").multiselect('rebuild');
            var defContentType = DefaultGlobalParameters.attr('ContentType');
            if(defContentType=="ALL" || defContentType=="-1"){
              $("#contentTypesFilter").multiselect('selectAll', false);
              $('#contentTypesFilter').multiselect('updateButtonText');
              setTimeout(function(){
                $("input[name='selAllContentType']").prop("checked",true);
                $("input[name='selAllContentType']").closest('li').addClass("active");
              }, 1000);
            } else {
              $("#contentTypesFilter").multiselect('select', DefaultGlobalParameters.ContentType.attr());
            }
            $("#contentTypesFilter").multiselect('rebuild');
            var selectedContentType = $("#contentTypesFilter").val();
            var formatContentType = [];
            if (selectedContentType != null) {
              for (var i = 0; i < selectedContentType.length; i++) {
                formatContentType.push(selectedContentType[i].split(":")[0]);
              }
            }

            self.scope.changesToApply.attr('periodFrom', periodWidgetHelper.getFiscalPeriod(DefaultGlobalParameters.PeriodFrom).toString());
            self.scope.changesToApply.attr('periodType', periodWidgetHelper.getPeriodType(DefaultGlobalParameters.PeriodFrom));
            self.scope.changesToApply.attr('periodFromType', periodWidgetHelper.getPeriodType(DefaultGlobalParameters.PeriodFrom));
            self.scope.changesToApply.attr('periodTo', periodWidgetHelper.getFiscalPeriod(DefaultGlobalParameters.PeriodTo));
            self.scope.changesToApply.attr('periodToType', periodWidgetHelper.getPeriodType(DefaultGlobalParameters.PeriodTo));
            self.scope.changesToApply.attr('storeType', DefaultGlobalParameters.StoreType);
            self.scope.changesToApply.attr('region', DefaultGlobalParameters.Region);
            if(defCountry=="ALL" || defCountry=="-1")
              self.scope.changesToApply.attr('country').replace(["ALL"]);
            else 
              self.scope.changesToApply.attr('country').replace($("#countriesFilter").val());

            if(defLicensor=="ALL" || defLicensor=="-1")
              self.scope.changesToApply.attr('licensor').replace(["-1"]);
            else 
              self.scope.changesToApply.attr('licensor').replace($("#licensorsFilter").val());

            if(defContentType=="ALL" || defContentType=="-1")
              self.scope.changesToApply.attr('contentType').replace(["-1"]);
            else 
              self.scope.changesToApply.attr('contentType').replace(formatContentType);

            self.scope.applyChanges(self.scope.changesToApply, self.scope.appstate);
            //console.log("APpp state & ChangesTOAPPLY is "+JSON.stringify(self.scope.appstate.attr())+","+JSON.stringify(self.scope.changesToApply.attr()));
          }, 1000);

          /* Setting default global parameter values to appstate scope variable Ends here*/

      }, 2000);
    });
  }
});

var validateFilters = function(appstate, validateStoreType, validateRegion, validateCountry, validateLicensor, validateContentType) {

  if (appstate != null && appstate != undefined) {

    var serTypeId = appstate.attr('storeType');
    var regId = appstate.attr('region');
    var countryId = appstate['country'];
    var licId = appstate['licensor'];
    var contGrpId = appstate['contentType'];

    var periodFrom = appstate.attr('periodFrom');
    var periodFromType = appstate['periodFromType'];
    var periodTo = appstate.attr('periodTo');
    var periodToType = appstate['periodToType'];
    var message = showErrorMsg(periodWidgetHelper.getDisplayPeriod(periodFrom, periodFromType), periodWidgetHelper.getDisplayPeriod(periodTo, periodToType));

    if (periodFrom.length == 0 || periodFrom.trim().length == 0) {
      return 'Invalid PeriodFrom !';
    } else if (periodTo.length == 0 || periodTo.trim().length == 0) {
      return 'Invalid PeriodTo !';
    } else if (message != 0) {
      return message;
    }

    if (validateStoreType && (serTypeId == null || serTypeId == "")) {
      return 'Invalid Store Type !';
    }

    if (validateRegion && (regId == null || regId == undefined)) {
      return 'Please select Region !';
    }

    if (validateCountry && (countryId == null || countryId == undefined)) {
      return 'Invalid Country !';
    }

    if (validateLicensor && (licId == null || licId == undefined || licId == "")) {
      return "Invalid Licensor !";
    } else if (validateLicensor && (licId == undefined && (licId.attr() == null || licId.attr() == ""))) {
      return "Invalid Licensor !";
    }

    if (validateContentType && (contGrpId == null || contGrpId == undefined || contGrpId == "")) {
      return "Invalid contentType !";
    } else if (validateContentType && (contGrpId == undefined && contGrpId.attr() == null || contGrpId.attr() == "")) {
      return "Invalid contentType !";
    }

    return "";
  }

}

var getDefaultPeriodFrom = function(from) {
  var defaultDate = moment().month(moment().month() - 3);
  var year = defaultDate.year() + '';
  if (from == 'ONACCOUNT') {
    return 'Q' + defaultDate.quarter() + 'FY' + year.substring(2, year.length);
  }
  var periodFrom = periodWidgetHelper.quarterToPeriod('Q' + defaultDate.quarter());
  return 'P' + periodFrom + 'FY' + year.substring(2, year.length);
}

var getDefaultPeriodTo = function() {
  var toPeriods = {
    "Q1": "03",
    "Q2": "06",
    "Q3": "09",
    "Q4": "12"
  };
  var defaultDate = moment().month(moment().month() - 3);
  var year = defaultDate.year() + '';
  var periodTo = toPeriods['Q' + defaultDate.quarter()];
  return 'P' + periodTo + 'FY' + year.substring(2, year.length);
}

var validateFiscalPeriod = function(periodFrom, periodTo) {
  var qFrom = periodFrom.substring(1, 2);
  var qTo = periodTO.substring(1, 2);
  var yearFrom = periodFrom.substring(periodFrom.length, periodFrom.length - 2);
  var yearTo = periodTO.substring(periodTO.length, periodTO.length - 2);
}

var showErrorMsg = function(periodFrom, periodTo) {

  var flag = false;
  var from = periodFrom || false;
  var to = periodTo || false;
  var message1 = 'Period from is greater than period to !';
  var message2 = 'Please select one year of data !';
  var message3 = 'Invalid Month Selection !'

  if (from && to) {
    var fromYear = parseInt(from.slice(-2));
    var toYear = parseInt(to.slice(-2));
    var yearDiff = parseInt(toYear - fromYear);
    if (fromYear > toYear) {
      return message1;
    }

    if (from.charAt(0) === "P" && to.charAt(0) === "P") {
      var periodFromValue = periodFrom.substr(1, 2);
      var periodToValue = periodTo.substr(1, 2);
      if (yearDiff >= 1 && periodToValue >= periodFromValue) {
        return message2;
      } else if (yearDiff == 0 && periodFromValue > periodToValue) {
        return message1;
      }
    } else if (from.charAt(0) === "Q" && to.charAt(0) === "Q") {
      var quarterFromValue = periodFrom.substr(1, 1);
      var quarterToValue = periodTo.substr(1, 1);
      if (yearDiff >= 1 && quarterToValue >= quarterFromValue) {
        //if(quarterFromValue >= quarterToValue ){
        return message2;
        //}
      } else if (yearDiff == 0 && quarterFromValue > quarterToValue) {
        return message1;
      }
    }else{
      //return message3;
    }
  }
  return "";
}

var isDate=function(txtDate){
  var currVal = txtDate;
  if(currVal == undefined || currVal == '')
    return false;
  //Declare Regex
  //var rxDatePattern = /^(\d{1,2})(\/|-)(\d{1,2})(\/|-)(\d{4})$/;
  var rxDatePattern = /^[P-Q]{1}\d{1,2}[FY]{2}\d{2}$/;
  var dtArray = currVal.match(rxDatePattern); // is format OK?
  var result = (dtArray == null) ? false : true;
   return result;
}

export default GlobalParameterBar;
