import Component from 'can/component/';

// Models
import StoreType from 'models/global-param-store-type/';
import Region from 'models/global-param-region/';
import Country from 'models/global-param-country/';
import Licensor from 'models/global-param-licensor/';

import template from './template.stache!';
import styles from './global-parameter-bar.less!';

var GlobalParameterBar = Component.extend({
  tag: 'global-parameter-bar',
  template: template,
  scope: {
    appstate: undefined, // this gets passed in
    storeTypes: [],
    regions: [],
    countries: [],
    licensors: []
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
      var selected = $(el[0].selectedOptions).data('storeType');
      this.scope.appstate.attr('storeType', selected);
    },
    '#region select change': function(el, ev) {
      var selected = $(el[0].selectedOptions).data('region');
      this.scope.appstate.attr('region', selected);

      var self = this;
      Country.findAll({region: selected.id}).then(function(countries) {
        self.scope.countries.replace(countries);
      });
    },
    '#countries select change': function(el, ev) {
      var selected = $(el[0].selectedOptions).data('country');
      this.scope.appstate.attr('country', selected);
    },
    '#licensor select change': function(el, ev) {
      var selected = $(el[0].selectedOptions).data('licensor');
      this.scope.appstate.attr('licensor', selected);
    }
  },
  init: function() {
    var self = this;

    Promise.all([
      StoreType.findAll(),
      Region.findAll(),
      Licensor.findAll()
    ]).then(function(values) {
      self.scope.storeTypes.replace(values[0]);
      self.scope.regions.replace(values[1]);
      self.scope.licensors.replace(values[2]);
    });
  }
});

export default GlobalParameterBar;
