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
    storetypes: [],
    regions: [],
    countries: [],
    licensors: [],
    contenttypes:[],
    periodchoosen:"@"
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
    'period-calendar onSelected': function (ele, event, val) {  
        this.scope.attr('periodchoosen', val);
        var which = $(ele).parent().find('input[type=text]').attr('id');
        this.scope.appstate.attr(which, this.scope.periodchoosen);
        $(ele).parent().find('input[type=text]').val(this.scope.periodchoosen).trigger( "change" ); 
        $(ele).closest('.calendarcls').find('.box-modal').hide();
        $(ele).blur();
     },
     '.updateperoid focus':function(el){ 
       $(el).closest('.calendarcls').find('.box-modal').show().trigger( "focus" ); 
     },
     'inserted': function(){
          document.getElementById("regionsFilter").selectedIndex = 2;
      },
     '#periodFrom  change': function(el, ev) {  
         var selected = $(el[0]).val(); 
         this.scope.appstate.attr('periodFrom', selected); 
         var comp ='from';
         showErrorMsg(this.scope.appstate.attr('periodFrom'),this.scope.appstate.attr('periodTo'),comp);
     },
     '#periodTo change': function(el, ev) {
         var selected = $(el[0]).val();
         this.scope.appstate.attr('periodTo', selected);
          var comp ='to';
         showErrorMsg(this.scope.appstate.attr('periodFrom'),this.scope.appstate.attr('periodTo'),comp);
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
      //PeriodFrom.findAll(),
      //PeriodTo.findAll()
    ]).then(function(values) {

      self.scope.storetypes.replace(values[0]);
      self.scope.regions.replace(values[1]);
      self.scope.countries.replace(values[2]);
      self.scope.licensors.replace(values[3]["entities"][0]);
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

var showErrorMsg = function(periodFrom,periodTo,whichcomp){

        if(whichcomp=='from'){
          var _root = $('#periodTocontainer');
          //_root.find('#periodTo').val('');
          _root.find('.period-calendar .period li a').removeClass('disabled period-active');
          if(periodFrom.charAt(0)=='Q'){
              _root.find('.period-calendar .q1 li').not(":first").find('a').addClass('disabled');
              _root.find('.period-calendar .q2 li').not(":first").find('a').addClass('disabled');
              _root.find('.period-calendar .q3 li').not(":first").find('a').addClass('disabled');
              _root.find('.period-calendar .q4 li').not(":first").find('a').addClass('disabled');
           }else{
             _root.find('.period-calendar .q1 li').first().find('a').addClass('disabled');
             _root.find('.period-calendar .q2 li').first().find('a').addClass('disabled');
             _root.find('.period-calendar .q3 li').first().find('a').addClass('disabled');
             _root.find('.period-calendar .q4 li').first().find('a').addClass('disabled');
           }
       }

    var showFlg=false;
          var from = periodFrom,to =  periodTo;
        if(from!=undefined &&  to!=undefined){
            from = from.split('FY');
            to = to.split('FY');   //console.log(from[1].slice(-2)+'--------'+ to[1].slice(-2));
               if(from[1].slice(-2) > to[1].slice(-2)) showFlg=true;
               if(from[1].slice(-2) >= to[1].slice(-2) && from[0].charAt(0)!=to[0].charAt(0) )showFlg=true;
               if(from[1].slice(-2) >= to[1].slice(-2) && parseInt(from[0].substring(1,3)) > parseInt(to[0].substring(1,3)))showFlg=true;
           
        }
        if(showFlg==true){ $('.period-invalid').show(); return false;}else {showFlg=false; $('.period-invalid').hide();}
}

export default GlobalParameterBar;
