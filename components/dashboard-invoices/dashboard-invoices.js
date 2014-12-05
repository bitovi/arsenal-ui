import _ from 'lodash';
import $ from 'jquery';
import Component from 'can/component/';
import Map from 'can/map/';

import HolesReport from 'models/holes-report/';

import template from './template.stache!';
import missingInvoicesTemplate from './missing-invoices.stache!';
import styles from './dashboard-invoices.less!';

var DashboardInvoices = Component.extend({
  tag: 'rn-dashboard-invoices',
  template: template,
  scope: {
    entities: [],
    holesByCountry: {/*
      AUT: [hole, hole, hole],
    */},

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

    appstateFilled: function(scope) {
      var filled =  scope.appstate &&
      scope.appstate.attr('storeType') &&
      scope.appstate.attr('region') &&
      scope.appstate.attr('country') &&
      scope.appstate.attr('licensor') &&
      scope.appstate.attr('contentType');

      return !!filled;
    },
    refreshReport: function(scope) {
      return HolesReport.findAll({appstate: scope.appstate}).then(function(holes) {
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

        can.batch.start();
        scope.attr('entities', entities);
        scope.attr('holesByCountry', holesByCountry);
        can.batch.stop();
      });
    }
  },
  helpers: {
    showPage: function(options) {
      can.__reading(this.appstate, 'change');
      if(this.appstateFilled(this)) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    },
    eachCountry: function(options) {
      var countries = Map.keys(this.attr('holesByCountry'));
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
      if(this.scope.appstateFilled(this.scope)) {
        this.scope.refreshReport(this.scope);
      }
    },
    '{scope.appstate} change': function() {
      var self = this;

      if(this.scope.appstateFilled(this.scope)) {
        this.scope.refreshReport(this.scope);
      } else {
        this.scope.attr('entities', []);
        this.scope.attr('holesByCountry', {});
      }
    }
  }
});

export default DashboardInvoices;
