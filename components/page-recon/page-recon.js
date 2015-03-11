import _ from 'lodash';
import Component from 'can/component/';
import template from './template.stache!';
import styles from './page-recon.less!';
import Stats from 'models/refreshstats/refreshstats';
import ReconStats from 'components/recon-stats/';
import RinsCommon from 'utils/urls';
import UserReq from 'utils/request/';
import reconGrid from  'components/recon-grid/';
import ingestedColumns from './column-sets/ingest-columns';
import Recon from 'models/recon/';

import tokeninput from 'rinsTokeninput';
import css_tokeninput from 'tokeninput.css!';
import css_tokeninput_theme from 'tokeninput_theme.css!';

import commonUtils from 'utils/commonUtils';
import FileManager from 'utils/fileManager/';

import stache from 'can/view/stache/';
import exportToExcel from 'components/export-toexcel/';
import copy from 'components/copy-clipboard/';
import gridUtils from 'utils/gridUtil';

//Navigation bar definitions
var tabNameObj = {
    ingest:{
      name:"Ingested",
      type: "INGESTED"
    }
}

var page = Component.extend({
  tag: 'page-recon',
  template: template,
  scope: {
    appstate:undefined,
    tabSelected :tabNameObj.ingest.name,
    tabName:tabNameObj,
    ingestGridColumns: ingestedColumns,
    ingestList:{
      headerRows: new can.List(),
      footerRows: new can.List()
    },
    paginateReq:{
      recordsAvailable : true,
      sortColumns:[],
      sortDirection: "asc",
      ingestedOffset: 0,
      ingestedScrollTop: 0,
      paginate : false
    },
    ingestCcidSelected:[],
    size_ingestCcidSelected:0,
    currencyScope:[],
    currencyList:[],
    reconRefresh : [],
    emptyrows : true,
    pagename : "recon",

    totalRecordCount:'@',
    reconStatsDetailsSelected : [],
    fetchSize:10,
    //bottomgrid
    refreshStatsReq:undefined,
    isBottomGridRefresh:true,
    isGlobalSearchIngested:undefined,
    tokenInput: [],
    isSortsearch:false,
    refreshTokenInput: function(val, type){
      var self = this;
      if(type=="Add")
        self.attr('tokenInput').push(val);
      else if(type=="Delete"){
        var flag=true;
        this.attr('tokenInput').each(function(value, key) {
          if(val.id == value.id){
            self.attr('tokenInput').splice(key,1);
          }
        });
      }
    },

    addRefresh : function(refresh){
      this.attr("reconRefresh").push(refresh);
    },

    setHeaderChkBox : function() {

      var checkBoxList = $('input.selectRow');

      if(checkBoxList != undefined && checkBoxList!= null && checkBoxList.length > 0) {

        $('input.headerChkBox').attr("checked", true);

        for(var i=0; i<checkBoxList.length; i++) {

          if (checkBoxList[i].checked != true) {

            $('input.headerChkBox').attr("checked", false);

          }

        }
      } else {

        $('input.headerChkBox').attr("checked", false);

      }

    }

  },
  helpers: {

    isIngestCcidsSelected:function(ref){
      //if the size of the list is greater than 0, enables the Reject button
      return ( this.attr("size_ingestCcidSelected") == ref || commonUtils.isReadOnly()=='true' ? 'disabled' : '' ) ;
    }

  },
  init: function(){
    this.scope.appstate.attr("renderGlobalSearch",true);
    this.scope.attr("fetchSize",this.scope.appstate.attr("fetchSize"));
    this.scope.attr("emptyrows", true);
    this.scope.ingestList.headerRows.splice(0, this.scope.ingestList.headerRows.length);
    this.scope.ingestList.footerRows.splice(0,this.scope.ingestList.footerRows.length);
    this.scope.attr("ingestCcidSelected").splice(0, this.scope.attr("ingestCcidSelected").length);
    // this.scope.attr("isGlobalSearchIngested",this.scope.appstate.attr("globalSearch"));
    // console.log(" ")
    //this.scope.attr('populateDefaultData',true);
    //  fetchReconIngest(this.scope,true);
    commonUtils.triggerGlobalSearch();
  },
  events:{
    "inserted": function(){
      var self = this;

      var tbody = self.element.find('tbody');
        //var tbody = self.element.find('tbody');
      var getTblBodyHght=gridUtils.getTableBodyHeight('ingested',88);
      gridUtils.setElementHeight(tbody[0],getTblBodyHght,getTblBodyHght);

      $("#loading_img").hide();

      $("#tokenSearch").tokenInput(self.scope.appstate.filterSuggestion,
      {
          theme: "facebook",
          placeholder:"Search...",
          preventDuplicates: true,
          allowFreeTagging:true,
          tokenLimit:3,
          allowTabOut:false,
          onResult: function (item) {
            if($.isEmptyObject(item)){
                    commonUtils.hideUIMessage();
                    var tempObj={id:$("#token-input-tokenSearch").val(),name: $("#token-input-tokenSearch").val()};
                    return [tempObj];
              }else{
                    commonUtils.hideUIMessage();
                    return item;
              }
          },
          onAdd: function (item) {
              //add it to the exisitng search array, remove duplicate if any
              var isExists=false;
              for(var j=0;j<self.scope.appstate.filterSuggestion.length;j++){
                if(self.scope.appstate.filterSuggestion[j].attr('name').toLowerCase() === item.name.toLowerCase()){
                  isExists=true;
                  break;
                }
              }
              if(!isExists){
                self.scope.appstate.filterSuggestion.push(item);
              }
              self.scope.refreshTokenInput(item,"Add");
          },
          onDelete: function (item) {
               self.scope.refreshTokenInput(item,"Delete");
               //after deleting call refresh method
               fetchReconIngest(self.scope);
          },
          queryDB:function(items){
             //Call Db fetch for the filter conditions.
             //this call back function will be called when the last token is added.
             //if the limit of the token is 3 then when the user add the last token this method
             //get invoked

             fetchReconIngest(self.scope);
          }
      });

        if(commonUtils.isReadOnly()=='true'){
          $('#reject_button').attr('disabled',true);
        }

      },
      '#searchDiv img mouseover': function(el, ev) {
        $(".overlay").html("<label class='tooltipMessage'>"+el.data('tooltip')+"</label>");
        $(".overlay").show();
      },
      '#searchDiv img mouseout': function(el, ev) {
        $(".overlay").hide();
      },
      ".token-input-list-facebook keyup": function(e,ev){
        if(ev.keyCode === 13){ //trigger search when user press enter key. This is becase user can
            //select multiple search token and can trigger the search
            var self= this;
            //console.log(this.scope.tokenInput);
            /* The below code calls {scope.appstate} change event that gets the new data for grid*/
            /* All the neccessary parameters will be set in that event */
            fetchReconIngest(self.scope);
          }
      },
      'tbody tr click': function(el, ev) {
        if(ev.target.nodeName !== 'INPUT'){
          $(el).parent().find('tr').removeClass("selected");
          $(el).parent().find('tr').removeClass("highlight");
          $(el).addClass("selected");
        }
      },
    ".downloadLink.badLines click": function(item, el, ev){
      var self=this.scope;
      var row = item.closest('tr').data('row').row;
      var request = {
          "fileId":row.invfilePath,
          "boundType":row.badFileType
      }
      FileManager.findOne({request}, function(values) {


      }, function(xhr) {
          // handle errors
      });
    },
    ".downloadLink.fileName click": function(item, el, ev){
      var self=this.scope;
      var row = item.closest('tr').data('row').row;
      var file={};
      file.fileId= row.invFileId;
      file.boundType='INBOUND';

      //FileManager.findOne(request);

      FileManager.findOne(file,function(data){
          if(data["status"]!="SUCCESS"){
            commonUtils.displayUIMessage(data["status"],data["responseText"]);
          }
    }, function(xhr) {
          console.error("Error while downloading the file with fileId: "+fileId+xhr);
    });


    },
    ".downloadLink.liDispAmt click": function(item, el, ev){
      var self=this.scope;
      var row = item.closest('tr').data('row').row;
      var request = {

          "fileId":row.liDispFileId,
          "boundType":row.liDispFileType

      }

      //FileManager.downloadFile(request);
        var file={};
        file.fileId= row.invFileId;
        file.boundType='INBOUND';

        //FileManager.findOne(request);

        FileManager.findOne(file,function(data){
            if(data["status"]=="SUCCESS"){

            }else{
              // $("#messageDiv").html("<label class='errorMessage'>"+data["responseText"]+"</label>");
              // $("#messageDiv").show();
              // setTimeout(function(){
              //     $("#messageDiv").hide();
              // },2000)
              commonUtils.showErrorMessage(data["responseText"]);
            }
      }, function(xhr) {
            console.error("Error while downloading the file with fileId: "+fileId+xhr);
      });
    },
    '.toggle :checkbox change': function(el, ev) {
      if (el[0].getAttribute('class') != 'headerChkBox') {
        refreshChekboxSelection(el,this.scope);
      } else {
        var checkBoxList = $('input.selectRow');

      if(el[0].checked == true) {

        for(var i=0; i<checkBoxList.length; i++) {

          if (checkBoxList[i].checked != true) {

            checkBoxList[i].click();

          }

        }

      } else {

        for(var i=0; i<checkBoxList.length; i++) {

          if (checkBoxList[i].checked != false) {

            checkBoxList[i].click();

          }

        }
      }

      }
    },
    '.btn-ingested-reject click': function() {

      $('#rejectModal').modal({
        "backdrop" : "static"
      });

    },

    '.btn-holesReport click': function() {
      commonUtils.navigateTo("dashboard");
      this.scope.appstate.screenLookup.attr('targetScreen',"2");// 2 - Screenid for Holes report
    },
    '.btn-OverRep click': function() {
        window.open(RinsCommon.RINS_OLD_URL+'overRepConfig');
    },
    '.btn-confirm-cancel click': function(){
      //nothing to do
    },
    '.btn-confirm-ok click': function(){
      $('#rejectModal').modal('hide');
      processRejectRequest(this.scope,"reject");
    },

    '{scope.appstate} change': function() {
      //this.scope.appstate.attr("renderGlobalSearch",true);
      if(this.scope.isGlobalSearchIngested != this.scope.appstate.attr('globalSearch')){
        this.scope.attr("isGlobalSearchIngested",this.scope.appstate.attr("globalSearch"));
        if(this.scope.tabSelected == this.scope.tabName.ingest.attr("name")){
          fetchReconIngest(this.scope);
        }
      }
    },
    '{scope.paginateReq} change': function() {

      if(this.scope.paginateReq.attr("paginate")){
        fetchReconIngest(this.scope);
      }
    },
    '{scope.currencyScope} change': function() {
      var list = [];
      can.each(this.scope.currencyScope,
        function( value, index ) {
          list.push( {
            "id":value
          });
        }
      );
      this.scope.currencyList.replace(list);
    },
    ".rn-grid>thead>tr>th:gt(0) click": function(item, el, ev){
          var self=this;
          //console.log($(item[0]).attr("class"));
          var val = $(item[0]).attr("class").split(" ");
          var existingSortColumns =self.scope.paginateReq.sortColumns.attr();
          var existingSortColumnsLen = existingSortColumns.length;
          var existFlag = false;
          if(existingSortColumnsLen==0){
            self.scope.paginateReq.attr('sortColumns').push(val[0]);
          } else {
            for(var i=0;i<existingSortColumnsLen;i++){
              /* The below condition is to selected column to be sorted in asc & dec way */
              console.log(val[0]+","+existingSortColumns[i] )
              if(existingSortColumns[i] == val[0]){
                existFlag = true;
              }
            }
            if(existFlag==false){
              self.scope.paginateReq.attr('sortColumns').replace([]);
              self.scope.paginateReq.attr('sortColumns').push(val[0]);
            } else {
              var sortDirection = (self.scope.paginateReq.attr('sortDirection') == 'asc') ? 'desc' : 'asc';
              self.scope.paginateReq.attr('sortDirection', sortDirection);
            }

          }

          //console.log("aaa "+self.scope.sortColumns.attr());
          self.scope.attr('isSortsearch',true);
           /* The below code calls {scope.appstate} change event that gets the new data for grid*/
           /* All the neccessary parameters will be set in that event */
           commonUtils.triggerGlobalSearch();

    },
    '#copyToClipboard click':function(){  console.log($('#myTabs').next('.tab-content').find('.tab-pane:visible table:visible').clone(true));
         $('#clonetable').empty().html($('#ingested').find('table:visible').clone(true).attr('id','dynamic'));
         $('copy-clipboard').slideDown(function(){
           $('body').css('overflow','hidden');
           $('#copyall').trigger('click');
        });
      },
   '.exportToExcel click':function(el,ev){

        var self = this;
        console.log(self.scope.tabSelected);
       if(self.scope.tabSelected=="Ingested"){
              Recon.findOne(createIngestedReconRequestForExportToExcel(self.scope.appstate),function(data){
                // console.log(data);
                // console.log(JSON.stringify(data));
                      if(data["status"]=="SUCCESS"){
                        $('#exportExcel').html(stache('<export-toexcel csv={data}></export-toexcel>')({data}));
                      }else{
                        commonUtils.displayUIMessage(data["status"], data["responseText"]);
                        self.scope.attr('emptyrows',true);
                      }
                }, function(xhr) {
                      console.error("Error while loading: onAccount balance Details"+xhr);
                } );


         }
       },
       "#arrowbtnCntiner click" :function(){
         accordin(this.scope,''); //user desired action
       }
   }
});


