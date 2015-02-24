import Component from 'can/component/';
import View from 'can/view/';
import _ from 'lodash';

import Grid from 'components/grid/';
import stache from 'can/view/stache/';

import template from './template.stache!';
import gridtemplate from './gridtemplate.stache!';
import styles from './page-icsv.less!';
import icsvmap from 'models/sharedMap/icsv';
import ValidateIcsv from 'models/invoice/validateIcsv/';
import createpb from 'components/create-pb/';
import pegeediticsv from 'components/page-edit-icsv/';
import icsvsummary from 'components/icsv-summary/';
import fileUpload from 'components/file-uploader/';
import UserReq from 'utils/request/';
import Invoice from 'models/invoice/';
import commonUtils from 'utils/commonUtils';
import gridUtils from 'utils/gridUtil';


Grid.extend({
  tag: 'icsv-grid',
  template: gridtemplate,
  scope: {
    appstate:undefined,
    columns: [
      {
        id: 'errormsg',
        title: '<img src="resources/images/notification.png" class="errorhead">',
        contents: function(row) {
          return stache('{{#error}}<img src="resources/images/rn_FieldError@2x.png" width="19" height="19" class="erroricon" data-container="body" data-toggle="popover" data-placement="right" data-content="{{error}}">{{/error}}')({error: row.error});
        }
      },
      {
        id: 'licensor',
        title: 'Licensor'
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
        id: 'dueDate',
        title: 'Due date'
      },
      {
        id: 'invoiceAmt',
        title: 'Amount'
      },
      {
        id: 'currency',
        title: 'Currency'
      },
      {
        id: 'comments',
        title: 'User comments'
      }
    ],
    strippedGrid:true
  },
  events: {
    'inserted': function(){
      var self= this;
      var tbody = self.element.find('tbody');
      //setting tbody height which determines the page height- start
      var getTblBodyHght=gridUtils.getTableBodyHeight('icsvinvoiceGrid',89);
      gridUtils.setElementHeight(tbody,getTblBodyHght,getTblBodyHght);
      //setting tbody height - end
    }
  }
});


fileUpload.extend({
  tag: 'rn-file-uploader-icsv-sum',
    scope: {
        fileList : new can.List(),
        uploadedfileinfo:[],
        deletedFileInfo:[]
    },
    init: function(){
        console.log('testinggggg');
        this.scope.attr('uploadedfileinfo').replace([]);
        this.scope.attr('fileList').replace([]);
    },
    events:{
        "{uploadedfileinfo} change":function () {
            // update areFilesToBeUploaded boolean
            //Handling this using data as scope is not accessible from page-edit -invoice.

            $('rn-file-uploader-icsv-sum').data('_d_uploadedFileInfo', this.scope.uploadedfileinfo);
            this.scope.fileList.replace(this.scope.uploadedfileinfo);

        },
        "{deletedFileInfo} change":function () {
            $('rn-file-uploader-icsv-sum').data('_d_deletedFileInfo', this.scope.deletedFileInfo);
        },
        '.cancelUpload click': function() {
            var _uploadedFileInfo = this.scope.attr('uploadedfileinfo');
            // remove only those files which have a guid (selectedFromLocal)
            for (var i = _uploadedFileInfo.length - 1; i > -1; i--) {
                if (!_uploadedFileInfo[i].isServer) {
                    _uploadedFileInfo.splice(i, 1);
                }
            }

             var parentScopeVar = this.element.closest('page-icsv').scope();
             parentScopeVar.attr("errorMessage", "");
           }
    }
});


