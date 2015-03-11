import jquerysorter from 'jquerysorter';
import Component from 'can/component/';

import stache from 'can/view/stache/';
import template from './template.stache!';
import styles from './page-ref-country.less!';
import GridSocietyModelMapping from './grid-model-society-mapping/';
import GridRevision from './grid-revision-history-country/';
import GridPricingBaseModel from './grid-pricing-base-model/';
import GridPricingTrackcounts from './grid-pricing-trackcounts/';
import calander from 'components/period-calendar/';
import Comments from 'components/multiple-comments/';

import css_bootstrapValidator from 'bootstrapValidator.css!';

import bootstrapValidator from 'bootstrapValidator';
import commonUtils from 'utils/commonUtils';

import UserReq from 'utils/request/';
import PeriodHelper from 'utils/periodWidgetHelpers'
import Licensor from 'models/common/licensor/';
import Country from 'models/common/country/';
import Currency from 'models/common/currency/';
import RefCountry from 'models/refdata/country/';
import PricingModels from 'models/pricing-models/';
import PricingMethods from 'models/common/pricingMethods/';
import CountryLicensor from 'models/refdata/countryLicensor/';
import constants from 'utils/constants';
import Region from 'models/common/region/';
import DefaultGlobalParameters from 'components/global-parameter-bar/default-global-parameter';


var reportConfigurationList = new can.List();

var revisionHistory = new can.List();

var pageState = {
    countryDetails:{
      country:{localSocietyId:"",countryId:"",status:undefined,displayStatus:undefined},
      commentList:undefined
    }
};

