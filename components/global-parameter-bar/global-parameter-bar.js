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

      if(changes.isdefault){
        appstate.attr({
          defaultPeriodFrom: changes.defaultPeriodFrom,
          defaultPeriodTo: changes.defaultPeriodTo,
          defaultPeriodType: changes.defaultPeriodType
        });
      }
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
      $('.box-modal').hide(); // hide all other open calendar popups before opening the new one.
      $(el).closest('.calendarcls').find('.box-modal').show(0,function(){
        //$($(el).closest('.calendarcls').find('.box-modal')).data("selected-period",el[0].value);
        $($(el).closest('.calendarcls').find('.box-modal')).data("selected-period-from",$('#periodFrom').val());
        $($(el).closest('.calendarcls').find('.box-modal')).data("selected-period-to",$('#periodTo').val());
        $($(el).closest('.calendarcls').find('.box-modal')).data("selected-period-type",periodWidgetHelper.getPeriodType($('#periodFrom').val()));
        $($(el).closest('.calendarcls').find('.box-modal')).data("selected-id",el[0].id);
        $(this).trigger("popup-shown");
      });   
    },
    '.calendarDateIcon click': function(el){
      $('.box-modal').hide(); // hide all other open calendar popups before opening the new one.
      $(el).closest('.calendarcls').find('.box-modal').show(0,function(){
        //$($(el).closest('.calendarcls').find('.box-modal')).data("selected-period",el[0].value);

        $($(el).closest('.calendarcls').find('.box-modal')).data("selected-period-from",$('#periodFrom').val());
        $($(el).closest('.calendarcls').find('.box-modal')).data("selected-period-to",$('#periodTo').val());
        $($(el).closest('.calendarcls').find('.box-modal')).data("selected-period-type",periodWidgetHelper.getPeriodType($('#periodFrom').val()));
        $($(el).closest('.calendarcls').find('.box-modal')).data("selected-id",el.data('type'));
        $(this).trigger("popup-shown");
      }); 
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
      //clear the error message if there is any.
      this.scope.attr('errorMessage','');
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

          self.scope.changesToApply.attr('licensor', ["-1"]);
          self.scope.changesToApply.attr('country', ["ALL"]);
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
      var self=this;
      //var selected = $(el[0].selectedOptions).data('country');
      console.log("Country sel id is "+$(el[0]).val());
      self.scope.attr('errorMessage','');
      var selected = $(el[0]).val();
      if (selected != null) {
        this.scope.changesToApply.attr('country', selected);
      } else {
        this.scope.changesToApply.removeAttr('country');
      }
      setTimeout(function(){
        if($("input[name='selAllCountry']").prop("checked"))
          {
            self.scope.changesToApply.attr('country', ["ALL"]);
          }
         else if($(el[0]).val() == null)
          {
            self.scope.changesToApply.attr('country', ["ALL"]);
          }
      }, 200);
    },
    '#licensor select change': function(el, ev) {
      var self=this;
      //var selected = $(el[0].selectedOptions).data('licensor');
      self.scope.attr('errorMessage','');
      var selected = $(el[0]).val();
      if (selected != null)
        this.scope.changesToApply.attr('licensor', selected);
      else
        this.scope.changesToApply.removeAttr('licensor');

      setTimeout(function(){
          if($("input[name='selAllLicensor']").prop("checked"))
          {
             self.scope.changesToApply.attr('licensor', ["-1"]);
          }
        else if($(el[0]).val() == null)
          {
            self.scope.changesToApply.attr('licensor', ["-1"]);
          }
      }, 200);
    },
    '#contentType select change': function(el, ev) {
      var self=this;
      //var selected = $(el[0].selectedOptions).data('contenttype');
      var selected = $(el[0]).val();
      var formatSelected = [];
      self.scope.attr('errorMessage','');
      if (selected != null) {
        for (var i = 0; i < selected.length; i++) {
          formatSelected.push(selected[i].split(":")[0]);
        }
        this.scope.changesToApply.attr('contentType', formatSelected);
      } else
        this.scope.changesToApply.removeAttr('contentType');

      setTimeout(function(){
        if($("input[name='selAllContentType']").prop("checked"))
        {
          self.scope.allContentTypes.length > 1 ? self.scope.changesToApply.attr('contentType', ["-1"]) : "";
        }
        else if($(el[0]).val() == null)
        {
          self.scope.changesToApply.attr('contentType', ["-1"]);
        }

      }, 200);
    },
    '#globalSearch click': function() {
      var self = this;
      //      self.scope.appstate.attr('periodFrom', $('#periodFrom').val());
      //      self.scope.appstate.attr('periodTo', $('#periodTo').val());
      //$('.errorOnAccount').html('');
      var message="";
      self.scope.appstate.attr('globalSearchButtonClicked', true);
      message = validateFilters(self.scope.errorMessage,self.scope.changesToApply, false, true, false, false, false,self.scope.appstate.attr('page'))

      self.scope.attr('errorMessage', message);


      if (message.length == 0) {
        this.scope.applyChanges(this.scope.changesToApply, this.scope.appstate);
        //this.scope.appstate.attr('globalSearch', !!this.scope.appstate.globalSearch);
        commonUtils.triggerGlobalSearch();
      }

    },
    '{scope.appstate} page': function() {
      var self = this;
      if (self.scope.appstate.attr('page') == 'on-account' && self.scope.appstate.attr('periodType') != 'Q') {
        var quart = getDefaultPeriodFrom('ONACCOUNT');
        $('#periodFrom').val(quart);
        $('#periodTo').val(quart);
        self.scope.changesToApply.attr('periodFrom', periodWidgetHelper.getFiscalPeriod(quart));
        self.scope.changesToApply.attr('periodTo', periodWidgetHelper.getFiscalPeriod(quart));
        self.scope.changesToApply.attr('periodType', 'Q');

        self.scope.changesToApply.attr('defaultPeriodFrom', self.scope.changesToApply.periodFrom);
        self.scope.changesToApply.attr('defaultPeriodTo', self.scope.changesToApply.periodTo);
        self.scope.changesToApply.attr('defaultPeriodType', 'Q');
        self.scope.changesToApply.attr('isdefault', true);
        self.scope.applyChanges(self.scope.changesToApply, self.scope.appstate);
      }
    },
    "#periodFrom blur":function(el,ev){
      var self = this;
      periodValidation(self,'periodFrom');
    },
    '#periodFrom keydown':function(el,ev){
      //$('.box-modal').hide();
      $(el).closest('.calendarcls').find('.box-modal').hide();
    },
    "#periodTo blur":function(el,ev){
      var self = this;
      periodValidation(self,'periodTo');
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
          buttonClass: 'dropdown-toggle btn btn-default safari-style',
          onChange: function(option, checked, select) {
            $("#countriesFilter").multiselect("refresh");
          },
          buttonText: function(options, select) {
              if(typeof options != undefined && options != null && options != ""){
                var returntext="";
                if (options.length === 0) {
                    returntext='None Selected';
                  }else{
                    var labels = [];
                    options.each(function() {
                        if ($(this).attr('label') !== undefined) {
                            labels.push($(this).attr('label'));
                        }
                        else {
                            labels.push($(this).html());
                        }
                    });
                    if(labels.length == 1){
                      returntext= labels.pop();
                    }else if(select.context.length == labels.length){
                      returntext='All Selected';
                    }else{
                      returntext=options.length+' Selected';
                    }
                  }
                  return "<span style='padding-left:10px'>"+truncateText(returntext,15)+"</span>";
              }
            }

        });


        $("#licensorsFilter").multiselect({
          numberDisplayed: 1,
          includeSelectAllOption: true,
          selectAllText: 'Select All',
          //selectAllValue: 'selectAll',
          selectAllName: 'selAllLicensor',
          maxHeight: 200,
          buttonClass: 'dropdown-toggle btn btn-default safari-style',
          onChange: function(option, checked, select) {
            $("#licensorsFilter").multiselect("refresh");
          },
          buttonText: function(options, select) {
              if(typeof options != undefined && options != null && options != ""){
                var returntext="";
                if (options.length === 0) {
                    returntext='None Selected';
                  }else{
                    var labels = [];
                    options.each(function() {
                        if ($(this).attr('label') !== undefined) {
                            labels.push($(this).attr('label'));
                        }
                        else {
                            labels.push($(this).html());
                        }
                    });
                    if(labels.length == 1){
                      returntext= labels.pop();
                    }else if(select.context.length == labels.length){
                      returntext='All Selected';
                    }else{
                      returntext=options.length+' Selected';
                    }
                  }
                  return "<span style='padding-left:10px'>"+truncateText(returntext,15)+"</span>";
              }
            }

        });
        $("#contentTypesFilter").multiselect({
          numberDisplayed: 1,
          includeSelectAllOption: true,
          selectAllText: 'Select All',
          //selectAllValue: 'selectAll',
          selectAllName: 'selAllContentType',
          maxHeight: 200,
          buttonClass: 'dropdown-toggle btn btn-default safari-style',
          onChange: function(option, checked, select) {
            $("#contentTypesFilter").multiselect("refresh");
          },
          buttonText: function(options, select) {
              if(typeof options != undefined && options != null && options != ""){
                var returntext="";
                if (options.length === 0) {
                    returntext='None Selected';
                  }else{
                    var labels = [];
                    options.each(function() {
                        if ($(this).attr('label') !== undefined) {
                            labels.push($(this).attr('label'));
                        }
                        else {
                            labels.push($(this).html());
                        }
                    });
                    if(labels.length == 1){
                      returntext= labels.pop();
                    }else if(select.context.length == labels.length){
                      returntext='All Selected';
                    }else{
                      returntext=options.length+' Selected';
                    }
                  }
                  return "<span style='padding-left:10px'>"+truncateText(returntext,15)+"</span>";
              }
            }

        });

        /* This is to set default global parameter values to appstate scope variable Starts here*/
          $('#periodFrom').val(DefaultGlobalParameters.PeriodFrom);
          $('#periodTo').val(DefaultGlobalParameters.PeriodTo);
          $('#storeTypesFilter').val(DefaultGlobalParameters.StoreType.id);
          $('#regionsFilter').val(DefaultGlobalParameters.Region.id);


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

              //default data to fetch the default data for all the grid
            self.scope.appstate.attr('defaultPeriodFrom', self.scope.changesToApply.periodFrom);
            self.scope.appstate.attr('defaultPeriodType', self.scope.changesToApply.periodType);
            self.scope.appstate.attr('defaultPeriodTo', self.scope.changesToApply.periodTo);
            self.scope.appstate.attr('defaultStoreType', self.scope.changesToApply.storeType);
            self.scope.appstate.attr('defaultRegion', self.scope.changesToApply.region);
            self.scope.appstate.attr('defaultcountry', self.scope.changesToApply.country);
            self.scope.appstate.attr('defaultlicensor', self.scope.changesToApply.licensor);
            self.scope.appstate.attr('defaultcontentType', self.scope.changesToApply.contentType);

            self.scope.applyChanges(self.scope.changesToApply, self.scope.appstate);
            //console.log("self.scope.appstate",self.scope.appstate)
          //console.log("APpp state & ChangesTOAPPLY is "+JSON.stringify(self.scope.appstate.attr())+","+JSON.stringify(self.scope.changesToApply.attr()));
          }, 1000);

          /* Setting default global parameter values to appstate scope variable Ends here*/

      }, 2000);
    });
  }
});

