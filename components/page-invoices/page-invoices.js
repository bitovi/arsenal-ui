import Component from 'can/component/';
import View from 'can/view/';
import _ from 'lodash';

import GlobalParameterBar from 'components/global-parameter-bar/';
import fileUpload from 'components/file-uploader/';
import Grid from 'components/grid/';
import gridtemplate from './gridtemplate.stache!';
import stache from 'can/view/stache/';

import UserReq from 'utils/request/';
import StatusCodes from 'models/common/statuscodes/';
import GetAllInvoices from 'models/getAllInvoices/';
import Invoice from 'models/invoice/';
import BundleNamesModel from 'models/payment/bundleNames/';
import MassFileUpLoader from 'models/mass-file-upload/';
import invoicemap from 'models/sharedMap/invoice';
import commonUtils from 'utils/commonUtils';
import gridUtils from 'utils/gridUtil';


import bootstrapmultiselect from 'bootstrap-multiselect';
import css_bootstrapmultiselect from 'bootstrap-multiselect.css!';


import treetables from 'treetables';
import css_treetables from 'treetables.css!';

import createpb from 'components/create-pb/';

import tokeninput from 'tokeninput';
import css_tokeninput from 'tokeninput.css!';
import css_tokeninput_theme from 'tokeninput_theme.css!';

import template from './template.stache!';
import styles from './page-invoices.less!';
import exportToExcel from 'components/export-toexcel/';
import periodWidgetHelper from 'utils/periodWidgetHelpers';
import copy from 'components/copy-clipboard/';


fileUpload.extend({
  tag: 'rn-file-uploader',
  scope: {
        fileList : new can.List(),
        displayMessage:"display:none",
        fileUpload:false,
        uploadedfileinfo:[],
        deletedFileInfo:[],
        isAnyFileLoaded : can.compute(function() { return this.fileList.attr('length') > 0; }),
        isSuccess: false,

    },
    events:{
       "{uploadedfileinfo} change":function(){
          this.scope.fileList.replace(this.scope.uploadedfileinfo);
      }
    }
 });

/* Extend grid with the columns */
Grid.extend({
  tag: 'rn-grid-invoice',
  template: gridtemplate,
  scope: {
    appstate:undefined,
    columns: [
      {
        id: 'invId',
        title: '<input type="checkbox" class="select-toggle-all"/> ',
        sortable: true,
        contents: function(row) {
          return stache('{{#invId}}<input type="checkbox" value="{{invId}}" {{#if isChecked}}checked{{/if}}/>{{/invId}}')({invId: row.invId, isChecked: row.__isChecked});
        }
      },
      {
        id: 'entityName',
        title: 'Entity',
        contents: function(row) { return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}} {{entityName}}')({entityName: row.entityName, isChild: row.__isChild}); }
      },
      {
        id: 'fiscalPeriod',
        title: 'Period Range'
      },
      {
        id: 'invTypeDisp',
        title: 'Invoice Type'
      },
      {
        id: 'contentGrpName',
        title: 'Content Type'
      },
      {
        id: 'country',
        title: 'Country'
      },
      {
        id: 'invoiceNumber',
        title: 'Invoice No'
      },
      {
        id: 'invoiceCcy',
        title: 'Currency'
      },
      {
        id: 'invoiceAmount',
        title: 'Invoice Amount'
      },
      {
        id: 'invoiceDueDate',
        title: 'Due date'
      },
      {
        id: 'status',
        title: 'Status'
      },
      {
        id: 'bundleName',
        title: 'Payment Bundle Name'
      },
      {
        id: 'comments',
        title: 'Notes'
      }
    ],
    strippedGrid:true
  },
  helpers: {
    tableClass: function() {
      return 'scrolling';
    }
  },
  events: {
    'inserted': function(){
      var self= this;
      var tbody = self.element.find('tbody');
      //setting tbody height which determines the page height- start
      var getTblBodyHght=gridUtils.getTableBodyHeight('invoiceGrid',90);
      gridUtils.setElementHeight(tbody,getTblBodyHght,getTblBodyHght);
      //setting tbody height - end
      var parentScopeVar = self.element.closest('page-invoices').scope();
      var tableScrollTopVal = parentScopeVar.attr('tableScrollTop');
      $(tbody[0]).scrollTop(tableScrollTopVal);
        $(tbody).on('scroll', function(ev) {
          if(tbody[0].scrollTop + tbody[0].clientHeight >= tbody[0].scrollHeight-1  && parentScopeVar.recordsAvailable) {
            //console.log(JSON.stringify(self.element.closest('page-invoices').scope().appstate.attr()));


            var offsetVal = parentScopeVar.attr('offset');

            /* Reset the offset value and call the webservice to fetch next set of records */
            parentScopeVar.attr('offset', (parseInt(offsetVal)+1));
            parentScopeVar.attr('tableScrollTop', (tbody[0].scrollHeight-200));
            parentScopeVar.appstate.attr('globalSearchButtonClicked', false);

            /* The below code calls {scope.appstate} change event that gets the new data for grid*/
            /* All the neccessary parameters will be set in that event */
           if(parentScopeVar.appstate.attr('globalSearch')){
              parentScopeVar.appstate.attr('globalSearch', false);
            }else{
              parentScopeVar.appstate.attr('globalSearch', true);
            }
          }
        });
      alignGrid('invoiceGrid');
    },

    'tbody tr click': function(el, ev) {
      $(el).parent().find('tr').removeClass("selected");
      $(el).parent().find('tr').removeClass("highlight");
      $(el).addClass("selected");
    },

    '.open-toggle click': function(el, ev) {
      var row = el.closest('tr').data('row').row;
      row.attr('__isOpen', !row.attr('__isOpen'));
      alignGrid('invoiceGrid');
    },
    '.select-toggle-all click': function(el, ev) {
      ev.stopPropagation();
      var allChecked = _.every(this.scope.rows, row => row.__isChecked ? true : false);
      can.batch.start();
      // open parent rows if they are closed; close them if they are open
      this.scope.rows.each(row => row.attr('__isChecked', !allChecked));
      can.batch.stop();
      alignGrid('invoiceGrid');
    },
  }
});

