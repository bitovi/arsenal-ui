import _ from 'lodash';
import $ from 'jquery';
import compute from 'can/compute/';
import Component from 'can/component/';
import Map from 'can/map/';

import HolesReport from 'models/holes-report/';
import stache from 'can/view/stache/';

import template from './template.stache!';
import missingInvoicesTemplate from './missing-invoices.stache!';
import styles from './dashboard-invoices.less!';

import exportToExcel from 'components/export-toexcel/';
import copy from 'components/copy-clipboard/';

var refreshTimeoutID;

var DashboardInvoices = Component.extend({
  tag: 'rn-dashboard-invoices',
  template: template,
  scope: {
    entities: [],
    holesReports:[],
    holesByCountry: {/*
      AUT: [hole, hole, hole],
    */},
    fetching: false,

    renderMissingInvoices: function(holes) {
      // var missingInvoices = _.filter(holes, hole => hole.pdfCount < 1 || hole.ccidCount < 1);
      // return missingInvoicesTemplate({missingInvoices}, {
      //   missingParts: function(pdfCount, ccidCount) {
      //     if(pdfCount() < 1 && ccidCount() < 1) {
      //       return 'PDF + CCID';
      //     } else if(pdfCount() < 1) {
      //       return 'PDF';
      //     } else if(ccidCount() < 1) {
      //       return 'CCID';
      //     } else {
      //       return '?';
      //     }
      //   }
      // })
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
      
      return HolesReport.findOne({ appstate: self.appstate }).then(function(holes) {
        // TODO: I think I may need a holesByEntity as well
        var entities = [];
        var holesByCountry = {};
        var data = holes;
        if (self.appstate.attr('excelOutput') != undefined || self.appstate.excelOutput) {

          if (data["status"] == "SUCCESS" && data["exportExcelFileInfo"] != null) {
            self.appstate.attr('excelOutput', false);
            $('#exportExcel').html(stache('<export-toexcel csv={data}></export-toexcel>')({data}));

          } /*else {
            $("#messageDiv").html("<label class='errorMessage'>" + data["responseText"] + "</label>");
            $("#messageDiv").show();
            setTimeout(function() {
              $("#messageDiv").hide();
            }, 2000);
          }*/
        } else {

          // var holes = holes.holesReportWrapper[0].holesReport;

          // _.each(holes, function(hole) {
          //   if (entities.indexOf(hole.entityName) < 0) {
          //     entities.push(hole.entityName);
          //   }

          //   if (!holesByCountry[hole.countryId]) {
          //     holesByCountry[hole.countryId] = [];
          //   }

          //   holesByCountry[hole.countryId].push(hole);
          // });

          // entities = _.sortBy(entities, e => e.toUpperCase());

          // can.batch.start();
          // self.attr('entities', entities);
          // self.attr('holesByCountry', holesByCountry);
          // can.batch.stop();

          //var holes = holes.holesReportWrapper[0].holesReport;
          var holesReports=[];
          var entities=[];

_.each(holes.holesReportWrapper, function(holesWrapper) {
          var holesReport={};
          var dataList = holesWrapper.holesReport.attr();
              holesReport.holesList=[];
              var displayBackGreen = true;
              var holes = holesWrapper.holesReport;
              holesReport.countryId=holesWrapper.countryId;
              holesReport.localSociety="";
              var localSociety=holesWrapper.localSociety;
              var localDisplay="";
              var checkForLocalSociety = false;
              if(typeof(localSociety) != "undefined" && localSociety != "null" && (localSociety != null) && localSociety.length >0){
                holesReport.localSociety = localSociety;
                checkForLocalSociety = true;
              }

           dataList.sort(function(obj1, obj2) {
                var nameA=obj1.entityName.toLowerCase(), nameB=obj2.entityName.toLowerCase()
               if (nameA < nameB) //sort string ascending
                return -1 
               if (nameA > nameB)
                return 1
               return 0 //default return value (no sorting)
              });

          _.each(dataList, function(value) {
                var hole={};
                var display='';
                var showImage=false;
                hole.entityId=value.entityId;
                hole.entityName=value.entityName;
                entities.push(hole.entityName);
                hole.isCCIDExpect=(value.isCCIDExpect == 1) ? true : false;
                if(value.pdfCount > value.ccidCount){
                  display="PDF";
                  displayBackGreen = false;
                }else if(value.pdfCount < value.ccidCount){
                  display="CCID";
                  displayBackGreen = false;
                }else{
                  showImage=true;
                }

                hole.show = display;

                if(checkForLocalSociety && localSociety == value.entityName){
                  localDisplay = display;
                }
               
                hole.isLA = (value.laFlag == 'Y') ? true : false;
                hole.showImage=showImage;
                holesList.push(hole);
              });
              holesReport.localDisplay=localDisplay;
              holesReport.displayBackGreen=displayBackGreen;

              // holesList.sort(function(obj1, obj2) {
              //   var nameA=obj1.entityName.toLowerCase(), nameB=obj2.entityName.toLowerCase()
              //  if (nameA < nameB) //sort string ascending
              //   return -1 
              //  if (nameA > nameB)
              //   return 1
              //  return 0 //default return value (no sorting)
              // });

              //holesReport.holesList=holesList;
              holesReports.push(holesReport);
          });
  
          
          
          entities = _.sortBy(entities, e => e.toUpperCase());

          entities = $.unique(entities);
          can.batch.start();
          self.attr('entities', entities);
          self.attr('holesByCountry', holesByCountry);
          self.attr('holesReports',holesReports);
          can.batch.stop();


        }
        self.attr('fetching', false);
      });
    }
  },
  helpers: {
    showPage: function(options) {
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
    '.exportToExcell click':function(el,ev){
        var self = this;
        if(this.scope.appstate.attr('excelOutput')==undefined || !self.scope.appstate.excelOutput)
          self.scope.appstate.attr("excelOutput",true);
    },
    '#copyToClipboard click':function(){  
        $('#clonetable').empty().html($('.dashboard-container').find('table:visible').clone(true).attr('id','dynamic'));
         $('copy-clipboard').slideDown(function(){
           $('body').css('overflow','hidden');
           $('#copyall').trigger('click');
        });       
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
