import Component from 'can/component/';
import stache from 'can/view/stache/';

import template from './template.stache!';

import _less from './page-on-account.less!';

import stache from 'can/view/stache/';

import OnAccountGrid from './grid-onaccount-balance/';
import newOnAccountGrid from './grid-new-onaccount/';
import fileUpload from 'components/file-uploader/';

import createpb from 'components/create-pb/';
import utils from 'components/page-on-account/utils';
import proposedOnAccountGrid from './grid-proposed-onaccount/';
import proposedOnAccount from 'models/onAccount/proposedOnAccount/';
import requestHelper from 'utils/request/';
import newOnAccountModel from 'models/onAccount/newOnAccount/'
import LicensorCurrency from 'models/common/licensorcurrency/';
import proposedOnAccount from 'models/onAccount/proposedOnAccount/';
import Comments from 'components/multiple-comments/';
import periodWidgetHelper from 'utils/periodWidgetHelpers';
import fileUpload from 'components/file-uploader/';
import onAccountBalance from 'models/onAccount/onAccountBalance/';

import copy from 'components/copy-clipboard/';
import exportToExcel from 'components/export-toexcel/';

fileUpload.extend({
  tag: 'rn-file-uploader-new',
    scope: {
        fileList : new can.List(),
        uploadedfileinfo:[],
        deletedFileInfo:[]
    },

    init: function(){
    this.scope.attr('uploadedfileinfo').replace([]);
},
    events:{
        "{uploadedfileinfo} change":function () {
            //Handling this using data as scope is not accessible from page-edit -invoice.
            $('rn-file-uploader-new').data('_d_uploadedFileInfo', this.scope.uploadedfileinfo);
            this.scope.fileList.replace(this.scope.uploadedfileinfo);
        },
        "{deletedFileInfo} change":function () {
            $('rn-file-uploader-new').data('_d_deletedFileInfo', this.scope.deletedFileInfo);
        }
    }
});

fileUpload.extend({
  tag: 'propose-rn-file-uploader',
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
        $('propose-rn-file-uploader').data('_d_uploadedFileInfo', this.scope.uploadedfileinfo);
          this.scope.fileList.replace(this.scope.uploadedfileinfo);

      }, 
      "{deletedFileInfo} change":function(){
        //this.scope.deletedFileInfo.replace(this.scope.deletedFileInfo);
        $('propose-rn-file-uploader').data('_d_deletedFileInfo', this.scope.deletedFileInfo);
      }
    }
 });