function accordin(obj,action){
  if($('#arrowbutton').hasClass('pull-up-arrow') || action === 'OPEN'){ //open

    if(obj.totalRecordCount > 0 || action === 'OPEN'){
      // setting tbody height which determines the page height- start
      if(obj.totalRecordCount > 0){
        $('#arrowbutton').removeClass('pull-up-arrow').addClass('pull-down-arrow');
        $('#arrowbutton').attr('src','/resources/images/approval_arrow_down.png');
      }
      var getTblBodyHght=gridUtils.getTableBodyHeight('ingested',51);
      gridUtils.setElementHeight($('.rn-grid tbody'),getTblBodyHght,getTblBodyHght);
      var getstatTabhght=gridUtils.getTableBodyHeight('arrowbtnCntiner',62.5);
      $(".statsTable").show(10,function(){
        gridUtils.setElementHeight($('.rn-grid-ingestionstats tbody'),getstatTabhght,getstatTabhght);
        gridUtils.setElementHeight($('.rn-summary-stat tbody'),getstatTabhght,getstatTabhght);
      });
    }else{
      $('#arrowbutton').removeClass('pull-up-arrow').addClass('pull-down-arrow');
      $('#arrowbutton').attr('src','/resources/images/approval_arrow_down.png');
    }
  }else if($('#arrowbutton').hasClass('pull-down-arrow') || action === 'CLOSE'){ //close
    if(obj.totalRecordCount > 0 || action === 'CLOSE'){
      if(obj.totalRecordCount > 0){
        $('#arrowbutton').removeClass('pull-down-arrow').addClass('pull-up-arrow');
        $('#arrowbutton').attr('src','/resources/images/approval_arrow_up.png');
      }
      var getTblBodyHght=gridUtils.getTableBodyHeight('ingested',88);
      gridUtils.setElementHeight($('.rn-grid tbody'),getTblBodyHght,getTblBodyHght);
      //hide the stats table.
      $(".statsTable").hide();
    }else{
      $('#arrowbutton').removeClass('pull-down-arrow').addClass('pull-up-arrow');
      $('#arrowbutton').attr('src','/resources/images/approval_arrow_up.png');
    }
  }
}


