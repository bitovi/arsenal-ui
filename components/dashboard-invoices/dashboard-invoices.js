import _ from 'lodash';
import $ from 'jquery';
import FixedHeader from 'components/fixed-header/'
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
import Licensor from 'models/common/licensor/';
import UserReq from 'utils/request/';
import gridUtils from 'utils/gridUtil';

var refreshTimeoutID;

var DashboardInvoices = Component.extend({
  tag: 'rn-dashboard-invoices',
  template: template,
  scope: {
    _entities:[],
    holesReports:[],holesReportsCC:[],
    holesByCountry: {/*
      AUT: [hole, hole, hole],
    */},
    fetching: false,

    renderMissingInvoices: function(id,from) {
      var missingInvoices = getMissingInvoices(from,this.holesReports,id);
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

      return HolesReport.findOne({ appstate: self.appstate }).then(function(holesReportResponse) {
        // TODO: I think I may need a holesByEntity as well
        var entities = [];
        var holesByCountry = {};
        var data = holesReportResponse;
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

          can.batch.start();
          self.attr('_entities', populateEntities(holesReportResponse));
          var getHolesReports = getHolesReport(self._entities,holesReportResponse.holesReportWrapper);
          self.attr('holesReports', getHolesReports);
          self.attr('holesReportsCC', getHolesReports);

          can.batch.stop();
          setTimeout(function(){

            $('.holes-report').stickyTableHeaders({ scrollableArea: $(".holes-report")[0], "fixedOffset": 2, fixedColumn: true });
            $('.holes-reports-country').stickyTableHeaders({scrollableArea: $(".holes-reports-country")[0], "fixedOffset": 2, fixedColumn: true});
            $('.holes-reports-local').stickyTableHeaders({scrollableArea: $(".holes-reports-local")[0], "fixedOffset": 2, fixedColumn: true});
            
            $(window).resize(function() {
              $(window).trigger('resize.stickyTableHeaders');
            });
          },1000)

          $(window).trigger('resize');

          
          // var height = $(window).height() - 300;
          //
          // console.log(height);

        }
        self.attr('fetching', false);
      });
    }
  },
  helpers: {
    divCalculatedHeight: function(){
      var height = $(window).height() - 300;
      return height+"px";
    },
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
      var id = "", placement='right';
      if(from == 'country'){
        id = data.context.countryId;
      }else{
        id = data.context;
        if( (data.contexts._parent._context._entities).indexOf(data.context) > data.contexts._parent._context._entities.length/2 ){
          placement='left';
        }
      }
      var popoverContent = $('<div>').append(this.renderMissingInvoices(id,from))[0].innerHTML;
      return function(span) {
        $(span).popover({
          title: 'Missing Invoices',
          content: popoverContent,
          html: true,
          trigger: 'hover',
          placement: placement
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
    //  gridUtils.resizeElementHeight("tableDiv");

      if(this.scope.appstate.filled) {
        this.scope.debouncedRefreshReport(this.scope);
      }

      var $window = $(window).on('resize', function(){
        var height = $(this).height() - 300;
        $(".tableDiv").height(height);
      }).trigger('resize');

    },
    '.exportToExcell click':function(el,ev){
        var self = this;
        if(this.scope.appstate.attr('excelOutput')==undefined || !self.scope.appstate.excelOutput)
          self.scope.appstate.attr("excelOutput",true);
    },
    '#copyToClipboard click':function(){

      var tableClone = $('.dashboard-container').find('.copytoclipboardContainer').clone(true);

      $('#clonetable').empty().html(tableClone).attr('id', 'dynamic');
      $('copy-clipboard').slideDown(function() {
          $('body').css('overflow', 'hidden');
          $('#copyall').trigger('click');
          tableClone = "";
        });
      },
    '{scope.appstate} change': function() {
      var self = this;

      if(this.scope.appstate.filled) {
        this.scope.debouncedRefreshReport(this.scope);
      } else {
        this.scope.attr('_entities', []);
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
            //if PDFCount and CCID COunt is missed, do not required to render as the LIC AND CNT is not belongs to
            if(missingInv.Missing != ""){
              missingInvoices.push(missingInv);
            }

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
            //if PDFCount and CCID COunt is missed, do not required to render as the LIC AND CNT is not belongs to
            if(missingInv.Missing != ""){

              missingInvoices.push(missingInv);
            }
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

var getHolesReport=function(_entityIds,holesReportWrapper){
    var _newHolesReports=[];
    _.each(holesReportWrapper, function(holesWrapper) {
          var _newHolesReport={};
          var localSociety=holesWrapper.localSociety;
          _newHolesReport.countryId=holesWrapper.countryId;
          _newHolesReport.localSociety="";

          _newHolesReports.push(getEntityDataList(_entityIds,holesWrapper.holesReport,_newHolesReport,localSociety));
      });
    return _newHolesReports;
}

var getEntityDataList=function(_entityIds,_holeRptEnitities,_newHolesReport,localSociety){
  var holesList=[];
  var displayBackGreen = true;
  var localDisplay="";
  var checkForLocalSociety = false;
  if(typeof(localSociety) != "undefined" && localSociety != "null" && (localSociety != null) && localSociety.length >0){
    _newHolesReport.localSociety = localSociety;
    checkForLocalSociety = true;
  }
  _.each(_entityIds, function(entityName) {
    var hole={};
    var display='';
    var showImage=false;
    // hole.entityName=licensorMap[id];
    hole.entityName=entityName
    var _holeRptEnityObj = _.find(_holeRptEnitities, function(value) {
         return value.entityName == entityName;
       });
    if(_holeRptEnityObj != undefined){
        hole.entityId=_holeRptEnityObj.entityId
        hole.pdfCount=_holeRptEnityObj.pdfCount;
        hole.ccidCount=_holeRptEnityObj.ccidCount;
        if(_holeRptEnityObj.pdfCount > _holeRptEnityObj.ccidCount){
          display="PDF";
          displayBackGreen = false;
        }else if(_holeRptEnityObj.pdfCount < _holeRptEnityObj.ccidCount){
          display="CCID";
          displayBackGreen = false;
        }else if(_holeRptEnityObj.pdfCount>0 && _holeRptEnityObj.ccidCount>0){
          showImage=true;
        }else{
          displayBackGreen = false;
        }

        hole.show = display;

        if(checkForLocalSociety && localSociety == _holeRptEnityObj.entityName){
          localDisplay = display;
        }

        hole.isLA = (_holeRptEnityObj.laFlag == 'Y') ? true : false;
        hole.showImage=showImage;
    }else{
      hole.isLicensorInvalidForCountry=true;
    }
    holesList.push(hole);
  });

   holesList.sort(function(obj1, obj2) {
        if(obj1.entityName != undefined && obj2.entityName != undefined){
          var nameA=obj1.entityName.toLowerCase(), nameB=obj2.entityName.toLowerCase();
           if (nameA < nameB) //sort string ascending
            return -1
           if (nameA > nameB)
            return 1
        }
       return 0 //default return value (no sorting)
      });
      var localSocHole=getLocalSocietyHole(localSociety,_holeRptEnitities)
      _newHolesReport.holesList=holesList;
      _newHolesReport.localDisplay=localSocHole.show;
      _newHolesReport.showLocalImage=localSocHole.showImage;
      _newHolesReport.displayBackGreen=(displayBackGreen)?true:undefined;

  return _newHolesReport;

}

var getLocalSocietyHole=function(localSociety,_holeRptEnitities){
  var hole={};
  var display="";
  var showImage=false;
  var _holeRptEnityObj = _.find(_holeRptEnitities, function(value) {
         return value.entityName == localSociety;
       });

     if(_holeRptEnityObj != undefined){
        hole.pdfCount=_holeRptEnityObj.pdfCount;
        hole.ccidCount=_holeRptEnityObj.ccidCount;
        if(_holeRptEnityObj.pdfCount > _holeRptEnityObj.ccidCount){
          display="PDF";
        }else if(_holeRptEnityObj.pdfCount < _holeRptEnityObj.ccidCount){
          display="CCID";
        }else if(_holeRptEnityObj.pdfCount>0 && _holeRptEnityObj.ccidCount>0){
          showImage=true;
        }
        hole.show = display;
        hole.isLA = (_holeRptEnityObj.laFlag == 'Y') ? true : false;
        hole.showImage=showImage;
    }else{
      hole.isLicensorInvalidForCountry=true;
    }
  return hole;
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

var populateEntities= function(holesReportResponse){
  var entities  = holesReportResponse.holesReportWrapper[0].entityList;
  return entities;
}


var getMissing=function(pdfCnt,ccidCnt){
  var missing ="";
    if(pdfCnt < 1 && ccidCnt < 1) {
      missing =  'PDF + CCID';
    } else if(pdfCnt < ccidCnt) {
      missing = 'PDF';
    } else if(ccidCnt < pdfCnt) {
      missing = 'CCID';
    }
    return missing;
}
export default DashboardInvoices;