var page = Component.extend({
  tag: 'page-on-account',
  template: template,
  scope: {
    appstate:undefined,
    localGlobalSearch:undefined,
    request:{},
    onAccountRows:{},
    documents:[],
    newpaymentbundlenamereq:undefined,
    tabsClicked:"@",
    paymentBundleName:"@",
    usercommentsStore:"",
    proposedOnAccountUserCommentsStore:"",
    paymentBundleNameText:"",
    proposedOnAccountData:{},
    bundleNamesForDisplay:"",
    newOnAccountRows:[],
    licensorCurrencies:'@',
    errorMessage:"",
    showLoadingImage:"",
    quarters:[],
    csvcontent:[],
    uploadedfileinfo:[],
    uploadedfileinfonew:[],
    loadProposedONAccountPage:undefined,
    deletedFileInfo:[],
    balanceOnAccOffset: 0,
    proposeOnAccOffset: 0,
    tableScrollTop: 0,
    sortColumns:[],
    sortDirection: "asc",
    previouslyFetchOnAccRows:[],
    cancelnewbundlereq:'@'
  },
  init: function(){
    this.scope.appstate.attr("renderGlobalSearch",true);
    this.scope.uploadedfileinfo.replace([]);
    this.scope.uploadedfileinfonew.replace([]);
    this.scope.tabsClicked="NEW_ON_ACC";
    },
    events: {
      "inserted": function(){
       $("#searchDiv").show();
       this.scope.uploadedfileinfonew.replace([]);
       this.scope.uploadedfileinfo.replace([]);

       setTimeout(function(){
          $('#newonAccountGrid').html(stache('<rn-new-onaccount-grid emptyrows="{emptyrows}"></rn-new-onaccount-grid>')({emptyrows:true}));
       }, 10);
          disablePropose(true);
          disableCopyOnAccount(true);
          $("#onAccountEditDeleteDiv").hide();
      },
      'period-calendar onSelected': function (ele, event, val) {  
         this.scope.attr('periodchoosen', val);
        var which = $(ele).parent().find('input[type=text]').attr('id');
        this.scope.appstate.attr(which, this.scope.periodchoosen);
        $(ele).parent().find('input[type=text]').val(this.scope.periodchoosen).trigger( "change" );
        $(ele).closest('.calendarcls').find('.box-modal').hide();
        $(ele).blur();
         },
        '.updateperoid focus':function(el){
            el.closest('.calendarcls').find('.box-modal').is(':visible') ?
            el.closest('.calendarcls').find('.box-modal').hide():$(el).closest('.calendarcls').find('.box-modal').show();

            if(el.attr('id')=='copyQuarter'){
                hidethePeriods();
            }
        },
      '#proposeCopyToClipboard click':function(){ 
         $('#clonetable').empty().html($('.copyToClipboard').closest('#myTabs').next('.tab-content').find('.tab-pane:visible table:visible').clone(true).attr('id','dynamic'));
         $('copy-clipboard').slideDown(function(){
           $('body').css('overflow','hidden');
           $('#copyall').trigger('click');
        });       
      },
      "#paymentBundleNames change": function(){
          var self = this;
          var pbval = $("#paymentBundleNames").val();
          var paymentBundleNameText;
          self.scope.attr('newpaymentbundlenamereq',"undefined");
          if(pbval=="createB"){
              var regId = self.scope.appstate.attr('region');
              var newBundleNameRequest = {"paymentBundle":{}};
              var bundleRequest = {};
              bundleRequest.regionId = regId['id'];
              bundleRequest.periodFrom = self.scope.appstate.attr('periodFrom');
              bundleRequest.periodTo=self.scope.appstate.attr('periodTo');
              bundleRequest.periodType=self.scope.appstate.attr('periodType');
              bundleRequest.bundleType ="ON_ACCOUNT";
              newBundleNameRequest["paymentBundle"] = bundleRequest;
              self.scope.attr('newpaymentbundlenamereq', JSON.stringify(newBundleNameRequest));
          } else {
            paymentBundleNameText=$("#paymentBundleNames option:selected").text();
            self.scope.attr('paymentBundleName',pbval);
            self.scope.attr('paymentBundleNameText',paymentBundleNameText);
          }

          if(pbval != undefined || paymentBundleNameText != undefined){
            $("#propose").removeAttr("disabled");
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

           /* The below code calls {scope.appstate} change event that gets the new data for grid*/
           /* All the neccessary parameters will be set in that event */
           self.scope.appstate.attr('globalSearchButtonClicked', false);
           if(self.scope.appstate.attr('globalSearch')){
              self.scope.appstate.attr('globalSearch', false);
            }else{
              self.scope.appstate.attr('globalSearch', true);
            }

    },
      '{scope.appstate} change': function() {
         var self = this;
         self.scope.attr('errorMessage',''); 
         if(this.scope.attr("localGlobalSearch") != this.scope.appstate.attr('globalSearch')){
            this.scope.attr("localGlobalSearch",this.scope.appstate.attr('globalSearch'));
            var genObj = {};
            var message="";
            var request = frameRequest(self.scope.appstate);
            self.scope.attr('request',request);
            var periodType=this.scope.appstate.attr('periodType');
            var quarterFrom = periodWidgetHelper.getDisplayPeriod(this.scope.appstate.attr('periodFrom'),periodType);
            var quarterTo=periodWidgetHelper.getDisplayPeriod(this.scope.appstate.attr('periodTo'),periodType);
            var quarters = utils.getQuarter(quarterFrom,quarterTo);
            self.scope.attr('quarters',quarters);
            request.quarters=quarters;
            if(self.scope.tabsClicked=="NEW_ON_ACC"){
                  message = validateFilters(self.scope.appstate,true,true,true,true,true);
                  self.scope.attr('errorMessage',message); 
                  if(message.length == 0){
                    //console.log("inside NEW_ON_ACC");
                    $('#newonAccountGrid, #newonAccountGridComps').show();
                    genObj["licensorId"]=request.searchRequest.entityId.toString();
                    genObj["regionId"]=request.searchRequest.regionId;
                    self.scope.attr('showLoadingImage',true);
                    LicensorCurrency.findAll(requestHelper.formRequestDetails(genObj)).then(function(data) {
                    self.scope.attr('showLoadingImage',false);
                    var rows = utils.frameRows(data.licensorCurrencies,quarters);
                    request.rows=rows;
                    //request.quarters=quarters;
                    self.scope.newOnAccountRows.replace(rows);
                    self.scope.attr('licensorCurrencies',data.licensorCurrencies);
                    if(rows != null && rows.length >0){
                      disablePropose(false);
                      disableCopyOnAccount(false);
                    }
                    $('#newonAccountGrid').html(stache('<rn-new-onaccount-grid request={request}></rn-new-onaccount-grid>')({request}));
                  });
                }
            } else if(self.scope.tabsClicked=="ON_ACC_BALANCE"){
              message = validateFilters(self.scope.appstate,true,false,false,false,false);
              self.scope.attr('errorMessage',message); 
              self.scope.appstate.attr("offset", self.scope.attr('balanceOnAccOffset'));
              self.scope.appstate.attr("sortBy", self.scope.sortColumns.attr().toString());
              self.scope.appstate.attr("sortOrder", self.scope.attr('sortDirection'));

              if(message.length == 0){
                //request.searchRequest["type"] = "BALANCE";
                  request.appstate=this.scope.appstate;
                 $('#onAccountBalanceGrid').html(stache('<rn-onaccount-balance-grid request={request}></rn-onaccount-balance-grid>')({request})); 
                }    
              } else if(self.scope.tabsClicked=="PROPOSED_ON_ACC"){
                  message = validateFilters(self.scope.appstate,true,false,false,false,false);
                  self.scope.attr('errorMessage',message); 
                  if(message.length == 0){
                      self.scope.attr('loadProposedONAccountPage',Date.now());
                  }
                }
          }       
      },
      "#onAccountBalance click":function(el, ev){
        ev.preventDefault();
        this.scope.tabsClicked="ON_ACC_BALANCE";

        $('#newonAccountGrid, #newonAccountGridComps, #proposedonAccountDiv,#proposeOnAccountGridComps, #forminlineElements,#searchDiv, #onAccountEditDeleteDiv').hide();
        $('#onAccountBalanceDiv').show();


       if ($("rn-onaccount-balance-grid").find("tbody>tr").length) {
           $('rn-onaccount-balance-grid tbody tr').css("outline","0px solid #f1c8c8");
       }else{
           $('#onAccountBalanceGrid').html(stache('<rn-onaccount-balance-grid emptyrows={emptyrows}></rn-onaccount-balance-grid>')({emptyrows:true}));
       }
      },
      "#newonAccount click":function(el, ev){
        ev.preventDefault();
        this.scope.tabsClicked="NEW_ON_ACC";
        this.scope.uploadedfileinfonew.replace([]);
        this.scope.uploadedfileinfo.replace([]);

        $('#newonAccountGrid, #newonAccountGridComps, #forminlineElements,#searchDiv').show();
        $('#onAccountBalanceDiv, #proposedonAccountDiv,#proposeOnAccountGridComps, #onAccountEditDeleteDiv').hide();
      },
      "#proposedonAccount click":function(el, ev){
        ev.preventDefault();
        this.scope.tabsClicked="PROPOSED_ON_ACC";
        this.scope.uploadedfileinfonew.replace([]);
        this.scope.uploadedfileinfo.replace([]);

        $('#newonAccountGrid, #onAccountBalanceDiv, #forminlineElements,#searchDiv').hide();
        $('#proposedonAccountDiv,#proposeOnAccountGridComps, #onAccountEditDeleteDiv').show();
        disableProposedSubmitButton(true);
        disableEditORDeleteButtons(true);
       if (!$("rn-proposed-onaccount-grid").find("tbody>tr").length) {
         $('#proposedOnAccountGrid').html(stache('<rn-proposed-onaccount-grid emptyrows={emptyrows}></rn-proposed-onaccount-grid>')({emptyrows:true}));
       }
      },
      "#propose click":function(el,ev){
        var self = this;
        var paymentBundleName = $("#newPaymentBundle").val();
        if(paymentBundleName==undefined  ||  paymentBundleName==null || paymentBundleName ==""){
            paymentBundleName = self.scope.paymentBundleNameText;
        }
         //Add code for sending selected documens on New onaccount propose
          var uploadedfiles = $('rn-file-uploader-new').data('_d_uploadedFileInfo');

          if(uploadedfiles != undefined){
              for(var i =0; i < uploadedfiles.length; i++){
                  var tempDocument = {};
                  tempDocument.fileName = uploadedfiles[i].fileName;
                  tempDocument.location = uploadedfiles[i].filePath;
                  tempDocument.createdDate=Date.now();
                  self.scope.documents.push(tempDocument);
              }
          }

        var createrequest = utils.frameCreateRequest(self.scope.request,self.scope.onAccountRows,self.scope.documents,self.scope.usercommentsStore,self.scope.quarters,paymentBundleName,self.scope.paymentBundleName);
        if(createrequest.onAccount.onAccountDetails.length>0){
          var request = requestHelper.formRequestDetails(createrequest);
          //console.log('Request:'+JSON.stringify(request));
          newOnAccountModel.create(request,function(data){
            if(data["status"]=="SUCCESS"){
                displayMessage(data["responseText"],true);
              $("#propose").attr("disabled","disabled");
              $("#paymentBundleNames").val('');

              self.scope.documents.replace([]);
              self.scope.uploadedfileinfo.replace([]);
              var request = {};
              var rows = utils.frameRows(self.scope.attr('licensorCurrencies'),self.scope.quarters);
              request.rows=rows;
              request.quarters=self.scope.quarters;   
              $('#newonAccountGrid').html(stache('<rn-new-onaccount-grid request={request}></rn-new-onaccount-grid>')({request}));
              $('#usercomments').val("");
              self.scope.attr('cancelnewbundlereq',true);
              self.scope.attr('onAccountRows',rows);
              disablePropose(true);
            }else{
                  displayMessage(data["responseText"],false);
                }
            },function(xhr){
              console.error("Error while Creating: onAccount Details"+xhr);
            });
        }else{
          displayMessage('Empty Invoice Amounts',true);
        }
      },
      "#proposedDelete click":function(el,ev){
          $('#rejectModal').modal({
              "backdrop" : "static"
          });

      },
      '.btn-confirm-ok click': function(){
          $('#rejectModal').modal('hide');
          processDeleteOnAccount(this.scope,"delete");
        },
      "#proposedEdit click":function(el,ev){
          $('#submitPOA').removeAttr("disabled");
          var req = this.scope.request;
          var quarters = this.scope.attr('quarters');
          req.quarters=quarters;
          //console.log(this.scope.proposedOnAccountData.rows);
          req.attr('editableRows',this.scope.proposedOnAccountData.rows);
          req.attr('footerrows',this.scope.proposedOnAccountData.footerrows);
          var type = 'EDIT';
          disableProposedSubmitButton(false);
          disableEditORDeleteButtons(true);
          $('#proposedOnAccountGrid').html(stache('<rn-proposed-onaccount-grid request={req} type={type}></rn-proposed-onaccount-grid>')({req,type}));
      },
      "#submitPOA click":function(el,ev){
        var self = this;
        var comments = $(".new-comments").val();
        //Remove this for domain services
     
           var updatableRows = [];
          var req = self.scope.request;
          var type = 'EDIT';
          var rows = self.scope.proposedOnAccountData.rows;
          if(rows != undefined && rows.length >0){
              for(var i=0;i < rows.length;i++){
                    if(rows[i].__isChecked != undefined && rows[i].__isChecked){
                      updatableRows.push(rows[i]);
                      rows[i].attr('__isChecked',false);
                    }
                  }
           }

              /* adding new document */
              // make sure that you remove all files from _d_uploadedFileInfo that have just the term ftype = 'selectedFromLocal' & isServer
              var proposedDocs=[];
              var uploadedfiles = $('propose-rn-file-uploader').data('_d_uploadedFileInfo');
              if(uploadedfiles != undefined){
                  for(var i =0; i < uploadedfiles.length; i++){
                    if (uploadedfiles[i].ftype === 'pushedToServer') {
                        // This is the list of newly uploaded files.
                        var tempDocument = {};
                        tempDocument.fileName = uploadedfiles[i].fileName;
                        tempDocument.location = uploadedfiles[i].filePath;
                        tempDocument.status = "add";
                        proposedDocs.push(tempDocument);
                    } else if (uploadedfiles[i].isServer) {
                        // This is the existing server file list which will be send back as-is with no change.
                        // var tempDocument = {};
                        // tempDocument.fileName = uploadedfiles[i].fileName;
                        // tempDocument.location = uploadedfiles[i].location;
                        // tempDocument.docId = uploadedfiles[i].docId;
                        // tempDocument.id = uploadedfiles[i].id;
                        // tempDocument.status = uploadedfiles[i].status;
                        // proposedDocs.push(tempDocument);
                    }
                }
              }
              /* deleting existing documents */
              var deletedFiles = $('propose-rn-file-uploader').data('_d_deletedFileInfo');

              if (typeof deletedFiles !== 'undefined') {
                  for (var i = 0; i < deletedFiles.length; i++) {
                      if (deletedFiles[i].isServer) {
                          var tempDocument = {};
                          tempDocument.fileName = deletedFiles[i].fileName;
                          tempDocument.location = deletedFiles[i].location;
                          tempDocument.docId = deletedFiles[i].docId;
                          tempDocument.status = "delete";
                          tempDocument.id = deletedFiles[i].id;
                          tempDocument.inboundFileId=deletedFiles[i].fileId;
                          proposedDocs.push(tempDocument);
                          //console.log(tempDocument);
                      }
                  }
              }

           var updateRequest = utils.frameUpdateRequest(self.scope.request,updatableRows,proposedDocs,comments,self.scope.quarters);
           updateRequest.searchRequest=requestHelper.formGlobalRequest(self.scope.appstate).searchRequest;
            proposedOnAccount.update(requestHelper.formRequestDetails(updateRequest),"UPDATE",function(data){
            //console.log("Update response is "+JSON.stringify(data));
              if(data["status"]=="SUCCESS"){
                 displayMessage(data["responseText"],true);
                  //req.attr('editableRows',rows);
                  //$('#proposedOnAccountGrid').html(stache('<rn-proposed-onaccount-grid request={req} type={type} ></rn-proposed-onaccount-grid>')({req,type}));
                   self.scope.attr('loadProposedONAccountPage',Date.now());
                   self.scope.appstate.attr('globalSearchButtonClicked',true);
                   self.scope.previouslyFetchOnAccRows.replace([]);
                  $("#submitPOA").attr("disabled","disabled");
              }
              else{
               displayMessage(data["responseText"],false);
                req.attr('editableRows',self.scope.proposedOnAccountData.rows);
                $('#proposedOnAccountGrid').html(stache('<rn-proposed-onaccount-grid request={req} type={type} ></rn-proposed-onaccount-grid>')({req,type}));
              }
            },function(xhr){
              console.error("Error while loading: onAccount Details"+xhr);
            });

      },
      'rn-new-onaccount-grid onSelected': function (ele, event, val) {  
              this.scope.attr('onAccountRows',val);
      },
      'rn-onaccount-balance-grid .open-toggle click': function(ele, event, val){
        ele.closest('tr').toggleClass("open");
        ele.parents('tr').nextAll('tr.child').toggleClass("visible");
      },
      'rn-proposed-onaccount-grid .open-toggle click': function(ele, event, val){
        ele.closest('tr').toggleClass("open");
        ele.parents('tr').nextAll('tr.child').toggleClass("visible");
      },
      'rn-proposed-onaccount-grid onSelected':function(ele, event, val){
            this.scope.attr('proposedOnAccountData',val);
            if(val.checkedRows.length >0){
                disableEditORDeleteButtons(false);
            }else{
                disableEditORDeleteButtons(true);
            }
      },
      'rn-proposed-onaccount-grid save':function(ele, event, val){
          this.scope.attr('proposedOnAccountData',val);
      },
       "#copyOnAccount click":function(el,ev){
        var self=this;
        var quarterValueForCopy = $("#copyQuarter").val();
       var rows=this.scope.newOnAccountRows;
       var copyOnAccountRequest=createCopyOnAccountRequest(this.scope.appstate,quarterValueForCopy);
       //var request = requestHelper.formGlobalRequest(this.scope.appstate);
       newOnAccountModel.findOne(copyOnAccountRequest,function(data){
          //console.log("Update copy onAccount is "+JSON.stringify(data));
            if(data["status"]=="SUCCESS"){
                //displayMessage(data["responseText"],true);
                //var quarters=utils.getQuarter(self.scope.request.searchRequest.periodFrom,self.scope.request.searchRequest.periodTo);
                var updatedRows = utils.frameRowsForCopyOnAcc(rows,data,self.scope.quarters,quarterValueForCopy);
                var request = self.scope.request;
                request.quarters=self.scope.quarters;
                request.rows=updatedRows;
                self.scope.newOnAccountRows.replace(updatedRows);
                $('#newonAccountGrid').html(stache('<rn-new-onaccount-grid request={request}></rn-new-onaccount-grid>')({request}));
            }
            else{
              displayMessage(data["responseText"],false);
            }
          },function(xhr){
            console.error("Error while executing Copy onAccount domain service "+xhr);
          });
      },
      "{scope} loadProposedONAccountPage": function(){
          var self = this;
          //var quarters = self.scope.quarters;         
          self.scope.attr('showLoadingImage',true);
          if(self.scope.appstate.attr('globalSearchButtonClicked')==true){
            self.scope.attr("proposeOnAccOffset",0);
            self.scope.attr("tableScrollTop",0);
            self.scope.sortColumns.replace([]);
            self.scope.attr('sortDirection','asc');
          }  
          self.scope.appstate.attr("offset", self.scope.attr('proposeOnAccOffset'));
          self.scope.appstate.attr("sortBy", self.scope.sortColumns.attr().toString());
          self.scope.appstate.attr("sortOrder", self.scope.attr('sortDirection'));
          proposedOnAccount.findOne(createProposedOnAccountRequest(self.scope.appstate),function(data){
            self.scope.attr('showLoadingImage',false);
            if(data["status"]=="SUCCESS"){
               /* The below calls {scope.appstate} change event that gets the new data for grid*/
                //var returnValue = utils.getProposedOnAccRows(quarters,data);

                var returnValue = utils.prepareOnAccountRowsForDisplay(data.onAccount.onAccountDetails,self.scope.quarters);
                var finalRows = returnValue['ROWS'];
                if(self.scope.attr('proposeOnAccOffset') > 0){
                  finalRows = self.scope.previouslyFetchOnAccRows.concat(returnValue['ROWS']);
                } 
                //var finalRows = self.scope.previouslyFetchOnAccRows.concat(returnValue['ROWS']);

                var footerRows = utils.createFooterRow(data.onAccount.onAccountFooter);


                //var arr = $.unique(returnValue['BUNDLE_NAMES']);
                self.scope.attr('bundleNamesForDisplay',returnValue['BUNDLE_NAMES'].toString());
                //console.log(self.scope.attr('bundleNamesForDisplay'));
                var proposedRequest = {};
                proposedRequest.rows=finalRows;
                proposedRequest.footerRows = footerRows;
                proposedRequest.recordsAvailable = data.recordsAvailable;
                if(proposedRequest.rows != null && proposedRequest.rows.length>0){
                    proposedRequest.quarters=self.scope.quarters;
                    disableProposedSubmitButton(true);
                    disableEditORDeleteButtons(true);
                    $("#submitPOA").attr("disabled","disabled");
                    $('#proposedOnAccountGrid').html(stache('<rn-proposed-onaccount-grid request={proposedRequest}></rn-proposed-onaccount-grid>')({proposedRequest}));

                    var tempcommentObj = data.onAccount.comments;
                    //console.log("multi comments "+JSON.stringify(tempcommentObj));
                    if(tempcommentObj!=null)
                      $('#multipleComments').html(stache('<multiple-comments divid="usercommentsdiv" options="{tempcommentObj}" divheight="100" isreadOnly="n"></multiple-comments>')({tempcommentObj}));
                    else
                      $('#multipleComments').html('<textarea class="form-control new-comments" maxlength="1024" name="usercommentsdiv"  style="height:125px;   min-height:100px;    max-height:100px;"></textarea>');


                      var proposedDocs = data.onAccount.documents;
                      for(var k=0;k<proposedDocs.length;k++){
                        proposedDocs[k].isServer = true;
                      }

                    if(proposedDocs.length > 0){
                        self.scope.uploadedfileinfo.replace(proposedDocs);
                    } else {
                        self.scope.uploadedfileinfo.replace([]);
                    }

                    //$('#proposeuploadFile').html(stache('<propose-rn-file-uploader uploadedfileinfo={docs}></propose-rn-file-uploader>')({docs:data.documents})); 

                }else{
                    $('#proposedOnAccountGrid').html(stache('<rn-proposed-onaccount-grid emptyrows={emptyrows}></rn-proposed-onaccount-grid>')({emptyrows:true}));
                     self.scope.uploadedfileinfo.replace([]);
                     $('#multipleComments').html(stache('<multiple-comments divid="usercommentsdiv" options="{tempcommentObj}" divheight="100" isreadOnly="n"></multiple-comments>')({tempcommentObj:[]}));
                     self.scope.attr('bundleNamesForDisplay','');
                }
                self.scope.previouslyFetchOnAccRows.replace(finalRows);
            } else{
                displayMessage(data["responseText"],false);
                $('#proposedOnAccountGrid').html(stache('<rn-proposed-onaccount-grid emptyrows={emptyrows}></rn-proposed-onaccount-grid>')({emptyrows:true}));
                $('#multipleComments').html(stache('<multiple-comments divid="usercommentsdiv" options="{tempcommentObj}" divheight="100" isreadOnly="n"></multiple-comments>')({tempcommentObj:[]}));
                self.scope.uploadedfileinfo.replace([]);
                self.scope.attr('bundleNamesForDisplay','');
            }
        }, function(xhr) {
              console.error("Error while loading: proposed onAccount Details"+xhr);
              $('#proposedOnAccountGrid').html(stache('<rn-proposed-onaccount-grid emptyrows={emptyrows}></rn-proposed-onaccount-grid>')({emptyrows:true}));
        } );
      },
      '{documents} change': function(){
        /* documents is binded to uploadedfileinfo in <rn-file-uploader uploadedfileinfo="{documents}"></rn-file-uploader> */
        /* IF the uploadedfileinfo is changed in rn-file-uploader component, documents gets updated automatically and this change event triggered. */
         // console.log("docu changed "+JSON.stringify(this.scope.documents.attr()));
      },
      '.exportToExcel click':function(el,ev){
       
        var self = this;
       if(self.scope.tabsClicked=="ON_ACC_BALANCE"){
              onAccountBalance.findOne(createBalanceOnAccountRequestForExportToExcel(self.scope.appstate),function(data){ 
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
                }, function(xhr) {
                      console.error("Error while loading: onAccount balance Details"+xhr);
                } ); 
         } else if(self.scope.tabsClicked=="PROPOSED_ON_ACC"){
            //createProposedOnAccountRequestForExportToExcel


               proposedOnAccount.findOne(createProposedOnAccountRequestForExportToExcel(self.scope.appstate),function(data){ 
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
                }, function(xhr) {
                      console.error("Error while loading: onAccount balance Details"+xhr);
                } ); 


         }
      },
      '.copyToClipboard click':function(){
        //alert('excel');
      }
    },
    helpers: {
           createPBRequest: function(){
          var bundleNamesRequest = {"bundleSearch":{}};

          var serTypeId = this.appstate.attr('storeType');
          var regId = this.appstate.attr('region');

          if(typeof(serTypeId)!="undefined")
            bundleNamesRequest.bundleSearch["serviceTypeId"] = serTypeId['id'];

          if(typeof(regId)=="undefined")
            bundleNamesRequest.bundleSearch["regionId"] = "";
          else
            bundleNamesRequest.bundleSearch["regionId"] = regId['id'];

          bundleNamesRequest.bundleSearch["type"] = "ON_ACCOUNT";
          //console.log("GetBundleNamesRequest is "+JSON.stringify(bundleNamesRequest));

          return JSON.stringify(bundleNamesRequest);
        }
      }
});

var processDeleteOnAccount  = function(scope,requestType)
{
    var self = scope;
    disableEditORDeleteButtons(true);
    var req = self.request;
    var quarters = self.attr('quarters');
    req.quarters=quarters;
    var deletableRows = [];
    var rows = self.proposedOnAccountData.rows;
    var footerrows = self.proposedOnAccountData.footerrows;

    var type = 'DELETE';
    if(rows != undefined && rows.length >0){
        for(var i=0;i < rows.length;i++){
            if(rows[i].__isChecked != undefined && rows[i].__isChecked){
                deletableRows.push(rows[i]);
                //rows.splice(i,1);
                //i=i-1;
            }
        }
    }
    var request = utils.frameDeleteRequest(deletableRows,null,quarters);
    console.log("request ",request);
    proposedOnAccount.update(requestHelper.formRequestDetails(request),"DELETE",function(data){
        //console.log("Delete response is "+JSON.stringify(data));
        if(data["status"]=="SUCCESS"){
            displayMessage(data["responseText"],true);
            self.attr('loadProposedONAccountPage',Date.now());
            self.appstate.attr('globalSearchButtonClicked',true);
            self.previouslyFetchOnAccRows.replace([]);
        }
        else{
            req.attr('deletableRows',rows);
            req.attr('footerrows',footerrows);
            $('#proposedOnAccountGrid').html(stache('<rn-proposed-onaccount-grid request={req} type={type} ></rn-proposed-onaccount-grid>')({req,type}));
            displayMessage(data["responseText"],false);
        }
    },function(xhr){
        console.error("Error while Deleting: onAccount Details"+xhr);
    });
}


var frameRequest = function(appstate){
      var onAccountrequest = {};
      var periodFrom = appstate.attr('periodFrom');
      var periodTo = appstate.attr('periodTo');
      var serTypeId = appstate.attr('storeType');
      var regId = appstate.attr('region');
      var countryId = appstate.attr()['country'];
      var licId = appstate.attr()['licensor'];
      var contGrpId = appstate.attr()['contentType'];
      onAccountrequest.searchRequest = {};
      onAccountrequest.searchRequest["periodFrom"] = "";
      onAccountrequest.searchRequest["periodTo"] = "";
      onAccountrequest.searchRequest["serviceTypeId"] = "";
      onAccountrequest.searchRequest["regionId"] = "";
      onAccountrequest.searchRequest["country"] = [];
      onAccountrequest.searchRequest["entityId"] = [];
      onAccountrequest.searchRequest["contentGrpId"] = [];
      onAccountrequest.searchRequest["periodType"] = "Q";
      //onAccountrequest.searchRequest["type"] = "BALANCE";

      if(typeof(periodFrom) != "undefined"){
        onAccountrequest.searchRequest["periodFrom"] = periodFrom;
      }

      if(typeof(periodTo)!="undefined"){
        onAccountrequest.searchRequest["periodTo"] = periodTo;
      }

      if(typeof(serTypeId)!="undefined"){
        onAccountrequest.searchRequest["serviceTypeId"] = serTypeId['id'];
      }

      if(typeof(regId)!="undefined"){
        onAccountrequest.searchRequest["regionId"] = regId['id'];
      }

      if(typeof(countryId)!="undefined"){
        onAccountrequest.searchRequest["country"]=countryId;
      }

      if(typeof(licId)!="undefined"){
        onAccountrequest.searchRequest["entityId"]=licId;
      }

      if(typeof(contGrpId)!="undefined"){
        onAccountrequest.searchRequest["contentGrpId"]=contGrpId;
      }

      //console.log('The request is :'+JSON.stringify(onAccountrequest));
  return onAccountrequest;
}

var disableEditORDeleteButtons = function(disable){
  if(disable){
       $("#proposedDelete").attr("disabled","disabled");
       $("#proposedEdit").attr("disabled","disabled");
       //disableProposedSubmitButton(true);
  }else{
      $("#proposedDelete").removeAttr("disabled");
      $("#proposedEdit").removeAttr("disabled");
  }

}
var disableProposedSubmitButton = function(disable){
  if(disable){
       $("#proposedUpdate").attr("disabled","disabled");
  }else{
      $("#proposedUpdate").removeAttr("disabled");
  }

}
var disablePropose=function(disable){
    if(disable){
        $("#propose").attr("disabled","disabled");
        $("#paymentBundleNames").attr("disabled","disabled");
        $("#submitPOA").attr("disabled","disabled");
    }else{
       $("#paymentBundleNames").removeAttr("disabled");
    }
}

var displayMessage=function(message,isSuccess){
  if(isSuccess){
    $("#messageDiv").html("<label class='successMessage'>"+message+"</label>");
  }else{
      $("#messageDiv").html("<label class='errorMessage'>"+message+"</label>");
  } 
  $("#messageDiv").show();
  setTimeout(function(){
      $("#messageDiv").hide();
  },2000)
}
var hidethePeriods = function(){
              var _root = $('#calendarclsdiv')
              _root.find('.q1 li').not(":first").find('a').addClass('disabled');
              _root.find('.q2 li').not(":first").find('a').addClass('disabled');
              _root.find('.q3 li').not(":first").find('a').addClass('disabled');
              _root.find('.q4 li').not(":first").find('a').addClass('disabled');
};
var disableCopyOnAccount=function(disable){
  if(disable){
        $("#copyOnAccount").attr("disabled","disabled");
    }else{
      $("#copyOnAccount").removeAttr("disabled");
    }
};
var createCopyOnAccountRequest=function(appstate,period){
  var copyOnAccountRequest={};
  copyOnAccountRequest.searchRequest=requestHelper.formGlobalRequest(appstate).searchRequest;
  copyOnAccountRequest.searchRequest.type='COPY';
  copyOnAccountRequest.searchRequest.periodFrom=periodWidgetHelper.getFiscalPeriod(period);
  copyOnAccountRequest.searchRequest.periodTo=copyOnAccountRequest.searchRequest.periodFrom;
  copyOnAccountRequest.searchRequest.periodType='Q';
  return requestHelper.formRequestDetails(copyOnAccountRequest);
};
var createProposedOnAccountRequest=function(appstate){
  var proposedOnAccountRequest={};
  proposedOnAccountRequest.searchRequest=requestHelper.formGlobalRequest(appstate).searchRequest;
  proposedOnAccountRequest.searchRequest.type="PROPOSED";
  proposedOnAccountRequest.searchRequest.offset=appstate.attr("offset");
  proposedOnAccountRequest.searchRequest.limit="10";
  proposedOnAccountRequest.searchRequest.sortBy=appstate.attr("sortBy");
  proposedOnAccountRequest.searchRequest.sortOrder=appstate.attr("sortOrder");

  return requestHelper.formRequestDetails(proposedOnAccountRequest);
};
var createProposedOnAccountRequestForExportToExcel=function(appstate){
  var proposedOnAccountRequest={};
  proposedOnAccountRequest.searchRequest=requestHelper.formGlobalRequest(appstate).searchRequest;
  proposedOnAccountRequest.searchRequest.type="PROPOSED";
  proposedOnAccountRequest.excelOutput=true;
  return requestHelper.formRequestDetails(proposedOnAccountRequest);
};
var createBalanceOnAccountRequestForExportToExcel=function(appstate){
    var balancedOnAccountRequest={};
    balancedOnAccountRequest.searchRequest=requestHelper.formGlobalRequest(appstate).searchRequest;
    balancedOnAccountRequest.searchRequest.type="BALANCE";
    balancedOnAccountRequest.excelOutput=true;
    balancedOnAccountRequest.searchRequest.offset=appstate.attr("offset");;
    balancedOnAccountRequest.searchRequest.limit="10";
    balancedOnAccountRequest.searchRequest.sortBy=appstate.attr("sortBy");
    balancedOnAccountRequest.searchRequest.sortOrder=appstate.attr("sortOrder");
    return requestHelper.formRequestDetails(balancedOnAccountRequest);
  };

var validateFilters=function(appstate,validateQuarter,validateStoreType,validateRegion,validateLicensor,validateContentType){
  if(appstate != null && appstate != undefined){
      var serTypeId = appstate.attr('storeType');
      var regId = appstate.attr('region');
      var countryId = appstate['country'];
      var licId = appstate['licensor'];
      var contGrpId = appstate['contentType'];
      var periodType = appstate['periodType'];

      if(validateQuarter && periodType!="Q"){
        return 'Please select Quarter !'
      }

      if(validateStoreType && (serTypeId == null || serTypeId == "")){
        return 'Please select Store Type !';
      }

      if(validateRegion && (regId == null || regId == undefined)){
        return 'Please select Region !';
      }

      var licTxt = $('#licensorsFilter option:selected').text();
      if(validateLicensor && (licId == null || licId == undefined || licId == "")){
        return "Please select Licensor !";
      }else if(validateLicensor && (licId == undefined || (licId.attr() == null || licId.attr() =="")) || licId.length==0 || (licTxt != undefined && licTxt.length <= 0)){
        return "Please select Licensor !";
      }

      if(validateContentType && (contGrpId == null || contGrpId == undefined || contGrpId == "")){
        return "Invalid contentType !";
      }else if(validateContentType && (contGrpId == undefined && contGrpId.attr() == null || contGrpId.attr() =="") && contGrpId.attr().length ==0){
        return "Please select contentType !";
      }else if(validateContentType && (contGrpId.attr().length >1  || contGrpId[0] == "-1")){
        return "Please select single contentType !";
      }
     
     return "";
  }


}
export default page;