var page = Component.extend({
  tag: 'page-icsv',
  template: template,
  scope: {
      //summaryData:{},
      invoicesData:[],
      appstate:undefined,
      showediticsv:false,
      activesubmitbutton:true,
      newpaymentbundlenamereq:undefined,
      errorMsg:{},
      errorStatus:{},
      fileUpload:'',
      uploadedfileinfo:[],
      errorMessage:"@",
      regionIdForPaymentBundle:"",
      serviceTypeIdForPaymentBundle:"",
      periodTypeForPaymentBundle:"",
      periodFromForPaymentBundle:"",
      periodToForPaymentBundle:"",
      fetchPB:"@",
      cancelnewbundlereq:'@',
      sumfileuploadedinfo:[],
      //gridHeight,
      createPBRequest: function(){
        var bundleNamesRequest = {"bundleSearch":{}};
          //console.log("fsdfsdfsdf "+JSON.stringify(this.attr('appstate')));
          bundleNamesRequest.bundleSearch["serviceTypeId"] = this.attr('serviceTypeIdForPaymentBundle');
          bundleNamesRequest.bundleSearch["regionId"] = this.attr('regionIdForPaymentBundle');
          bundleNamesRequest.bundleSearch["type"] = "REGULAR_INV";
          return JSON.stringify(bundleNamesRequest);
        }

    },
    init:function(){
      this.scope.appstate.attr("renderGlobalSearch",false);
      var self = this;
      self.scope.uploadedfileinfo.replace([]);
      icsvmap.removeAttr("invoiceData");
      $('.popover').popover('destroy');
      icsvmap.attr("showediticsv", false);
      self.scope.attr('fetchPB',false);
    },
   events:{
      "inserted":function(){
       var self = this;

       this.scope.appstate.attr("renderGlobalSearch",false);
       icsvmap.delegate("invoiceData","change", function(ev, newVal){
            //console.log(icsvmap.attr("invoiceData"));
            $("#loading_img").hide();
            $('#arrowbtnCntiner').show();
            if(icsvmap.attr("invoiceData"))
            {
                  var gridData = [];
                  var tempArr = icsvmap.invoiceData.invoices.attr();
                  var lowest = 0;
                  var highest = 0;
                  var tmp=0;
                  for(var i=0; i< tempArr.length; i++){
                        var tempObj = {};
                        //console.log(JSON.stringify(tempArr[i].errors));
                        if(i==0){
                          self.scope.attr('regionIdForPaymentBundle',tempArr[i].regionId);
                          self.scope.attr('serviceTypeIdForPaymentBundle',tempArr[i].serviceTypeId);
                          self.scope.attr('periodTypeForPaymentBundle',tempArr[i].periodType);
                        }
                        if(tempArr[i].errors){

                              var errString = "";

                              if((tempArr[i].errors != "undefined") && (tempArr[i].errors != null))
                                {
                                    for(var key in tempArr[i].errors.errorMap){  /*Invoice error*/
                                           if(tempArr[i].errors.errorMap[key].trim())
                                           errString += tempArr[i].errors.errorMap[key]+", ";
                                    }
                                }


                              for(var j =0; j < tempArr[i].invoiceLines.length; j++){
                                if((tempArr[i].invoiceLines[j].errors != "undefined") && (tempArr[i].invoiceLines[j].errors != null)){
                                    for(var key in tempArr[i].invoiceLines[j].errors.errorMap){  /*Invoiceline error*/
                                         if(tempArr[i].invoiceLines[j].errors.errorMap[key].trim())
                                         errString += tempArr[i].invoiceLines[j].errors.errorMap[key]+", ";
                                     }
                                  }
                              }

                              for(var k =0; k < tempArr[i].invoiceDocuments.length; k++){
                                if((tempArr[i].invoiceDocuments[k].errors != "undefined") && (tempArr[i].invoiceDocuments[k].errors != null)){
                                    for(var key in tempArr[i].invoiceDocuments[k].errors.errorMap){  /*Invoice document error*/
                                         if(tempArr[i].invoiceDocuments[k].errors.errorMap[key].trim())
                                         errString += tempArr[i].invoiceDocuments[k].errors.errorMap[key]+", ";
                                     }
                                  }
                              }


                             errString = errString.replace(/,\s*$/, "");

                               /*filtering duplicate invloiceline error*/


                              var arr = errString.split(", ");
                              var unique = [];
                              $.each(arr, function (index,word) {
                                  if ($.inArray(word, unique) === -1)
                                      unique.push(word);

                              });

                              //errString = unique;

                              var resErrString=[];
                              for(var k=0;k<=unique.length-1;k++){
                                resErrString.push("<div> <b>-</b> "+unique[k]+"</div>");
                              }

                              errString = resErrString;

                              var errlabel = "<span class='errorlabel' style='font-weight:bold;'>Error: </span>";

                              var newErrString=(errlabel+errString).replace("</div>,<div>","</div><div>");

                              tempObj.error = ((unique[0] == "") && (unique.length == 1))?"":newErrString;

                          }
                        tempObj.licensor= tempArr[i].entityName;
                        tempObj.invoiceNum= (tempArr[i].invoiceNumber.length > 40)?tempArr[i].invoiceNumber.substring(0, 50)+"..":tempArr[i].invoiceNumber;
                        tempObj.invoiceOrigNum= tempArr[i].invoiceNumber;
                        tempObj.dueDate= tempArr[i].invoiceDueDate;
                        tempObj.invoiceAmt= CurrencyFormat(tempArr[i].invoiceAmount);
                        tempObj.currency= tempArr[i].invoiceCcy;
                        var maxcommentlength = 50;
                        if((typeof tempArr[i].comments[0].comments !== "undefined") && (tempArr[i].comments[0].comments !== null)){
                            tempObj.comments= (tempArr[i].comments[0].comments.length > maxcommentlength)?tempArr[i].comments[0].comments.substring(0, maxcommentlength)+"..":tempArr[i].comments[0].comments;
                        }

                        var contentTypeArr = [], countryArr = [];

                        if(typeof tempArr[i].invoiceLines !== "undefined"){
                             var invLineCount = tempArr[i].invoiceLines.length;
                            for(var j =0; j < invLineCount; j++){
                                  countryArr.push(tempArr[i].invoiceLines[j].country);
                                  contentTypeArr.push(tempArr[i].invoiceLines[j].contentGrpName);

                                  //setting the mix and max fiscal period in scope for payment bundle;
                                  if(i==0){
                                        lowest=Number(tempArr[i].invoiceLines[j].fiscalPeriod);
                                        highest=Number(tempArr[i].invoiceLines[j].fiscalPeriod);
                                  }
                                tmp = Number(tempArr[i].invoiceLines[j].fiscalPeriod);
                                if (tmp < lowest) lowest = tmp;
                                if (tmp > highest) highest = tmp;
                            }
                        }

                         /*Below function is to remove the duplicate content type and find the count */
                          contentTypeArr = contentTypeArr.filter( function( item, index, inputArray ) {
                                 return inputArray.indexOf(item) == index;
                          });
                          if(contentTypeArr.length>1){
                            tempObj.contentType = contentTypeArr.length+" types of Content";
                          }
                          else if(contentTypeArr.length==1)
                            tempObj.contentType = contentTypeArr[0];

                          /*Below function is to remove the duplicate country and find the count */
                          countryArr = countryArr.filter( function( item, index, inputArray ) {
                            return inputArray.indexOf(item) == index;
                          });
                          if(countryArr.length>1){
                            tempObj.country = countryArr.length+ " Countries";
                          }
                          else if(countryArr.length==1)
                            tempObj.country = countryArr[0];

                        gridData.push(tempObj);
                   }

                        self.scope.attr('periodFromForPaymentBundle',lowest+'');
                        self.scope.attr('periodToForPaymentBundle',highest+'');
                        self.scope.attr('fetchPB',true);
                }
                else{
                  var gridData = [];
                }
                    var rows = new can.List(gridData);
                    if(rows.length>0){
                      $('#icsvinvoiceGrid').html(stache('<icsv-grid rows="{rows}"></icsv-grid>')({rows}));
                        disableBundle(false);
                    }else{
                        disableBundle(true);
                        self.scope.attr("activesubmitbutton", false);
                       $('#icsvinvoiceGrid').html(stache('<icsv-grid emptyrows="{emptyrows}"></icsv-grid>')({emptyrows:true}));
                    }


                    $('.rn-grid>tbody>tr').find("td.errormsg").each(function(i){
                    if($(this).html() != ""){

                         self.scope.attr("activesubmitbutton", false);

                          return false;
                      }

                     self.scope.attr("activesubmitbutton", true);
                   });



        });


         icsvmap.bind('showediticsv', function(ev, newVal, oldVal) {
              self.scope.attr("showediticsv", newVal);

          });
      },
      destroy: function() {
        //distroy all items can be placed.
        $(".popover").hide();
      },

      'rn-file-uploader-icsv-sum onSelected': function (ele, event, val) {
            var self = this;
            self.scope.attr('uploadedfileinfo',val.filePropeties);
            self.scope.attr('sumfileuploadedinfo', val.filePropeties);
            console.log(JSON.stringify(self.scope.attr('sumfileuploadedinfo')));
            //$('.jQfunhide').show();
            //val == 'SUCCESS' ?  $('.jQfunhide').show():$('.jQfunhide').hide();
       },
       "#buttonCancelicsv click":function(){
          var self = this;

          icsvmap.removeAttr("invoiceData");
          self.scope.uploadedfileinfo.replace([]);
          $('.jQfunhide').hide();
          $('#topContanier').show();
          $('#arrowbtnCntiner').hide();
          $('.file-component-icv-div #buttondiv').show();
          $('.file-component-icv-div #fileContainer').css('height','80%');
       },
       '{scope} uploadedfileinfo':function(){
          var self = this;
          /* Below is request for validateicsv*/
          var icsvReq =getICSVRequest(this.scope.uploadedfileinfo);

          //console.log('Request:'+ JSON.stringify(icsvReq));

          //console.log(icsvmap);

          icsvmap.removeAttr("invoiceData");

          //console.log(icsvmap);

          if(!$(".jQfunhide").is(":visible")){
            $('#icsverr').removeClass("icsv-error").addClass("icsv-validate-inprogress");
            self.scope.attr('errorMessage',"<br/><br/><br/>File Upload is Completed.<br/><br/>Invoice line validation is in Progress ......");

          ValidateIcsv.findOne(icsvReq,function(data){
            $('#icsverr').removeClass("icsv-validate-inprogress").addClass("icsv-error");
                  //console.log(data);
                 if(data.errorStatus == 'FAILURE'){
                  var fatalErrorList = data.fatalErrorList;
                  var errorMess = data.errorDesc;
                  if(fatalErrorList.length>0){
                    var messages = fatalErrorList[0].errorMessages;
                    if(messages.length >0){
                      //errorMess = errorMess+" : "+fatalErrorList[0].errorMessages[0]+" "+fatalErrorList[0].csvFileName+" at lineNumber "+fatalErrorList[0].lineNumber;
                      errorMess = errorMess+" : "+ "Line #"+fatalErrorList[0].lineNumber+" - "+ fatalErrorList[0].errorMessages[0] +" in File \""+fatalErrorList[0].csvFileName+"\".\n";
                      self.scope.attr('errorMessage',errorMess);
                       $("#loading_img").hide();
                    }
                  }else{
                    self.scope.attr('errorMessage',data.errorDesc);
                  }
                 }else{
                  self.scope.attr('errorMessage',"");
                  $('.jQfunhide').show();
                  $('.file-component-icv-div #buttondiv').hide();
                  $('.file-component-icv-div #fileContainer').css('height','93%');
                  icsvmap.attr("invoiceData", data);

                 }
                },function(xhr){
                  //self.scope.attr('errorMessage','Problem accessing /api/v1/invoice/icsv/validate');
                  console.log('error while validating ICSV');
          });
        }
       },
       "#arrowbutton click" :function(){
         accordin(this);
       },
       "#arrowbtnCntiner click" :function(){
         accordin(this);
       },
      "#addIcsvSubmit click":function(){
          var self = this;
            var tempArr = icsvmap.invoiceData.invoices.attr();
           var createInvoiceData = {};
             createInvoiceData.invoices = [];

             console.log("tempArr",tempArr);
            for(var i=0; i < tempArr.length; i++)
                {
                    var tempInvoiceData = {};

                   tempInvoiceData["invoiceNumber"] = tempArr[i].invoiceNumber;
                   tempInvoiceData["invoiceTypeId"] = tempArr[i].invoiceTypeId;
                   tempInvoiceData["serviceTypeId"] = tempArr[i].serviceTypeId;
                   tempInvoiceData["invoiceType"] = tempArr[i].invoiceType;
                   tempInvoiceData["entityId"] = tempArr[i].entityId;
                   tempInvoiceData["regionId"] = tempArr[i].regionId;
                   tempInvoiceData["entityName"] = tempArr[i].entityName;
                   tempInvoiceData["invoiceCcy"] = tempArr[i].invoiceCcy;
                   tempInvoiceData["fxRate"] = tempArr[i].fxRate;
                   tempInvoiceData["notes"] = tempArr[i].notes;
                   tempInvoiceData["invoiceAmount"] = tempArr[i].invoiceAmount;
                   tempInvoiceData["grossTotal"] = tempArr[i].grossTotal;
                   tempInvoiceData["finalInvoiceAmount"] = tempArr[i].grossTotal;
                   tempInvoiceData["periodType"] = tempArr[i].periodType;
                   tempInvoiceData["netTotal"] = tempArr[i].netTotal;
                   if(tempArr[i].tax== undefined && tempArr[i].tax != null && parseInt(tempArr[i].tax) > 0) {
                      tempInvoiceData["tax"] = tempArr[i].tax;
                   }

                  if(typeof $("#paymentBundleNames").val() == "undefined"){
                    // tempInvoiceData["bundleId"] = "";
                        tempInvoiceData["bundleName"] = $("#newPaymentBundle").val();
                   }else{

                      if($("#paymentBundleNames").val() != ""){
                        tempInvoiceData["bundleId"] = $("#paymentBundleNames").val();
                        tempInvoiceData["bundleName"] = $("#paymentBundleNames option:selected").text();
                      }
                   }


                   tempInvoiceData["receivedDate"] = dateFormatter(tempArr[i].receivedDate,"mm/dd/yyyy");//"06/19/2014"//self.scope.receiveddate;
                   tempInvoiceData["invoiceDate"] = dateFormatter(tempArr[i].invoiceDate,"mm/dd/yyyy");//"06/19/2014"//self.scope.invoicedate;
                   tempInvoiceData["invoiceCalcDueDate"] = dateFormatter(tempArr[i].invoiceCalcDueDate, "mm/dd/yyyy");
                   tempInvoiceData["invoiceDueDate"] = dateFormatter(tempArr[i].invoiceDueDate,"mm/dd/yyyy"); //"06/19/2014"//self.scope.invoiceduedate;

                   tempInvoiceData["createdBy"] = self.scope.appstate.userInfo.prsId;

                   tempInvoiceData["comments"] = [];
                   var tempComment = {};
                   tempComment.comments = tempArr[i].comments.comments;
                   tempInvoiceData["comments"].push(tempComment);


                   tempInvoiceData["invoiceDocuments"] = [];
                   var tempDocument = {};
                   for(var j = 0; j < tempArr[i].invoiceDocuments.length; j++){
                      tempDocument.fileName = tempArr[i].invoiceDocuments[j].fileName;
                      tempDocument.location = tempArr[i].invoiceDocuments[j].location;
                      tempInvoiceData["invoiceDocuments"].push(tempDocument);
                   }

                //   tempDocument.fileName = tempArr[i].invoiceDocuments.fileName;
                 //  tempDocument.location = tempArr[i].invoiceDocuments.location;


                  // console.log(tempArr[i].invoiceLines.length);


                   tempInvoiceData["invoiceLines"] = [];

                  var invoiceLineCount = tempArr[i].invoiceLines.length;

                   for(var j=0; j < invoiceLineCount; j++){
                         var tempArryInv = {};
                          tempArryInv["country"] = tempArr[i].invoiceLines[j].country;
                          tempArryInv["fiscalPeriod"] =  tempArr[i].invoiceLines[j].fiscalPeriod;
                          tempArryInv["periodType"] = tempArr[i].invoiceLines[j].periodType;

                          tempArryInv["lineAmount"] = tempArr[i].invoiceLines[j].lineAmount;

                         if(tempArr[i].invoiceTypeId == "2"){

                            tempArryInv["glAccRefId"] = tempArr[i].invoiceLines[j].glAccRefId;
                            tempArryInv["adhocTypeId"] = tempArr[i].invoiceLines[j].adhocTypeId;
                          //  tempArry["ccidFileName"] = "";
                          }
                          else{
                            //tempArry["glAccRefId"] = "";
                          tempArryInv["contentGrpId"] = tempArr[i].invoiceLines[j].contentGrpId;
                          tempArryInv["contentGrpName"] = tempArr[i].invoiceLines[j].contentGrpName;
                          tempArryInv["ccidFileName"] = tempArr[i].invoiceLines[j].ccidFileName;
                          //  tempArry["ccidFileName"] = self.scope.ccidGLStore.attr(inputContent);
                          }

                          tempInvoiceData["invoiceLines"].push(tempArryInv);
                     }

                 createInvoiceData.invoices.push(tempInvoiceData);

            }

             Promise.all([
                            Invoice.create(UserReq.formRequestDetails(createInvoiceData))
                         ]).then(function(values) {

                                if(values[0]["status"]=="SUCCESS"){
                                       var msg = "Invoices  saved successfully."
                                      displayMessage(msg,true);

                                       icsvmap.removeAttr("invoiceData");
                                       self.scope.attr('cancelnewbundlereq',true);

                                        self.scope.uploadedfileinfo.replace([]);
                                        $('.jQfunhide').hide();
                                        $('#topContanier').show();
                                        $('#arrowbtnCntiner').hide();
                                        $('.file-component-icv-div #buttondiv').show();
                                        $('.file-component-icv-div #fileContainer').css('height','80%');
                                    }
                                    else
                                    {
                                        var responseInvoiceArr = values[0].invoices;
                                        icsvmap.invoiceData.attr("invoices", responseInvoiceArr);  /*updating icsv map with invoice response*/
                                        var msg = values[0].responseText;
                                        displayMessage(msg,false);
                                    }
                                });
      },
      ".rn-grid>tbody>tr td dblclick": function(el, ev){
          var invoiceid = el.closest('tr').data('row').row.invoiceOrigNum;
          var societyName=el.closest('tr').data('row').row.licensor;
          icsvmap.attr("invoiceid", invoiceid);
          icsvmap.attr("licensor", societyName);
          icsvmap.attr("showediticsv", true);
      },
      ".erroricon mouseover":function(el, ev){
          el.popover({'html': true});
          el.popover('show');
      },
      ".erroricon mouseleave":function(el, ev){
          el.popover('hide');
      },
      "#paymentBundleNames change": function(){
          var self = this;
          var pbval = $("#paymentBundleNames").val();
          //console.log("val djsi is "+ pbval);
          if(pbval=="createB"){

              var regId = self.scope.appstate.attr('region');


              var newBundleNameRequest = {"paymentBundle":{}};
              var bundleRequest = {};

              bundleRequest["regionId"] = self.scope.regionIdForPaymentBundle;
              bundleRequest["periodFrom"] = self.scope.periodFromForPaymentBundle;
              bundleRequest["periodTo"] = self.scope.periodToForPaymentBundle;
              bundleRequest["periodType"] =self.scope.periodTypeForPaymentBundle;
              bundleRequest["bundleType"] ="REGULAR_INV";

              newBundleNameRequest["paymentBundle"] = bundleRequest;
              //console.log("New Bundle name request is "+JSON.stringify(newBundleNameRequest));
              self.scope.attr('newpaymentbundlenamereq', JSON.stringify(newBundleNameRequest));
          } else {
            self.scope.attr('newpaymentbundlenamereq', "undefined");
          }
      },
      ".submitFiles.uploadFiles click":function(){
         $("#loading_img").show();
      }


    },
    helpers:{
      showediticsvmain:function(){
           if(!this.attr("showediticsv")){
                return "style='display:block'"
           }
           else
           {
                return "style='display:none'"
           }
      },
    showactivebutton:function(){
          if(!this.attr("activesubmitbutton")){
            return "disabled"
          }
          else{
            return ""
          }
      },
     showAfterSubmitMsg:function(){
          if($.isEmptyObject(this.attr("errorStatus"))){
                if(this.attr("errorStatus") == "success"){
                    //return "<label class='successMessage'>"+this.attr("responseText")+"</label>";
                    return commonUtils.showSuccessMessage(this.attr("responseText"));
                }else{
                    //return "<label class='errorMessage'>"+this.attr("responseText")+"</label>";
                    return commonUtils.showErrorMessage(this.attr("responseText"));
                }

                // setTimeout(function(){
                //       $("#icsvMessageDiv").hide();
                // },2000);
           }
       }

    }
});


