import Component from 'can/component/';

import stache from 'can/view/stache/';
import template from './template.stache!';
import styles from './page-ref-licensorcountry.less!';
import GridReportConfig from 'components/page-ref-licensorcountry/grid-report-configuration/';
import GridRivision from 'components/page-ref-licensorcountry/grid-revision-history/';
import css_bootstrapValidator from 'bootstrapValidator.css!';
import bootstrapValidator from 'bootstrapValidator';
import multiComments from 'components/multiple-comments/';
import UserReq from 'utils/request/';
import Licensor from 'models/common/licensor/';
import Country from 'models/common/country/';
import Currency from 'models/common/currency/';
import CountryLicensor from 'models/refdata/countryLicensor/';
import PricingModels from 'models/pricing-models/';
import PricingModelVersions from 'models/common/pricingModelVersions/';
import PricingMethods from 'models/common/pricingMethods/';
import periodCalendar from 'components/period-calendar/';
import periodWidgetHelper from 'utils/periodWidgetHelpers';
import Comments from 'components/multiple-comments/';
import GridPricingBaseModel from '../pricing-model-components/grid-pricing-base-model/';
import GridPricingTrackcounts from '../pricing-model-components/grid-pricing-trackcounts/';


var reportConfigurationList = new can.List();

var revisionHistory = new can.List();


var pageState = {
  entityCountryDetails:{
    entityCountry:{status:undefined},
    comment:undefined
  }
};