var periodValidation=function(self,control){
  //get selected period values;
  var periodFrom=$('#periodFrom').val();
  var periodTo=$('#periodTo').val();
  var message="";
  if(control == 'periodFrom'){
    if(isDate(periodFrom)){
      self.scope.changesToApply.attr('periodFrom', periodWidgetHelper.getFiscalPeriod(periodFrom));
      self.scope.changesToApply.attr('periodType', periodWidgetHelper.getPeriodType(periodFrom));
    }else {
      self.scope.changesToApply.attr('periodFrom', '');
      message = 'Invalid Period From';
    }
  }

  if(control == 'periodTo'){
    if(isDate(periodTo)){
      self.scope.changesToApply.attr('periodTo', periodWidgetHelper.getFiscalPeriod(periodTo));
    }else{
      self.scope.changesToApply.attr('periodTo', '');
      message = 'Invalid Period To';
    }
  }

  if(message.length == 0){
      var periodFromType = periodWidgetHelper.getPeriodType(periodFrom);
      var periodToType = periodWidgetHelper.getPeriodType(periodTo);
      if(periodFromType == periodToType){
        message = showErrorMsg(periodFrom,periodTo);
        if(message.length > 0){
          if(control == 'periodFrom'){
            self.scope.changesToApply.attr('periodFrom', '');
          }else if(control == 'periodTo'){
            self.scope.changesToApply.attr('periodTo', '');
          }
        }else{
          //if no validation error then set the values to global object. These values
          //might be cleared on part of previous validation error.
          //radar: 19764807 UI : Global Filter : Incorrect error message - Unable to search by Period . Quater option works fine .
          self.scope.changesToApply.attr('periodFrom', periodWidgetHelper.getFiscalPeriod(periodFrom));
          self.scope.changesToApply.attr('periodType', periodWidgetHelper.getPeriodType(periodFrom));
          self.scope.changesToApply.attr('periodTo', periodWidgetHelper.getFiscalPeriod(periodTo));
          message="";
        }
      }else{
        message = 'Please select the similar type for periodFrom and periodTo';
      }
    }
  self.scope.attr('errorMessage', message);
}