var page = Component.extend({
  tag: 'page-ref-country',
  template: template,
  scope: {
    pageState: pageState,
  appstate : [],

    /*Loading form elemenst*/
    localSocietyNames:[],
    countries:[],
    entities: [],
    transcurrencies:[],
    altcurrencies:[],
    accuralModels:[],
    accuralModelVersions:[],
    selectedModelId:"",
    pricingModelTypes:[],
    pricingMethods:[],
    getPricingModelDetails:[],
    baseModelParameter: [],
    trackCounts: [],
    societyModelMapping:[],
    revisionHistory:[],
    selectedperiod:[],
    displayMessage:"display:none",
    state:"Edit",
    validFrom: [],
    validTo : [],
    reportConfigurationList : reportConfigurationList,
    footerrowspresent : true,
    footerdatasocmod : "",
    footerdata : "",
    revHistory : [],
    enableButtonsPropose : "display:block",
    enableButtonsApprove : "display:none",
    enableButtonsReject : "display:none",
    regions:[],
    regionStore:"",
    reloadCountries:true,
    commentFlag: false,

    switchButtons: function() {

      var self = this;

      if(self.pageState.countryDetails.country.status == "N") {

        if(self.appstate.userInfo.roleIds[0] == constants.ROLES.BM) {

          self.attr("enableButtonsApprove", "display:none");
          self.attr("enableButtonsReject", "display:none");
          self.attr("enableButtonsPropose", "display:none");

        } else {

          self.attr("enableButtonsApprove", "display:inline-block");
          self.attr("enableButtonsReject", "display:inline-block");
          self.attr("enableButtonsPropose", "display:none");

        }
      //   var screenId = self.appstate.screenLookup.attr("screenid") ;
      //   console.log("screenId="+screenId);
      //   console.log("commonUtils.getFieldAttribute(screenId,9)="+commonUtils.getFieldAttribute(screenId,9));
      //   if(commonUtils.getFieldAttribute(screenId,9)=="disabled"){
      //     self.attr("enableButtonsApprove", "display:none");
      //   }
      //   if(commonUtils.getFieldAttribute(screenId,10)=="disabled"){
      //     self.attr("enableButtonsReject", "display:none");
      //   }
      //   if(commonUtils.getFieldAttribute(screenId,11)=="disabled"){
      //  self.attr("enableButtonsPropose", "display:none");
      // }

      } else {

        if(self.appstate.userInfo.roleIds[0] == constants.ROLES.FA) {
          self.attr("enableButtonsApprove", "display:none");
          self.attr("enableButtonsReject", "display:none");
          self.attr("enableButtonsPropose", "display:none");
        } else {
          self.attr("enableButtonsApprove", "display:none");
          self.attr("enableButtonsReject", "display:none");
          self.attr("enableButtonsPropose", "display:inline-block");

        }

      }

    },

    populateCountryDetails : function(self, countryId, rowId, revHistory) {

      var requestObj  = {
          "id":rowId
//          "countryId":countryId
      };

      //console.log("Request passed is "+ JSON.stringify(UserReq.formRequestDetails(requestObj)));
      RefCountry.findOne(UserReq.formRequestDetails(requestObj),function(data){

        $("#loading_img").hide();
        $("#viewPricingModelDivBlock").hide();

        if(data.status == "SUCCESS") {

          //console.log("Response data is "+JSON.stringify(data.attr()));
          self.pageState.countryDetails.attr("country",data.countryDetails);

          /* if the data.countryDetails.countryId is null then set the country dropdown using requestObj*/
          if(data.countryDetails.countryId==null){
            self.pageState.countryDetails.country.attr("countryId",requestObj.countryId);
          }

          if(data.countryDetails.attr("validFrom")!=0)
            var validFrom = data.countryDetails.attr("validFrom").toString();
          else
            var validFrom = "0";

          if(validFrom == undefined || validFrom == null || validFrom == "0")
            self.pageState.countryDetails.country.attr("validFrom","");
          else {
            var formatValidFrom = PeriodHelper.getDisplayPeriod(validFrom,"P");
            self.pageState.countryDetails.country.attr("validFrom",formatValidFrom);
            //self.validFrom.replace(formatValidFrom);
          }

          if(data.countryDetails.attr("validTo")!=0)
            var validTo = data.countryDetails.attr("validTo").toString();
          else
            var validTo = "0";

          if(validTo == undefined || validTo == null || validTo == "0")
            self.pageState.countryDetails.country.attr("validTo","");
          else {
            var formatValidTo = PeriodHelper.getDisplayPeriod(validTo,"P");
            self.pageState.countryDetails.country.attr("validTo",formatValidTo);
            //self.validTo.replace(formatValidTo);
          }

          self.attr("localSocietyNames").replace(data.countryDetails.localSocietyNames);
          if(data.countryDetails.localSocietyId !=0){
            self.pageState.countryDetails.country.attr("localSocietyId",data.countryDetails.localSocietyId);
            $("#localSocietysel").val(data.countryDetails.localSocietyId);
          }

          if(data.countryDetails.mainPricingMethod!=null)
            self.pageState.countryDetails.country.attr("mainPricingMethod",data.countryDetails.mainPricingMethod);
          if(data.countryDetails.altPricingMethod!=null)
            self.pageState.countryDetails.country.attr("altPricingMethod",data.countryDetails.altPricingMethod);

          self.attr("transcurrencies").replace(data.countryDetails.transactionCurrencies);
          if(data.countryDetails.transactionCurrency!=null){
            self.pageState.countryDetails.country.attr("transactionCurrency",data.countryDetails.transactionCurrency);
            $("#transCurrSel").val(data.countryDetails.transactionCurrency);
          }

          self.attr("altcurrencies").replace(data.countryDetails.altCurrencies);
          if(data.countryDetails.altCurrency!=null){
            self.pageState.countryDetails.country.attr("altCurrency",data.countryDetails.altCurrency);
            $("#altCurrSel").val(data.countryDetails.altCurrency);
          }

          var pricingModelNames = [];
          var pricingModelVersions = {};
          var getModels = data.countryDetails.models;
          var selectedAccModel = data.countryDetails.model;
          var selModelId,selectedAccModelVersions;

          for(var i=0;i<getModels.length;i++){
            var accModelName = getModels[i].accrualModelName;
            var accModelId = getModels[i].accrualModelID;
            var accModelVersion = getModels[i].versionNo;
            if(pricingModelNames.indexOf(accModelName)==-1){
              pricingModelNames.push(accModelName);
              pricingModelVersions[accModelName] = [];
              pricingModelVersions[accModelName].push({"version":accModelVersion,"modelId":accModelId});
            } else {
              pricingModelVersions[accModelName].push({"version":accModelVersion,"modelId":accModelId});
            }
          }

          var accModels = [];
          var flag= false;
          for(var key in pricingModelVersions){
            var temp = {};
            temp["accName"] = key;
            temp["versions"] = pricingModelVersions[key];
            accModels.push(temp);
            /* this in the case of selectedAccModel is null to set the first value in Pricing model*/
            if(selectedAccModel==null && flag==false){
              selectedAccModelVersions =  pricingModelVersions[key];
              selModelId = selectedAccModelVersions[0]["modelId"];
              flag = true;
            }
            if(key==selectedAccModel){
              selectedAccModelVersions =  pricingModelVersions[key];
              selModelId = selectedAccModelVersions[0]["modelId"];
            }
          }
          //console.log("accural Models "+JSON.stringify(accModels));
          //console.log("sel accural Model vers are "+JSON.stringify(selectedAccModelVersions));
          //console.log("sel accural Model id is "+JSON.stringify(selModelId));
          self.attr("accuralModels").replace(accModels);
          self.attr("accuralModelVersions").replace(selectedAccModelVersions);
          self.attr("selectedModelId",selModelId);

          $("#accModelSel").val(selectedAccModel);
          $("#accModelSel").change();

          var tempcommentObj = data.countryDetails.commentList;
          //console.log("multi comments "+JSON.stringify(tempcommentObj.attr()));
          if(tempcommentObj !=null)
          {
            self.pageState.countryDetails.attr("commentList",data.countryDetails.commentList);
            $('#multipleComments').html(stache('<multiple-comments divid="usercommentsdiv" options="{tempcommentObj}" divheight="100" isreadOnly="n"></multiple-comments>')({tempcommentObj}));
          } else {
            self.pageState.countryDetails.attr("commentList","");
          }

          var revHistories = [];
          if(revHistory) {

            revHistories = self.attr("revHistory");
          }

          var formatRevHistories = [];

          if(revHistory) {

            revHistories = self.attr("revHistory");

          } else {

            revHistories = data.countryDetails.revisionHistories.attr();
            self.attr("revHistory", data.countryDetails.revisionHistories.attr());

          }

          for(var i=0;i<revHistories.length;i++){
            var revHisTemp = {};
            revHisTemp["id"] = revHistories[i]["id"];
            revHisTemp["validFrom"] = (revHistories[i]["validFrom"]==null)?"":revHistories[i]["validFrom"];
            revHisTemp["validTo"] = (revHistories[i]["validTo"]==null)?"":revHistories[i]["validTo"];
             revHisTemp["comment"] = (revHistories[i]["commentText"]==null)?"":revHistories[i]["commentText"];
            //
            // (revHistories[i]["commentList"] == undefined || revHistories[i]["commentList"] == null
            //
            // ||
            //   (revHistories[i]["commentList"].length==0
            //
            //   || revHistories[i]["commentList"][0]["comments"]==null))?"":revHistories[i]["commentList"][0]["comments"];
            //
            revHisTemp["status"] = revHistories[i]["status"];
            formatRevHistories.push(revHisTemp);
          }
          //console.log("revision history "+JSON.stringify(formatRevHistories));
          self.revisionHistory.replace(formatRevHistories);

          self.societyModelMapping.replace(data.countryDetails.modelMappings);

          $("#loading_img").hide();
          $(".main-layout").show();

          $(".buttonsPlaceHolder").show();

          if(data.countryDetails.status == "A") {
                self.pageState.countryDetails.country.attr("displayStatus","Active");
           } else if (data.countryDetails.status == "I") {
                self.pageState.countryDetails.country.attr("displayStatus","Inactive");
           } else if (data.countryDetails.status == "R") {
                self.pageState.countryDetails.country.attr("displayStatus","Rejected");
           }else if (data.countryDetails.status == "N") {
               self.pageState.countryDetails.country.attr("displayStatus","New");
           }
           else {
               self.pageState.countryDetails.country.attr("displayStatus",data.countryDetails.status);
           }

          if(data.countryDetails.status == "A" || data.countryDetails.status == "N") {
            self.attr("state","Edit");
          }else{
            self.attr("state","Read");
          }

          //self.fetchDetailsBtn();

          setTimeout(function(){
            alignGrid("grid-revision-history-country");
            alignGrid("grid-society-model");
            $('rn-grid-society-model').children('table').tablesorter({
              // manipulate the template string after is it created
              onRenderTemplate : function(i, t){
                return t+'<span class="sort-arrow-asc">△</span><span class="sort-arrow-desc">▽</span>';
              }
            });
            $('rn-grid-revision-history-country').children('table').tablesorter({
              // manipulate the template string after is it created
              onRenderTemplate : function(i, t){
                return t+'<span class="sort-arrow-asc">△</span><span class="sort-arrow-desc">▽</span>';
              }
            });
          },10);

          $('#submitBtn').show();

          self.switchButtons();

          if(data.countryDetails.proposalPending != null && data.countryDetails.proposalPending != undefined
            && data.countryDetails.proposalPending == true ) {

            $('#submitBtn').hide();

            commonUtils.displayUIMessage( "SUCCESS", "A Proposal is already pending for the licensor");

          } 

          $('#countryForm').bootstrapValidator('validate');

      } else {

        commonUtils.displayUIMessage(data.status, data.responseText);

      }

      },function(xhr){
          console.error("Error while loading: country Details"+xhr);
      });


    }
  },

  init: function(){
        var self = this;
        self.scope.appstate.attr("renderGlobalSearch",false);
        var requestObj = {};
        var modelObj = {reqType:'modeltype'};
        var regionId = DefaultGlobalParameters.Region.id+'';
        if(self.scope.appstate.attr("screendetails") != null && self.scope.appstate.attr("screendetails") != undefined){
          regionId=self.scope.appstate.screendetails.regionId;
        }
        var conObj = {regionId: regionId};
        $("#viewPricingModelDivBlock").hide();
        Promise.all([
            Region.findAll(UserReq.formRequestDetails(requestObj)),
            //Licensor.findAll(UserReq.formRequestDetails(requestObj)),
            PricingModels.findOne(UserReq.formRequestDetails(modelObj)),
            Country.findAll(UserReq.formRequestDetails(conObj)),
            PricingMethods.findOne(UserReq.formRequestDetails(requestObj))
        ]).then(function(values) {
              //self.scope.attr("entities").replace(values[0]["entities"][0]);
              //var countryId=values[2][0].id;
              self.scope.attr("regions").replace(values[0]);
              self.scope.attr("pricingModelTypes").replace(values[1].modelTypes);
              self.scope.attr("countries").replace(values[2]);
              self.scope.attr("reloadCountries",false);
              self.scope.attr("regionStore",regionId);
              //$("#selCountry").val((values[2])[0].id);
              self.scope.pageState.countryDetails.country.attr("countryId", values[2][0].id);
              if(self.scope.appstate.screenLookup.attr("screendetails") != null && self.scope.appstate.screenLookup.attr("screendetails") != undefined) {
                  //countryId=self.scope.appstate.screendetails.tableId;
                  self.scope.attr("regionStore",self.scope.appstate.screenLookup.screendetails.regionId);
                  self.scope.populateCountryDetails(self.scope, "", self.scope.appstate.screenLookup.screendetails.tableId, false)
                  self.scope.appstate.screenLookup.attr("screendetails", null);

              } else {
                $("#fetchDetailsBtn").click();
              }
              self.scope.attr("pricingMethods").replace(values[3].pricingMethodList);
        }).then(function(values) {
              //self.scope.pageState.entityCountryDetails.entityCountry.attr("countryId",self.scope.attr("countries")[0].id);
              self.scope.pageState.attr("countryId",self.scope.attr("countries")[0].id);
        })


    },
  helpers:{

    setHeight: function(){
       var vph = $(window).height()-180;
       console.log("Div height "+ $("#refcountryform").height());
       return 'Style="height:'+vph+'px"';
     },
    disableSubmit:function(fieldId){
      var screenId = this.appstate.screenLookup.attr("screenid");
       if(this.attr("state") == "Read" || commonUtils.getFieldAttribute(screenId,fieldId)){
         //return 'disabled';
       }else{
         return '';
       }

     },
     isSelected: function(parameterName, modelID) {
      if(this.pageState.countryDetails.country.attr(parameterName) && this.pageState.countryDetails.country.attr(parameterName)=== modelID()) {
        return 'selected="selected"';
      } else {
        return '';
      }
    },

    enableButtons : function(ref){

      if(this.attr("USER_ROLE") != ref)
          return "display:none";
      else
          return "display:inline";

    }

  },
  events: {

    "inserted": function(){
      var self = this;
      $(".multicomments-required").hide();
      $(".buttonsPlaceHolder").hide();

      //$('#grid-society-model').append(stache('<rn-grid rows="{reportConfigurationList}"></rn-grid>')({reportConfigurationList}));
      //$('#grid-revision-history-country').append(stache('<rn-grid-revision-history-country rows="{revisionHistory}"></rn-grid-revision-history-country>')({revisionHistory}));


      $('#countryForm').on('init.form.bv', function(e, data) {
           data.bv.disableSubmitButtons(true);

      }).on('init.field.bv', function(e, data) {


      })

      $('#countryForm').bootstrapValidator({
        container: 'popover',
        feedbackIcons: {
            valid: 'valid-rnotes',
            invalid: 'alert-rnotes',
            validating: 'glyphicon glyphicon-refreshas'
        },
        fields: {
            validFrom: {
                validators: {
                    notEmpty: {
                        message: 'The ValidFrom is required'
                    },

                    callback: {
                    message: 'Valid From is required',
                    callback: function (value, validator, $field) {
                      var periodTo = $("input[name='validTo']").val();
                        if(value == "" || value == "0"){
                          return {
                                valid: false,
                                message: 'Valid From is required'
                            }
                        } else {
                          if(periodTo.length > 0){
                            var isValid = showErrorMsg(value, periodTo);
                            if(isValid !== ""){
                                return{
                                  valid: false,
                                  message: isValid
                                }
                              }
                            }
                        }
                        return true;
                      }
                  }
                }
            },
            localSociety :{
                validators: {
                  group:'.comments',
                    notEmpty: {
                        message: 'The LocalSociety is required'
                    }
                }
            },
            mainPricingMethod :{
                validators: {
                  group:'.comments',
                    notEmpty: {
                        message: 'The MainPricingMethod is required'
                    }
                }
            },
            transCurr :{
                validators: {
                  group:'.comments',
                    notEmpty: {
                        message: 'The Transaction currency is required'
                    }
                }
            },
            accuralModelName :{
                validators: {
                  group:'.comments',
                    notEmpty: {
                        message: 'The Accural Model Name is required'
                    }
                }
            },
            accuralModelVersion :{
                validators: {
                  group:'.comments',
                    notEmpty: {
                        message: 'The Accural Model Version is required'
                    }
                }
            },
            usercommentsdiv :{
                validators: {
                  group:'.comments',
                    notEmpty: {
                        message: 'The comment is required'
                    }
                }
            }
        }
      }).on('error.field.bv', function(e, data) {
          $('*[data-bv-icon-for="'+data.field +'"]').popover('show');
          $('#submitBtn').prop('disabled',true);
      }).on('success.field.bv', function(e, data) {
          //data.bv.disableSubmitButtons(false);
          if($('#editableText').val().length==0){/*Check the textarea editable - Onload*/  
            $("#submitBtn").prop("disabled", true);
          }else{
            $('#submitBtn').prop('disabled',false);
          }
      });

      if(commonUtils.isReadOnly()=='true'){



 $('#left_layout').find('input, textarea, select').attr('disabled','disabled');

 $('#right_layout').find('input, textarea, button').attr('disabled','disabled');

 $('#button_layout').find('input, textarea, button').attr('disabled','disabled');



 }


    },
    '.updatePeroid focus':function(el){
        $(el).closest('.calendarcls').find('.box-modal').show().trigger( "focus" );
     },
    '.calendarDateIcon click': function(el){
      $('.box-modal').hide(); // hide all other open calendar popups before opening the new one.
      $(el).closest('.calendarcls').find('.box-modal').show(0,function(){
        //$($(el).closest('.calendarcls').find('.box-modal')).data("selected-period",el[0].value);

        //var selected = el.data('type');
      //  console.log($('.periodFromInput').val() +", "+ $('.periodToInput').val() );
        $($(el).closest('.calendarcls').find('.box-modal')).data("selected-period-from",$('.periodFromInput').val());
        $($(el).closest('.calendarcls').find('.box-modal')).data("selected-period-to",$('.periodToInput').val());
        //$($(el).closest('.calendarcls').find('.box-modal')).data("selected-period-type",PeriodWidgetHelper.getPeriodType($('.periodFromInput').val()));
        $($(el).closest('.calendarcls').find('.box-modal')).data("selected-id",el.data('type'));
        $(this).trigger("popup-shown");

      }); 
    },
    "#grid-revision-history-country table>tbody>tr click": function(item, el, ev){
        //var invoiceid = el.closest('tr').data('row').row.id;
        var self=this.scope;
        $("#loading_img").show();

        var alreadySelRow = item.closest("tbody").find("tr.selected");
        alreadySelRow.toggleClass("selected");

        $(item[0]).toggleClass("selected");
        var row = item.closest('tr').data('row').row;

        self.populateCountryDetails(self, self.pageState.countryDetails.country.attr("countryId"), row.id, true);
    },
    "#grid-society-model table>tbody>tr click": function(item, el, ev){
        var self=this.scope;

        var alreadySelRow = item.closest("tbody").find("tr.selected");
        alreadySelRow.toggleClass("selected");

        $(item[0]).toggleClass("selected");
    },
    '{revisionHistory} change': function() {
      var self = this;
      var revisionHistory = self.scope.revisionHistory;
      //$('#grid-revision-history-country').html(stache('<rn-grid-revision-history-country  rows="{revisionHistory}"></rn-grid-revision-history-country>')({revisionHistory}));
      self.scope.attr("footerrowspresent", true);
      self.scope.attr("footerdata",  self.scope.revisionHistory != null && self.scope.revisionHistory.length >0 ? self.scope.revisionHistory.length : 0);

    },
    '{societyModelMapping} change': function() {
      var self = this;
      var societyModelMapping = self.scope.societyModelMapping;
      //$('#grid-society-model').html(stache('<rn-grid-society-model rows="{societyModelMapping}"></rn-grid-society-model>')({societyModelMapping}));
      self.scope.attr("footerrowspresent", true);
      self.scope.attr("footerdatasocmod",  self.scope.societyModelMapping != null && self.scope.societyModelMapping.length >0 ? self.scope.societyModelMapping.length : 0);

    },
    '#editableText keyup':function(){   
      if($('#editableText').val().length==0){
        $("#submitBtn").prop("disabled", true);
      }else{
        $("#submitBtn").prop("disabled", false);
      }
    },
    '#fetchDetailsBtn click':function(){
      var self = this.scope;
      self.attr("revHistory").splice(0, self.attr("revHistory").length);
      $("#loading_img").show();
      $(".buttonsPlaceHolder").hide();
      $("#viewPricingModelDivBlock").hide();
      //console.log(this.scope.pageState.attr("countryId"));
      var countryId;
      if(self.pageState.countryDetails.country.attr("countryId")=="")
        countryId = self.pageState.attr("countryId")
      else
        countryId = self.pageState.countryDetails.country.attr("countryId");

      var requestObj  = {
          "id":"",
          "countryId":countryId
      };

      RefCountry.findOne(UserReq.formRequestDetails(requestObj),function(data){
        $("#loading_img").hide();
         commonUtils.hideUIMessage();
        if(data.status == "SUCCESS") {
          //console.log("Response data is "+JSON.stringify(data.attr()));
          self.pageState.countryDetails.attr("country",data.countryDetails);

          console.log("data.countryDetails.status-->"+data.countryDetails.status);
           if(data.countryDetails.status == "A") {
                self.pageState.countryDetails.country.attr("displayStatus","Active");
           } else if (data.countryDetails.status == "I") {
                self.pageState.countryDetails.country.attr("displayStatus","Inactive");
           } else if (data.countryDetails.status == "R") {
                self.pageState.countryDetails.country.attr("displayStatus","Rejected");
           }else if (data.countryDetails.status == "N") {
               self.pageState.countryDetails.country.attr("displayStatus","New");
           }
           else {
               self.pageState.countryDetails.country.attr("displayStatus",data.countryDetails.status);
           }


          /* if the data.countryDetails.countryId is null then set the country dropdown using requestObj*/
          if(data.countryDetails.countryId==null){
            self.pageState.countryDetails.country.attr("countryId",requestObj.countryId);
          }

          if(data.countryDetails.attr("validFrom")!=0)
            var validFrom = data.countryDetails.attr("validFrom").toString();
          else
            var validFrom = "0";

          if(validFrom == undefined || validFrom == null || validFrom == "0")
            self.pageState.countryDetails.country.attr("validFrom","");
          else {
            var formatValidFrom = PeriodHelper.getDisplayPeriod(validFrom,"P");
            self.pageState.countryDetails.country.attr("validFrom",formatValidFrom);
            //self.validFrom.replace(formatValidFrom);
          }

          if(data.countryDetails.attr("validTo")!=0)
            var validTo = data.countryDetails.attr("validTo").toString();
          else
            var validTo = "0";

          if(validTo == undefined || validTo == null || validTo == "0")
            self.pageState.countryDetails.country.attr("validTo","");
          else {
            var formatValidTo = PeriodHelper.getDisplayPeriod(validTo,"P");
            self.pageState.countryDetails.country.attr("validTo",formatValidTo);
            //self.validTo.replace(formatValidTo);
          }

          self.attr("localSocietyNames").replace(data.countryDetails.localSocietyNames);
          if(data.countryDetails.localSocietyId !=0){
            self.pageState.countryDetails.country.attr("localSocietyId",data.countryDetails.localSocietyId);
            $("#localSocietysel").val(data.countryDetails.localSocietyId);
          }

          if(data.countryDetails.mainPricingMethod!=null){
            self.pageState.countryDetails.country.attr("mainPricingMethod",data.countryDetails.mainPricingMethod);
            $('#mainPricingMethod').val(data.countryDetails.mainPricingMethod);
          }
          if(data.countryDetails.altPricingMethod!=null){
            self.pageState.countryDetails.country.attr("altPricingMethod",data.countryDetails.altPricingMethod);
            $('#altPricingMethod').val(data.countryDetails.altPricingMethod);
          }

          self.attr("transcurrencies").replace(data.countryDetails.transactionCurrencies);
          if(data.countryDetails.transactionCurrency!=null){
            self.pageState.countryDetails.country.attr("transactionCurrency",data.countryDetails.transactionCurrency);
            $("#transCurrSel").val(data.countryDetails.transactionCurrency);
          }

          self.attr("altcurrencies").replace(data.countryDetails.altCurrencies);
          if(data.countryDetails.altCurrency!=null){
            self.pageState.countryDetails.country.attr("altCurrency",data.countryDetails.altCurrency);
            $("#altCurrSel").val(data.countryDetails.altCurrency);
          }

          var pricingModelNames = [];
          var pricingModelVersions = {};
          var getModels = data.countryDetails.models;
          var selectedAccModel = data.countryDetails.model;
          var selModelId,selectedAccModelVersions;

          for(var i=0;i<getModels.length;i++){
            var accModelName = getModels[i].accrualModelName;
            var accModelId = getModels[i].accrualModelID;
            var accModelVersion = getModels[i].versionNo;
            if(pricingModelNames.indexOf(accModelName)==-1){
              pricingModelNames.push(accModelName);
              pricingModelVersions[accModelName] = [];
              pricingModelVersions[accModelName].push({"version":accModelVersion,"modelId":accModelId});
            } else {
              pricingModelVersions[accModelName].push({"version":accModelVersion,"modelId":accModelId});
            }
          }

          var accModels = [];
          var flag= false;
          for(var key in pricingModelVersions){
            var temp = {};
            temp["accName"] = key;
            temp["versions"] = pricingModelVersions[key];
            accModels.push(temp);
            /* this in the case of selectedAccModel is null to set the first value in Pricing model*/
            if(selectedAccModel==null && flag==false){
              selectedAccModelVersions =  pricingModelVersions[key];
              selModelId = selectedAccModelVersions[0]["modelId"];
              flag = true;
            }
            if(key==selectedAccModel){
              selectedAccModelVersions =  pricingModelVersions[key];
              selModelId = selectedAccModelVersions[0]["modelId"];
            }
          }
          //console.log("accural Models "+JSON.stringify(accModels));
          //console.log("sel accural Model vers are "+JSON.stringify(selectedAccModelVersions));
          //console.log("sel accural Model id is "+JSON.stringify(selModelId));
          self.attr("accuralModels").replace(accModels);
          self.attr("accuralModelVersions").replace(selectedAccModelVersions);
          self.attr("selectedModelId",selModelId);

          $("#accModelSel").val(selectedAccModel);
          $("#accModelSel").change();

          var tempcommentObj = data.countryDetails.commentList;
          //console.log("multi comments "+JSON.stringify(tempcommentObj.attr()));
          if(tempcommentObj !=null)
          {
            self.pageState.countryDetails.attr("commentList",data.countryDetails.commentList);
            $('#multipleComments').html(stache('<multiple-comments divid="usercommentsdiv" options="{tempcommentObj}" divheight="100" isreadOnly="n"></multiple-comments>')({tempcommentObj}));
          } else {
            self.pageState.countryDetails.attr("commentList","");
          }

          var revHistories = data.countryDetails.revisionHistories.attr();
          self.attr("revHistory", data.countryDetails.revisionHistories.attr());
          var formatRevHistories = [];
          for(var i=0;i<revHistories.length;i++){
            var revHisTemp = {};
            revHisTemp["id"] = revHistories[i]["id"];
            revHisTemp["validFrom"] = (revHistories[i]["validFrom"]==null)?"":revHistories[i]["validFrom"];
            revHisTemp["validTo"] = (revHistories[i]["validTo"]==null)?"":revHistories[i]["validTo"];

          //  revHisTemp["comment"] = (revHistories[i]["commentList"].length==0 || revHistories[i]["commentList"][0]["comments"]==null)?"":revHistories[i]["commentList"][0]["comments"];
          revHisTemp["comment"] = (revHistories[i]["commentText"]==null)?"":revHistories[i]["commentText"];
            revHisTemp["status"] = revHistories[i]["status"];
            formatRevHistories.push(revHisTemp);
          }
          //console.log("revision history "+JSON.stringify(formatRevHistories));
          self.revisionHistory.replace(formatRevHistories);

          self.societyModelMapping.replace(data.countryDetails.modelMappings);

          $("#loading_img").hide();
          $(".main-layout").show();
          $(".buttonsPlaceHolder").show();

          if(data.countryDetails.status == "A" || data.countryDetails.status == "N") {
            self.attr("state","Edit");
          }else{
            self.attr("state","Read");
          }

          setTimeout(function(){
            alignGrid("grid-revision-history-country");
            alignGrid("grid-society-model");
            $('rn-grid-society-model').children('table').tablesorter({
              // manipulate the template string after is it created
              onRenderTemplate : function(i, t){
                return t+'<span class="sort-arrow-asc">△</span><span class="sort-arrow-desc">▽</span>';
              }
            });
            $('rn-grid-revision-history-country').children('table').tablesorter({
              // manipulate the template string after is it created
              onRenderTemplate : function(i, t){
                return t+'<span class="sort-arrow-asc">△</span><span class="sort-arrow-desc">▽</span>';
              }
            });
          },10);

          $('#submitBtn').show();

          self.switchButtons();

          if(data.countryDetails.proposalPending != null && data.countryDetails.proposalPending != undefined
            && data.countryDetails.proposalPending == true ) {

            $('#submitBtn').hide();

            commonUtils.displayUIMessage( "SUCCESS", "A Proposal is already pending for the country");

          }

          $('#countryForm').bootstrapValidator('validate');
         

        } else {

          commonUtils.displayUIMessage(data.status, data.responseText);

        }

      },function(xhr){
          console.error("Error while loading: country Details"+xhr);
      });


    },
    '{selectedperiod} change':function(val){

       var periodValue = val[0].value;
       console.log(periodValue);

       if(val[0].which == "validFrom"){

         $("input[name='validFrom']").val(periodValue);

         $("input[name='validFrom']").on('change', function(e) {
           // Revalidate the date when user change it
           $('#countryForm').bootstrapValidator('revalidateField', 'validFrom');
         });

       }
       $('input[name=validFrom]').change();

       if(val[0].which == "validTo") {
         $("input[name='validTo']").val(periodValue);
         $("input[name='validTo']").on('change', function(e) {
             // Revalidate the date when user change it
           //$('#entityLicensorBottom').bootstrapValidator('revalidateField', 'periodToInp');
         });
       }
       $('input[name=validTo]').change();

       //val[0].which=='validFrom' ? this.scope.validFrom.replace(val[0].value):this.scope.validTo.replace(val[0].value);
    },
    '{validFrom} change': function(el, ev) {
         var comp ='from';
         //showErrorMsg(this.scope.attr('validFrom')[0],this.scope.attr('validTo')[0],comp);
     },
     '{validTo} change': function(el, ev) {
          var comp ='to';
          //showErrorMsg(this.scope.attr('validFrom')[0],this.scope.attr('validTo')[0],comp);

     },
    '#accModelSel change': function(el, ev) {
      var self=this.scope;
      var selected = $(el[0].selectedOptions).data('accModel');
      //console.log("selected accmodel "+JSON.stringify(selected.attr()));
      var ver = selected.attr()["versions"];
      //console.log("selected ver "+JSON.stringify(ver));
      self.attr("accuralModelVersions").replace(ver);

      var selModelId = ver[0]["modelId"];

      var maxVersion = 0;

      for(var i=0; i< ver.length; i++) {

        if(maxVersion < ver[i].version) {

          maxVersion =  ver[i].version;

        }

      }

      $("#accModelVerSel").val(maxVersion);
      $("#accModelVerSel").change();
      //console.log("sel model id "+selModelId)
      self.attr("selectedModelId",selModelId);

    },
    '#accModelVerSel change': function(el, ev) {
      var self=this.scope;
      var selected = $(el[0].selectedOptions).data('accModelVer');
      //console.log("selected accmodelvers "+JSON.stringify(selected.attr()));

      //console.log("sel model id "+selModelId)
      self.attr("selectedModelId",selected.modelId);
    },
    'td .society click': function(el, ev){

        var self = this;
        var licensor = el[0].text;

        if(licensor != undefined && licensor.length>0){
           var data = {  licensor:licensor, regionId: $('#countryRegion option:selected').val()};
           self.scope.appstate.screenLookup.attr("licensorScreenDetails" ,data);
           commonUtils.navigateTo("licensor");
        }
        // self.scope.appstate.attr("licensorName", (el[0].getElementsByTagName("a")).length > 0 ?  ((el[0].getElementsByTagName("a"))[0]).getAttribute("value") : "") ;
        // commonUtils.navigateTo("licensor");
        // this.scope.appstate.attr('page','licensor');
    },
    '.pricingModel click': function(item, el, ev){
        var self = this.scope;
        var row = item.closest('tr').data('row').row;
        var entity = row.society;

        var selmodelid = (item.closest("a")[0]).getAttribute("value");
        var country = self.pageState.countryDetails.country.attr("countryId");
        var genObj = {modelId:selmodelid,reqType:'countryLicensordetails', countryId:country, entityName:entity};

        console.log("Request is " +JSON.stringify(UserReq.formRequestDetails(genObj)));
        CountryLicensor.findOne(UserReq.formRequestDetails(genObj),function(data){
            //console.log("Pricing model details "+ JSON.stringify(data.pricingModel.attr()));
            if(data.pricingModel != null) {
              self.attr("getPricingModelDetails",data.pricingModel);
              self.attr("baseModelParameter").replace(data.pricingModel.baseModelParameters);
              self.attr("trackCounts").replace(data.pricingModel.trackCounts);

              var tempcommentObj = data.pricingModel.pricingModel.comments;
              if(tempcommentObj.length > 0){
                self.attr("commentFlag", true);
                $('#priceModelmultipleComments').html(stache('<multiple-comments divid="usercommentsdiv" options="{tempcommentObj}" divheight="100" isreadOnly="y"></multiple-comments>')({tempcommentObj}));
              }else{
                self.attr("commentFlag", false);
              }

              $("#viewPricingModelDivBlock").show();
            } else {

              commonUtils.displayUIMessage("FAILURE", "No details present");

            }
        }).then(function(){
          console.log("ERROR");
        });

    },
    "{scope} regionStore": function(){
      var self = this;
      var regnId = self.scope.attr("regionStore");
      if (regnId != undefined && regnId.length > 0 && self.scope.reloadCountries) {
        var genObj = {
          regionId: regnId
        };
        Promise.all([
          Country.findAll(UserReq.formRequestDetails(genObj))
          ]).then(function(values) {
            self.scope.attr("countries").replace([]);
            //self.scope.attr("licensors").replace(values[0]["entities"]);
            self.scope.attr("countries").replace(values[0]);
            self.scope.pageState.countryDetails.country.attr("countryId",values[0][0].id)
          });
        }
        self.scope.attr("reloadCountries",true);
      },
    '#accuralModelBtn click': function(){
      var self = this.scope;
      var selmodelid = self.attr("selectedModelId").toString();
      var country = self.pageState.countryDetails.country.attr("countryId");
      var genObj = {modelId:selmodelid,reqType:'countryLicensordetails', countryId:country, id:self.pageState.countryDetails.country.id};

      console.log("Request is " +JSON.stringify(UserReq.formRequestDetails(genObj)));
      CountryLicensor.findOne(UserReq.formRequestDetails(genObj),function(data){
          //console.log("Pricing model details "+ JSON.stringify(data.pricingModel.attr()));

          if(data.pricingModel == undefined || data.pricingModel == null) {

            $("#viewPricingModelDivBlock").hide();

            var msg = "No details available";

            // $("#invmessageDiv").html("<label class='successMessage'>"+msg+"</label>");
            // $("#invmessageDiv").show();
            // setTimeout(function(){
            //   $("#invmessageDiv").hide();
            // },5000);
            commonUtils.displayUIMessage("SUCCESS", msg);

          } else {

            $("#viewPricingModelDivBlock").show();
            self.attr("getPricingModelDetails",data.pricingModel);
            self.attr("baseModelParameter").replace(data.pricingModel.baseModelParameters );
            self.attr("trackCounts").replace(data.pricingModel.trackCounts);

            var tempcommentObj = data.pricingModel.pricingModel.comments;
            if(tempcommentObj.length > 0){
              self.attr("commentFlag", true);
              $('#priceModelmultipleComments').html(stache('<multiple-comments divid="usercommentsdiv1" options="{tempcommentObj}" divheight="100" isreadOnly="y" dividfromparent="noneditdiv"></multiple-comments>')({tempcommentObj}));
            }else{
              self.attr("commentFlag", false);
            }

            $("#viewPricingModelDivBlock").show();

          }

          
      }).then(function(){
        console.log("ERROR");
      });
    },
    '#priModelClose click': function(){
        $("#viewPricingModelDivBlock").hide();
    },
    '{baseModelParameter} change': function() {
      var self = this;
      console.log("here");
      var baseModelParameter = self.scope.baseModelParameter;
        $('#baseModelParameterDiv').html(stache('<rn-grid-pricing-base-model rows="{baseModelParameter}"></rn-grid-pricing-base-model>')({baseModelParameter}));
    },
    '{trackCounts} change': function() {
      var self = this;
      console.log("here");

      var trackCounts = self.scope.trackCounts;
        $('#trackCountsDiv').html(stache('<rn-grid-pricing-trackcounts rows="{trackCounts}"></rn-grid-pricing-trackcounts>')({trackCounts}));
    },
    '#buttonCancel  click': function(){

      //form Reset
      var self = this.scope;
      self.societyModelMapping.replace([]);
      revisionHistory.replace([]);

      var resetObject = {
            countryId:this.scope.pageState.countryDetails.country.attr("countryId")
          };

      self.pageState.countryDetails.attr("country",resetObject);
      self.pageState.countryDetails.attr("comment","");
      self.attr("state","Read");
      $(".main-layout").hide();
      $(".buttonsPlaceHolder").hide();

    },
    '#approveBtn click': function() {

      var genObj = {};
      var self = this.scope;

      var selmodelid = self.pageState.countryDetails.country.attr("modelId");
      var country = self.pageState.countryDetails.country.attr("countryId");
      var validFrom = $("#validFrom").val();
      var formatValidFrom = PeriodHelper.getFiscalPeriod(validFrom);
      var validTo = $("#validTo").val();
      if(validTo != null && validTo != undefined && validTo!="")
        var formatValidTo = PeriodHelper.getFiscalPeriod(validTo);
      else
        var formatValidTo = "";
      var comments = $(".new-comments").val();

      if(comments != null && comments == "") {

        $(".multicomments-required").show();
        setTimeout(function(){
          $(".multicomments-required").hide();
        },2000);
        return;

      }

      $("#loading_img").show();

      //genObj = {modelId:selmodelid,reqType:'countryLicensordetails', countryId:country};

      var requestObj  = {
          id : self.pageState.countryDetails.country.id,
          countryDetails  :{
            id: self.pageState.countryDetails.country.id,
            status: self.pageState.countryDetails.country.status,
            modelId: self.selectedModelId,
            countryId: self.pageState.countryDetails.country.countryId,
            currencies: null,
            countryName: self.pageState.countryDetails.country.countryName,
            localSocietyNames: null,
            residualInvoiceDays: 0,
            mainPricingMethod: self.pageState.countryDetails.country.mainPricingMethod,
            altPricingMethod: self.pageState.countryDetails.country.altPricingMethod,
            mainPricingMethods: null,
            altPricingMethods: null,
            mechShare: self.pageState.countryDetails.country.mechShare,
            performShare: self.pageState.countryDetails.country.performShare,
            transactionCurrency: self.pageState.countryDetails.country.transactionCurrency,
            altCurrency: self.pageState.countryDetails.country.altCurrency,
            currency: self.pageState.countryDetails.country.altCurrency,
            transactionCurrencies: null,
            altCurrencies: null,
            localSocietyId: self.pageState.countryDetails.country.localSocietyId,
            validFrom: formatValidFrom,
            validTo: formatValidTo,
            commentId: self.pageState.countryDetails.country.commentId,
            comments: comments

          }
        };

      console.log("Request passed is "+JSON.stringify(UserReq.formRequestDetails(requestObj)));

      Promise.all([RefCountry.approve(UserReq.formRequestDetails(requestObj))]).then(function(values){
        var data = values[0];
        console.log("Response is "+ JSON.stringify(data));

        $("#loading_img").hide();

        if(data.status=="SUCCESS"){
          var msg = "Country details saved successfully";

          $("#invmessageDiv").html("<label class='successMessage'>"+msg+"</label>");
          $("#invmessageDiv").show();
          setTimeout(function(){
            $("#invmessageDiv").hide();
          },5000);

          self.populateCountryDetails(self, country, self.pageState.countryDetails.country.id, false)
        } else {

          $("#loading_img").hide();

        }
      });

    },

    '#rejectBtn click': function() {

      //var genObj = {};
      var self = this.scope;

     // var selmodelid = (item.closest("a")[0]).getAttribute("value");
      var country = self.pageState.countryDetails.country.attr("countryId");
      //genObj = {modelId:selmodelid,reqType:'countryLicensordetails', countryId:country, entityName:entity};

      var validFrom = $("#validFrom").val();
      var formatValidFrom = PeriodHelper.getFiscalPeriod(validFrom);
      var validTo = $("#validTo").val();
      if(validTo != null && validTo != undefined && validTo!="")
        var formatValidTo = PeriodHelper.getFiscalPeriod(validTo);
      else
        var formatValidTo = "";
      var comments = $(".new-comments").val();

      if(comments != null && comments == "") {

        $(".multicomments-required").show();
        setTimeout(function(){
          $(".multicomments-required").hide();
        },2000);
        return;

      }

      $("#loading_img").show();

      var requestObj  = {
          id: self.pageState.countryDetails.country.id,
          countryDetails  :{
            id: self.pageState.countryDetails.country.id,
            status: self.pageState.countryDetails.country.status,
            modelId: self.selectedModelId,
            countryId: self.pageState.countryDetails.country.countryId,
            currencies: null,
            countryName: self.pageState.countryDetails.country.countryName,
            localSocietyNames: null,
            residualInvoiceDays: 0,
            mainPricingMethod: self.pageState.countryDetails.country.mainPricingMethod,
            altPricingMethod: self.pageState.countryDetails.country.altPricingMethod,
            mainPricingMethods: null,
            altPricingMethods: null,
            mechShare: self.pageState.countryDetails.country.mechShare,
            performShare: self.pageState.countryDetails.country.performShare,
            transactionCurrency: self.pageState.countryDetails.country.transactionCurrency,
            altCurrency: self.pageState.countryDetails.country.altCurrency,
            currency: self.pageState.countryDetails.country.altCurrency,
            transactionCurrencies: null,
            altCurrencies: null,
            localSocietyId: self.pageState.countryDetails.country.localSocietyId,
            validFrom: formatValidFrom,
            validTo: formatValidTo,
            commentId: self.pageState.countryDetails.country.commentId,
            comments: comments

          }
        };

      console.log("Request passed is "+JSON.stringify(UserReq.formRequestDetails(requestObj)));

      Promise.all([RefCountry.reject(UserReq.formRequestDetails(requestObj))]).then(function(values){
        var data = values[0];
        console.log("Response is "+ JSON.stringify(data));
        if(data.status=="SUCCESS"){
          var msg = "Country details saved successfully";

          $("#loading_img").hide();

          $("#invmessageDiv").html("<label class='successMessage'>"+msg+"</label>");
          $("#invmessageDiv").show();
          setTimeout(function(){
            $("#invmessageDiv").hide();
          },5000);

          self.populateCountryDetails(self, country, self.pageState.countryDetails.country.id, false)
        } else {

          $("#loading_img").hide();

        }
      });

    },
    '#submitBtn click': function(el, ev){
      ev.preventDefault();

      var self = this.scope;
      var validFrom = $("#validFrom").val();
      var formatValidFrom = PeriodHelper.getFiscalPeriod(validFrom);
      var validTo = $("#validTo").val();
      if(validTo != null && validTo != undefined && validTo!="")
        var formatValidTo = PeriodHelper.getFiscalPeriod(validTo);
      else
        var formatValidTo = "";
      var comments = $(".new-comments").val();

      if(comments != null && comments == "") {

        $(".multicomments-required").show();
        setTimeout(function(){
          $(".multicomments-required").hide();
        },2000);
        return;

      }

      $("#loading_img").show();

      var requestObj  = {
          countryDetails  :{
            id: self.pageState.countryDetails.country.id,
            status: self.pageState.countryDetails.country.status,
            modelId: self.selectedModelId,
            countryId: self.pageState.countryDetails.country.countryId,
            currencies: null,
            countryName: self.pageState.countryDetails.country.countryName,
            localSocietyNames: null,
            residualInvoiceDays: 0,
            mainPricingMethod: self.pageState.countryDetails.country.mainPricingMethod,
            altPricingMethod: self.pageState.countryDetails.country.altPricingMethod,
            mainPricingMethods: null,
            altPricingMethods: null,
            mechShare: self.pageState.countryDetails.country.mechShare,
            performShare: self.pageState.countryDetails.country.performShare,
            transactionCurrency: self.pageState.countryDetails.country.transactionCurrency,
            altCurrency: self.pageState.countryDetails.country.altCurrency,
            currency: self.pageState.countryDetails.country.altCurrency,
            transactionCurrencies: null,
            altCurrencies: null,
            localSocietyId: self.pageState.countryDetails.country.localSocietyId,
            validFrom: formatValidFrom,
            validTo: formatValidTo,
            commentId: self.pageState.countryDetails.country.commentId,
            comments: comments
          }
        };

        console.log("Request passed is "+JSON.stringify(UserReq.formRequestDetails(requestObj)));

      RefCountry.create(UserReq.formRequestDetails(requestObj),function(data){
        console.log("Response is "+ JSON.stringify(data));
         $("#loading_img").hide();
        if(data.status=="SUCCESS"){
          var msg = "Country details saved successfully";

      //$("#invmessageDiv").html("<label class='successMessage'>"+msg+"</label>");
          //$("#invmessageDiv").show();
          $("#fetchDetailsBtn").click();
          // setTimeout(function(){
          //   $("#invmessageDiv").hide();
          // },5000);
          commonUtils.displayUIMessage(data.status, msg);
        } else {

          commonUtils.displayUIMessage(data.status, data.responseText);

        }
      });

      //this.scope.attr("displayMessage","display:block");
    }
  }
});