var page = Component.extend({
  tag: 'page-invoices',
  template: template,
  scope: {
    localGlobalSearch:undefined,
    allowSearch: false,
    allInvoicesMap:[],
    checkedRows: [],
    unDeletedInvoices: [],
    sortColumns:[],
    sortDirection: "asc",
    tokenInput: [],
    disableBundleName:undefined,
    getPaymentBundlesNames: undefined,
    newpaymentbundlenamereq:undefined,
    tableScrollTop: 0,
    offset: 0,
    recordsAvailable:'@',
    totalRecordCount:'@',
    fileinfo:[],
    excelOutput:[],
    cancelnewbundlereq:'@',
    populateDefaultData:'@',
    bundleState:{},
    refreshTokenInput: function(val, type){
      //console.log("val is "+JSON.stringify(val));
      var self = this;
      //var prev = self.attr('refreshCount');

        if(type=="Add")
          self.attr('tokenInput').push(val);
        else if(type=="Delete"){
          //console.log(JSON.stringify(self.tokenInput.attr()));
          var flag=true;
          this.attr('tokenInput').each(function(value, key) {

            //console.log(key+" "+val.id+" "+value.id);
            if(val.id == value.id){
                self.attr('tokenInput').splice(key,1);
              //console.log("updated " +JSON.stringify(self.tokenInput.attr()));
            }

          });

        }
        //console.log(type+"&&"+JSON.stringify(this.attr('tokenInput')));
     },

     getSelectedValue : function(text, divId) {

      var obj = $(divId+ " input");

      for(var i=1; i< obj.length; i++) {

        var ele = obj[i];

        if(ele.getAttribute("value") !=null && ele.getAttribute("value") !=undefined && ele.getAttribute("value") == text.toString()) {

          ($(divId+' table>tbody>tr.visible')[i-1]).setAttribute("class" , "visible highlight");

          return i;

        }

      }
    }

  },
  init: function(){
    var self = this;
    self.scope.appstate.attr("renderGlobalSearch",true);
    self.scope.attr('populateDefaultData',true);
    fetchData(self.scope)
  },
  helpers: {
        createPBRequest: function(){
          var self = this;
          /* Load the new Payment Bundle Names based on 'Invoice Type' */
          if(this.attr("getPaymentBundlesNames")==undefined){
            var bundleNamesRequest = {"bundleSearch":{}};

              bundleNamesRequest.bundleSearch["regionId"] = "";

              bundleNamesRequest.bundleSearch["type"] = "REGULAR_INV";

              //console.log("GetBundleNamesRequest is "+JSON.stringify(bundleNamesRequest));
              self.attr('getPaymentBundlesNames', JSON.stringify(bundleNamesRequest));
              /*Ends Here */
            }
          return self.attr("getPaymentBundlesNames");
        },
        newPBnameRequest: function(){
          return this.attr("newpaymentbundlenamereq");
        },

    },
  events: {

    "inserted": function(){

        var self = this;

        $("#tokenSearch").tokenInput([
            {id: 1, name: "Search"} //This is needed
        ],
        {
            theme: "facebook",
            placeholder:"Search...",
            preventDuplicates: true,
            onResult: function (item) {
              //alert(item);
                if($.isEmptyObject(item)){
                      return [{id:$("#token-input-tokenSearch").val(),name: $("#token-input-tokenSearch").val()}];
                }else{
                      return item;
                }
            },
            onAdd: function (item) {
                self.scope.refreshTokenInput(item,"Add");
            },
            onDelete: function (item) {
                 self.scope.refreshTokenInput(item,"Delete");
            }
        });

        /* Bundle Names is selectable only when any row is selected */
        $('#paymentBundleNames').prop('disabled', 'disabled');
        $('#invoiceGrid').html(stache('<rn-grid-invoice emptyrows="{emptyrows}"></rn-grid-invoice>')({emptyrows:true}));
        if (self.scope.appstate.attr("invSearchPervHist") != undefined && self.scope.appstate.attr("invSearchPervHist") != null ) {

          self.scope.appstate.attr('globalSearch', true);
          self.scope.attr("localGlobalSearch", false);
          self.scope.attr("appstate", self.scope.appstate.attr("invSearchPervHist"));
          getAllInvoices(self.scope);
          //self.scope.appstate.attr("invSearchPervHist", null);

        }
    },

    '#exportExcel click':function(){
          var self= this;
          self.scope.excelOutput.attr('flag',true);
          if(self.scope.appstate.attr('globalSearch')){
            self.scope.appstate.attr('globalSearch', false);
          }else{
            self.scope.appstate.attr('globalSearch', true);
          }
    },
     '#copyToClipboard click':function(){  console.log($('#myTabs').next('.tab-content').find('.tab-pane:visible table:visible').clone(true));
        $('#clonetable').empty().html($('#invoiceGrid').find('table:visible').clone(true).attr('id','dynamic').removeClass('rn-grid'));
         $('copy-clipboard').slideDown(function(){
           $('body').css('overflow','hidden');
           $("#clonetable input:checkbox").attr("disabled",true);
           $('#copyall').trigger('click');
        });
      },
    "{tokenInput} change": function(){
          var self= this;
          //console.log(JSON.stringify(self.scope.tokenInput.attr()));
           /* The below code calls {scope.appstate} change event that gets the new data for grid*/
          /* All the neccessary parameters will be set in that event */

          self.scope.attr("offset", 0);  /* Search criteria changes. So making offset 0 */
         if(self.scope.appstate.attr('globalSearch')){
            self.scope.appstate.attr('globalSearch', false);
          }else{
            self.scope.appstate.attr('globalSearch', true);
          }
    },
    "{allInvoicesMap} change": function() {
        var self = this;
        var invoiceData = this.scope.attr().allInvoicesMap[0].invoices;
        var footerData = this.scope.attr().allInvoicesMap[0].footer;




        //console.log("Status code "+JSON.stringify(StatusCodes));
        //console.log("dsada "+JSON.stringify(invoiceData));
        var gridData = {"data":[],"footer":[]};
        var currencyList = {};
        if(invoiceData!=null && invoiceData.length!=0){

          for(var i=0;i<invoiceData.length;i++){
              var invTemp = {};
              invTemp["invId"] = invoiceData[i]["invId"];
              invTemp["__isChild"] = false;
              invTemp["__isChecked"] = false;
              //invTemp["__isOddRow"] = false;
              invTemp["entityName"] = (invoiceData[i]["entityName"]==null)?"":invoiceData[i]["entityName"];
              invTemp["fiscalPeriod"] = "";
              invTemp["invoiceType"] = (invoiceData[i]["invoiceType"]==null)?"":invoiceData[i]["invoiceType"];
              invTemp["invTypeDisp"] = (invoiceData[i]["invTypeDisp"]==null)?"":invoiceData[i]["invTypeDisp"];
              invTemp["contentGrpName"] = "";
              invTemp["country"] = "";
              invTemp["invoiceNumber"] = (invoiceData[i]["invoiceNumber"]==null)?"":invoiceData[i]["invoiceNumber"];
              invTemp["invoiceAmount"] = (invoiceData[i]["invoiceAmount"]==null)?0:parseFloat(invoiceData[i]["invoiceAmount"]);
              invTemp["invoiceDueDate"] = (invoiceData[i]["invoiceDueDate"]==null)?"":invoiceData[i]["invoiceDueDate"];
              invTemp["invoiceCcy"] = (invoiceData[i]["invoiceCcy"]==null)?"":invoiceData[i]["invoiceCcy"];
              invTemp["statusId"] = (invoiceData[i]["status"]==null || invoiceData[i]["status"]==-1)?"":invoiceData[i]["status"];
              invTemp["status"] = (invoiceData[i]["status"]==null || invoiceData[i]["status"]==-1)?"":StatusCodes[invoiceData[i]["paymentState"]];
              invTemp["paymentState"] = (invoiceData[i]["paymentState"]==null || invoiceData[i]["paymentState"]==-1)?"":invoiceData[i]["paymentState"];
              invTemp["bundleName"] = (invoiceData[i]["bundleName"]==null || invoiceData[i]["bundleName"]=="--Select--")?"":invoiceData[i]["bundleName"];
              invTemp["comments"] = (invoiceData[i]["notes"]==null || invoiceData[i]["notes"].length==0)?"":invoiceData[i]["notes"];
              invTemp["invoiceAmount"] = CurrencyFormat(invTemp["invoiceAmount"]); //This is to format the amount with commas

              //This line is added for grid alternative coloring.
              //we need to set the flag called isOddRow based on the loop index.
              /*if(i%2 != 0){
                invTemp["__isOddRow"] = true;
              }*/

              gridData.data.push(invTemp);
              var insertedId = gridData.data.length-1;

              var invoiceLineItems = invoiceData[i]["invoiceLines"];
              var contentTypeArr = [], countryArr = [];
              var lowestPeriod = 0;
              var highestPeriod = 0;
              var tmpPeriod = 0;
              var periodType = 'P';
              if(invoiceLineItems.length > 0){
                for(var j=0;j<invoiceLineItems.length;j++){
                  var invLITemp={};
                  var period = invoiceLineItems[j]["fiscalPeriod"];
                  invLITemp["invId"] = "";
                  invLITemp["__isChild"] = true;
                  invLITemp["__isChecked"] = false;
                  //invLITemp["__isOddRow"] = false;
                  invLITemp["entityName"] = "";
                  invLITemp["fiscalPeriod"] = "";
                  invLITemp["invoiceType"] = "";
                  invLITemp["invTypeDisp"] = "";
                  invLITemp["contentGrpName"] = (invoiceLineItems[j]["contentGrpName"]==null)?'':invoiceLineItems[j]["contentGrpName"];
                  invLITemp["country"] = (invoiceLineItems[j]["country"]==null)?'NO_COUNTRY':invoiceLineItems[j]["country"];
                  invLITemp["invoiceNumber"] = "";
                  invLITemp["invoiceAmount"] = (invoiceLineItems[j]["lineAmount"]==null)?0:CurrencyFormat(invoiceLineItems[j]["lineAmount"]);
                  invLITemp["invoiceDueDate"] = "";
                  invLITemp["invoiceCcy"] = invTemp["invoiceCcy"];
                  invLITemp["statusId"] = "";
                  invLITemp["status"] = "";
                  invLITemp["paymentState"] = "";
                  invLITemp["bundleName"] = "";
                  invLITemp["comments"] = "";
                  if(period != undefined && period > 0){
                    invLITemp["fiscalPeriod"] = periodWidgetHelper.getDisplayPeriod(period,periodType);
                    if(lowestPeriod==0 && highestPeriod == 0){
                      lowestPeriod=Number(period);
                      highestPeriod=Number(period);
                    }
                    tmpPeriod = Number(period);
                    if (tmpPeriod < lowestPeriod) lowestPeriod = tmpPeriod;
                    if (tmpPeriod > highestPeriod) highestPeriod = tmpPeriod;
                  }else if(period == 0){
                    invLITemp["fiscalPeriod"] = '';
                  }
                  contentTypeArr.push(invLITemp["contentGrpName"]);
                  countryArr.push(invLITemp["country"]);
                  //modify befor epushing to griddata.
                   if(invLITemp["country"] === 'NO_COUNTRY'){
                       invLITemp["country"]='';
                   }

                  gridData.data.push(invLITemp);
                }
              }

              /*Below function is to remove the duplicate content type and find the count */
              contentTypeArr = contentTypeArr.filter( function( item, index, inputArray ) {
                     return inputArray.indexOf(item) == index;//
              });
              contentTypeArr = contentTypeArr.filter(function (item, index, contentTypeArr) {
                  return contentTypeArr.indexOf("TAX") != index;
              });

              if(contentTypeArr.length>1){

                gridData.data[insertedId]["contentGrpName"] = contentTypeArr.length+" types of Content";
              }
              else if(contentTypeArr.length==1)
                gridData.data[insertedId]["contentGrpName"] = contentTypeArr[0];

              /*Below function is to remove the duplicate country and find the count */
              countryArr = countryArr.filter( function( item, index, inputArray ) {
                return inputArray.indexOf(item) == index;
              });

              countryArr = countryArr.filter(function (item, index, countryArr) {
                  return countryArr.indexOf('NO_COUNTRY') != index;
              });
              if(countryArr.length>1){
                gridData.data[insertedId]["country"] = countryArr.length+ " Countries";
              }
              else if(countryArr.length==1)
                gridData.data[insertedId]["country"] = countryArr[0];

              if(lowestPeriod != undefined && highestPeriod != undefined){
                  gridData.data[insertedId]["fiscalPeriod"] = periodWidgetHelper.getDisplayPeriod(lowestPeriod,periodType);
                  if(lowestPeriod != highestPeriod){
                    gridData.data[insertedId]["fiscalPeriod"] = periodWidgetHelper.getDisplayPeriod(lowestPeriod,periodType)+' - '+periodWidgetHelper.getDisplayPeriod(highestPeriod,periodType);
                  }
                }
            }

            var first = "true";
            var regCcyTemp = {"invId":"", "__isChild":false, "entityName":"Total in Regional Currency", "invoiceType":"", "invTypeDisp":"", "contentGrpName":"", "country":"", "invoiceNumber":"","invoiceAmount":"", "invoiceDueDate":"", "invoiceCcy":"", "status":"", "bundleName":"", "comments":""};
            regCcyTemp["invoiceAmount"] = CurrencyFormat(footerData["regAmtTot"]);
            regCcyTemp["invoiceNumber"] = self.scope.attr('totalRecordCount') + " Invoices";
            regCcyTemp["invoiceCcy"] = footerData["regCcy"];
            gridData["footer"].push(regCcyTemp);
            for(var obj in footerData["amtCcyMap"]){
              var ccyTemp = {"invId":"", "__isChild":true, "entityName":"", "invoiceType":"", "invTypeDisp":"", "contentGrpName":"", "country":"", "invoiceNumber":"","invoiceAmount":"", "invoiceDueDate":"", "invoiceCcy":"", "status":"", "bundleName":"", "comments":""};
              ccyTemp["invoiceAmount"] = CurrencyFormat(footerData["amtCcyMap"][obj]);
              ccyTemp["invoiceCcy"] = obj;
              gridData["footer"].push(ccyTemp);
            }

          //console.log("gridData is "+JSON.stringify(gridData));
          //console.log("Footer is "+JSON.stringify(gridData.footer));
          var rows = new can.List(gridData.data);
          var footerrows = new can.List(gridData.footer);
          var sortedColumns = self.scope.sortColumns.attr();
          var sortDir = self.scope.attr('sortDirection');
          $("#loading_img").hide();
          $('#invoiceGrid').html(stache('<rn-grid-invoice rows="{rows}" footerrows="{footerrows}" sortcolumnnames="{sortcolumnnames}" sortdir="{sortdir}" emptyrows="{emptyrows}"></rn-grid-invoice>')({rows, footerrows, sortcolumnnames:sortedColumns, sortdir:sortDir, emptyrows:false}));

          if (self.scope.appstate.attr("invSearchPervHist") != undefined && self.scope.appstate.attr("invSearchPervHist") != null ) {

            self.scope.appstate.attr("invSearchPervHist", null);
            self.scope.getSelectedValue(self.scope.appstate.attr("invoiceId"), "#invoiceGrid");


          } else {

            if(self.scope.appstate.attr("invoiceId") != null || self.scope.appstate.attr("invoiceId") != undefined) {
              //var i = self.scope.getSelectedValue(self.scope.appstate.attr("invoiceId"), "#invoiceGrid");
              $('#invoiceGrid table>tbody>tr.highlight').removeClass("highlight");
            }
            self.scope.appstate.attr("invoiceId", null);

          }

        } else {
          $("#loading_img").hide();
          $('#invoiceGrid').html(stache('<rn-grid-invoice emptyrows="{emptyrows}"></rn-grid-invoice>')({emptyrows:true}));
        }


    },
     "#btnAdd click": function(){
            //this.scope.appstate.attr('page','create-invoice');
            commonUtils.navigateTo("create-invoice");
            invoicemap.attr('invoiceid','');
    },
    "#btnAddFromiCSV click": function(){
            //this.scope.appstate.attr('page','icsv');
            commonUtils.navigateTo("icsv");
    },
    ".rn-grid>tbody>tr:not('.child') td dblclick": function(item, el, ev){
          //var invoiceid = el.closest('tr').data('row').row.id;
          var self=this;
          var flag=false;
          var row = item.closest('tr').data('row').row;
          var invoiceid = row.invId;
          var statusId = row.statusId;
          var paymentState = row.paymentState;
          var invoiceno = row.invoiceNumber;
          self.scope.appstate.attr("invSearchPervHist", self.scope.appstate);
          self.scope.appstate.attr("invoiceId", row.invId);
          //console.log("row is "+JSON.stringify(row));

          /* An invoice can be Edited only if it satisfies the below criteria */
          if(statusId==0){
            if(paymentState==0 || paymentState==1 || paymentState==9){
              invoicemap.attr('invoiceid',invoiceid);
              flag=true;
              self.scope.appstate.attr('viewinvoicemode',false);
              //commonUtils.navigateTo("edit-invoice");
              self.scope.appstate.attr('page','edit-invoice');
            }
          }

          if(flag==false) {
              invoicemap.attr('invoiceid',invoiceid);
              self.scope.appstate.attr('viewinvoicemode',true);
              self.scope.appstate.attr('page','edit-invoice');
          }
    },
    ".rn-grid>thead>tr>th:gt(0) click": function(item, el, ev){
          var self=this;
           //console.log($(item[0]).attr("class"));
          var val = $(item[0]).attr("class").split(" ");
          var existingSortColumns =self.scope.sortColumns.attr();
          var existingSortColumnsLen = existingSortColumns.length;
          var existFlag = false;
          if(existingSortColumnsLen==0){
            self.scope.attr('sortColumns').push(val[0]);
          } else {
            for(var i=0;i<existingSortColumnsLen;i++){
              /* The below condition is to selected column to be sorted in asc & dec way */
              console.log(val[0]+","+existingSortColumns[i] )
              if(existingSortColumns[i] == val[0]){
                existFlag = true;
              }
            }
            if(existFlag==false){
              self.scope.attr('sortColumns').replace([]);
              self.scope.attr('sortColumns').push(val[0]);
            } else {
              var sortDirection = (self.scope.attr('sortDirection') == 'asc') ? 'desc' : 'asc';
              self.scope.attr('sortDirection', sortDirection);
            }

          }

          console.log("aaa "+self.scope.sortColumns.attr());
           /* The below code calls {scope.appstate} change event that gets the new data for grid*/
           /* All the neccessary parameters will be set in that event */
           self.scope.appstate.attr('globalSearchButtonClicked', true);
           if(self.scope.appstate.attr('globalSearch')){
              self.scope.appstate.attr('globalSearch', false);
            }else{
              self.scope.appstate.attr('globalSearch', true);
            }

    },
    '.select-toggle-all change': function(){
      var self=this;
      if($('.select-toggle-all').is(":checked")){
        var invoiceData = self.scope.attr().allInvoicesMap[0].invoices;
        var invIdArr = [];
        var unDelInvIdArr = [];
        for(var i=0;i<invoiceData.length;i++){
          var flag=false;
          var statusId = invoiceData[i]["status"];
          var paymentState = invoiceData[i]["paymentState"];
          var invoiceno = invoiceData[i]["invoiceNumber"];
          //console.log("row is "+JSON.stringify(row));
          if(statusId==0){
            if(paymentState==0 || paymentState==9){
              flag=true; // Allow deleteing the invoice
            }
          }

          invIdArr.push(invoiceData[i]["invId"]);
          if(flag==false)
            unDelInvIdArr.push(invoiceData[i]["invId"]);
        }

        self.scope.attr('checkedRows').replace(invIdArr);
        self.scope.attr('unDeletedInvoices').replace(unDelInvIdArr);
      } else {
        self.scope.attr('checkedRows').replace([]);
        self.scope.attr('unDeletedInvoices').replace([]);
      }
    },
    '.invId :checkbox click': function(item, el, ev) {
      var self = this;
      var val = parseInt($(item[0]).attr("value"));
      var row = item.closest('tr').data('row').row;
      var invoiceType = row.invoiceType;
      var bundleStatus = row.status;

     $('.select-toggle-all').prop("checked", false);

      /* An invoice can be deleted only if it satisfies the below criteria */
      var flag=false;
      var statusId = row.statusId;
      var paymentState = row.paymentState;
      var invoiceno = row.invoiceNumber;
      //console.log("row is "+JSON.stringify(row));
      if(statusId==0){
        if(paymentState==0 || paymentState==9){
          flag=true; // Allow deleteing the invoice
        }
      }

      if($(item[0]).is(":checked")){
           if(bundleStatus == "UNBUNDLED"){
              self.scope.bundleState.attr(val, true);
            }
            else
            {
              self.scope.bundleState.attr(val, false);
            }

          row.attr('__isChecked', true);
          self.scope.attr('checkedRows').push(val);
          if(flag==false){
            self.scope.attr('unDeletedInvoices').push(invoiceno);
          }


      } else {
        self.scope.bundleState.removeAttr(val);
          self.scope.attr('checkedRows').each(function(value, key) {
              row.attr('__isChecked', false);
              if(val == value){
                  var i = self.scope.attr('checkedRows').indexOf(value);
                  self.scope.attr('checkedRows').splice(i,1);
              }
          });

          self.scope.attr('unDeletedInvoices').each(function(value, key) {
              if(invoiceno == value){
                  var j = self.scope.attr('unDeletedInvoices').indexOf(value);
                  self.scope.attr('unDeletedInvoices').splice(j,1);
              }
          });
      }
      //console.log("Checked rows: "+JSON.stringify(self.scope.checkedRows.attr()));
      //console.log("unDeleted Invoices: "+JSON.stringify(self.scope.attr('unDeletedInvoices')));
      alignGrid('invoiceGrid');
    },
    "{checkedRows} change": function(item,el,ev){
          var self = this;
          console.log("Checked rows "+JSON.stringify(self.scope.checkedRows.attr()));
          if(self.scope.attr('checkedRows').length > 0){
              $("#btnDelete").removeAttr("disabled");
              $("#btnAttach").removeAttr("disabled");
              $("#btnSubmit").removeAttr("disabled");
              $("#paymentBundleNames").removeAttr("disabled");

              //self.scope.attr('disableBundleName', "no");
          }
          else{

              $("#btnDelete").attr("disabled","disabled");
              $("#btnAttach").attr("disabled","disabled");
              $("#btnSubmit").attr("disabled","disabled");
              $("#paymentBundleNames").attr("disabled","disabled");

              //self.scope.attr('disableBundleName', "yes");

          }

          var flag=true;
          var cashAdj=false;
          var invTypeArr =[];
          var invoiceData = this.scope.attr().allInvoicesMap[0].invoices;
          self.scope.attr('checkedRows').each(function(value, key) {
            for(var i=0;i<invoiceData.length;i++){
              if(invoiceData[i]["invId"]==value){
                  invTypeArr.push(invoiceData[i]["invoiceType"]);
              }
            }
          });
          //console.log(invTypeArr);
          var counter=0;
          for(var z=0;z<invTypeArr.length;z++){
            for(var y=0;y<invTypeArr.length;y++){
              if(z!=y){
                if(invTypeArr[z]!=invTypeArr[y])
                  flag=false;
              }
            }
            if(invTypeArr[z] == "CASHADJ_INV"){
              cashAdj=true;
            }

          }

          if(flag==false){
              $("#paymentBundleNames").attr("disabled","disabled");
              $("#btnSubmit").attr("disabled","disabled");
              $("#messageDiv").html("<label class='errorMessage' style='padding:3px 15px !important'>Selected rows are different types of invoices and cannot be added to same bundle.</label>");
              $("#messageDiv").show();
          }else if(cashAdj){
              $("#paymentBundleNames").attr("disabled","disabled");
              $("#btnSubmit").attr("disabled","disabled");
              $("#messageDiv").hide();
          } else {
               $("#messageDiv").hide();
              if(self.scope.attr('checkedRows').length > 0){
                  $("#btnSubmit").removeAttr("disabled");
                  $("#paymentBundleNames").removeAttr("disabled");
              }

              /* Load the new Payment Bundle Names based on 'Invoice Type' */
             var invoiceType = invTypeArr[0];
             var bundleNamesRequest = {"bundleSearch":{}};
              //console.log("appstate "+JSON.stringify(this.appstate));
              var serTypeId = self.scope.appstate.attr('storeType');
              var regId = self.scope.appstate.attr('region');

              if(typeof(serTypeId)!="undefined")
                bundleNamesRequest.bundleSearch["serviceTypeId"] = serTypeId['id'];

              if(typeof(regId)=="undefined")
                bundleNamesRequest.bundleSearch["regionId"] = "";
              else
                bundleNamesRequest.bundleSearch["regionId"] = regId['id'];

                bundleNamesRequest.bundleSearch["type"] = invoiceType;

                console.log("GetBundleNamesRequest is "+JSON.stringify(bundleNamesRequest));
                self.scope.attr('getPaymentBundlesNames', JSON.stringify(bundleNamesRequest));
                /*Ends Here */
          }
      },
      "#inputAnalyze change": function(){
              var self=this;

               self.scope.attr("offset", 0);  /* Search criteria changes. So making offset 0 */

              /* The below code calls {scope.appstate} change event that gets the new data for grid*/
              /* All the neccessary parameters will be set in that event */
             if(self.scope.appstate.attr('globalSearch')){
                self.scope.appstate.attr('globalSearch', false);
              }else{
                self.scope.appstate.attr('globalSearch', true);
              }
      },
      "#btnDelete click": function(){
          var self=this;

          //console.log("selected Invoices are "+ self.scope.checkedRows.attr());
          var unDeletedInvoices = self.scope.unDeletedInvoices.attr();
          if(unDeletedInvoices.length > 0){
            $("#messageDiv").html("<label class='errorMessage' style='padding:3px 15px !important'>Invoice "+unDeletedInvoices.toString()+" cannot be deleted! </label>");
            $("#messageDiv").show();
          } else {
            $("#messageDiv").hide();
            var invoiceDelete = {"searchRequest":{}};
            invoiceDelete.searchRequest.ids = self.scope.checkedRows.attr();
            console.log("Delete request params are "+JSON.stringify(UserReq.formRequestDetails(invoiceDelete)));

            Invoice.update(UserReq.formRequestDetails(invoiceDelete),"invoiceDelete",function(data){
              console.log("Delete response is "+JSON.stringify(data));
              if(data["status"]=="SUCCESS"){
                //if(data["responseCode"] == "IN1013" || data["responseCode"] == "IN1015"){
                   $("#messageDiv").html("<label class='successMessage' style='padding:3px 15px !important'>"+data["responseText"]+"</label>")
                   $("#messageDiv").show();
                   setTimeout(function(){
                      $("#messageDiv").hide();
                      self.scope.checkedRows.replace([]);
                       /* The below calls {scope.appstate} change event that gets the new data for grid*/
                       if(self.scope.appstate.attr('globalSearch')){
                          self.scope.appstate.attr('globalSearch', false);
                        }else{
                          self.scope.appstate.attr('globalSearch', true);
                        }
                    },2000);
                //}
              }
              else{
                $("#messageDiv").html("<label class='errorMessage' style='padding:3px 15px !important'>"+data["responseText"]+"</label>");
                $("#messageDiv").show();
                setTimeout(function(){
                    $("#messageDiv").hide();
                },2000)
              }

            },function(xhr){
              console.error("Error while loading: bundleNames"+xhr);
            });
          }
      },
      "#paymentBundleNames change": function(){
          var self = this;
          var pbval = $("#paymentBundleNames").val();

          if(pbval=="createB"){

                var bundleStateObj = self.scope.bundleState;
                var unbundleStatus = true;;

                for(var key in bundleStateObj){
                  if(!bundleStateObj[key]){
                    unbundleStatus = false;
                    break;
                  }
                }
                if(unbundleStatus)
                {
                    var regId = self.scope.appstate.attr('region');
                    var periodFrom = self.scope.appstate.attr('periodFrom');
                    var periodTo = self.scope.appstate.attr('periodTo');
                    var invoiceData = self.scope.attr().allInvoicesMap[0].invoices;
                    //console.log(JSON.stringify(self.scope.checkedRows.attr()));

                    var selInvoices = self.scope.checkedRows.attr();

                    console.log(JSON.stringify(self.scope.checkedRows.attr()));
                    var bundleLines = [];
                    for(var i=0;i<invoiceData.length;i++){
                        var invId = invoiceData[i]["invId"];
                     if(invoiceData.length > 0 && selInvoices.indexOf(invId)>-1) {

                            var lineType = invoiceData[i]["invoiceType"];
                            var periodType = invoiceData[i]["periodType"];

                            var temp = {};
                            temp["refLineId"] = invId;
                            temp["refLineType"] = lineType;
                            temp["periodType"] = (periodType == null) ? "P" : periodType;
                            bundleLines.push(temp);
                        }
                    }
                    console.log("create bundle bundleLines "+JSON.stringify(bundleLines));
                    var bundleType = lineType;
                    var newBundleNameRequest = {"paymentBundle":{}};
                    var bundleRequest = {};

                    bundleRequest["regionId"] = regId['id'];
                    //bundleRequest["periodFrom"] = periodFrom;
                    //bundleRequest["periodTo"] = periodTo;
                    bundleRequest["bundleType"] =lineType;
                    bundleRequest["bundleDetailsGroup"] =bundleLines;
                    newBundleNameRequest["paymentBundle"] = bundleRequest;
                    console.log("New Bundle name request is "+JSON.stringify(newBundleNameRequest));
                    self.scope.attr('newpaymentbundlenamereq', JSON.stringify(newBundleNameRequest));

                  }
                  else
                  {
                    $("#paymentBundleNames").val("");
                    $("#messageDiv").html("<label class='errorMessage' style='padding:3px 15px !important'>Only unbundled invoices can be bundled</label>");
                    $("#messageDiv").show();
                     setTimeout(function(){
                      $("#messageDiv").hide();
                   },4000);
                  }
            }
      },
      "#btnAttach click": function(){
          //this.scope.attr("fileinfo").replace([]);
          //$('#fileUploaderDiv').html(stache('<rn-file-uploader uploadedfileinfo="{fileinfo}" fileList="{newFileList}"></rn-file-uploader>')({fileinfo:[], newFileList:[]}));
          $("#attachDocumentDiv").show();
      },
      '#attachDocClose click': function(){
          $("#attachDocumentDiv").hide();
      },
      'rn-file-uploader filesUploaded': function(ele, event){
        /* uploadedfileinfo & fileinfo are two way binded. Refer template.stache <rn-file-uploader uploadedfileinfo="{fileinfo}"></rn-file-uploader>*/
        /* When the uploadedfileinfo in rn-file-uploader component, fileinfo in this component updated and change event triggered */
          //console.log("updated file info "+JSON.stringify(this.scope.fileinfo.attr()));
          var self = this;
          var fileInfo = self.scope.fileinfo.attr();
          var selectedInvoice = self.scope.checkedRows.attr();
          var attachReq = {"searchRequest":{"ids":[], "document":[]}};
          attachReq["searchRequest"]["ids"] = selectedInvoice;
          if(fileInfo != undefined && fileInfo.length >0){
            for(var i=0;i<fileInfo.length;i++){
              var temp = {};
              temp["fileName"] = fileInfo[i].fileName;
              temp["location"] = fileInfo[i].filePath;
              attachReq["searchRequest"]["document"].push(temp);
            }
            //console.log("Attach request are "+JSON.stringify(UserReq.formRequestDetails(attachReq)));
            MassFileUpLoader.create(UserReq.formRequestDetails(attachReq),function(data){
              //console.log("Reponse is "+JSON.stringify(data));
              $("#attachDocumentDiv").hide();
              if(data["status"]=="SUCCESS"){

                   $("#messageDiv").html("<label class='successMessage' style='padding:3px 15px !important'>"+data["responseText"]+"</label>")
                   $("#messageDiv").show();
                   setTimeout(function(){
                      $("#messageDiv").hide();
                      self.scope.checkedRows.replace([]);
                       /* The below calls {scope.appstate} change event that gets the new data for grid*/
                       if(self.scope.appstate.attr('globalSearch')){
                          self.scope.appstate.attr('globalSearch', false);
                        }else{
                          self.scope.appstate.attr('globalSearch', true);
                        }
                    },2000);

                }
                else{
                  $("#messageDiv").html("<label class='errorMessage' style='padding:3px 15px !important'>"+data["responseText"]+"</label>");
                  $("#messageDiv").show();
                  setTimeout(function(){
                      $("#messageDiv").hide();
                  },2000)
                }
            });
          }
      },
      "#btnSubmit click":function(){
        var self = this;
        var invoiceData = this.scope.attr().allInvoicesMap[0].invoices;
        var selInvoices = self.scope.checkedRows.attr();
        var bundleLines = [];
        for(var i=0;i<invoiceData.length;i++){
            var invId = invoiceData[i]["invId"];
            var paymentState = invoiceData[i]["paymentState"];
            if(invoiceData.length > 0 && selInvoices.indexOf(invId)>-1) {
                /* The below condition is to check if an invoice is already Bundled */
                if(paymentState!=0){
                  $("#messageDiv").html("<label class='errorMessage' style='padding:3px 15px !important'>Only unbundled invoices can be bundled</label>")
                  $("#messageDiv").show();
                   setTimeout(function(){
                      $("#messageDiv").hide();
                   },4000);
                   return false;
                }
                var lineType = invoiceData[i]["invoiceType"];
                var periodType = invoiceData[i]["periodType"];

                var temp = {};
                temp["refLineId"] = invId;
                temp["refLineType"] = lineType;
                temp["periodType"] = (periodType == null) ? "P" : periodType;
                bundleLines.push(temp);

            }
        }
//        console.log("bundleLines "+JSON.stringify(bundleLines));
        var bundleType = lineType;
        var bundleRequest = {};
        bundleRequest["bundleId"] = $("#paymentBundleNames :selected").val();
        bundleRequest["bundleName"] = $("#paymentBundleNames :selected").text();
        /*This is for getting the value from Text box*/
        if($("#newPaymentBundle").val())
          bundleRequest["bundleName"] = $("#newPaymentBundle").val();

        bundleRequest["bundleType"] =lineType;
        bundleRequest["mode"] ="ADD";
        bundleRequest["bundleDetailsGroup"] =bundleLines;
        console.log('bundleRequest2 '+JSON.stringify(bundleRequest));
         var overAllBundleRequest =  {
              "paymentBundle":bundleRequest
          };

        if(bundleRequest["bundleName"]!="" && bundleRequest["bundleName"]!="--Select--"){
          console.log("Add to bundle request is "+JSON.stringify(UserReq.formRequestDetails(overAllBundleRequest)));
          BundleNamesModel.create(UserReq.formRequestDetails(overAllBundleRequest),function(data){
              console.log("passing params is "+JSON.stringify(data));
              if(data["status"]=="SUCCESS"){
                //if(data["responseCode"] == "IN1013" || data["responseCode"] == "IN1015"){
                 $("#messageDiv").html("<label class='successMessage' style='padding:3px 15px !important'>"+data["responseText"]+"</label>")
                 $("#messageDiv").show();
                 setTimeout(function(){
                    $("#messageDiv").hide();
                    self.scope.checkedRows.replace([]);
                     /* The below calls {scope.appstate} change event that gets the new data for grid*/
                     self.scope.attr('cancelnewbundlereq',true);
                     if(self.scope.appstate.attr('globalSearch')){
                        self.scope.appstate.attr('globalSearch', false);
                      }else{
                        self.scope.appstate.attr('globalSearch', true);
                      }
                 },2000);
               //}
              }
              else{
                $("#messageDiv").html("<label class='errorMessage' style='padding:3px 15px !important'>"+data["responseText"]+"</label>")
                $("#messageDiv").show();
                 setTimeout(function(){
                    $("#messageDiv").hide();
                 },2000);
              }
          },function(xhr){
            console.error("Error while loading: bundleNames"+xhr);
          });
        } else {
          $("#messageDiv").html("<label class='errorMessage'>Please select Bundle Name</label>")
          $("#messageDiv").show();
           setTimeout(function(){
              $("#messageDiv").hide();
           },2000);
        }
      },
      '{scope.appstate} change': function() {
          var self=this;

          getAllInvoices(self.scope);


      }
  }
});


