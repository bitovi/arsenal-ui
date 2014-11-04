import Component from 'can/component/';
import View from 'can/view/';
import _ from 'lodash';

import GlobalParameterBar from 'components/global-parameter-bar/';
import Grid from 'components/grid/';
import stache from 'can/view/stache/';

import GetAllInvoices from 'models/getAllInvoices/';
import invoicemap from 'models/sharedMap/invoice';
import topfilterMap from 'models/sharedMap/topfilter';

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
        id: 'id',
        title: '',
        contents: function(row) {
          return stache('{{#id}}<input type="checkbox" value="{{id}}"/>{{/id}}')({id: row.id});
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
    ],
    checkedRows: []
  },
  events: {
    '.open-toggle click': function(el, ev) {
      var row = el.closest('tr').data('row').row;
      row.attr('__isOpen', !row.attr('__isOpen'));
    },
    '.id :checkbox change': function(item, el, ev) {
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
              $("#invoiceTypeError").html("<label class='errorMessage'>Selected rows has different Invoice Types</label>")
          }else {
              $("#paymentBundleNames").removeAttr("disabled");
              $("#invoiceTypeError").text("");
              if(self.scope.attr('checkedRows').length > 0)
                  $("#btnSubmit").removeAttr("disabled");

          }
      }
  }
});

var page = Component.extend({
  tag: 'page-invoices',
  template: template,
  scope: {
    "tokenInput": [],
    refreshTokenInput: function(val, type){
      //console.log("val is "+JSON.stringify(val));
      var self = this;
      //var prev = self.attr('refreshCount');

        if(type=="Add")
          self.attr('tokenInput').push(val);
        else if(type=="Delete"){
          //console.log(JSON.stringify(self.tokenInput.attr()));
          this.attr('tokenInput').each(function(value, key) {

            console.log(key+" "+val.id+" "+value.id);
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
        ],
        allInvoicesMap:[]
  },
  init: function(){
    console.log(" loading Invoices");


  },
  events: {
    "inserted": function(){
      topfilterMap.attr("show", true);
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
          if(values[0][0]["responseCode"]==="0000")
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
          if(values[0][0]["responseCode"]=="0000"){
            self.scope.allInvoicesMap.replace(values[0][0]);
          }

        });
    },
    "{allInvoicesMap} change": function() {
        var invoiceData = this.scope.attr().allInvoicesMap[0].invoices;

        var gridData = {"data":[]};

        for(var i=0;i<invoiceData.length;i++){
            var invTemp = {};
            invTemp["id"] = invoiceData[i]["id"];
            invTemp["__isChild"] = false;
            invTemp["entity"] = invoiceData[i]["entityId"];
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
                invLITemp["id"] = "";
                invLITemp["__isChild"] = true;
                invLITemp["entity"] = "";
                invLITemp["invoiceType"] = "";
                invLITemp["contentType"] = invoiceLineItems[j]["contentType"];
                invLITemp["country"] = invoiceLineItems[j]["countryId"];
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
        //console.log(JSON.stringify(gridData));
        var rows = new can.List(gridData.data);
        $('#invoiceGrid').html(stache('<rn-grid rows="{rows}"></rn-grid>')({rows}));
         

    },
     "#btnAdd click": function(){
            this.scope.appstate.attr('page','create-invoice');
            invoicemap.attr('invoiceid','');
    },
    ".rn-grid>tbody>tr dblclick": function(){
           this.scope.appstate.attr('page','create-invoice');
           invoicemap.attr('invoiceid','123');
    }
  }
});

export default page;
