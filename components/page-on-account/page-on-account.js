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

import copy from 'components/copy-clipboard/';

fileUpload.extend({
  tag: 'rn-file-uploader',
  events:{
      'inserted': function (){
        //alert('hi');
        this.scope.fileList.replace(this.scope.uploadedfileinfo);
        //console.log(JSON.stringify(this.scope.uploadedfileinfo.attr()));
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
        isAnyFileLoaded : can.compute(function() { return this.fileList.attr('length') > 0; }),
        isSuccess: false

    },
    events:{
      'inserted': function (){
        //alert('hi');
        this.scope.fileList.replace(this.scope.uploadedfileinfo);
        //console.log(JSON.stringify(this.scope.uploadedfileinfo.attr()));
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
    proposedOnAccDocuments:[],
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
    multipleComments:[]

  },
  init: function(){
    this.scope.appstate.attr("renderGlobalSearch",true);
    this.scope.tabsClicked="NEW_ON_ACC";
    },
    events: {
      "inserted": function(){
       $("#searchDiv").show();

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
        $('copy-clipboard').show();
        $('#clonetable').empty().html($('rn-onaccount-balance-grid').find('table').clone(true))
      },
      "#paymentBundleNames change": function(){
          var self = this;
          var pbval = $("#paymentBundleNames").val();
          var paymentBundleNameText;
          if(pbval=="createB"){
              var regId = self.scope.appstate.attr('region');
              var newBundleNameRequest = {"paymentBundle":{}};
              var bundleRequest = {};
              bundleRequest.regionId = regId['id'];
              bundleRequest.periodFrom = self.scope.appstate.attr('periodFrom');
              bundleRequest.periodTo=self.scope.appstate.attr('periodTo');
              bundleRequest.bundleType ="ON_ACCOUNT";
              newBundleNameRequest["paymentBundle"] = bundleRequest;
              self.scope.attr('newpaymentbundlenamereq', JSON.stringify(newBundleNameRequest));
          } else {
            paymentBundleNameText=$("#paymentBundleNames option:selected").text();
            self.scope.attr('paymentBundleName',pbval);
            self.scope.attr('paymentBundleNameText',paymentBundleNameText);
            self.scope.attr('newpaymentbundlenamereq', "undefined");
          }

          if(pbval != undefined || paymentBundleNameText != undefined){
            $("#propose").removeAttr("disabled");
          }
      },
      '{scope.appstate} change': function() {
         var self = this;
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
              if(message.length == 0){
                //request.searchRequest["type"] = "BALANCE";
                  request.appstate=this.scope.appstate;
                 $('#onAccountBalanceGrid').html(stache('<rn-onaccount-balance-grid request={request}></rn-onaccount-balance-grid>')({request})); 
                }    
              } else if(self.scope.tabsClicked=="PROPOSED_ON_ACC"){
                  message = validateFilters(self.scope.appstate,true,false,false,false,false);
                  self.scope.attr('errorMessage',message); 
                  if(message.length == 0){
                       self.scope.attr('showLoadingImage',true);
                      proposedOnAccount.findOne(createProposedOnAccountRequest(self.scope.appstate),function(data){
                         self.scope.attr('showLoadingImage',false);
                        if(data["status"]=="SUCCESS"){
                           /* The below calls {scope.appstate} change event that gets the new data for grid*/
                            var returnValue = utils.getProposedOnAccRows(quarters,data);
                            //var arr = $.unique(returnValue['BUNDLE_NAMES']);
                            self.scope.attr('bundleNamesForDisplay',returnValue['BUNDLE_NAMES'].toString());
                            //console.log(self.scope.attr('bundleNamesForDisplay'));
                            var proposedRequest = {};
                            proposedRequest.rows=returnValue['ROWS'];
                            if(proposedRequest.rows != null && proposedRequest.rows.length>0){
                                proposedRequest.quarters=quarters;
                                disableProposedSubmitButton(true);
                                disableEditORDeleteButtons(true);
                                $("#submitPOA").attr("disabled","disabled");
                                $('#proposedOnAccountGrid').html(stache('<rn-proposed-onaccount-grid request={proposedRequest}></rn-proposed-onaccount-grid>')({proposedRequest}));

                                var tempcommentObj = data.onAccount.comments;
                                //console.log("multi comments "+JSON.stringify(tempcommentObj));
                                self.scope.multipleComments.replace(data.onAccount.comments);
                                if(tempcommentObj!=null)
                                  $('#multipleComments').html(stache('<multiple-comments divid="usercommentsdiv" options="{tempcommentObj}" divheight="100" isreadOnly="n"></multiple-comments>')({tempcommentObj}));
                                else
                                  $('#multipleComments').html('<textarea class="form-control new-comments" maxlength="1024" name="usercommentsdiv"  style="height:125px;   min-height:100px;    max-height:100px;"></textarea>');

                                  
                                $('#proposeuploadFile').html(stache('<propose-rn-file-uploader uploadedfileinfo={docs}></propose-rn-file-uploader>')({docs:data.documents})); 

                            }else{
                                $('#proposedOnAccountGrid').html(stache('<rn-proposed-onaccount-grid emptyrows={emptyrows}></rn-proposed-onaccount-grid>')({emptyrows:true}));
                                 $('#proposeuploadFile').html(stache('<propose-rn-file-uploader uploadedfileinfo={docs}></propose-rn-file-uploader>')({docs:[]})); 
                            }
                        } else{
                            displayMessage(data["responseText"],false);
                            $('#proposedOnAccountGrid').html(stache('<rn-proposed-onaccount-grid emptyrows={emptyrows}></rn-proposed-onaccount-grid>')({emptyrows:true}));
                        }
                    }, function(xhr) {
                          console.error("Error while loading: proposed onAccount Details"+xhr);
                          $('#proposedOnAccountGrid').html(stache('<rn-proposed-onaccount-grid emptyrows={emptyrows}></rn-proposed-onaccount-grid>')({emptyrows:true}));
                    } );
                  }
                }
          }else{
            self.scope.attr('errorMessage',''); 
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
        $('#newonAccountGrid, #newonAccountGridComps, #forminlineElements,#searchDiv').show();
        $('#onAccountBalanceDiv, #proposedonAccountDiv,#proposeOnAccountGridComps, #onAccountEditDeleteDiv').hide();
      },
      "#proposedonAccount click":function(el, ev){
        ev.preventDefault();
        this.scope.tabsClicked="PROPOSED_ON_ACC";
         //var emptyDocuments =[];
        //$('#proposeuploadFile').html(stache('<propose-rn-file-uploader isAnyFileLoaded="{isAnyFileLoaded}"></propose-rn-file-uploader>')({isAnyFileLoaded:false}));
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
        var createrequest = utils.frameCreateRequest(self.scope.request,self.scope.onAccountRows,self.scope.documents,self.scope.usercommentsStore,self.scope.quarters,paymentBundleName,self.scope.paymentBundleName);
        if(createrequest.onAccount.onAccountDetails.length>0){
          var request = requestHelper.formRequestDetails(createrequest);
          //console.log('Request:'+JSON.stringify(request));
          newOnAccountModel.create(request,function(data){
            if(data["status"]=="SUCCESS"){
                displayMessage(data["responseText"],true);
              $("#propose").attr("disabled","disabled");
              $("#paymentBundleNames").val('');
              var request = {};
              var rows = utils.frameRows(self.scope.attr('licensorCurrencies'),self.scope.quarters);
              request.rows=rows;
              request.quarters=self.scope.quarters;   
              $('#newonAccountGrid').html(stache('<rn-new-onaccount-grid request={request}></rn-new-onaccount-grid>')({request}));
              $('#usercomments').val("");
              self.scope.attr('onAccountRows',rows);
              $('#uploadFile').html(stache('<rn-file-uploader uploadedfileinfo={docs}></rn-file-uploader>')({docs:[]})); 
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
        var self = this;
        disableEditORDeleteButtons(true);
        var req = this.scope.request;
        var quarters = this.scope.attr('quarters');
        req.quarters=quarters;
        var deletableRows = [];
        var rows = this.scope.proposedOnAccountData.rows;
        // console.log('checking');
        // console.log(rows);
        var type = 'DELETE';
        if(rows != undefined && rows.length >0){
            for(var i=0;i < rows.length;i++){
                  if(rows[i].__isChecked != undefined && rows[i].__isChecked){
                    deletableRows.push(rows[i]);
                    rows.splice(i,1);
                    i=i-1;
                  }
                }

         }
          var request = utils.frameDeleteRequest(deletableRows,null);
          proposedOnAccount.update(requestHelper.formRequestDetails(request),"DELETE",function(data){
          //console.log("Delete response is "+JSON.stringify(data));
          if(data["status"]=="SUCCESS"){
              displayMessage(data["responseText"],true);
              req.attr('deletableRows',rows);
              var comments = getTheUpdatedComments(self.scope.multipleComments,deletableRows);
              self.scope.multipleComments.replace(comments);
              if(comments!=null)
                $('#multipleComments').html(stache('<multiple-comments divid="usercommentsdiv" options="{comments}" divheight="100" isreadOnly="n"></multiple-comments>')({comments}));
              else
                $('#multipleComments').html('<textarea class="form-control new-comments" maxlength="1024" name="usercommentsdiv"  style="height:125px;   min-height:100px;    max-height:100px;"></textarea>');
              if(rows.length >0){
                $('#proposedOnAccountGrid').html(stache('<rn-proposed-onaccount-grid request={req} type={type} ></rn-proposed-onaccount-grid>')({req,type}));  
              }else{
                $('#proposedOnAccountGrid').html(stache('<rn-proposed-onaccount-grid emptyrows={emptyrows}></rn-proposed-onaccount-grid>')({emptyrows:true}));
              }
              
          }
          else{
            var details = data.onAccount.onAccountDetails;
            if(data.onAccount.onAccountDetails != undefined && data.onAccount.onAccountDetails.length >0){
               for(var i=0;i<details.length;i++){
               var toBeAdded = utils.getRow(deletableRows,details[i].id);
               if(toBeAdded !=null){
                rows.push(toBeAdded);
               }
              }
              req.attr('deletableRows',rows);
              $('#proposedOnAccountGrid').html(stache('<rn-proposed-onaccount-grid request={req} type={type} ></rn-proposed-onaccount-grid>')({req,type}));
            }
            displayMessage(data["responseText"],false);
          }

          },function(xhr){
            console.error("Error while loading: onAccount Details"+xhr);
          });
      },
      "#proposedEdit click":function(el,ev){
          $('#submitPOA').removeAttr("disabled");
          var req = this.scope.request;
          var quarters = this.scope.attr('quarters');
          req.quarters=quarters;
          //console.log(this.scope.proposedOnAccountData.rows);
          req.attr('editableRows',this.scope.proposedOnAccountData.rows);
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

           var updateRequest = utils.frameUpdateRequest(self.scope.request,updatableRows,self.scope.proposedOnAccDocuments,comments,self.scope.quarters);
            proposedOnAccount.update(requestHelper.formRequestDetails(updateRequest),"UPDATE",function(data){
            //console.log("Update response is "+JSON.stringify(data));
              if(data["status"]=="SUCCESS"){
                 displayMessage(data["responseText"],true);
                  req.attr('editableRows',rows);
                  $('#proposedOnAccountGrid').html(stache('<rn-proposed-onaccount-grid request={req} type={type} ></rn-proposed-onaccount-grid>')({req,type}));
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
        ele.parents('tr').next('tr.child').toggleClass("visible");
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
      '{documents} change': function(){
        /* documents is binded to uploadedfileinfo in <rn-file-uploader uploadedfileinfo="{documents}"></rn-file-uploader> */
        /* IF the uploadedfileinfo is changed in rn-file-uploader component, documents gets updated automatically and this change event triggered. */
         // console.log("docu changed "+JSON.stringify(this.scope.documents.attr()));
         //alert('hi');
      },
      '.exportToExcel click':function(){
        var self = this;
       if(self.scope.tabsClicked=="ON_ACC_BALANCE"){
              onAccountBalance.findOne(createBalanceOnAccountRequestForExportToExcel(self.scope.appstate),function(data){
                      if(data["status"]=="SUCCESS"){
                        //alert(data);
                        //self.scope.rows.replace(getUiRowsFromResponse(quarters,data));  
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
  return requestHelper.formRequestDetails(proposedOnAccountRequest);
};

var createBalanceOnAccountRequestForExportToExcel=function(appstate){
    var balancedOnAccountRequest={};
    balancedOnAccountRequest.searchRequest=requestHelper.formGlobalRequest(appstate).searchRequest;
    balancedOnAccountRequest.searchRequest.type="BALANCE";
    balancedOnAccountRequest.excelOutput=true;
    return requestHelper.formRequestDetails(balancedOnAccountRequest);
  };

  var getTheUpdatedComments=function(Comments,deletableRows){
    var updatedRow=[];
    for(var i=0;i<deletableRows.length;i++){
      for(var j=0;j<Comments.length;j++){
        if(Comments[j].commentId != deletableRows[i].commentId){
            updatedRow.push(Comments[j]);
        }
      }
    }
    return updatedRow;
  }

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


      if(validateLicensor && (licId == null || licId == undefined || licId == "")){
        return "Please select Licensor !";
      }else if(validateLicensor && (licId == undefined || (licId.attr() == null || licId.attr() =="")) || licId.length==0){
        return "Please select Licensor !";
      }

      if(validateContentType && (contGrpId == null || contGrpId == undefined || contGrpId == "")){
        return "Invalid contentType !";
      }else if(validateContentType && (contGrpId == undefined && contGrpId.attr() == null || contGrpId.attr() =="")){
        return "Invalid contentType !";
      }else if(validateContentType && (contGrpId.attr().length >1 )){
        return "Please select single contentType !";
      }
     
     return "";
  }
   
}
export default page;
