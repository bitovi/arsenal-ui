import Component from 'can/component/';

// Models
import StoreType from 'models/store-type/';
import Region from 'models/region/';
import Licensor from 'models/licensor/';

import template from './template.stache!';
import styles from './global-parameter-bar.less!';

var GlobalParameterBar = Component.extend({
  tag: 'global-parameter-bar',
  template: template,
  scope: {
    appstate: undefined, // this gets passed in
    storeTypes: [],
    regions: [],
    licensors: []
  },
  events: {
    '#region select change': function(el, ev) {
      var selectedRegion = $(el[0].selectedOptions).data('region');
      this.scope.appstate.attr('region', selectedRegion);
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