var page = Component.extend({
  tag: 'page-ref-licensorcountry',
  template: template,
  scope: {
    pageState: pageState,

    /*Loading form elemenst*/
    entities:[],
    countries:[],
    currencies:[],
    pricingModels:[],
    pricingModelVersions:[],
    pricingMethods:[],
    periodFrom: [],
    periodTo : [],
    selectedperiod:[],
    displayMessage:"display:none",
    state:"Edit",
    periodValidationMsg:"",
    pricingModelDetails : [],
    baseModelParameter: [],
    trackCounts: [],
    refreshEntityId : true,
    validFrom: [],
    validTo : [],
    footerrowspresent: false,
    footer : [],
    data : "",
    revisionHistory : revisionHistory,
    reportConfigurationList : reportConfigurationList,
    footerdatarepconf : "",
    footerdata : "",


      getPricingModelsOnLoad : function(modelId, versionNo) {
        var self = this;
        var pricingModels = self.pricingModels;
        var pricingModelVersions = self.pricingModelVersions;
        for( var i=0; i< pricingModels.length;i++) {

          if(pricingModels[i].modelName == modelId) {

            self.pageState.entityCountryDetails.attr("pricingModelVersionNo", modelId);
            self.setSelectedValue(versionNo, "#entityPricingModelVersionId");

          }
        }
      },

      setSelectedValue : function(text, divId) {

        $(divId+ " option").filter(function() {
          return $(this).text() == text;
        }).prop('selected', true);

      }

  },

  init: function(){

    var self = this;
    self.scope.appstate.attr("renderGlobalSearch",false);
    var requestObj = {};

    var licId ="";

    Promise.all([
      Licensor.findAll(UserReq.formRequestDetails(requestObj)),
      CountryLicensor.findOne(UserReq.formRequestDetails( {reqType:'modelListAndVersion'})) ,
      PricingMethods.findOne(UserReq.formRequestDetails(requestObj))
      ]).then(function(values) {
        self.scope.attr("entities").replace(values[0]["entities"][0]);

        self.scope.attr("onload", true);

        var licensor  = self.scope.attr("entities")[0].entities[0].id;

        self.scope.pageState.entityCountryDetails.entityCountry.attr("entityId", licensor);
        //licId = self.scope.attr("entities")[0].entities[0].id;
        //self.scope.attr("pricingModels").replace(values[1].modelTypes);
        self.scope.attr("pricingMethods").replace(values[2].pricingMethodList);

        var pricingmodelTemps  = [];

        var saved = false;

        var models = values[1].models;

        self.scope.pricingModelDetails = values[1].models;

        for(var i=0; i< models.length; i++) {

          saved = false;

          if(pricingmodelTemps.length > 0 ) {

            for(var j = 0; j < pricingmodelTemps.length ; j++) {

              if(pricingmodelTemps[j].modelName ==  models[i].accrualModelName) {

                var modelVersionElement = {id : "" , value : "" };

                modelVersionElement.id = models[i].accrualModelID;

                modelVersionElement.value = models[i].versionNo;

                pricingmodelTemps[j].modelVersion.push(modelVersionElement);

                saved = true;

              }

            }

          }


        if( !saved ) {

          var element = {modelName : "", modelVersion : []  };

          var modelVersionElement = {id : "" , value : "" };

          modelVersionElement.id = models[i].accrualModelID;

          element.modelName = models[i].accrualModelName;

          modelVersionElement.value = models[i].versionNo;

          element.modelVersion.push(modelVersionElement);

          pricingmodelTemps.push(element);

        }
      }

      self.scope.attr("pricingModels").replace(pricingmodelTemps);

      }).then(function(values) {

        //requestObj = {licensorId:licId};
        requestObj = {};
        self.scope.currencies.replace(Currency.findAll(UserReq.formRequestDetails(requestObj)));
        var pricingReq  = {
          modelName:self.scope.attr("pricingModels")[0].modelName
        }

        Promise.all([
          //Country.findAll(UserReq.formRequestDetails(requestObj)),
          PricingModelVersions.findOne(UserReq.formRequestDetails(pricingReq))
          ]).then(function(values) {
            //self.scope.attr("countries").replace(values[0]);
            var list = [];
            can.each(values[0].version,
              function( value, index ) {
                list.push( {
                  "id":value
                });
              }
            );
            self.scope.attr("pricingModelVersions").replace(list);
          }).then(function(){

            //self.scope.pageState.entityCountryDetails.entityCountry.attr("entityId",self.scope.attr("entities")[0].id);
            //self.scope.pageState.entityCountryDetails.entityCountry.attr("countryId",self.scope.attr("countries")[0].id);

          });
        })


      },
      helpers:{
        setHeight: function(){
          var vph = '85%';
          return 'Style="height:'+vph;
        },
        disableSubmit:function(){
          if(this.attr("state") == "Read"){
            return 'disabled';
          }else{
            return '';
          }
        }
      },
      events: {

        "inserted": function(){

          $(".mainLayoutId").hide();
          $(".buttonsPlaceHolder").hide();
          $("#loading_img").hide();

          $(".multicomments-required").hide();

          var self = this;

          reportConfigurationList = new can.List();
          revisionHistory = new can.List();

          var footer = {
            data: "No of records : " 
          }

          //$('#grid-report-config').append(stache('<rn-grid-report-configuration rows="{reportConfigurationList}"></rn-grid-report-configuration>')({reportConfigurationList}));
          //$('#grid-revision-history').append(stache('<rn-grid-revision-history rows="{revisionHistory}" footerrowspresent="{footerrowspresent}" footerdata="{footerdata}"></rn-grid-revision-history>')({revisionHistory, footerrowspresent:true, footerdata:"No of records: "}));

          $('#countryLicForm').on('init.form.bv', function(e, data) {
            data.bv.disableSubmitButtons(true);

          }).on('init.field.bv', function(e, data) {


          })

          $('#countryLicForm').bootstrapValidator({
            container: 'popover',
            feedbackIcons: {
              valid: 'valid-rnotes',
              invalid: 'alert-rnotes',
              validating: 'glyphicon glyphicon-refreshas'
            },
            fields: {
              validFrom: {
                trigger: 'change',
                validators: {
                      notEmpty: {
                        message: 'The ValidFrom is required'
                      },
                      callback: {
                      message: 'Valid from is greater than Valid to!',
                      callback: function (value, validator, $field) {

                        if(validatePeriods(self.scope) == ""){
                          return true;
                        }else
                          return false;
                      }
                    }
                  }
              },
              comments: {
                group:'.comments',
                validators: {
                  stringLength: {
                    max:1024,
                    message: 'Maximum 1024 characters allowed',
                    utf8Bytes: true
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
              }
            }
          }).on('error.field.bv', function(e, data) {
            $('*[data-bv-icon-for="'+data.field +'"]').popover('show');

          }).on('success.field.bv', function(e, data) {

            $('*[data-bv-icon-for="'+data.field +'"]').popover('destroy');

          }).on('success.form.bv', function(e) {
            e.preventDefault();
          });

        },
        "#grid-revision-history table>tbody>tr td dblclick": function(item, el, ev){
          //var invoiceid = el.closest('tr').data('row').row.id;
          var self=this.scope;
          var row = item.closest('tr').data('row').row;

          $(".mainLayoutId").hide();
          $("#loading_img").show();

          var requestObj  = {
            entityCountryDetails:{
              entityCountry:{
                id:row.id
              }
            }
          }

          CountryLicensor.findOne(UserReq.formRequestDetails(requestObj),function(data){

            loadPage(self, data);

            $("#loading_img").hide();
            $(".mainLayoutId").show();

          },function(xhr){
            console.error("Error while loading: country-Entity Details"+xhr);
          });


        },

        '{scope} pageState.entityCountryDetails.entityCountry.entityId': function() {

          var self = this;

          if(self.scope.attr("refreshEntityId")) {
            $('#fetchDetailsBtn').attr("disabled", true);


            var requestObj = {entityId:self.scope.pageState.entityCountryDetails.entityCountry.entityId};
            Promise.all([Country.findAllCountriesByLicenesor(UserReq.formRequestDetails(requestObj))]).then(function(values) {
              $('#fetchDetailsBtn').attr("disabled", false);
              self.scope.attr("countries").replace(values[0].data);
              if(self.scope.attr("onload")) {

                self.scope.attr("onload", false);
                $("#countryId").val(values[0].data[0].id);
                self.scope.pageState.entityCountryDetails.entityCountry.attr("countryId", values[0].data[0].id);
                $('#fetchDetailsBtn').click();

              }

            });
          }
          //this.scope.currencies.replace(Currency.findAll(UserReq.formRequestDetails(requestObj)));
        },

        '{scope} pageState.entityCountryDetails.pricingModelVersionNo': function() {

          var self = this;

          for(var i=0; i< self.scope.pricingModels.length; i++) {

            if(self.scope.pricingModels[i].modelName == self.scope.pageState.entityCountryDetails.pricingModelVersionNo ) {

              self.scope.attr("pricingModelVersions").replace(self.scope.pricingModels[i].modelVersion)
              self.scope.pageState.entityCountryDetails.attr("pricingModelId", self.scope.pricingModels[i].modelVersion[0].id)

            }

          }

          //this.scope.currencies.replace(Currency.findAll(UserReq.formRequestDetails(requestObj)));
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

        '#fetchDetailsBtn click':function(){

            $(".mainLayoutId").hide();
            $(".buttonsPlaceHolder").show();
            $("#loading_img").show();

             var requestObj  = {
              entityCountryDetails:{
                entityCountry:{
                  entityId:this.scope.pageState.entityCountryDetails.entityCountry.entityId,
                  countryId:this.scope.pageState.entityCountryDetails.entityCountry.attr("countryId")
                }
              }
            }
            var self = this.scope;
            CountryLicensor.findOne(UserReq.formRequestDetails(requestObj),function(data){
              loadPage(self, data);
              self.attr("refreshEntityId", false);
              self.pageState.entityCountryDetails.entityCountry.attr("entityId", requestObj.entityCountryDetails.entityCountry.entityId);
              self.pageState.entityCountryDetails.entityCountry.attr("invoiceCurr", data.entityCountryDetails.entityCountry.invoiceCurr);
              $("#countryId").val(requestObj.entityCountryDetails.entityCountry.countryId);
              self.attr("refreshEntityId", true);
              $("#loading_img").hide();
              $(".mainLayoutId").show();
            },function(xhr){
              console.error("Error while loading: country-Entity Details"+xhr);
            });


          },
          '#buttonCancel click': function(){

            //form Reset
            $(".mainLayoutId").hide();
            $(".buttonsPlaceHolder").hide();

            var self = this.scope;
            reportConfigurationList.replace([]);
            revisionHistory.replace([]);

            var resetObject = {
              entityId:this.scope.pageState.entityCountryDetails.entityCountry.attr("entityId"),
              countryId:this.scope.pageState.entityCountryDetails.entityCountry.attr("countryId")
            };

            self.pageState.entityCountryDetails.attr("entityCountry",resetObject);
            self.pageState.entityCountryDetails.attr("comment","");
            self.attr("state","Read");

          },
          '#submitBtn click': function(){
            var entityCountry_data  = this.scope.pageState.entityCountryDetails.attr("entityCountry")._data;
            pageState.entityCountryDetails.entityCountry.validFrom

            var comments = $(".new-comments").val();

            if(comments != null && comments == "") {

              $(".multicomments-required").show();
              setTimeout(function(){
                $(".multicomments-required").hide();
              },2000);
              return;

            }

            if(entityCountry_data.laEnabled){
              entityCountry_data.laEnabled = "Y";
            }else{
              entityCountry_data.laEnabled = "N";
            }


            //  var periodFP = "0";
            //  //periodFP =

            // if(periodFP!= undefined && periodFP != null) {
            //   periodFP = periodWidgetHelper.getFiscalPeriod(entityCountry_data.validFrom);
            // }


             entityCountry_data.validFrom = periodWidgetHelper.getFiscalPeriod($("#validFrom").val());

            //  periodFP = "0";
            //
            // if(periodFP!= undefined && periodFP != null) {
            //   periodFP =
            // }

             entityCountry_data.validTo = periodWidgetHelper.getFiscalPeriod($("#validTo").val());;



            entityCountry_data.status = "N";// New state
            var reportConfigurationListObj =  [];

            can.each(reportConfigurationList,
              function( value, index ) {
                reportConfigurationListObj.push(value._data);
              }
            );



            var requestObj  = {
              entityCountryDetails  :{
                entityCountry:entityCountry_data,
                reportConfigurationList:reportConfigurationListObj,
                pricingModelVersionNo: this.scope.pageState.entityCountryDetails.pricingModelVersionNumber,
                pricingModelId:this.scope.pageState.entityCountryDetails.pricingModelId,
                comment: $(".new-comments").val(),
                commentType:"ENTITY_COUNTRY"//TODO: Should be handled at server side. Not required to pass it.
              },

            };

            //console.log("requestObj: "+JSON.stringify(requestObj));
            CountryLicensor.create(UserReq.formRequestDetails(requestObj), function(data){
            if(data.status == "SUCCESS") {

                var msg = "Country-Licensor details saved successfully";

                $("#invmessageDiv").html("<label class='successMessage'>"+msg+"</label>");
                $("#invmessageDiv").show();
                setTimeout(function(){
                  $("#invmessageDiv").hide();
                },5000);
              } else {

                  var msg = "Country-Licensor Detials was not saved successfully";
                  $("#invmessageDiv").html("<label class='errorMessage'>"+msg+"</label>");
                  $("#invmessageDiv").show();
                  setTimeout(function(){
                    $("#invmessageDiv").hide();
                  },5000);
              }
            },function(xhr){
              console.error("Failed :"+xhr);
            });


          },
          '#priModelClose click': function(){
            $("#viewPricingModelDiv").hide();
          },
          '#pricingModelBtn click': function(){
            var self = this.scope;

            var selmodelid =  self.pageState.entityCountryDetails.pricingModelId;

            var entityName  = $("#licensorId :selected").text();
            var countryId = self.pageState.entityCountryDetails.entityCountry.attr("countryId");

            var genObj = {modelId:selmodelid, reqType:'countryLicensordetails', "countryId" : countryId, "entityName" : entityName};

            console.log("Request is " +JSON.stringify(UserReq.formRequestDetails(genObj)));
            CountryLicensor.findOne(UserReq.formRequestDetails(genObj),function(data){
              //console.log("Pricing model details "+ JSON.stringify(data.pricingModel.attr()));

              if(data.pricingModel == undefined || data.pricingModel == null) {

                $("#viewPricingModelDiv").hide();

                var msg = "No details available";

                $("#invmessageDiv").html("<label class='successMessage'>"+msg+"</label>");
                $("#invmessageDiv").show();
                setTimeout(function(){
                  $("#invmessageDiv").hide();
                },5000);

              } else {

                $("#viewPricingModelDiv").show();
                  self.attr("displayPMDetails",true);
              }

              self.attr("getPricingModelDetails",data.pricingModel);
              self.attr("baseModelParameter").replace(data.pricingModel != undefined && data.pricingModel != null && data.pricingModel.baseModelParameters != null  ? data.pricingModel.baseModelParameters : []);
              self.attr("trackCounts").replace(data.pricingModel != undefined && data.pricingModel != null && data.pricingModel.trackCounts != null  ? data.pricingModel.trackCounts : []);

              var tempcommentObj = data.pricingModel.pricingModel.comments;
              if(tempcommentObj!=null)
                $('#priceModelmultipleComments').html(stache('<multiple-comments divid="priceModelmultipleComments" options="{tempcommentObj}" divheight="100" isreadOnly="y"></multiple-comments>')({tempcommentObj}));
              }).then(function(){
              });
            },
          'period-calendar onSelected': function (ele, event, val) {  
            this.scope.attr('periodchoosen', val);
            $(ele).parent().find('input[type=text]').val(this.scope.periodchoosen).trigger('change');
            $(ele).closest('.calendarcls').find('.box-modal').hide();
            $(ele).blur();
          },
          '.updateperoid focus':function(el){
            $(el).closest('.calendarcls').find('.box-modal').show().trigger( "focus" );
          },
          '{selectedperiod} change':function(val){
            //var period = periodWidgetHelper.getFiscalPeriod();

            if(val[0].which=='validFrom'){
              $("#validFrom").val(val[0].value);
            }else{
              $("#validTo").val(val[0].value) ;
            }

            $('#validFrom').trigger("change");

            //console.log(" I am here "+$("#validFrom").val());

          },
          '{validFrom} change': function(el, ev) {
               var comp ='from';
               showErrorMsg(this.scope.attr('periodFrom')[0],this.scope.attr('periodTo')[0],comp);
           },
           '{validTo} change': function(el, ev) {
                var comp ='to';
                showErrorMsg(this.scope.attr('periodFrom')[0],this.scope.attr('periodTo')[0],comp);

           },
          'shown.bs.collapse':function(ele, event){
            $(ele).parent().find(".glyphicon-plus").removeClass("glyphicon-plus").addClass("glyphicon-minus");
          },
          'hidden.bs.collapse':function(ele, event){
            $(ele).parent().find(".glyphicon-minus").removeClass("glyphicon-minus").addClass("glyphicon-plus");
          }

        }
      });

      var showErrorMsg = function(periodFrom,periodTo,whichcomp){

        if(whichcomp=='from'){
          var _root = $('#ref-period-container');
          //_root.find('#periodTo').val('');
          _root.find('.period-calendar .period li a').removeClass('disabled period-active');
          if(periodFrom.charAt(0)=='Q'){
            _root.find('.period-calendar .q1 li').not(":first").find('a').addClass('disabled');
            _root.find('.period-calendar .q2 li').not(":first").find('a').addClass('disabled');
            _root.find('.period-calendar .q3 li').not(":first").find('a').addClass('disabled');
            _root.find('.period-calendar .q4 li').not(":first").find('a').addClass('disabled');
          }else{
            _root.find('.period-calendar .q1 li').first().find('a').addClass('disabled');
            _root.find('.period-calendar .q2 li').first().find('a').addClass('disabled');
            _root.find('.period-calendar .q3 li').first().find('a').addClass('disabled');
            _root.find('.period-calendar .q4 li').first().find('a').addClass('disabled');
          }
        }

        var showFlg=false;
        var from = periodFrom,to =  periodTo;
        if(from!=undefined &&  to!=undefined){
          from = from.split('FY');
          to = to.split('FY');   //console.log(from[1].slice(-2)+'--------'+ to[1].slice(-2));
          if(from[1].slice(-2) > to[1].slice(-2)) showFlg=true;
          if(from[1].slice(-2) >= to[1].slice(-2) && from[0].charAt(0)!=to[0].charAt(0) )showFlg=true;
          if(from[1].slice(-2) >= to[1].slice(-2) && parseInt(from[0].substring(1,3)) > parseInt(to[0].substring(1,3)))showFlg=true;
        }
        if(showFlg==true){ $('.period-invalid').show(); return false;}else {showFlg=false; $('.period-invalid').hide();}
    }



var loadPage = function(scope,data){

  //revisionHistory.splice(0, revisionHistory.length);
  //reportConfigurationList.splice(0, reportConfigurationList.length);

  scope.attr("footerrowspresent", true);
  scope.reportConfigurationList.replace(data.entityCountryDetails.reportConfigurationList);

  scope.attr("footerdatarepconf",  data.entityCountryDetails.reportConfigurationList != null && data.entityCountryDetails.reportConfigurationList.length >0 ? data.entityCountryDetails.reportConfigurationList.length : 0);

  scope.revisionHistory.replace(data.revisionHistory);

  scope.attr("footerdata",  data.revisionHistory != null && data.revisionHistory.length >0 ? data.revisionHistory.length : 0);


  var displayDate = data.entityCountryDetails.entityCountry.attr("validFrom");
  if(displayDate == 0){
    data.entityCountryDetails.entityCountry.attr("validFrom","");
  }else
  {data.entityCountryDetails.entityCountry.attr("validFrom",periodWidgetHelper.getDisplayPeriod(displayDate,"P"));}

  displayDate = data.entityCountryDetails.entityCountry.attr("validTo");
  if(displayDate == 0){
    data.entityCountryDetails.entityCountry.attr("validTo","");
  }else{
      data.entityCountryDetails.entityCountry.attr("validTo",periodWidgetHelper.getDisplayPeriod(displayDate,"P"));
  }

  var status = data.entityCountryDetails.entityCountry.attr("status");
  if(status == "A"){
    data.entityCountryDetails.entityCountry.attr("status","Active");
  }else{
    data.entityCountryDetails.entityCountry.attr("status","InActive");
  }



  scope.pageState.entityCountryDetails.attr("pricingModelVersionNo", data.entityCountryDetails.pricingModelVersionNo);
  scope.pageState.entityCountryDetails.attr("pricingModelId", data.entityCountryDetails.pricingModelId);

  scope.getPricingModelsOnLoad(data.entityCountryDetails.pricingModelName, data.entityCountryDetails.pricingModelVersionNo);

  scope.pageState.entityCountryDetails.attr("entityCountry",data.entityCountryDetails.entityCountry);

  scope.pageState.entityCountryDetails.attr("pricingModelVersionNumber", data.entityCountryDetails.pricingModelVersionNo);

  $('#validFrom').trigger("change");
  $('#validTo').trigger("change");

  scope.pageState.attr("historyComments",data.entityCountryDetails.historyComments);
  scope.pageState.entityCountryDetails.attr("comment",data.entityCountryDetails.comment);

  var tempcommentObj = data.entityCountryDetails.commentList;
  //console.log("multi comments "+JSON.stringify(tempcommentObj));
  if(tempcommentObj != undefined && tempcommentObj!=null && tempcommentObj.length > 0){
    $('#multipleComments').html(stache('<multiple-comments divid="usercommentsdiv" options="{tempcommentObj}" divheight="100" isreadOnly="n"></multiple-comments>')({tempcommentObj}));
  } else {
      $('#multipleComments').html(stache('<multiple-comments divid="usercommentsdiv" options="{tempcommentObj}" divheight="100" isreadOnly="n"></multiple-comments>')({}));
  }

  if( data.pricingModel!= null && data.pricingModel.baseModelParameters != null && data.pricingModel.baseModelParameters.length > 0) {
    scope.attr("baseModelParameter").replace(data.pricingModel.baseModelParameters);
  }
  if( data.pricingModel!= null && data.pricingModel.trackCounts != null && data.pricingModel.trackCounts.length > 0) {
    scope.attr("trackCounts").replace(data.pricingModel.trackCounts);
  }

  if(data.entityCountryDetails.entityCountry.status == "Active") {
    scope.attr("state","Edit");
  }else{
    scope.attr("state","Read");
  }

  if(data.entityCountryDetails.entityCountry.laEnabled != null && data.entityCountryDetails.entityCountry.laEnabled == "Y") {

    $(".laCheckBox").click();

  } else {

    if($(".laCheckBox").attr("checked")) {
      $(".laCheckBox").click();
    }

  }

  setTimeout(function(){
    alignGridStats('grid-revision-history');
    alignGridStats('grid-report-config');
    //$("#grid-revision-history-heading table").append($(".rn-grid thead"));
    //$(".rn-grid thead").remove();
  },10);

}

var validatePeriods = function(scope) {

  var periodFrom = $("#validFrom").val();
  var periodTo = $("#validTo").val();


  var flag = false;
  var from = periodFrom || false;
  var to = periodTo || false;
  var message1 = 'Period from is greater than period to !';


  if (from && to) {
    var fromYear = parseInt(from.slice(-2));
    var toYear = parseInt(to.slice(-2));
    var yearDiff = parseInt(toYear - fromYear);
    if (fromYear > toYear) {
      return message1;
    }

    if (from.charAt(0) === "P" && to.charAt(0) === "P") {
      var periodFromValue = periodFrom.substr(1, 2);
      var periodToValue = periodTo.substr(1, 2);
      if (yearDiff == 0 && periodFromValue > periodToValue) {
        return message1;
      }
    }
    // else if (from.charAt(0) === "Q" && to.charAt(0) === "Q") {
    //   var quarterFromValue = periodFrom.substr(1, 1);
    //   var quarterToValue = periodTo.substr(1, 1);
    //   if (yearDiff >= 1 && quarterFromValue == quarterToValue) {
    //     //if(quarterFromValue >= quarterToValue ){
    //     return message2;
    //     //}
    //   } else if (yearDiff == 0 && quarterFromValue > quarterToValue) {
    //     return message1;
    //   }
    // }
  }
  return "";
};


function alignGridStats(divId){
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
          if(divWidth > tableWidth + tbodyTdWidth) {
            tdWidth = tbodyTdWidth;
          } else {
            tdWidth = divWidth - tableWidth;
          }

        if(i==1)
          tdWidth = 45;

        tableWidth += tdWidth;
        cellWidthArr.push(tdWidth);
      }
      var foot = true;
      if($('#'+divId+' table>tfoot>tr') != undefined && $('#'+divId+' table>tfoot>tr') != null &&
          ($('#'+divId+' table>tfoot>tr')[0] == undefined  || $('#'+divId+' table>tfoot>tr')[0] == null ||
              $('#'+divId+' table>tfoot>tr')[0].getAttribute("colspan") == undefined  || $('#'+divId+' table>tfoot>tr')[0].getAttribute("colspan") == null)

      ) {
        foot = false;
      }
      if(tableWidth < divWidth){
        var moreWidth = (divWidth-tableWidth)/colLength;
        for(var j=1;j<=cellWidthArr.length;j++){
          var width = cellWidthArr[j-1]+moreWidth;

          $('#'+divId+' table>thead>tr>th:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tbody>tr>td:nth-child('+j+')').css("min-width",width);
          if(!foot)
            $('#'+divId+' table>tfoot>tr>td:nth-child('+j+')').css("width",width);
        }
        $('#'+divId+' table').css("width",divWidth);
        $('#'+divId+' table>tbody').css("max-width",divWidth);
      } else {
        for(var j=1;j<=cellWidthArr.length;j++){
          var width = cellWidthArr[j-1];
          $('#'+divId+' table>thead>tr>th:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tbody>tr>td:nth-child('+j+')').css("min-width",width);
          if(!foot)
            $('#'+divId+' table>tfoot>tr>td:nth-child('+j+')').css("width",width);
        
        }

        if(foot) {
          $('#'+divId+' table>tfoot>tr>td:nth-child('+j+')').css("width",tableWidth);
        }
        $('#'+divId+' table').css("width",tableWidth);
        $('#'+divId+' table>tbody').css("max-width",tableWidth);
      }
  }
}




export default page;
