import Component from 'can/component/';

import stache from 'can/view/stache/';
import template from './template.stache!';
import styles from './page-ref-country.less!';
import GridSocietyModelMapping from './grid-model-society-mapping/';
import GridRevision from './grid-revision-history/';
import GridPricingBaseModel from './grid-pricing-base-model/';
import GridPricingTrackcounts from './grid-pricing-trackcounts/';
import calander from 'components/period-calendar/';
import Comments from 'components/multiple-comments/';

import css_bootstrapValidator from 'bootstrapValidator.css!';

import bootstrapValidator from 'bootstrapValidator';


import UserReq from 'utils/request/';
import PeriodHelper from 'utils/periodWidgetHelpers'
import Licensor from 'models/common/licensor/';
import Country from 'models/common/country/';
import Currency from 'models/common/currency/';
import RefCountry from 'models/refdata/country/';
import PricingModels from 'models/pricing-models/';
import PricingMethods from 'models/common/pricingMethods/';


var reportConfigurationList = new can.List();

var revisionHistory = new can.List();

var pageState = {
    countryDetails:{
      country:{localSocietyId:"",countryId:"",status:undefined},
      commentList:undefined
    }
};

var page = Component.extend({
  tag: 'page-ref-country',
  template: template,
  scope: {
    pageState: pageState,

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
    displayMessage:"display:none",
    state:"Edit"
  },

  init: function(){
        var self = this;
        self.scope.appstate.attr("renderGlobalSearch",false);
        var requestObj = {};
        var modelObj = {reqType:'modeltype'};

        Promise.all([
            Licensor.findAll(UserReq.formRequestDetails(requestObj)),
            PricingModels.findOne(UserReq.formRequestDetails(modelObj)),
            Country.findAll(UserReq.formRequestDetails(requestObj)),
            PricingMethods.findOne(UserReq.formRequestDetails(requestObj))
        ]).then(function(values) {
              self.scope.attr("entities").replace(values[0]["entities"][0]);
              self.scope.attr("pricingModelTypes").replace(values[1].modelTypes);
              self.scope.attr("countries").replace(values[2]);
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
    disableSubmit:function(){
       if(this.attr("state") == "Read"){
         return 'disabled';
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
    }

  },
  events: {

    "inserted": function(){
      var self = this;

      $('#grid-society-model').append(stache('<rn-grid rows="{reportConfigurationList}"></rn-grid>')({reportConfigurationList}));
      $('#grid-revision-history').append(stache('<rn-grid-revision-history rows="{revisionHistory}"></rn-grid-revision-history>')({revisionHistory}));


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

      }).on('success.field.bv', function(e, data) {
          data.bv.disableSubmitButtons(false);

      });

    },
    '.updatePeroid focus':function(el){
       $(el).closest('.calendarcls').find('.box-modal').show().trigger( "focus" );
     },
    "#grid-revision-history table>tbody>tr click": function(item, el, ev){
        //var invoiceid = el.closest('tr').data('row').row.id;
        var self=this.scope;
        $("#loading_img").show();

        var alreadySelRow = item.closest("tbody").find("tr.selected");
        alreadySelRow.toggleClass("selected");

        $(item[0]).toggleClass("selected");
        var row = item.closest('tr').data('row').row;

        var requestObj  = {
            "id":row.id,
            "countryId":self.pageState.countryDetails.country.attr("countryId")
        };
        console.log("Request passed is "+ JSON.stringify(UserReq.formRequestDetails(requestObj)));
        RefCountry.findOne(UserReq.formRequestDetails(requestObj),function(data){

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

          if(validFrom == "0")
            self.pageState.countryDetails.country.attr("validFrom","");
          else {
            var formatValidFrom = PeriodHelper.getDisplayPeriod(validFrom, "P");
            self.pageState.countryDetails.country.attr("validFrom",formatValidFrom);
          }

          if(data.countryDetails.attr("validTo")!=0)
            var validTo = data.countryDetails.attr("validTo").toString();
          else 
            var validTo = "0";

          if(validTo == "0")
            self.pageState.countryDetails.country.attr("validTo","");
          else {
            var formatValidTo = PeriodHelper.getDisplayPeriod(validTo,"P");
            self.pageState.countryDetails.country.attr("validTo",formatValidTo);
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
          for(var key in pricingModelVersions){
            var temp = {};
            temp["accName"] = key;
            temp["versions"] = pricingModelVersions[key];
            accModels.push(temp);
          }
          //console.log("accural Models "+JSON.stringify(accModels));
          self.attr("accuralModels").replace(accModels);

          
          var tempcommentObj = data.countryDetails.commentList;
          //console.log("multi comments "+JSON.stringify(tempcommentObj));
          if(tempcommentObj!=null){
            self.pageState.countryDetails.attr("commentList",data.countryDetails.commentList);
            $('#multipleComments').html(stache('<multiple-comments divid="usercommentsdiv" options="{tempcommentObj}" divheight="100" isreadOnly="n"></multiple-comments>')({tempcommentObj}));
          } else {
              self.pageState.countryDetails.attr("commentList",[]);
              $('#multipleComments').html('<textarea class="form-control new-comments" maxlength="1024" name="usercommentsdiv"  style="height:125px;   min-height:100px;    max-height:100px;"></textarea>');
          }
          $("#loading_img").hide();
        },function(xhr){
            console.error("Error while loading: country-Entity Details"+xhr);
        });
    },
    '{revisionHistory} change': function() {
      var self = this;
      var revisionHistory = self.scope.revisionHistory;
        $('#grid-revision-history').html(stache('<rn-grid-revision-history rows="{revisionHistory}"></rn-grid-revision-history>')({revisionHistory}));
    },
    '{societyModelMapping} change': function() {
      var self = this;
      var societyModelMapping = self.scope.societyModelMapping;
        $('#grid-society-model').html(stache('<rn-grid-society-model rows="{societyModelMapping}"></rn-grid-society-model>')({societyModelMapping}));
    },
    '#fetchDetailsBtn click':function(){
      var self = this.scope;
      $("#loading_img").show();
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

      console.log("Request passed is "+ JSON.stringify(UserReq.formRequestDetails(requestObj)));
      RefCountry.findOne(UserReq.formRequestDetails(requestObj),function(data){

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

        if(validFrom == "0")
          self.pageState.countryDetails.country.attr("validFrom","");
        else {
          var formatValidFrom = PeriodHelper.getDisplayPeriod(validFrom,"P");
          self.pageState.countryDetails.country.attr("validFrom",formatValidFrom);
        }

        if(data.countryDetails.attr("validTo")!=0)
          var validTo = data.countryDetails.attr("validTo").toString();
        else 
          var validTo = "0";

        if(validTo == "0")
          self.pageState.countryDetails.country.attr("validTo","");
        else {
          var formatValidTo = PeriodHelper.getDisplayPeriod(validTo,"P");
          self.pageState.countryDetails.country.attr("validTo",formatValidTo);
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
        setTimeout(function(){
          if(selectedAccModel !=null)
            $("#accModelSel").val(selectedAccModel);
        },1000);

        if(data.countryDetails.commentList!=null)
          
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
        var formatRevHistories = [];
        for(var i=0;i<revHistories.length;i++){
          var revHisTemp = {};
          revHisTemp["id"] = revHistories[i]["id"];
          revHisTemp["validFrom"] = (revHistories[i]["validFrom"]==null)?"":revHistories[i]["validFrom"];
          revHisTemp["validTo"] = (revHistories[i]["validTo"]==null)?"":revHistories[i]["validTo"];
          revHisTemp["comment"] = (revHistories[i]["commentList"].length==0 || revHistories[i]["commentList"][0]["comments"]==null)?"":revHistories[i]["commentList"][0]["comments"];
          revHisTemp["status"] = revHistories[i]["status"];
          formatRevHistories.push(revHisTemp);
        }
        //console.log("revision history "+JSON.stringify(formatRevHistories));
        self.revisionHistory.replace(formatRevHistories);

        self.societyModelMapping.replace(data.countryDetails.modelMappings);

        $("#loading_img").hide();
        if(data.countryDetails.status == "A") {
          self.attr("state","Edit");
        }else{
          self.attr("state","Read");
        }

      },function(xhr){
          console.error("Error while loading: country Details"+xhr);
      });


    },
    '#accModelSel change': function(el, ev) {
      var self=this.scope;
      var selected = $(el[0].selectedOptions).data('accModel');
      //console.log("selected accmodel "+JSON.stringify(selected.attr()));
      var ver = selected.attr()["versions"];
      //console.log("selected ver "+JSON.stringify(ver));
      self.attr("accuralModelVersions").replace(ver);

      var selModelId = ver[0]["modelId"];
      //console.log("sel model id "+selModelId)
      self.attr("selectedModelId",selModelId);

    },
    '#accModelVerSel change': function(el, ev) {
      var self=this.scope;
      var selected = $(el[0].selectedOptions).data('accModelVer');
      //console.log("selected accmodelvers "+JSON.stringify(selected.attr()));
      var selModelId = selected["modelId"];
      //console.log("sel model id "+selModelId)
      self.attr("selectedModelId",selModelId);
    },
    '#pricingModelBtn click': function(){
      var self = this.scope;
      $("#viewPricingModelDiv").show();
      var selmodelid = self.attr("selectedModelId").toString();
      var genObj = {modelId:selmodelid,reqType:'details'};

      console.log("Request is " +JSON.stringify(UserReq.formRequestDetails(genObj)));
      PricingModels.findOne(UserReq.formRequestDetails(genObj),function(data){
          //console.log("Pricing model details "+ JSON.stringify(data.pricingModel.attr()));
          self.attr("getPricingModelDetails",data.pricingModel);
          self.attr("baseModelParameter").replace(data.pricingModel.baseModelParameters);
          self.attr("trackCounts").replace(data.pricingModel.trackCounts);

          var tempcommentObj = data.pricingModel.pricingModel.comments;
          if(tempcommentObj!=null)
            $('#priceModelmultipleComments').html(stache('<multiple-comments divid="priceModelmultipleComments" options="{tempcommentObj}" divheight="100" isreadOnly="y"></multiple-comments>')({tempcommentObj}));
      }).then(function(){
      });
    },
    '#priModelClose click': function(){
        $("#viewPricingModelDiv").hide();
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
      societyModelMapping.replace([]);
      revisionHistory.replace([]);

      var resetObject = {
            countryId:this.scope.pageState.countryDetails.country.attr("countryId")
          };

      self.pageState.countryDetails.attr("country",resetObject);
      self.pageState.countryDetails.attr("comment","");
      self.attr("state","Read");

    },
    '#submitBtn click': function(el, ev){
      ev.preventDefault();
      var self = this.scope;
      var validFrom = $("#validFrom").val();
      var formatValidFrom = PeriodHelper.getFiscalPeriod(validFrom);
      var validTo = $("#validTo").val();
      if(validTo!="")
        var formatValidTo = PeriodHelper.getFiscalPeriod(validTo);
      else
        var formatValidTo = "";
      var comments = $(".new-comments").val();

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
        if(data.status=="SUCCESS"){
          self.attr("displayMessage","display:block");
          setTimeout(function(){
                self.attr("displayMessage","display:none");
          },4000);
        }
      });

      //this.scope.attr("displayMessage","display:block");
    }
  }
});


export default page;