function getAllInvoices(self) {

  /* When fetch button is clicked the first set of records should be brought */
  /* Reset the offset to 0 only when global search Fetch button is clicked */
  /* In the case of scroll, globalSearchButtonClicked attr will be false */
  if(self.appstate.attr('globalSearchButtonClicked')==true){
    self.attr("offset",0);
    self.attr("tableScrollTop",0);
  }

  /* Page is not allowed to do search by default when page is loaded */
  /* This can be checked using 'localGlobalSearch' parameter, it will be undefined when page loaded */
  if(self.attr("localGlobalSearch") != undefined){
      if(self.attr("localGlobalSearch") != self.appstate.attr('globalSearch')) {
        self.attr("localGlobalSearch",self.appstate.attr('globalSearch'));
        fetchData(self);
      }

  } else {
    if(self.appstate.attr('globalSearch')==undefined)
      self.appstate.attr('globalSearch',true);
      self.attr("localGlobalSearch", self.appstate.attr('globalSearch'));
  }

};

function fetchData(self){
  var invSearchRequest= getInvoiceSearchRequest(self);
  $("#loading_img").show();
  GetAllInvoices.findOne(UserReq.formRequestDetails(invSearchRequest),function(data){
            //console.log("response is "+JSON.stringify(data.attr()));
            if(data["status"]=="SUCCESS"){
              if(self.excelOutput.attr('flag')){//when user clicks export to excel icon this block will run otherwise its goes to normal else conditon
                 if(data["status"]=="SUCCESS"){
                    $('#exportExcels').html(stache('<export-toexcel csv={data}></export-toexcel>')({data}));
                    self.excelOutput.attr('flag',false);
                    $("#loading_img").hide();
                  }
              }else{
                if(data["responseCode"] == "IN1013" || data["responseCode"] == "IN1015"){
                  $("#messageDiv").html("<label class='successMessage' style='padding:3px 15px !important'>"+data["responseText"]+"</label>");
                  $("#messageDiv").show();
                  setTimeout(function(){
                      $("#messageDiv").hide();
                  },4000);
                }
                self.attr('recordsAvailable',data.recordsAvailable);
                self.attr('totalRecordCount', data.totRecCnt);
                self.checkedRows.replace([]); //Reset Checked rows scope variable
                if(parseInt(invSearchRequest.searchRequest["offset"])==0){
                  self.allInvoicesMap.replace(data);
                } else{
                  //self.scope.allInvoicesMap[0].invoices.push(data.invoices);
                  $.merge(self.allInvoicesMap[0].invoices, data.invoices);
                  self.allInvoicesMap.replace(self.allInvoicesMap);
                }
               // self.allInvoicesMap.replace(data);
                //$("rn-grid-invoice td").invoiceId
              }
            } else {
              $("#loading_img").hide();
              $("#messageDiv").html("<label class='errorMessage' style='padding:3px 15px !important'>"+data["responseText"]+"</label>");
              $("#messageDiv").show();
              setTimeout(function(){
                  $("#messageDiv").hide();
              },4000);
            }
        },function(xhr){
          console.error("Error while loading: bundleNames"+xhr);
        });
    self.attr('populateDefaultData',false);
}

