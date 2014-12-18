import _ from 'lodash';
import $ from 'jquery';
import compute from 'can/compute/';
import Component from 'can/component/';
import Map from 'can/map/';

import HolesReport from 'models/holes-report/';

import template from './template.stache!';
import missingInvoicesTemplate from './missing-invoices.stache!';
import styles from './dashboard-invoices.less!';

var refreshTimeoutID;

var DashboardInvoices = Component.extend({
  tag: 'rn-dashboard-invoices',
  template: template,
  scope: {
    entities: [],
    holesByCountry: {/*
      AUT: [hole, hole, hole],
    */},
    fetching: false,

    renderMissingInvoices: function(holes) {
      var missingInvoices = _.filter(holes, hole => hole.pdfCount < 1 || hole.ccidCount < 1);
      return missingInvoicesTemplate({missingInvoices}, {
        missingParts: function(pdfCount, ccidCount) {
          if(pdfCount() < 1 && ccidCount() < 1) {
            return 'PDF + CCID';
          } else if(pdfCount() < 1) {
            return 'PDF';
          } else if(ccidCount() < 1) {
            return 'CCID';
          } else {
            return '?';
          }
        }
      })
    },

    debouncedRefreshReport: function() {
      var self = this;
      if(refreshTimeoutID) {
        window.clearTimeout(refreshTimeoutID);
      }
      refreshTimeoutID = window.setTimeout(function() {
        self.refreshReport.apply(self);
      }, 500);
    },
    refreshReport: function() {
      var self = this;
      this.attr('fetching', true);
      return HolesReport.findAll({appstate: self.appstate}).then(function(holes) {
        // TODO: I think I may need a holesByEntity as well
        var entities = [];
        var holesByCountry = {};
        _.each(holes, function(hole) {
          if(entities.indexOf(hole.entityName) < 0) {
            entities.push(hole.entityName);
          }

          if(! holesByCountry[hole.countryId]) {
            holesByCountry[hole.countryId] = [];
          }

          holesByCountry[hole.countryId].push(hole);
        });

        entities = _.sortBy(entities, e => e.toUpperCase());

        can.batch.start();
        self.attr('entities', entities);
        self.attr('holesByCountry', holesByCountry);
        can.batch.stop();

        self.attr('fetching', false);
      });
    }
  },
  helpers: {
    showPage: function(options) {
      //can.__reading(this.appstate, 'change');
      if(this.appstate.attr('filled')) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    },
    eachCountry: function(options) {
      var countries = _.sortBy(Map.keys(this.attr('holesByCountry')), c => c.toUpperCase());
      return _.map(countries, c => options.fn({
        country: c,
        holes: this.holesByCountry[c],
        localSociety: this.holesByCountry[c][0].localSociety
      }));
    },
    popover: function(holes) {
      var popoverContent = $('<div>').append(this.renderMissingInvoices(holes))[0].innerHTML;
      return function(span) {
        $(span).popover({
          title: 'Missing Invoices',
          content: popoverContent,
          html: true,
          trigger: 'hover'
        });
      };
    },
    renderCell: function(holes, country, entity, options) {
      var hole = _.find(holes, {entityName: entity});

      var holeStatus = hole ? {
        holeExists: true,
        hole: hole,
        isCCIDExpect: hole.isCCIDExpect,
        pdfExists: hole.pdfCount > 0,
        ccidExists: hole.ccidCount > 0,
        la: !!hole.laFlag
      } : {
        holeExists: false
      };

      return options.fn(holeStatus)
    }
  },
  events: {
    'inserted': function() {
      if(this.scope.appstate.filled) {
        this.scope.debouncedRefreshReport(this.scope);
      }
    },
    '{scope.appstate} change': function() {
      var self = this;

      if(this.scope.appstate.filled) {
        this.scope.debouncedRefreshReport(this.scope);
      } else {
        this.scope.attr('entities', []);
        this.scope.attr('holesByCountry', {});
      }
    }
  }
});

export default DashboardInvoices;
