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

    renderMissingInvoices: function(id,from) {
      var missingInvoices = getMissingInvoices(from,this.holesReports,id);
      // var missingInvoices = _.filter(holes, hole => hole.pdfCount < 1 || hole.ccidCount < 1);
      //var missingInvoices=[];
      return missingInvoicesTemplate({missingInvoices})
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
              //var localSociety=holesWrapper.localSociety;
              var localSociety='CELAS';
              var localDisplay="";
              var checkForLocalSociety = false;
              if(typeof(localSociety) != "undefined" && localSociety != "null" && (localSociety != null) && localSociety.length >0){
                holesReport.localSociety = localSociety;
                checkForLocalSociety = true;
              }

           dataList.sort(function(obj1, obj2) {
                if(obj1.entityName != undefined && obj2.entityName != undefined){
                  var nameA=obj1.entityName.toLowerCase(), nameB=obj2.entityName.toLowerCase();
                   if (nameA < nameB) //sort string ascending
                    return -1 
                   if (nameA > nameB)
                    return 1
                }
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
                hole.pdfCount=value.pdfCount;
                hole.ccidCount=value.ccidCount;
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
                holesReport.holesList.push(hole);
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
  
          
          entities = entities.filter(function(n){ return n !== undefined; });
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
    popover: function(from,val,data) {
      var id = "";
      if(from == 'country'){
        id = data.context.countryId;
      }else{
        id = data.context;
      }
      var popoverContent = $('<div>').append(this.renderMissingInvoices(id,from))[0].innerHTML;
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
           $('body').css('overflow','scroll');
           $('#copyall').trigger('click');
           $('copy-clipboard').addClass('wrapCopyToClipboard');
           $("#clonetable").css("position","relative");
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

var getMissingInvoices=function(from,holesReports,id){
  var holesReport = [];
  var missingInvoices=[];
  if(from != undefined ){
    if(from.toUpperCase() == 'COUNTRY'){
     holesReport = getholesReportByCountry(holesReports,id);
     if(holesReport != undefined){
        for(var i=0;i<holesReport.holesList.length;i++){
          var missingInv={};
          missingInv.Country = id;
          missingInv.Licensor = holesReport.holesList[i].entityName;
          missingInv.Missing = getMissing(holesReport.holesList[i].pdfCount,holesReport.holesList[i].ccidCount);
          missingInvoices.push(missingInv);
        }
     }
    }else if(from.toUpperCase() == 'ENTITY'){
      holesReport = getHolesReportByEntity(holesReports,id);
      if(holesReport != undefined){
        for(var i=0;i<holesReport.length;i++){
          var missingInv={};
          missingInv.Country = holesReport[i].countryId;
          missingInv.Licensor = id;
          missingInv.Missing = getMissing(holesReport[i].pdfCount,holesReport[i].ccidCount);
          missingInvoices.push(missingInv);
        }
      }
    }
  }else{
    missingInvoices =[];
  }
  return missingInvoices;
}

var getholesReportByCountry=function(holesReports,id){
  if(id != undefined && id.length >0){
    for(var i=0;i<holesReports.length;i++){
      if(id == holesReports[i].countryId){
        return holesReports[i];
      }
    }
  }else{
    return [];
  }
}

var getHolesReportByEntity=function(holesReports,id){
  var holeReport=[];
  if(id != undefined && id.length >0){
    for(var i=0;i<holesReports.length;i++){
      var hole={}
      hole.countryId=holesReports[i].countryId;
      for(var k=0;k<holesReports[i].holesList.length;k++){
        if(id == holesReports[i].holesList[k].entityName){
          hole.pdfCount=holesReports[i].holesList[k].pdfCount;
          hole.ccidCount=holesReports[i].holesList[k].ccidCount;
        }
      }
      holeReport.push(hole);
    }
  }
  return holeReport;
}

var getMissing=function(pdfCnt,ccidCnt){
  var missing ="";
    if(pdfCnt < 1 && ccidCnt < 1) {
      missing =  'PDF + CCID';
    } else if(pdfCnt < 1) {
      missing = 'PDF';
    } else if(ccidCnt < 1) {
      missing = 'CCID';
    }
    return missing;
}
export default DashboardInvoices;
