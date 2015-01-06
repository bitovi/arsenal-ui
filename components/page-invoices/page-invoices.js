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
        id: 'invoiceAmount',
        title: 'Invoice Amount'
      },
      {
        id: 'invoiceCcy',
        title: 'Currency'
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
        title: 'User comments'
      }
    ]
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
        $(tbody).on('scroll', function(ev) {
          if(tbody[0].scrollTop + tbody[0].clientHeight >= tbody[0].scrollHeight) {
            //console.log(JSON.stringify(self.element.closest('page-invoices').scope().appstate.attr()));

            var parentScopeVar = self.element.closest('page-invoices').scope();
            var offsetVal = parentScopeVar.attr('offset');
            //console.log(offsetVal);

            /* Reset the offset value and call the webservice to fetch next set of records */
            parentScopeVar.attr('offset', (parseInt(offsetVal)+1));
            /* The below code calls {scope.appstate} change event that gets the new data for grid*/
            /* All the neccessary parameters will be set in that event */
           if(parentScopeVar.appstate.attr('globalSearch')){
              parentScopeVar.appstate.attr('globalSearch', false);
            }else{
              parentScopeVar.appstate.attr('globalSearch', true);
            }
          }
        });

      alignGrid();
    },
    '.open-toggle click': function(el, ev) {
      var row = el.closest('tr').data('row').row;
      row.attr('__isOpen', !row.attr('__isOpen'));
      alignGrid();
    },
    '.select-toggle-all click': function(el, ev) {
      ev.stopPropagation();
      var allChecked = _.every(this.scope.rows, row => row.__isChecked ? true : false);
      can.batch.start();
      // open parent rows if they are closed; close them if they are open
      this.scope.rows.each(row => row.attr('__isChecked', !allChecked));
      can.batch.stop();
      alignGrid();
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
    offset: 0,
    fileinfo:[],
    excelOutput:[],
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
     }
  },
  init: function(){
    //console.log("inside init");
    var self = this;
    setTimeout(function(){
      self.scope.appstate.attr("renderGlobalSearch",true);
    },1000);
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
        }
    },
  events: {

    "inserted": function(){

        var self = this;

        $("#tokenSearch").tokenInput([
            {id: 1, name: "Search"} //This is needed
        ],
        {
            theme: "facebook",
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
    },
    '#exportExcel click':function(){
          var self= this;
          self.scope.excelOutput.attr('flag',true);
          if(self.scope.appstate.attr('globalSearch')){
            self.scope.appstate.attr('globalSearch', false);
          }else{
            self.scope.appstate.attr('globalSearch', true);
          }

         /* var self=this;
          Invoice.findOne(invoiceExportToExcel(self.scope.appstate),function(data){
             if(data["status"]=="SUCCESS"){
                $('#exportExcel').html(stache('<export-toexcel csv={data}></export-toexcel>')({data}));
              }else{
                $("#messageDiv").html("<label class='errorMessage'>"+data["responseText"]+"</label>");
                $("#messageDiv").show();
                setTimeout(function(){
                    $("#messageDiv").hide();
                },2000)
                self.scope.attr('emptyrows',true);
              }
            },function(xhr){
            console.error("Error while loading: bundleNames"+xhr);
          });*/


    },
    "{tokenInput} change": function(){
          var self= this;
          //console.log(JSON.stringify(self.scope.tokenInput.attr()));
           /* The below code calls {scope.appstate} change event that gets the new data for grid*/
          /* All the neccessary parameters will be set in that event */
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
          console.log("here");
          for(var i=0;i<invoiceData.length;i++){
              var invTemp = {};
              invTemp["invId"] = invoiceData[i]["invId"];
              invTemp["__isChild"] = false;
              invTemp["__isChecked"] = false;
              invTemp["entityName"] = (invoiceData[i]["entityName"]==null)?"":invoiceData[i]["entityName"];
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
              gridData.data.push(invTemp);
              var insertedId = gridData.data.length-1;

              var invoiceLineItems = invoiceData[i]["invoiceLines"];
              var contentTypeArr = [], countryArr = [];
              if(invoiceLineItems.length > 0){
                for(var j=0;j<invoiceLineItems.length;j++){
                  var invLITemp={};
                  invLITemp["invId"] = "";
                  invLITemp["__isChild"] = true;
                  invLITemp["__isChecked"] = false;
                  invLITemp["entityName"] = "";
                  invLITemp["invoiceType"] = "";
                  invLITemp["invTypeDisp"] = "";
                  invLITemp["contentGrpName"] = (invoiceLineItems[j]["contentGrpName"]==null)?"":invoiceLineItems[j]["contentGrpName"];
                  invLITemp["country"] = (invoiceLineItems[j]["country"]==null)?"":invoiceLineItems[j]["country"];
                  invLITemp["invoiceNumber"] = "";
                  invLITemp["invoiceAmount"] = (invoiceLineItems[j]["lineAmount"]==null)?0:CurrencyFormat(invoiceLineItems[j]["lineAmount"]);
                  invLITemp["invoiceDueDate"] = "";
                  invLITemp["invoiceCcy"] = invTemp["invoiceCcy"];
                  invLITemp["statusId"] = "";
                  invLITemp["status"] = "";
                  invLITemp["paymentState"] = "";
                  invLITemp["bundleName"] = "";
                  invLITemp["comments"] = "";
                  contentTypeArr.push(invLITemp["contentGrpName"]);
                  countryArr.push(invLITemp["country"]);
                  gridData.data.push(invLITemp);
                }

              }

              /*Below function is to remove the duplicate content type and find the count */
              contentTypeArr = contentTypeArr.filter( function( item, index, inputArray ) {
                     return inputArray.indexOf(item) == index;
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
              if(countryArr.length>1){
                gridData.data[insertedId]["country"] = countryArr.length+ " Countries";
              }
              else if(countryArr.length==1)
                gridData.data[insertedId]["country"] = countryArr[0];

            }

            var first = "true";
            var regCcyTemp = {"invId":"", "__isChild":false, "entityName":"Total in Regional Currency", "invoiceType":"", "invTypeDisp":"", "contentGrpName":"", "country":"", "invoiceNumber":"","invoiceAmount":"", "invoiceDueDate":"", "invoiceCcy":"", "status":"", "bundleName":"", "comments":""};
            regCcyTemp["invoiceAmount"] = CurrencyFormat(footerData["regAmtTot"]);
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
    ".rn-grid>tbody>tr td dblclick": function(item, el, ev){
          //var invoiceid = el.closest('tr').data('row').row.id;
          var self=this;
          var flag=false;
          var row = item.closest('tr').data('row').row;
          var invoiceid = row.invId;
          var statusId = row.statusId;
          var paymentState = row.paymentState;
          var invoiceno = row.invoiceNumber;
          //console.log("row is "+JSON.stringify(row));

          /* An invoice can be Edited only if it satisfies the below criteria */
          if(statusId==0){
            if(paymentState==0 || paymentState==1 || paymentState==9){
              invoicemap.attr('invoiceid',invoiceid);
              flag=true;
              //commonUtils.navigateTo("edit-invoice");
              self.scope.appstate.attr('page','edit-invoice');
            }
          }

          if(flag==false) {
            $("#messageDiv").html("<label class='errorMessage'>Invoice can't be edited as its in transit</label>");
            $("#messageDiv").show();
            setTimeout(function(){
                $("#messageDiv").hide();
            },4000)
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
          var statusId = invoiceData[i]["statusId"];
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
      alignGrid();
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
            if(invTypeArr[z] == "Cash Adjustments")
              flag=false;
          }

          if(flag==false){
              $("#paymentBundleNames").attr("disabled","disabled");
              $("#btnSubmit").attr("disabled","disabled");
              $("#messageDiv").html("<label class='errorMessage'>Selected rows has different Invoice Types</label>");
              $("#messageDiv").show();
          }else {
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
            $("#messageDiv").html("<label class='errorMessage'>Invoice Numbers"+unDeletedInvoices.toString()+" : Cannot Delete the invoice </label>");
            $("#messageDiv").show();
          } else {
            $("#messageDiv").hide();
            var invoiceDelete = {"searchRequest":{}};
            invoiceDelete.searchRequest.ids = self.scope.checkedRows.attr();
            console.log("Delete request params are "+JSON.stringify(UserReq.formRequestDetails(invoiceDelete)));

            Invoice.update(UserReq.formRequestDetails(invoiceDelete),"invoiceDelete",function(data){
              console.log("Delete response is "+JSON.stringify(data));
              if(data["status"]=="SUCCESS"){
                 $("#messageDiv").html("<label class='successMessage'>"+data["responseText"]+"</label>")
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
                $("#messageDiv").html("<label class='errorMessage'>"+data["responseText"]+"</label>");
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
                    $("#messageDiv").html("<label class='errorMessage'>Only unbundled invoices can be bundled</label>");
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
      "{fileinfo} change": function(){
        /* uploadedfileinfo & fileinfo are two way binded. Refer template.stache <rn-file-uploader uploadedfileinfo="{fileinfo}"></rn-file-uploader>*/
        /* When the uploadedfileinfo in rn-file-uploader component, fileinfo in this component updated and change event triggered */
          console.log("updated file info "+JSON.stringify(this.scope.fileinfo.attr()));
          var self = this;
          var fileInfo = self.scope.fileinfo.attr();
          var selectedInvoice = self.scope.checkedRows.attr();
          var attachReq = {"searchRequest":{"ids":[], "document":[]}};
          attachReq["searchRequest"]["ids"] = selectedInvoice;
          if(fileInfo.length >0){
            for(var i=0;i<fileInfo.length;i++){
              var temp = {};
              temp["fileName"] = fileInfo[i]["fileName"];
              temp["location"] = fileInfo[i]["filePath"];
              attachReq["searchRequest"]["document"].push(temp);
            }
            console.log("Attach request are "+JSON.stringify(UserReq.formRequestDetails(attachReq)));
            MassFileUpLoader.create(UserReq.formRequestDetails(attachReq),function(data){
              console.log("Reponse is "+JSON.stringify(data));
              $("#attachDocumentDiv").hide();
              if(data["status"]=="SUCCESS"){
                   $("#messageDiv").html("<label class='successMessage'>"+data["responseText"]+"</label>")
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
                  $("#messageDiv").html("<label class='errorMessage'>"+data["responseText"]+"</label>");
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
                  $("#messageDiv").html("<label class='errorMessage'>Only unbundled invoices can be bundled</label>")
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
               $("#messageDiv").html("<label class='successMessage'>"+data["responseText"]+"</label>")
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
                $("#messageDiv").html("<label class='errorMessage'>"+data["responseText"]+"</label>")
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
          /* Page is not allowed to do search by default when page is loaded */
          /* This can be checked using 'localGlobalSearch' parameter, it will be undefined when page loaded */
          if(this.scope.attr("localGlobalSearch") != undefined){
              if(this.scope.attr("localGlobalSearch") != this.scope.appstate.attr('globalSearch')) {
                this.scope.attr("localGlobalSearch",this.scope.appstate.attr('globalSearch'));
                $("#loading_img").show();

                var periodFrom = this.scope.appstate.attr('periodFrom');
                var periodTo = this.scope.appstate.attr('periodTo');
                var serTypeId = this.scope.appstate.attr('storeType');
                var regId = this.scope.appstate.attr('region');
                var countryId = this.scope.appstate.attr()['country'];
                var licId = this.scope.appstate.attr()['licensor'];
                var contGrpId = this.scope.appstate.attr()['contentType'];

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

                invSearchRequest.searchRequest["periodType"] = "P";

                invSearchRequest.searchRequest["status"] = $("#inputAnalyze").val();
                invSearchRequest.searchRequest["offset"] = this.scope.offset;
                invSearchRequest.searchRequest["limit"] = "10";

                var filterData = self.scope.tokenInput.attr();
                var newFilterData = [];
                if(filterData.length>0){
                  for(var p=0;p<filterData.length;p++)
                    newFilterData.push(filterData[p]["name"]);
                }
                invSearchRequest.searchRequest["filter"] = newFilterData;

                invSearchRequest.searchRequest["sortBy"] = self.scope.sortColumns.attr().toString();
                invSearchRequest.searchRequest["sortOrder"] = self.scope.attr('sortDirection');

                /*This parameter is to generating the excel output*/
                if(self.scope.excelOutput.attr('flag'))invSearchRequest["excelOutput"] = true;

                console.log("Request are "+JSON.stringify(UserReq.formRequestDetails(invSearchRequest)));


                GetAllInvoices.findOne(UserReq.formRequestDetails(invSearchRequest),function(data){
                    //console.log("response is "+JSON.stringify(data.attr()));
                    if(data["status"]=="SUCCESS"){
                      if(self.scope.excelOutput.attr('flag')){//when user clicks export to excel icon this block will run otherwise its goes to normal else conditon
                         if(data["status"]=="SUCCESS"){
                            $('#exportExcels').html(stache('<export-toexcel csv={data}></export-toexcel>')({data}));
                            self.scope.excelOutput.attr('flag',false);
                            $("#loading_img").hide();
                          }
                      }else{
                        $("#messageDiv").html("<label class='successMessage'>"+data["responseText"]+"</label>");
                        $("#messageDiv").show();
                        setTimeout(function(){
                            $("#messageDiv").hide();
                        },4000);

                        self.scope.checkedRows.replace([]); //Reset Checked rows scope variable  
                        if(parseInt(invSearchRequest.searchRequest["offset"])==0){
                          self.scope.allInvoicesMap.replace(data);
                        } else{
                          //self.scope.allInvoicesMap[0].invoices.push(data.invoices);
                          $.merge(self.scope.allInvoicesMap[0].invoices, data.invoices);
                          self.scope.allInvoicesMap.replace(self.scope.allInvoicesMap);
                        }
                      }
                    } else {
                      $("#loading_img").hide();
                      $("#messageDiv").html("<label class='errorMessage'>"+data["responseText"]+"</label>");
                      $("#messageDiv").show();
                      setTimeout(function(){
                          $("#messageDiv").hide();
                      },4000);
                    }
                },function(xhr){
                  console.error("Error while loading: bundleNames"+xhr);
                });
              }

          } else {
            if(this.scope.appstate.attr('globalSearch')==undefined)
              this.scope.appstate.attr('globalSearch',true);
            this.scope.attr("localGlobalSearch", this.scope.appstate.attr('globalSearch'));
          }
      }
  }
});


var invoiceExportToExcel=function(appstate){
    var invoiceRequest={};
    invoiceRequest.searchRequest=UserReq.formGlobalRequest(appstate).searchRequest;
    invoiceRequest.searchRequest.type="invoices";
    //invoiceRequest.excelOutput=true;
    return UserReq.formRequestDetails(invoiceRequest);
};

function CurrencyFormat(number)
{
  var n = number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
  return n;
}
function alignGrid(){
  var colLength = $('#invoiceGrid table>thead>tr>th').length;
  var rowLength = $('#invoiceGrid table>tbody>tr').length;
  var tableWidth = 0;
  //console.log("rowLength" + rowLength);
  if(rowLength>0){
      for(var i=1;i<=colLength;i++){
        var tdWidth = $('#invoiceGrid table>tbody>tr>td:nth-child('+i+')').outerWidth();
        if(i==1) //For the column holding 'check box'
          tdWidth = 35;
        if(i==2) // For the footer column hold 'Total in Regional Currency'
          tdWidth = 225;
        if(i>1 && tdWidth<125) // For all other columns which has the size less than 125px
          tdWidth = 125;
        if(i==11 && tdWidth<150) //For the title 'Payment Bundle Name'
          tdWidth = 150;
        //console.log("td "+i+" width "+$('#invoiceGrid table>tbody>tr>td:nth-child('+i+')').outerWidth());
        $('#invoiceGrid table>thead>tr>th:nth-child('+i+')').css("width",tdWidth);
        $('#invoiceGrid table>tbody>tr>td:nth-child('+i+')').css("width",tdWidth);
        $('#invoiceGrid table>tfoot>tr>td:nth-child('+i+')').css("width",tdWidth);
        //$('#invoiceGrid table>tfoot>tr>td:nth-child('+i+')').css("width",tdWidth);
        tableWidth += tdWidth;
      }
      $("#invoiceGrid table").css("width",tableWidth);
  }
}
export default page;
