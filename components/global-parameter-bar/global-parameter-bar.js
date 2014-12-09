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
    selectedperiod:[]
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
         this.scope.appstate.attr('periodFrom', this.scope.attr('periodFrom')[0]);
         showErrorMsg(this.scope.attr('periodFrom')[0],this.scope.attr('periodTo')[0],comp);
     },
     '{periodTo} change': function(el, ev) { 
          var comp ='to';
          this.scope.appstate.attr('periodTo', this.scope.attr('periodTo')[0]);
          showErrorMsg(this.scope.attr('periodFrom')[0],this.scope.attr('periodTo')[0],comp);
     },
    '#store-type select change': function(el, ev) {
       var selected = $(el[0].selectedOptions).data('storetype');
      this.scope.appstate.attr('storeType', selected);
    },
    '#region select change': function(el, ev) {
      var self = this;
      var selected = $(el[0].selectedOptions).data('region');
      this.scope.appstate.attr('region', selected);
      //console.log("region id is "+JSON.stringify(selected.id));
      Promise.all([
        Country.findAll(UserReq.formRequestDetails({"regionId":selected.id})),
        Licensor.findAll(UserReq.formRequestDetails({"regionId":selected.id}))
      ]).then(function(values) {
        //console.log(JSON.stringify(values[0][0]["data"].attr()));
        if (values[0].length === 0 && values[1].length === 0) {
           $('.no-data').show()
         } else {
           $('.no-data').hide();
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
      //To idntify, user has clicked the button
      var self = this;
      if(this.scope.appstate.attr('globalSearch')){
         this.scope.appstate.attr('globalSearch', false);
      }else{
        this.scope.appstate.attr('globalSearch', true);
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
      var regionInfo = {"id":"2","value":"Europe"};
      self.scope.appstate.attr('region', regionInfo);
      
        setTimeout(function(){
          document.getElementById("regionsFilter").selectedIndex = 2;
          
              
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

var showErrorMsg = function(periodFrom,periodTo,whichcomp){ 
       var showFlg=false;
       var from = periodFrom,to =  periodTo;
       if(from!=undefined &&  to!=undefined){ 
            from = from.slice(-2);
            to = to.slice(-2);
           if(parseInt(periodFrom.substr(0,4)) >  parseInt(periodTo.substr(0,4)))showFlg=true;
           if(parseInt(from) > parseInt(to)) showFlg=true;
        }
        if(showFlg==true){ $('.period-invalid').show(); return false;}else {showFlg=false; $('.period-invalid').hide();}
}

export default GlobalParameterBar;