function dateFormatter(datestring, currentformat){
  if(currentformat == "mm/dd/yyyy")
  {
    var date = new Date(datestring);
    return  date.getFullYear()+'-'+(date.getMonth() + 1)+'-'+date.getDate();
  }
  else if(currentformat == "yyyy-mm-dd")
  {
    var date = new Date(datestring);
    return  (date.getMonth() + 1)+'/'+date.getDate()+'/'+date.getFullYear();
  }
}


function CurrencyFormat(number)
{
  if($.isNumeric(number)){

    var n = parseFloat(number).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
    return n;
  }else{
    return 0;
  }

}

function getICSVRequest(fileInfo)
{
  var request ={};
  //request.requestHeader=UserReq.formRequestDetails();
  request.documents=[];
  if(fileInfo != null && fileInfo != undefined && fileInfo.length >0){
    for(var i=0;i<fileInfo.length;i++){
      var fileDocument ={};
      fileDocument.fileName = fileInfo[i].fileName;
      fileDocument['location'] = fileInfo[i].filePath;
      request.documents.push(fileDocument);
    }

  }
  return UserReq.formRequestDetails(request);
}

function disableBundle(disable){
  if(disable){
    $("#paymentBundleNames").attr("disabled","disabled");
  }else{
    $("#paymentBundleNames").removeAttr("disabled");
  }

}

