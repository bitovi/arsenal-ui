import Component from 'can/component/';
import View from 'can/view/';
import _ from 'lodash';

import GlobalParameterBar from 'components/global-parameter-bar/';
import Grid from 'components/grid/';
import stache from 'can/view/stache/';

import UserReq from 'utils/request/';
import GetAllInvoices from 'models/getAllInvoices/';
import Invoice from 'models/invoice/';
import BundleNamesModel from 'models/payment/bundleNames/';
import invoicemap from 'models/sharedMap/invoice';


import dataTables from 'components/data-tables/';
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
  scope: {
    appstate:undefined,
    columns: [
      {
        id: 'invId',
        title: '',
        contents: function(row) {
          return stache('{{#invId}}<input type="checkbox" value="{{invId}}"/>{{/invId}}')({invId: row.invId});
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
        id: 'dueDate',
        title: 'Due date'
      },
      {
        id: 'currency',
        title: 'Currency'
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
    "gridcolumntext": [
          { "sTitle": "", "mData": "id" },
          { "sTitle": "Entity", "mData": "entity" },
          { "sTitle": "Invoice Type", "mData": "invoiceType" },
          { "sTitle": "Content Type", "mData": "contentType" },
          { "sTitle": "Country", "mData": "country" },
          { "sTitle": "Invoice No", "mData": "invoiceNum"},
          { "sTitle": "Invoice Amount", "mData": "invoiceAmt"},
          { "sTitle": "Due date", "mData": "dueDate"},
          { "sTitle": "Currency",  "mData": "currency"},
          { "sTitle": "Status",  "mData": "status"},
          { "sTitle": "Payment Bundle Name",  "mData": "bundleName"},
          { "sTitle": "User comments",  "mData": "comments"}
        ]
  },
  init: function(){
    this.scope.appstate.attr("renderGlobalSearch",true);

  },
  events: {

    "inserted": function(){
      /*var ingTemplate = View.stache("<data-grid name='invoiceSearchTable' type='getAllInvoices' columnText='{gridCoulmnText}'></data-grid>");
      var f = ingTemplate();
      $("#invoiceGrid").html( f );*/
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
              //alert(JSON.stringify(item));
                //doSearch(item,"add");
                //self.scope.tokenInputData.replace(item);
                self.scope.refreshTokenInput(item,"Add");
                //var $subComp = $('data-grid', self.element);
                //$subComp.scope().refreshTokenInput(item,"Add");

            },
            onDelete: function (item) {
                //doSearch(item,"delete");
                 //self.scope.tokenInputData.replace(item);
                 self.scope.refreshTokenInput(item,"Delete");
                //var $subComp = $('data-grid', self.element);
                //$subComp.scope().refreshTokenInput(item,"Delete");
            }
      });

      Promise.all([
            GetAllInvoices.findAll()
        ]).then(function(values) {
          //console.log(JSON.stringify(values[0][0].attr()));
          //if(values[0][0]["responseCode"]==="0000")
            self.scope.allInvoicesMap.replace(values[0][0]);
        });

    },
    "{tokenInput} change": function(){
          var self= this;
          console.log(JSON.stringify(self.scope.tokenInput.attr()));
          Promise.all([
              /* While search,  Token parameter has to be sent with page data */
              /* tokenInput holds that search token info */
            //AllInvoices.findAll({searchParam: tokenInput})
            GetAllInvoices.findAll()
        ]).then(function(values) {
            self.scope.allInvoicesMap.replace(values[0][0]);

        });
    },
    "{allInvoicesMap} change": function() {
        var invoiceData = this.scope.attr().allInvoicesMap[0].invoices;

        var gridData = {"data":[]};

        for(var i=0;i<invoiceData.length;i++){
            var invTemp = {};
            invTemp["invId"] = invoiceData[i]["invId"];
            invTemp["__isChild"] = false;
            invTemp["entity"] = invoiceData[i]["entityName"];
            invTemp["invoiceType"] = invoiceData[i]["invoiceType"];
            invTemp["contentType"] = "";
            invTemp["country"] = "";
            invTemp["invoiceNum"] = invoiceData[i]["invoiceNumber"];
            invTemp["invoiceAmt"] = invoiceData[i]["invoiceAmount"];
            invTemp["dueDate"] = invoiceData[i]["invoiceDueDate"];
            invTemp["currency"] = invoiceData[i]["invoiceCcy"];
            invTemp["status"] = invoiceData[i]["status"];
            invTemp["bundleName"] = invoiceData[i]["bundleName"];
            invTemp["comments"] = invoiceData[i]["comments"][0]["comments"];
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
                invLITemp["contentType"] = invoiceLineItems[j]["contentGrpName"];
                invLITemp["country"] = invoiceLineItems[j]["country"];
                invLITemp["invoiceNum"] = "";
                invLITemp["invoiceAmt"] = invoiceLineItems[j]["lineAmount"];
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
        //console.log("grid data is "+JSON.stringify(gridData));
        var rows = new can.List(gridData.data);
        $('#invoiceGrid').html(stache('<rn-grid rows="{rows}"></rn-grid>')({rows}));


    },
     "#btnAdd click": function(){
            this.scope.appstate.attr('page','create-invoice');
            invoicemap.attr('invoiceid','');
    },
    ".rn-grid>tbody>tr dblclick": function(){
           this.scope.appstate.attr('page','create-invoice');
           invoicemap.attr('invoiceid','104');
    },
    ".rn-grid>thead>tr>th click": function(item, el, ev){
          var self=this;
           //console.log($(item[0]).attr("class"));
          var val = $(item[0]).attr("class");
           self.scope.attr('sortColumns').push(val);
           
            var invSearchRequest = {};
            invSearchRequest.searchRequest = {};
            invSearchRequest.searchRequest["serviceTypeId"] = this.scope.appstate.attr('storeType');
            invSearchRequest.searchRequest["regionId"] = this.scope.appstate.attr('region');
            invSearchRequest.searchRequest["entityId"] = this.scope.appstate.attr('licensor');

            invSearchRequest.searchRequest["periodType"] = "P";
            invSearchRequest.searchRequest["periodFrom"] = "201304";
            invSearchRequest.searchRequest["periodTo"] = "201307";

            invSearchRequest.searchRequest["status"] = $("#inputAnalyze").val();
            invSearchRequest.searchRequest["offset"] = "0";
            invSearchRequest.searchRequest["limit"] = "10";
            invSearchRequest.searchRequest["filter"] = self.scope.tokenInput.attr();

            invSearchRequest.searchRequest["sortBy"] = self.scope.sortColumns.attr();
            invSearchRequest.searchRequest["sortOrder"] = "ASC";

            GetAllInvoices.findAll(UserReq.formRequestDetails(invSearchRequest),function(data){
                //console.log("passing params is "+JSON.stringify(data[0].attr()));
                self.scope.allInvoicesMap.replace(data[0]);
            },function(xhr){
              console.error("Error while loading: bundleNames"+xhr);
            });
    },
    '.invId :checkbox change': function(item, el, ev) {
      var self = this;
      var val = $(item[0]).attr("value");

      if($(item[0]).is(":checked"))
          self.scope.attr('checkedRows').push(val);
      else {
          self.scope.attr('checkedRows').each(function(value, key) {

              if(val == value){
                  var i = self.scope.attr('checkedRows').indexOf(value);
                  self.scope.attr('checkedRows').splice(i,1);
              }
          });
      }
      //console.log("Checked rows: "+JSON.stringify(self.scope.attr('checkedRows')));
    },
    "{checkedRows} change": function(){
          var self = this;
          //console.log(JSON.stringify(self.scope.checkedRows.attr()));
          if(self.scope.attr('checkedRows').length > 0){
              $("#btnDelete").removeAttr("disabled");
              $("#btnAttach").removeAttr("disabled");
              $("#btnSubmit").removeAttr("disabled");
          }
          else{
              $("#btnDelete").attr("disabled","disabled");
              $("#btnAttach").attr("disabled","disabled");
              $("#btnSubmit").attr("disabled","disabled");
          }
          var flag=true;
          self.scope.attr('checkedRows').each(function(val, key) {
              self.scope.attr('checkedRows').each(function(value, key) {
                  if(val!=value)
                      flag = false;
              });
          });
          if(flag==false){
              $("#paymentBundleNames").attr("disabled","disabled");
              $("#btnSubmit").attr("disabled","disabled");
              $("#messageDiv").html("<label class='errorMessage'>Selected rows has different Invoice Types</label>");
          }else {
              $("#paymentBundleNames").removeAttr("disabled");
              $("#messageDiv").text("");
              if(self.scope.attr('checkedRows').length > 0)
                  $("#btnSubmit").removeAttr("disabled");

          }
      },
      "#inputAnalyze change": function(){
              var self=this;
              var invSearchRequest = {};
              invSearchRequest.searchRequest = {};
              invSearchRequest.searchRequest["serviceTypeId"] = this.scope.appstate.attr('storeType');
              invSearchRequest.searchRequest["regionId"] = this.scope.appstate.attr('region');
              invSearchRequest.searchRequest["entityId"] = this.scope.appstate.attr('licensor');

              invSearchRequest.searchRequest["periodType"] = "P";
              invSearchRequest.searchRequest["periodFrom"] = "201304";
              invSearchRequest.searchRequest["periodTo"] = "201307";

              invSearchRequest.searchRequest["status"] = $("#inputAnalyze").val();
              invSearchRequest.searchRequest["offset"] = "0";
              invSearchRequest.searchRequest["limit"] = "10";
              invSearchRequest.searchRequest["filter"] = self.scope.tokenInput.attr();

              invSearchRequest.searchRequest["sortBy"] = self.scope.sortColumns.attr();
              invSearchRequest.searchRequest["sortOrder"] = "ASC";

              GetAllInvoices.findAll(UserReq.formRequestDetails(invSearchRequest),function(data){
                  //console.log("passing params is "+JSON.stringify(data[0].attr()));
                  self.scope.allInvoicesMap.replace(data[0]);
              },function(xhr){
                console.error("Error while loading: bundleNames"+xhr);
              });
      },
      "#btnDelete click": function(){
          var self=this;
          console.log("selected Invoices are "+ self.scope.checkedRows.attr());
          var invoiceDelete = {"searchRequest":{}};
          invoiceDelete.searchRequest.ids = self.scope.checkedRows.attr();
          /* Getting cross origin error - need to check with Hardeep to correct the JSON REquest Header */
          Invoice.update(UserReq.formRequestDetails(invoiceDelete),"invoiceDelete",function(data){
                  console.log("passing params is "+JSON.stringify(data[0]));
          if(data[0]["status"]=="SUCCESS"){
             $("#messageDiv").html("<label class='successMessage'>"+data[0]["responseText"]+"</label>")
             $("#messageDiv").show();
             setTimeout(function(){
                $("#messageDiv").hide();
             },2000)
          }
          else 
            $("#messageDiv").html("<label class='errorMessage'>Failed to delete invoice</label>")

          },function(xhr){
            console.error("Error while loading: bundleNames"+xhr);
          });
      },
      "#btnSubmit click":function(){
        var self = this;
        var invoiceData = this.scope.attr().allInvoicesMap[0].invoices;
        //console.log(JSON.stringify(invoiceData));
        console.log(JSON.stringify(self.scope.checkedRows.attr()));


        var selInvoices = self.scope.checkedRows.attr();
        var bundleLines = [];
        for(var i=0;i<invoiceData.length;i++){
          var invId = invoiceData[i]["invId"];
          var lineType = invoiceData[i]["invoiceType"];
          var periodType = invoiceData[i]["periodType"];
          var invoiceLineItems = invoiceData[i]["invoiceLines"];
          if(invoiceLineItems.length > 0 && selInvoices.indexOf(invId)>-1){
            for(var j=0;j<invoiceLineItems.length;j++){
              var temp = {};
                temp["lineId"]= invoiceLineItems[j]["invLineId"];
                temp["lineType"] = lineType;
                temp["periodType"] = periodType; 
                bundleLines.push(temp);
            }
          }
          
        }
        
        var bundleType = lineType;
        var bundleRequest = {};
        bundleRequest["bundleId"] = $("#paymentBundleNames :selected").val();
        bundleRequest["bundleName"] = $("#paymentBundleNames :selected").text();
        if($("#newPaymentBundle").val())
          bundleRequest["bundleName"] = $("#newPaymentBundle").val();
         
        bundleRequest["bundleType"] =lineType;
        bundleRequest["mode"] ="ADD";
        bundleRequest["bundleLines"] =bundleLines;

        console.log(JSON.stringify(bundleRequest));
        BundleNamesModel.create(UserReq.formRequestDetails(bundleRequest),function(data){
            console.log("passing params is "+JSON.stringify(data));
            if(data[0]["responseText"]=="SUCCESS"){
             $("#messageDiv").html("<label class='successMessage'>Invoices added to payment bundle successfully</label>")
             $("#messageDiv").show();
             setTimeout(function(){
                $("#messageDiv").hide();
             },2000)
            }
            else 
              $("#messageDiv").html("<label class='errorMessage'>Failed to add invoices</label>")
        },function(xhr){
          console.error("Error while loading: bundleNames"+xhr);
        });


      },
      '{scope.appstate} change': function() {
          var self=this;
          console.log("appState set to "+JSON.stringify(this.scope.appstate.attr()));
          if(this.scope.attr("localGlobalSearch") != this.scope.appstate.attr('globalSearch') ){
              this.scope.attr("localGlobalSearch",this.scope.appstate.attr('globalSearch'));
              console.log("User clicked on invoice search");

              var invSearchRequest = {};
              invSearchRequest.searchRequest = {};
              invSearchRequest.searchRequest["serviceTypeId"] = this.scope.appstate.attr('storeType');
              invSearchRequest.searchRequest["regionId"] = this.scope.appstate.attr('region');
              invSearchRequest.searchRequest["entityId"] = this.scope.appstate.attr('licensor');

              invSearchRequest.searchRequest["periodType"] = "P";
              invSearchRequest.searchRequest["periodFrom"] = "201304";
              invSearchRequest.searchRequest["periodTo"] = "201307";

              invSearchRequest.searchRequest["status"] = $("#inputAnalyze").val();
              invSearchRequest.searchRequest["offset"] = "0";
              invSearchRequest.searchRequest["limit"] = "10";
              invSearchRequest.searchRequest["filter"] = self.scope.tokenInput.attr();

              invSearchRequest.searchRequest["sortBy"] = self.scope.sortColumns.attr();
              invSearchRequest.searchRequest["sortOrder"] = "ASC";

              GetAllInvoices.findAll(UserReq.formRequestDetails(invSearchRequest),function(data){
                  //console.log("passing params is "+JSON.stringify(data[0].attr()));
                  self.scope.allInvoicesMap.replace(data[0]);
                  

              },function(xhr){
                console.error("Error while loading: bundleNames"+xhr);
              });

          }
      }
  }
});

export default page;
