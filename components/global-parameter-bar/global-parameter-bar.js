import Component from 'can/component/';

// Models
import StoreType from 'models/common/store-type/';
import Region from 'models/common/region/';
import Country from 'models/common/country/';
import Licensor from 'models/common/licensor/';
import ContentType from 'models/common/content-type/';
import PeriodFrom from 'models/common/periodFrom/';
import PeriodTo from 'models/common/periodTo/';

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
     '#periodFrom select change': function(el, ev) {
         var selected = $(el[0].selectedOptions).data('periodFrom');
         this.scope.appstate.attr('periodFrom', selected);
     },
     '#periodTo select change': function(el, ev) {
         var selected = $(el[0].selectedOptions).data('periodTo');
         this.scope.appstate.attr('periodTo', selected);
     },
    '#store-type select change': function(el, ev) {
       var selected = $(el[0].selectedOptions).data('storetype');
      this.scope.appstate.attr('storeType', selected);
    },
    '#region select change': function(el, ev) {
      var selected = $(el[0].selectedOptions).data('region');
      this.scope.appstate.attr('region', selected);
    },
    '#country select change': function(el, ev) {
      var selected = $(el[0].selectedOptions).data('country');
      this.scope.appstate.attr('country', selected);
    },
    '#licensor select change': function(el, ev) {
      var selected = $(el[0].selectedOptions).data('licensor');
      this.scope.appstate.attr('licensor', selected);
    },
    '#contentType select change': function(el, ev) {
      var selected = $(el[0].selectedOptions).data('contenttype');
      this.scope.appstate.attr('contentType', selected);
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

    Promise.all([
      PeriodFrom.findAll(),
      PeriodTo.findAll(),
      StoreType.findAll(),
      Region.findAll(),
      Country.findAll(),
      Licensor.findAll(),
      ContentType.findAll()
    ]).then(function(values) {

      self.scope.periodFrom.replace(values[0][0]["data"]);
      self.scope.periodTo.replace(values[1][0]["data"]);
      self.scope.storetypes.replace(values[2][0]["data"]);
      self.scope.regions.replace(values[3][0]["data"]);
      self.scope.countries.replace(values[4][0]["data"]);
      self.scope.licensors.replace(values[5][0]["data"]);
      self.scope.contenttypes.replace(values[6][0]["data"]);
    });
  }
});

export default GlobalParameterBar;