function displayMessage(msg,success){
  if(success){
    //$("#invcsvmessageDiv").html("<label class='successMessage'>"+msg+"</label>")
    commonUtils.showSuccessMessage(msg);
  }else{
    //$("#invcsvmessageDiv").html("<label class='errorMessage'>"+msg+"</label>");
    commonUtils.showErrorMessage(msg);
  }
   // $("#invcsvmessageDiv").show();
   // setTimeout(function(){
   //    $("#invcsvmessageDiv").hide();
   // },5000)
}

function accordin(obj){
  if($('#arrowbutton').hasClass('pull-up-arrow')){
    $('#arrowbutton').removeClass('pull-up-arrow').addClass('pull-down-arrow');
    $('#arrowbutton').attr('src','/resources/images/approval_arrow_down.png')
    $('#topContanier').hide();
    //obj.scope.attr('gridHeight', $('.rn-grid tbody').height());
    // setting tbody height which determines the page height- start
    var getTblBodyHght=gridUtils.getTableBodyHeight('icsvinvoiceGrid',94);
    gridUtils.setElementHeight($('.rn-grid tbody'),getTblBodyHght,getTblBodyHght);
    // setting tbody height which determines the page height - end
  }else if($('#arrowbutton').hasClass('pull-down-arrow')){
    $('#arrowbutton').removeClass('pull-down-arrow').addClass('pull-up-arrow');
    $('#arrowbutton').attr('src','/resources/images/approval_arrow_up.png')
    //$('.rn-grid tbody').height(obj.scope.attr('gridHeight'));
    $('#topContanier').show();
    var getTblBodyHght=gridUtils.getTableBodyHeight('icsvinvoiceGrid',89);
    gridUtils.setElementHeight($('.rn-grid tbody'),getTblBodyHght,getTblBodyHght);
  }
}


export default page;
