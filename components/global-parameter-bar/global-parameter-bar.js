import Component from 'can/component/';

// Models
import StoreType from 'models/store-type/';
import Region from 'models/region/';
import Country from 'models/country/';
//import Licensor from 'models/global-param-licensor/';
import Licensor from 'models/licensor/';
import ContentType from 'models/content-type/';

import template from './template.stache!';
import styles from './global-parameter-bar.less!';

var GlobalParameterBar = Component.extend({
  tag: 'global-parameter-bar',
  template: template,
  scope: {
    appstate: undefined, // this gets passed in
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
    '#store-type select change': function(el, ev) {
       var selected = $(el[0].selectedOptions).data('storetype');
       //console.log("contetntytpe " +JSON.stringify(selected));
      this.scope.appstate.attr('storeType', selected);
    },
    '#region select change': function(el, ev) {
      //console.log("globalFetch Global Search: ");
      var selected = $(el[0].selectedOptions).data('region');
      this.scope.appstate.attr('region', selected);

      /*var self = this;
      Country.findAll({region: selected.id}).then(function(countries) {
        self.scope.countries.replace(countries);
      });*/
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
      StoreType.findAll(),
      Region.findAll(),
      Country.findAll(),
      Licensor.findAll(),
      ContentType.findAll()
    ]).then(function(values) {
      self.scope.storetypes.replace(values[0][0]["data"]);
      self.scope.regions.replace(values[1][0]["data"]);
      self.scope.countries.replace(values[2][0]["data"]);
      self.scope.licensors.replace(values[3][0]["data"]);
      self.scope.contenttypes.replace(values[4][0]["data"]);
    });
  }
});

export default GlobalParameterBar;