var createIngestedReconRequestForExportToExcel=function(appstate){
    var IngestedReconRequest={};
    IngestedReconRequest.searchRequest=UserReq.formGlobalRequest(appstate).searchRequest;
    IngestedReconRequest.searchRequest.type="INGESTED";
    IngestedReconRequest.excelOutput=true;
    console.log(JSON.stringify(IngestedReconRequest));
    return UserReq.formRequestDetails(IngestedReconRequest);
  };



var processRejectRequest = function(scope,requestType){
    var ccidList ;
    var type ;
    var ccidSelected = [];
    var tab = "";

    if(scope.tabSelected == scope.tabName.ingest.attr("name")){
      ccidList = scope.attr("ingestCcidSelected");
      type =  scope.tabName.ingest.attr("type");
      tab = "ingest";
    }

    can.each(ccidList,
      function( value, index ) {
        ccidSelected.push(value);
      }
    );
    if(requestType == "reject"){

        var rejectSearchRequestObj =   {
          "searchRequest": {
          "type" : type,
          "ids" : ccidSelected
          }
        }

      Promise.all([Recon.reject(rejectSearchRequestObj)]).then(function(values) {


        scope.attr("size_ingestCcidSelected", 0);

        if(values != null && values.length > 0) {
          var data = values[0];

          commonUtils.displayUIMessage(data.status ,data["responseText"]);

          if(data.status == "SUCCESS"){


            if(tab == "ingest") {
              scope.reconRefresh[0].summaryStatsData.splice(0,1);
              scope.attr("ingestCcidSelected").splice(0, scope.attr("ingestCcidSelected").length);
            }

            $('.statsTable').hide();

            fetchReconIngest(scope);
          }
        }

        });
    }
}