function getInvoiceSearchRequest(self){
  var appstate = self.appstate;
    if(self.populateDefaultData){
      appstate = commonUtils.getDefaultParameters(appstate);
    }
        // var periodFrom = self.appstate.attr('periodFrom');
        // var periodTo = self.appstate.attr('periodTo');
        // var serTypeId = self.appstate.attr('storeType');
        // var regId = self.appstate.attr('region');
        // var countryId = self.appstate.attr()['country'];
        // var licId = self.appstate.attr()['licensor'];
        // var contGrpId = self.appstate.attr()['contentType'];
        // var periodType = self.appstate.attr()['periodType'];

        var periodFrom = appstate.periodFrom;
        var periodTo = appstate.periodTo;
        var serTypeId = appstate.storeType;
        var regId = appstate.region;
        var countryId = appstate.country.attr();
        var licId = appstate.licensor.attr();
        var contGrpId = appstate.contentType.attr();
        var periodType = appstate.periodType;

        var invSearchRequest = {};
        invSearchRequest.searchRequest = {};
        if(typeof(periodFrom)=="undefined")
          invSearchRequest.searchRequest["periodFrom"] = "";
        else
          invSearchRequest.searchRequest["periodFrom"] = periodFrom;

        if(typeof(periodTo)=="undefined")
          invSearchRequest.searchRequest["periodTo"] = "";
        else
          invSearchRequest.searchRequest["periodTo"] = periodTo;

        if(typeof(periodType)=="undefined")
          invSearchRequest.searchRequest["periodType"] = "";
        else
          invSearchRequest.searchRequest["periodType"] = periodType;


        if(typeof(serTypeId)=="undefined")
          invSearchRequest.searchRequest["serviceTypeId"] = "";
        else
          invSearchRequest.searchRequest["serviceTypeId"] = serTypeId['id'];

        if(typeof(regId)=="undefined")
          invSearchRequest.searchRequest["regionId"] = "";
        else
          invSearchRequest.searchRequest["regionId"] = regId['id'];

        invSearchRequest.searchRequest["country"] = [];
        if(typeof(countryId)!="undefined")
          //invSearchRequest.searchRequest["country"].push(countryId['value']);
          invSearchRequest.searchRequest["country"]=countryId;

        invSearchRequest.searchRequest["entityId"] = [];
        if(typeof(licId)!="undefined")
          invSearchRequest.searchRequest["entityId"] = licId;

        invSearchRequest.searchRequest["contentGrpId"] = [];
        if(typeof(contGrpId)!="undefined")
          invSearchRequest.searchRequest["contentGrpId"] = contGrpId;

   //     invSearchRequest.searchRequest["periodType"] = "P";
        var analyse = $("#inputAnalyze").val();
        if(analyse == undefined){
          analyse=0;
        }
        invSearchRequest.searchRequest["status"] = analyse;
        invSearchRequest.searchRequest["offset"] = self.offset;
        invSearchRequest.searchRequest["limit"] = self.appstate.attr("fetchSize");
        //console.log("#####this.appstate.attr(fetchSize)",self.appstate.attr("fetchSize"));

        var filterData = self.tokenInput.attr();
        var newFilterData = [];
        if(filterData.length>0){
          for(var p=0;p<filterData.length;p++)
            newFilterData.push(filterData[p]["name"]);
        }
        invSearchRequest.searchRequest["filter"] = newFilterData;

        invSearchRequest.searchRequest["sortBy"] = self.sortColumns.attr().toString();
        invSearchRequest.searchRequest["sortOrder"] = self.attr('sortDirection');

        /*This parameter is to generating the excel output*/
        if(self.excelOutput.attr('flag'))
        invSearchRequest["excelOutput"] = true;

      return invSearchRequest;
}

