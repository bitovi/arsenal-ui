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
    }
  },
  helpers: {
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
    inserted: function() {
      var self = this;

      HolesReport.findAll({appstate: this.scope.appstate}).then(function(holes) {
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
        self.scope.attr('entities', entities);
        self.scope.attr('holesByCountry', holesByCountry);
        can.batch.stop();
      });
    }
  }
});

export default DashboardInvoices;
