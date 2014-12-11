import Component from 'can/component/';
import View from 'can/view/';
import _ from 'lodash';

import GlobalParameterBar from 'components/global-parameter-bar/';
import Grid from 'components/grid/';
import gridtemplate from './gridtemplate.stache!';
import stache from 'can/view/stache/';

import UserReq from 'utils/request/';
import periodWidgetHelper from 'utils/periodWidgetHelpers';
import StatusCodes from 'models/common/statuscodes/';
import GetAllInvoices from 'models/getAllInvoices/';
import Invoice from 'models/invoice/';
import BundleNamesModel from 'models/payment/bundleNames/';
import invoicemap from 'models/sharedMap/invoice';

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

/* Extend grid with the columns */
Grid.extend({
  tag: 'rn-grid-invoice',
  template: gridtemplate,
  scope: {
    appstate:undefined,
    columns: [
      {
        id: 'invId',
        title: '',
        contents: function(row) {
          return stache('{{#invId}}<input type="checkbox" value="{{invId}}" {{#if isChecked}}checked{{/if}}/>{{/invId}}')({invId: row.invId, isChecked: row.__isChecked});
        }
      },
      {
        id: 'entity',
        title: 'Entity',
        contents: function(row) { return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}} {{entity}}')({entity: row.entity, isChild: row.__isChild}); }
      },
      {
        id: 'invoiceType',
        title: 'Invoice Type'
      },
      {
        id: 'contentType',
        title: 'Content Type'
      },
      {
        id: 'country',
        title: 'Country'
      },
      {
        id: 'invoiceNum',
        title: 'Invoice No'
      },
      {
        id: 'invoiceAmt',
        title: 'Invoice Amount'
      },
      {
        id: 'currency',
        title: 'Currency'
      },
      {
        id: 'dueDate',
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
  }
});

var page = Component.extend({
  tag: 'page-invoices',
  template: template,
  scope: {
    localGlobalSearch:undefined,
    allInvoicesMap:[],
    checkedRows: [],
    sortColumns:[],
    tokenInput: [],
    disableBundleName:undefined,
    newpaymentbundlenamereq:undefined,
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
    this.scope.appstate.attr("renderGlobalSearch",true);

  },
  helpers: {
        createPBRequest: function(){
          var bundleNamesRequest = {"bundleSearch":{}};

          var serTypeId = this.appstate.attr('storeType');
          var regId = this.appstate.attr('region');

          //bundleNamesRequest["mode"] = "Get"

          if(typeof(serTypeId)!="undefined")
            bundleNamesRequest.bundleSearch["serviceTypeId"] = serTypeId['id'];

          if(typeof(regId)=="undefined")
            bundleNamesRequest.bundleSearch["region"] = "";
          else
            bundleNamesRequest.bundleSearch["region"] = regId['value'];

          bundleNamesRequest.bundleSearch["type"] = "invoice";


          //console.log("GetBundleNamesRequest is "+JSON.stringify(bundleNamesRequest));

          return JSON.stringify(bundleNamesRequest);
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

         /* The below code calls {scope.appstate} change event that gets the new data for grid*/
          /* All the neccessary parameters will be set in that event */
         if(self.scope.appstate.attr('globalSearch')){
            self.scope.appstate.attr('globalSearch', false);
          }else{
            self.scope.appstate.attr('globalSearch', true);
          }
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
        this.scope.appstate.attr("renderGlobalSearch",true);
        var invoiceData = this.scope.attr().allInvoicesMap[0].invoices;
        var footerData = this.scope.attr().allInvoicesMap[0].footer;
        //console.log("dsada "+JSON.stringify(invoiceData));
        var gridData = {"data":[],"footer":[]};
        var currencyList = {};
        if(invoiceData!=null){
          for(var i=0;i<invoiceData.length;i++){
              var invTemp = {};
              invTemp["invId"] = invoiceData[i]["invId"];
              invTemp["__isChild"] = false;
              invTemp["entity"] = (invoiceData[i]["entityName"]==null)?"":invoiceData[i]["entityName"];
              invTemp["invoiceType"] = (invoiceData[i]["invoiceType"]==null)?"":invoiceData[i]["invoiceType"];
              invTemp["contentType"] = "";
              invTemp["country"] = "";
              invTemp["invoiceNum"] = (invoiceData[i]["invoiceNumber"]==null)?"":invoiceData[i]["invoiceNumber"];
              invTemp["invoiceAmt"] = (invoiceData[i]["invoiceAmount"]==null)?0:parseFloat(invoiceData[i]["invoiceAmount"]);
              invTemp["dueDate"] = (invoiceData[i]["invoiceDueDate"]==null)?"":invoiceData[i]["invoiceDueDate"];
              invTemp["currency"] = (invoiceData[i]["invoiceCcy"]==null)?"":invoiceData[i]["invoiceCcy"];
              invTemp["status"] = (invoiceData[i]["status"]==null)?"":StatusCodes[invoiceData[i]["status"]];
              invTemp["bundleName"] = (invoiceData[i]["bundleName"]==null || invoiceData[i]["bundleName"]=="--Select--")?"":invoiceData[i]["bundleName"];
              invTemp["comments"] = (invoiceData[i]["comments"]==null || invoiceData[i]["comments"].length==0)?"":invoiceData[i]["comments"][0]["comments"];

              if(currencyList[invTemp["currency"]]!=undefined){
                currencyList[invTemp["currency"]] = parseFloat(currencyList[invTemp["currency"]])+parseFloat(invTemp["invoiceAmt"]);
              }else {
                currencyList[invTemp["currency"]] = parseFloat(invTemp["invoiceAmt"]);
              }

              invTemp["invoiceAmt"] = CurrencyFormat(invTemp["invoiceAmt"]); //This is to format the amount with commas
              gridData.data.push(invTemp);
              var insertedId = gridData.data.length-1;

              var invoiceLineItems = invoiceData[i]["invoiceLines"];
              var contentTypeArr = [], countryArr = [];
              if(invoiceLineItems.length > 0){
                for(var j=0;j<invoiceLineItems.length;j++){
                  var invLITemp={};
                  invLITemp["invId"] = "";
                  invLITemp["__isChild"] = true;
                  invLITemp["entity"] = "";
                  invLITemp["invoiceType"] = "";
                  invLITemp["contentType"] = (invoiceLineItems[j]["contentGrpName"]==null)?"":invoiceLineItems[j]["contentGrpName"];
                  invLITemp["country"] = (invoiceLineItems[j]["country"]==null)?"":invoiceLineItems[j]["country"];
                  invLITemp["invoiceNum"] = "";
                  invLITemp["invoiceAmt"] = (invoiceLineItems[j]["lineAmount"]==null)?0:invoiceLineItems[j]["lineAmount"];
                  invLITemp["dueDate"] = "";
                  invLITemp["currency"] = invTemp["currency"];
                  invLITemp["status"] = "";
                  invLITemp["bundleName"] = "";
                  invLITemp["comments"] = "";
                  contentTypeArr.push(invLITemp["contentType"]);
                  countryArr.push(invLITemp["country"]);
                  gridData.data.push(invLITemp);
                }

              }

              /*Below function is to remove the duplicate content type and find the count */
              contentTypeArr = contentTypeArr.filter( function( item, index, inputArray ) {
                     return inputArray.indexOf(item) == index;
              });
              if(contentTypeArr.length>1){
                gridData.data[insertedId]["contentType"] = contentTypeArr.length+" types of Content";
              }
              else if(contentTypeArr.length==1)
                gridData.data[insertedId]["contentType"] = contentTypeArr[0];

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
            var regCcyTemp = {"invId":"", "__isChild":false, "entity":"Total in Regional Currency", "invoiceType":"", "contentType":"", "country":"", "invoiceNum":"","invoiceAmt":"", "dueDate":"", "currency":"", "status":"", "bundleName":"", "comments":""}; 
            regCcyTemp["invoiceAmt"] = CurrencyFormat(footerData["regAmtTot"]);
            regCcyTemp["currency"] = footerData["regCcy"];
            gridData["footer"].push(regCcyTemp);
            for(var obj in footerData["amtCcyMap"]){
              var ccyTemp = {"invId":"", "__isChild":true, "entity":"", "invoiceType":"", "contentType":"", "country":"", "invoiceNum":"","invoiceAmt":"", "dueDate":"", "currency":"", "status":"", "bundleName":"", "comments":""};
              ccyTemp["invoiceAmt"] = CurrencyFormat(footerData["amtCcyMap"][obj]);
              ccyTemp["currency"] = obj;
              gridData["footer"].push(ccyTemp);
            }

          //console.log("gridData is "+JSON.stringify(gridData));
          //console.log("Footer is "+JSON.stringify(gridData.footer));
          var rows = new can.List(gridData.data);
          var footerrows = new can.List(gridData.footer);
          $('#invoiceGrid').html(stache('<rn-grid-invoice rows="{rows}" footerrows="{footerrows}" emptyrows="{emptyrows}"></rn-grid-invoice>')({rows, footerrows, emptyrows:false}));
        } else {
          $('#invoiceGrid').html(stache('<rn-grid-invoice emptyrows="{emptyrows}"></rn-grid-invoice>')({emptyrows:true}));
        }

    },
     "#btnAdd click": function(){
            this.scope.appstate.attr('page','create-invoice');
            invoicemap.attr('invoiceid','');
    },
    ".rn-grid>tbody>tr td dblclick": function(item, el, ev){
          //var invoiceid = el.closest('tr').data('row').row.id;
          var self=this;
          var row = item.closest('tr').data('row').row;
          var invoiceid = row.invId;
          var status = row.status;
          var invoiceno = row.invoiceNum;
          //console.log("invoice id is "+JSON.stringify(invoiceid));
          if(status=="UNBUNDLED" || status=="PENDING_WITH_BM (Bundled)" || status=="BM_REJECTED"){
            invoicemap.attr('invoiceid',invoiceid);
            self.scope.appstate.attr('page','create-invoice');
            
          } else {
            $("#messageDiv").html("<label class='errorMessage'>"+invoiceno+" : Cannot edit the invoice </label>");
            $("#messageDiv").show();
            setTimeout(function(){
                $("#messageDiv").hide();
            },4000)
          }
    },
    ".rn-grid>thead>tr>th click": function(item, el, ev){
          var self=this;
           //console.log($(item[0]).attr("class"));
          var val = $(item[0]).attr("class");
           self.scope.attr('sortColumns').push(val);

           /* The below code calls {scope.appstate} change event that gets the new data for grid*/
           /* All the neccessary parameters will be set in that event */
           if(self.scope.appstate.attr('globalSearch')){
              self.scope.appstate.attr('globalSearch', false);
            }else{
              self.scope.appstate.attr('globalSearch', true);
            }

    },
    '.invId :checkbox change': function(item, el, ev) {
      var self = this;
      var val = parseInt($(item[0]).attr("value"));
      var row = item.closest('tr').data('row').row;

      if($(item[0]).is(":checked")){
          row.attr('__isChecked', true);
          self.scope.attr('checkedRows').push(val);

      } else {
          self.scope.attr('checkedRows').each(function(value, key) {
              row.attr('__isChecked', false);
              if(val == value){
                  var i = self.scope.attr('checkedRows').indexOf(value);
                  self.scope.attr('checkedRows').splice(i,1);
              }
          });
      }
      //console.log("Checked rows: "+JSON.stringify(self.scope.attr('checkedRows')));
    },
    "{checkedRows} change": function(item,el,ev){
          var self = this;
          //console.log(JSON.stringify(self.scope.checkedRows.attr()));
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
          }else {
              $("#messageDiv").text("");
              if(self.scope.attr('checkedRows').length > 0){
                  $("#btnSubmit").removeAttr("disabled");
                  $("#paymentBundleNames").removeAttr("disabled");
              }
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
          var invoiceDelete = {"searchRequest":{}};
          invoiceDelete.searchRequest.ids = self.scope.checkedRows.attr();
          console.log("Delete request params are "+JSON.stringify(UserReq.formRequestDetails(invoiceDelete)));
          Invoice.update(UserReq.formRequestDetails(invoiceDelete),"invoiceDelete",function(data){
                  console.log("Delete response is "+JSON.stringify(data));
          if(data["status"]=="SUCCESS"){
             $("#messageDiv").html("<label class='successMessage'>"+data[0]["responseText"]+"</label>")
             $("#messageDiv").show();
             setTimeout(function(){
                $("#messageDiv").hide();
             },2000);

             /* The below calls {scope.appstate} change event that gets the new data for grid*/
             if(this.scope.appstate.attr('globalSearch')){
                this.scope.appstate.attr('globalSearch', false);
              }else{
                this.scope.appstate.attr('globalSearch', true);
              }
          }
          else{
            $("#messageDiv").html("<label class='errorMessage'>Failed to delete invoice</label>");
            $("#messageDiv").show();
            setTimeout(function(){
                $("#messageDiv").hide();
            },2000)
          }

          },function(xhr){
            console.error("Error while loading: bundleNames"+xhr);
          });
      },
      "#paymentBundleNames change": function(){
          var self = this;
          var pbval = $("#paymentBundleNames").val();
          if(pbval=="createB"){

              var regId = self.scope.appstate.attr('region');
              var invoiceData = self.scope.attr().allInvoicesMap[0].invoices;
              //console.log(JSON.stringify(invoiceData));
              //console.log(JSON.stringify(self.scope.checkedRows.attr()));


              var selInvoices = self.scope.checkedRows.attr();
              //console.log("selInvoices "+JSON.stringify(selInvoices));
              var bundleLines = [];
              for(var i=0;i<invoiceData.length;i++){
                var invId = invoiceData[i]["invId"];
                var lineType = invoiceData[i]["invoiceType"];
                var periodType = invoiceData[i]["periodType"];
                var invoiceLineItems = invoiceData[i]["invoiceLines"];
                  //console.log("here is "+invoiceLineItems.length+","+selInvoices.indexOf(invId.toString()));

                if(invoiceLineItems.length > 0 && selInvoices.indexOf(invId)>-1){
                  for(var j=0;j<invoiceLineItems.length;j++){
                    var temp = {};
                      temp["refLineId"]= invoiceLineItems[j]["invLineId"];
                      temp["refLineType"] = lineType;
                      temp["periodType"] = (periodType==null)?"P":periodType;
                      bundleLines.push(temp);
                  }
                }

              }
              //console.log("bundleLines "+JSON.stringify(bundleLines));


              var bundleType = lineType;
              var newBundleNameRequest = {"paymentBundle":{}};
              var bundleRequest = {};

              bundleRequest["region"] = regId['value'];
              bundleRequest["bundleType"] =lineType;
              bundleRequest["bundleDetailsGroup"] =bundleLines;
              newBundleNameRequest["paymentBundle"] = bundleRequest;
              console.log("New Bundle name request is "+JSON.stringify(newBundleNameRequest));
              self.scope.attr('newpaymentbundlenamereq', newBundleNameRequest);
          }
      },
      "#btnSubmit click":function(){
        var self = this;
        var invoiceData = this.scope.attr().allInvoicesMap[0].invoices;
        //console.log(JSON.stringify(invoiceData));
        //console.log(JSON.stringify(self.scope.checkedRows.attr()));


        var selInvoices = self.scope.checkedRows.attr();
        //console.log("selInvoices "+JSON.stringify(selInvoices));
        var bundleLines = [];
        for(var i=0;i<invoiceData.length;i++){
          var invId = invoiceData[i]["invId"];
          var lineType = invoiceData[i]["invoiceType"];
          var periodType = invoiceData[i]["periodType"];
          var invoiceLineItems = invoiceData[i]["invoiceLines"];
            //console.log("here is "+invoiceLineItems.length+","+selInvoices.indexOf(invId.toString()));

          if(invoiceLineItems.length > 0 && selInvoices.indexOf(invId)>-1){
            for(var j=0;j<invoiceLineItems.length;j++){
              var temp = {};
                temp["refLineId"]= invoiceLineItems[j]["invLineId"];
                temp["refLineType"] = lineType;
                temp["periodType"] = (periodType==null)?"P":periodType;
                bundleLines.push(temp);
            }
          }

        }
        //console.log("bundleLines "+JSON.stringify(bundleLines));


        var bundleType = lineType;
        var overAllBundleRequest = {"paymentBundle":[]};
        var bundleRequest = {};
        bundleRequest["bundleId"] = $("#paymentBundleNames :selected").val();
        bundleRequest["bundleName"] = $("#paymentBundleNames :selected").text();
        if($("#newPaymentBundle").val())
          bundleRequest["bundleName"] = $("#newPaymentBundle").val();

        bundleRequest["bundleType"] =lineType;
        bundleRequest["mode"] ="ADD";
        bundleRequest["bundleLines"] =bundleLines;

        overAllBundleRequest["paymentBundle"].push(bundleRequest);
        console.log("Add to bundle request is "+JSON.stringify(UserReq.formRequestDetails(overAllBundleRequest)));
        BundleNamesModel.create(UserReq.formRequestDetails(overAllBundleRequest),function(data){
            console.log("passing params is "+JSON.stringify(data));
            if(data["responseText"]=="SUCCESS"){
             $("#messageDiv").html("<label class='successMessage'>Invoices added to payment bundle successfully</label>")
             $("#messageDiv").show();
             setTimeout(function(){
                $("#messageDiv").hide();
             },2000);
            }
            else
              $("#messageDiv").html("<label class='errorMessage'>Failed to add invoices</label>")
        },function(xhr){
          console.error("Error while loading: bundleNames"+xhr);
        });


      },
      '{scope.appstate} change': function() {
          var self=this;
          //console.log("appState set to "+JSON.stringify(this.scope.appstate.attr()));
          if(this.scope.attr("localGlobalSearch") != this.scope.appstate.attr('globalSearch')){
              this.scope.attr("localGlobalSearch",this.scope.appstate.attr('globalSearch'));

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
                invSearchRequest.searchRequest["periodFrom"] = periodWidgetHelper.getFiscalPeriod(periodFrom);

              if(typeof(periodTo)=="undefined")
                invSearchRequest.searchRequest["periodTo"] = "";
              else
                invSearchRequest.searchRequest["periodTo"] = periodWidgetHelper.getFiscalPeriod(periodTo);

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
              invSearchRequest.searchRequest["offset"] = "0";
              invSearchRequest.searchRequest["limit"] = "10";

              var filterData = self.scope.tokenInput.attr();
              var newFilterData = [];
              if(filterData.length>0){
                for(var p=0;p<filterData.length;p++)
                  newFilterData.push(filterData[p]["name"]);
              }
              invSearchRequest.searchRequest["filter"] = newFilterData;

              invSearchRequest.searchRequest["sortBy"] = self.scope.sortColumns.attr().toString();
              invSearchRequest.searchRequest["sortOrder"] = "ASC";

              console.log("Request are "+JSON.stringify(UserReq.formRequestDetails(invSearchRequest)));
              GetAllInvoices.findOne(UserReq.formRequestDetails(invSearchRequest),function(data){
                  //console.log("response is "+JSON.stringify(data.attr()));
                  self.scope.allInvoicesMap.replace(data);


              },function(xhr){
                console.error("Error while loading: bundleNames"+xhr);
              });

          }
      }
  }
});

function CurrencyFormat(number)
{
  var n = number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
  return n;
}

export default page;