var truncateText=function(textval,length){
  if(textval != "" && textval != null){
    var returnStr=textval;
    if(textval.length > length){
      returnStr=returnStr.substring(0,length)+'...';
    }
    return returnStr;
  }
}

var validateFilters = function(errorMsg,appstate, validateStoreType, validateRegion,
  validateCountry, validateLicensor, validateContentType,page) {
  if(errorMsg == null) errorMsg="";
  if (appstate != null && appstate != undefined && errorMsg.length == 0) {
    var serTypeId = appstate.attr('storeType');
    var regId = appstate.attr('region');
    var countryId = appstate['country'];
    var licId = appstate['licensor'];
    var contGrpId = appstate['contentType'];

    var periodFrom = appstate.attr('periodFrom');
    var periodFromType = appstate['periodFromType'];
    var periodTo = appstate.attr('periodTo');
    var periodToType = appstate['periodToType'];
    var periodType = appstate['periodType']
    var message = showErrorMsg(periodWidgetHelper.getDisplayPeriod(periodFrom, periodFromType), periodWidgetHelper.getDisplayPeriod(periodTo, periodToType));
    var validateQuarter=false;
    if(page == 'on-account'){
      var onAccScope=$('.page-container').closest('page-on-account').scope();
      if(onAccScope != undefined){
        validateQuarter=true;
        if(onAccScope.tabsClicked == 'NEW_ON_ACC'){
          validateQuarter=true;
          validateLicensor=true;
          validateContentType=true;
        }else if(onAccScope.tabsClicked == 'ON_ACC_BALANCE'){
          validateQuarter=true;
          validateLicensor=true;
        }
      }
    }

    if(validateQuarter && periodType!="Q"){
        return 'Please select Quarter !'
    }

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

    var licTxt = $('#licensorsFilter option:selected').text();
    if(validateLicensor && (licId == null || licId == undefined || licId == "")){
      return "Please select Licensor !";
    }else if(validateLicensor && (licId == undefined || (licId.attr() == null || licId.attr() =="")) || licId.length==0 || (licTxt != undefined && licTxt.length <= 0)){
      return "Please select Licensor !";
    }

    if(validateContentType && (contGrpId == null || contGrpId == undefined || contGrpId == "")){
      return "Invalid contentType !";
    }else if(validateContentType && (contGrpId == undefined && contGrpId.attr() == null || contGrpId.attr() =="") && contGrpId.attr().length ==0){
      return "Please select contentType !";
    }else if(validateContentType && (contGrpId.attr().length >1  || contGrpId[0] == "-1")){
      return "Please select single contentType !";
    }
    return ""; //no error
  }
  return errorMsg;
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
    var prdFromVal=periodWidgetHelper.getFiscalPeriod(from);
    var prdToVal=periodWidgetHelper.getFiscalPeriod(to);
    var periodFrom=prdFromVal%100;
    var periodTo=prdToVal%100;
    var yearFrom=(prdFromVal-periodFrom)/100;
    var yearTo=(prdToVal-periodTo)/100;
    var yearDif=yearTo-yearFrom;
    if(yearDif < 0){
      return message1;
    }else if(yearDif > 1){
      return message2;
    }else if(yearDif == 0 ){
      if(periodFrom > periodTo){
        return message1;
      }
    }else if(yearDif == 1){
      if(periodTo >= periodFrom){
        return message2;
      }
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
