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


Grid.extend({
  tag: 'icsv-grid',
  template: gridtemplate,
  scope: {
    appstate:undefined,
    columns: [
      {
        id: 'errormsg',
        title: '<img src="resources/images/rn_WarningActive@2x.png" class="errorhead">',
        contents: function(row) {
          return stache('{{#error}}<img src="resources/images/alert.png" class="erroricon" data-container="body" data-toggle="popover" data-placement="right" data-content="{{error}}">{{/error}}')({error: row.error});
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
    ]
  }
});




fileUpload.extend({
  tag: 'rn-file-uploader-icsv-sum',
  scope: {
    fileList: new can.List(),
    isAnyFileLoaded : can.compute(function() { return this.fileList.attr('length') > 0; })
  },
  events: {
    'inserted': function() {
      this.scope.fileList.replace(this.scope.uploadedfileinfo);
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
      createPBRequest: function(){
        var bundleNamesRequest = {"bundleSearch":{}};
          //console.log("fsdfsdfsdf "+JSON.stringify(this.attr('appstate')));
            
         
            bundleNamesRequest.bundleSearch["serviceTypeId"] = '1';

            bundleNamesRequest.bundleSearch["regionId"] = '2';
            
          bundleNamesRequest.bundleSearch["type"] = "REGULAR_INV";
          

          return JSON.stringify(bundleNamesRequest);
        }
    
    },
    init:function(){
      var self = this;
      self.scope.uploadedfileinfo.replace([]);
      icsvmap.removeAttr("invoiceData"); 
      $('.popover').popover('destroy');
      this.scope.appstate.attr("renderGlobalSearch",false);
      icsvmap.attr("showediticsv", false);
      
    },
   events:{
      "inserted":function(){
       var self = this;
       
       icsvmap.delegate("invoiceData","change", function(ev, newVal){
            console.log(icsvmap.attr("invoiceData"));
            if(icsvmap.attr("invoiceData"))
            {
                  var gridData = [];
                  var tempArr = icsvmap.invoiceData.invoices.attr();
         
           

                  for(var i=0; i< tempArr.length; i++){
                        var tempObj = {};
                        
                        console.log(JSON.stringify(tempArr[i].errors));
                        if(tempArr[i].errors){

                              var errString = "";
                        
                              for(var key in tempArr[i].errors.errorMap){  /*Invoice error*/
                                     if(tempArr[i].errors.errorMap[key].trim())
                                     errString += tempArr[i].errors.errorMap[key]+", ";
                              }

                              for(var j =0; j < tempArr[i].invoiceLines.length; j++){
                                    for(var key in tempArr[i].invoiceLines[j].errors.errorMap){  /*Invoiceline error*/
                                         if(tempArr[i].invoiceLines[j].errors.errorMap[key].trim())
                                         errString += tempArr[i].invoiceLines[j].errors.errorMap[key]+", ";
                                     }
                              }
                              errString = errString.replace(/,\s*$/, "");  
                            
                              var errlabel = "<span class='errorlabel'>Error: </span>";

                              tempObj.error = (errString)?errlabel+errString:"";
                          }

                        
                     

                        tempObj.licensor= tempArr[i].entityName;
                        tempObj.invoiceNum= tempArr[i].invoiceNumber;
                        tempObj.dueDate= tempArr[i].invoiceDueDate;
                        tempObj.invoiceAmt= CurrencyFormat(tempArr[i].invoiceAmount);
                        tempObj.currency= tempArr[i].invoiceCcy;
                        var maxcommentlength = 50;
                        if(typeof tempArr[i].comments[0].comments !== "undefined"){
                            tempObj.comments= (tempArr[i].comments[0].comments.length > maxcommentlength)?tempArr[i].comments[0].comments.substring(0, maxcommentlength)+"..":tempArr[i].comments[0].comments;
                        }

                        var contentTypeArr = [], countryArr = [];
                        if(typeof tempArr[i].invoiceLines !== "undefined"){
                             var invLineCount = tempArr[i].invoiceLines.length;
                            for(var j =0; j < invLineCount; j++){
                                  countryArr.push(tempArr[i].invoiceLines[j].country);
                                  contentTypeArr.push(tempArr[i].invoiceLines[j].contentGrpName);
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
                }
                else{
                  var gridData = [];
                }
                    var rows = new can.List(gridData);
                    if(rows.length>0){
                      $('#icsvinvoiceGrid').html(stache('<icsv-grid rows="{rows}"></icsv-grid>')({rows}));  
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

      
      'rn-file-uploader-icsv-sum onSelected': function (ele, event, val) {
            var self = this;
            self.scope.attr('uploadedfileinfo',val.filePropeties);
            //console.log(JSON.stringify(self.scope.attr('uploadedFileInfo')));
            //$('.jQfunhide').show();
            //val == 'SUCCESS' ?  $('.jQfunhide').show():$('.jQfunhide').hide();
       },
       "#buttonCancelicsv click":function(){
          this.scope.appstate.attr('page','invoices');
       },
       '{scope} uploadedfileinfo':function(){
          var self = this;
          /* Below is request for validateicsv*/
          var icsvReq =getICSVRequest(this.scope.uploadedfileinfo);

          //console.log('Request:'+ JSON.stringify(icsvReq));

         

          icsvmap.removeAttr("invoiceData"); 

        

          ValidateIcsv.findOne(icsvReq,function(data){
                  //console.log(data);
                 if(data.errorStatus == 'FAILURE'){
                  var fatalErrorList = data.fatalErrorList;
                  var errorMess = data.errorDesc;
                  if(fatalErrorList.length>0){
                    var messages = fatalErrorList[0].errorMessages;
                    if(messages.length >0){
                      errorMess = errorMess+" : "+fatalErrorList[0].errorMessages[0]+" "+fatalErrorList[0].csvFileName+" at lineNumber "+fatalErrorList[0].lineNumber;
                      self.scope.attr('errorMessage',errorMess);
                    }  
                  }else{
                    self.scope.attr('errorMessage',data.errorDesc);
                  }
                 }else{
                  $('.jQfunhide').show();
                  icsvmap.attr("invoiceData", data); 

                 }
                },function(xhr){
                  //self.scope.attr('errorMessage','Problem accessing /api/v1/invoice/icsv/validate');
                  console.log('error while validating ICSV');
          });
       },

      "#addIcsvSubmit click":function(){
          var self = this;
            var tempArr = icsvmap.invoiceData.invoices.attr();
           var createInvoiceData = {};
             createInvoiceData.invoices = [];

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
                  
                   tempInvoiceData["createdBy"] = "1000";  
                   
                   tempInvoiceData["comments"] = [];
                   var tempComment = {};
                   tempComment.comments = tempArr[i].comments.comments;
                   tempInvoiceData["comments"].push(tempComment);

                   
                   tempInvoiceData["invoiceDocuments"] = [];
                   var tempDocument = {};
                   tempDocument.fileName = tempArr[i].invoiceDocuments.fileName;
                   tempDocument.location = tempArr[i].invoiceDocuments.location;

                   tempInvoiceData["invoiceDocuments"].push(tempDocument);
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
                                       $("#invcsvmessageDiv").html("<label class='successMessage'>"+msg+"</label>")
                                       $("#invcsvmessageDiv").show();
                                       setTimeout(function(){
                                          $("#invcsvmessageDiv").hide();
                                       },5000)

                                       icsvmap.removeAttr("invoiceData"); 

                                        self.scope.uploadedfileinfo.replace([]);

                                         $('.jQfunhide').hide();
                                    }
                                    else
                                    {
                                        var responseInvoiceArr = values[0].invoices;
                                        icsvmap.invoiceData.attr("invoices", responseInvoiceArr);  /*updating icsv map with invoice response*/
                                        
                                        if(values[0].responseCode == "IN1022"){  /* Contact support team error*/
                                          var msg = values[0].responseText;
                                          $("#invcsvmessageDiv").html("<label class='errorMessage'>"+msg+"</label>");
                                          $("#invcsvmessageDiv").show();
                                        }
                                    }   
                                });  
      },
      ".rn-grid>tbody>tr td dblclick": function(el, ev){
          var invoiceid = el.closest('tr').data('row').row.invoiceNum;
          icsvmap.attr("invoiceid", invoiceid);
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

              bundleRequest["regionId"] = '2';
              bundleRequest["periodFrom"] = "201303";
              bundleRequest["periodTo"] = "201304";
              //bundleRequest["bundleType"] =lineType;
              bundleRequest["bundleType"] ="REGULAR_INV";

              newBundleNameRequest["paymentBundle"] = bundleRequest;
              //console.log("New Bundle name request is "+JSON.stringify(newBundleNameRequest));
              self.scope.attr('newpaymentbundlenamereq', JSON.stringify(newBundleNameRequest));
          } else {
            self.scope.attr('newpaymentbundlenamereq', "undefined");
          }
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
                    return "<label class='successMessage'>"+this.attr("responseText")+"</label>";
                }else{
                    return "<label class='errorMessage'>"+this.attr("responseText")+"</label>";
                }
                
                setTimeout(function(){
                      $("#icsvMessageDiv").hide();
                },2000);
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


export default page;