var invoiceExportToExcel=function(appstate){
    var invoiceRequest={};
    invoiceRequest.searchRequest=UserReq.formGlobalRequest(appstate).searchRequest;
    invoiceRequest.searchRequest.type="invoices";
    //invoiceRequest.excelOutput=true;
    return UserReq.formRequestDetails(invoiceRequest);
}

function CurrencyFormat(number)
{
  var n = number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
  return n;
}


function alignGrid(divId){
  var colLength = $('#'+divId+' table>thead>tr>th').length;
  var rowLength = $('#'+divId+' table>tbody>tr').length;
  var divWidth = $('#'+divId).outerWidth();
  var tableWidth = 0;
  var tdWidth, cellWidthArr = [];
  if(rowLength>0){
    $('#'+divId+' table').css("width",divWidth-300);
      for(var i=1;i<=colLength;i++){
        var theadTdWidth = $('#'+divId+' table>thead>tr>th:nth-child('+i+')').outerWidth();
        var tbodyTdWidth = $('#'+divId+' table>tbody>tr>td:nth-child('+i+')').outerWidth();
        var tfootTdWidth = $('#'+divId+' table>tfoot>tr>td:nth-child('+i+')').outerWidth();

        if(theadTdWidth >= tbodyTdWidth && theadTdWidth >= tfootTdWidth)
          tdWidth = theadTdWidth;
        else if(tfootTdWidth >= tbodyTdWidth && tfootTdWidth >= theadTdWidth)
          tdWidth = tfootTdWidth;
        else
          tdWidth = tbodyTdWidth;

        if(i==1) //For the column holding 'check box'
            tdWidth = 35;

        tableWidth += tdWidth;
        cellWidthArr.push(tdWidth);
      }

      if(tableWidth < divWidth){
        var moreWidth = (divWidth-tableWidth)/colLength;
        for(var j=1;j<=cellWidthArr.length;j++){
          var width = cellWidthArr[j-1]+moreWidth;
          $('#'+divId+' table>thead>tr>th:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tbody>tr>td:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tfoot>tr>td:nth-child('+j+')').css("width",width);
        }
        $('#'+divId+' table').css("width",divWidth);
      } else {
        for(var j=1;j<=cellWidthArr.length;j++){
          var width = cellWidthArr[j-1];
          $('#'+divId+' table>thead>tr>th:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tbody>tr>td:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tfoot>tr>td:nth-child('+j+')').css("width",width);
        }
        $('#'+divId+' table').css("width",tableWidth);
      }
  }

}
export default page;
