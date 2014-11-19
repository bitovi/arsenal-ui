import _ from 'lodash';
import Component from 'can/component/';
import List from 'can/list/';

import BundleDetailGrid from 'components/bundle-detail-grid/';
import Switcher from 'components/switcher/';

import licensorColumns from './column-sets/licensor-columns';
import countryColumns from './column-sets/country-columns';

import template from './template.stache!';
import _less from './bundle-detail.less!';

var columnSets = [
  {
    value: 'licensor',
    text: 'Licensor',
    columns: licensorColumns
  },
  {
    value: 'country',
    text: 'Country',
    columns: countryColumns
  }
];

var BundleDetailTabs = Component.extend({
  tag: 'rn-bundle-detail',
  template: template,
  scope: {
    appstate: null, // passed in
    pageState: null, // passed in
    columnSets: columnSets,
    selectedTab: null, // by default
    isCashAdjusted: false, // TODO: set up checkbox
    paymentType: 'recon', // TODO: set up dropdown
    gridColumns: columnSets[0].columns,
    gridRows: new List([])
  },
  events: {
    init: function() {
      this.scope.attr('selectedTab', this.scope.columnSets[0]);
    },
    '{scope} selectedTab': function(scope, ev, newVal) {
      this.scope.attr('gridColumns', newVal.columns);
    },
    '{scope} pageState.selectedBundle': function(scope, ev, newBundle) {
      var self = this;

      newBundle.getDetails(
        this.scope.attr('appstate'),
        this.scope.attr('isCashAdjusted'),
        this.scope.attr('paymentType')
      );
    }
  }
});

export default BundleDetailTabs;
