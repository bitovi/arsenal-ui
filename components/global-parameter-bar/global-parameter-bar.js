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

var GlobalParameterBar = Component.extend({
  tag: 'global-parameter-bar',
  template: template,
  scope: {
    appstate: undefined, // this gets passed in
    periodFrom: [],
    periodTo : [],
    storetypes: [],
    regions: [],
    countries: [],
    licensors: [],
    contenttypes:[]
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
      'inserted': function(){
          document.getElementById("regionsFilter").selectedIndex = 2;
      },
     '#periodFrom select change': function(el, ev) {
         //var selected = $(el[0].selectedOptions).data('periodFrom');
         var selected = $(el[0]).val();
         this.scope.appstate.attr('periodFrom', selected);
     },
     '#periodTo select change': function(el, ev) {
         //var selected = $(el[0].selectedOptions).data('periodTo');
         var selected = $(el[0]).val();
         this.scope.appstate.attr('periodTo', selected);
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
      //PeriodFrom.findAll(),
      //PeriodTo.findAll()
    ]).then(function(values) {

      self.scope.storetypes.replace(values[0]);
      self.scope.regions.replace(values[1]);
      self.scope.countries.replace(values[2]);
      self.scope.licensors.replace(values[3]["entities"]["Licensor"]);
      self.scope.contenttypes.replace(values[4]["contentTypes"]);
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
                  //alert('Changed option ' + $(option).val() + '.');
                  //console.log(checked);
                  //$(option).attr("selected","selected");
                  var selVal = $(option).val();

                  //$("#countriesFilter").val(selVal);
                  //document.getElementById("countriesFilter").value = selVal;
              }
              
         });
          $("#licensorsFilter").multiselect({
              numberDisplayed: 1,
              includeSelectAllOption: true,
              selectAllText: 'Select All',
              maxHeight: 200
              
         });
          $("#contentTypesFilter").multiselect({
              numberDisplayed: 1,
              includeSelectAllOption: true,
              selectAllText: 'Select All',
              maxHeight: 200
              
         });
        },2000);
    });
  }
});

export default GlobalParameterBar;