/**/
var fetchReconIngest = function(scope){
  commonUtils.hideUIMessage();
  //console.log("Loading Started");
  setTimeout(function(){$("#loading_img").show()},50);
  var searchRequestObj = getSearchReqObj(scope);
  searchRequestObj.searchRequest["type"] =  scope.tabName.ingest.attr("type");
  var load = scope.paginateReq.attr("paginate");
  if(scope.paginateReq.attr("paginate")) {
    scope.paginateReq.attr("paginate",false);
    scope.attr("ingestCcidSelected").splice(0, scope.attr("ingestCcidSelected").length);
    scope.paginateReq.attr("ingestedOffset",scope.paginateReq.ingestedOffset + 1);
    searchRequestObj.searchRequest["offset"] = scope.paginateReq.attr("ingestedOffset");
  }else{
    searchRequestObj.searchRequest["offset"] = 0;
    scope.paginateReq.attr("ingestedOffset",0);
    scope.paginateReq.attr("ingestedScrollTop",0);
  }

  searchRequestObj.searchRequest["limit"] = scope.attr("fetchSize");

  searchRequestObj.searchRequest["sortBy"] = scope.paginateReq.sortColumns.attr().toString();
  searchRequestObj.searchRequest["sortOrder"] = scope.paginateReq.sortDirection;

  var filterData = scope.tokenInput.attr();
  var newFilterData = [];
  if(filterData.length>0){
    for(var p=0;p<filterData.length;p++)
      newFilterData.push(filterData[p]["name"]);
    }

  searchRequestObj.searchRequest["filter"] = newFilterData;

  var dataLowerGrid = {};

  Promise.all([Recon.findOne(searchRequestObj)]).then(function(values){
    //console.log("Loading Done");

    if(values != undefined && values != null) {
      var data = values[0];
      dataLowerGrid = data;
      if(data.status == "FAILURE"){
        commonUtils.displayUIMessage(data.status, data["responseText"]);
      }else  {

        if(data.reconStatsDetails == undefined || (data.reconStatsDetails != null && data.reconStatsDetails.length <= 0)) {

          scope.attr("emptyrows", true);
          if(data["responseCode"] == "IN1013" || data["responseCode"] == "IN1015"){
              commonUtils.displayUIMessage(data.status, data["responseText"]);

          }

        } else {

          scope.attr("emptyrows", false);

        }
        if(searchRequestObj.searchRequest["offset"]==0)
          scope.ingestList.headerRows.replace(data.reconStatsDetails);
        else {
          $.merge(scope.ingestList.headerRows, data.reconStatsDetails);
          scope.ingestList.headerRows.replace(scope.ingestList.headerRows);
        }
        scope.paginateReq.recordsAvailable = data.recordsAvailable;
        scope.reconStatsDetailsSelected = data.reconStatsDetails;
        scope.totalRecordCount = data.totRecCnt;
        scope.currencyScope.replace(data.currency);

        if(scope.reconRefresh[0] != undefined) {
          scope.reconRefresh[0].attr("currency", data.currency != null && data.currency.length > 0 ? data.currency[0] : "");
          $("#currency").val(scope.reconRefresh[0].attr("currency"));
        }



        if(data.summary == undefined){
          console.error("Footer rows doesn't exists in the response");
        }
        scope.ingestList.footerRows.splice(0, scope.ingestList.footerRows.length);
        if (data.summary!== null) {
          var footerLine= {
            "__isChild": true,
            "ccy":"EUR",
            "pubFee": data.summary.totalPubFee,
            "reconAmt": data.summary.totalRecon,
            "liDispAmt": data.summary.totalLi,
            "orDispAmt": data.summary.totalOrDisp, //Changed for rdar://problem/20018861> Recon Stats: Over-Rep is missing
            "copConAmt": data.summary.totalCopCon,
            "unMatchedAmt": data.summary.totalUnMatched!= undefined && data.summary.totalUnMatched!= null ? data.summary.totalUnMatched : 0.00,
            "badLines": data.summary.totalBadLines,
            "ccidId": scope.totalRecordCount +" invoices",
            "entityName":"",
            "countryId":"",
            "contType":"",
            "fiscalPeriod":"",
            "ingstdDate":"",
            "invFileName":"",
            "status":"",
            "isFooterRow":true
          };
          scope.ingestList.footerRows.replace(footerLine);
        }

        //if search results comes for the user search criteria and if there is records to
        //show then open the according control to show results.
        // we need to eliminate this action when the sort search result.
        //commenting out this implementation now.
        /*if(!scope.attr('isSortsearch')){
          if(scope.totalRecordCount > 0){
            accordin(scope,'OPEN');
          }else{
            accordin(scope,'CLOSE');
          }
        }else{
          scope.attr('isSortsearch',false);
        }*/
        // This check is make sure that wheneven the search result is return it shows the up arrow
        // The logic of open and close working based on the arrow button class.
        if($('#arrowbutton').hasClass('pull-down-arrow')){
          $('#arrowbutton').removeClass('pull-down-arrow').addClass('pull-up-arrow');
        }
      }
    }

  },function(xhr){
    console.error("Error while loading: fetchReconIngest"+xhr);
  }).then(function(values){

    //if(load) {
      var ccidCheckbox = $("input.selectRow");

      for(var i=0; i<ccidCheckbox.length  ;i++) {

        ccidCheckbox[i].click();

      }

      var ccids = scope.ingestCcidSelected;
      scope.setHeaderChkBox();

      // if(!load){//Not a Paginate Request, load the stats
      if(scope.paginateReq.attr("ingestedOffset") == 0){
        scope.reconRefresh[0].loadRefreshStats(dataLowerGrid, scope.reconRefresh[0]);
      }
      // }else{
      //   scope.attr("load", true);
      // }


    $("#loading_img").hide();
  });

}

var refreshChekboxSelection = function(el,scope){
  var row = el.closest('tr').data('row').row;
  if(scope.tabSelected == scope.tabName.ingest.attr("name")){
    if(el[0].checked) {
      scope.ingestCcidSelected.push(row.dtlHdrId);
    } else {
      $('input.headerChkBox').attr("checked", false);
      var index = _.indexOf(scope.ingestCcidSelected, row.dtlHdrId);
      (index > -1) && scope.attr("ingestCcidSelected").splice(index, 1);
    }
    scope.attr("size_ingestCcidSelected" ,_.size(scope.attr("ingestCcidSelected")));
  }
};

var linkDownload = function(a, filename, request) {

  var contentType =  'data:application/csv;charset=utf-8,';

  var uriContent = contentType + escape();
  a.setAttribute('href', uriContent);
  a.setAttribute('download', filename);

};



function getSearchReqObj(self) {
  var appstate= self.appstate;
  return UserReq.formGlobalRequest(appstate);
}

export default page;