var showErrorMsg = function(periodFrom,periodTo,whichcomp){

        var flag = false;
        var from = periodFrom || false;
        var to = periodTo || false;
        var message1 = 'Period from is greater than period to !';
        var message3 = 'Invalid Month Selection !'

        if (from && to) {
          var prdFromVal=PeriodHelper.getFiscalPeriod(from);
          var prdToVal=PeriodHelper.getFiscalPeriod(to);
          var periodFrom=prdFromVal%100;
          var periodTo=prdToVal%100;
          var yearFrom=(prdFromVal-periodFrom)/100;
          var yearTo=(prdToVal-periodTo)/100;
          var yearDif=yearTo-yearFrom;
          alert(" data " + yearDif + " " + periodFrom + " " + periodTo + " " + prdFromVal + " " + prdToVal);
          if(yearDif < 0){
            return message1;
          }else if(yearDif == 0 ){
            if(prdFromVal > prdToVal){
              return message1;
            }
          }
        }
        return "";
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

        if(i==1)
          tdWidth = 35;

        tableWidth += tdWidth;
        cellWidthArr.push(tdWidth);
      }

      if(tableWidth < divWidth){


        var moreWidth = (divId == "grid-society-model")?(divWidth-tableWidth)/(colLength-1):(divWidth-tableWidth)/colLength;
        for(var j=1;j<=cellWidthArr.length;j++){
          var width = cellWidthArr[j-1]+moreWidth;

           if(divId == "grid-society-model"){
              if(j != 3){  //version
                var width = cellWidthArr[j-1]+moreWidth;
              }
              else{
                var width = cellWidthArr[j-1];
              }
            }
            else
            {
              var width = cellWidthArr[j-1]+moreWidth;
            }

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
