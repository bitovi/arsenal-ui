import Component from 'can/component/';

import stache from 'can/view/stache/';
import template from './template.stache!';
import styles from './page-ref-licensorcountry.less!';
import GridReportConfig from 'components/page-ref-licensorcountry/grid-report-configuration/';
import GridRivision from 'components/page-ref-licensorcountry/grid-revision-history/';

import css_bootstrapValidator from 'bootstrapValidator.css!';

import bootstrapValidator from 'bootstrapValidator';


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
    state:"Edit"
  },

  init: function(){

    var self = this;
    var requestObj = {};

    var licId ="";

    Promise.all([
      Licensor.findAll(UserReq.formRequestDetails(requestObj)),
      PricingModels.findOne(UserReq.formRequestDetails( {reqType:'modeltype'})),
      PricingMethods.findAll(UserReq.formRequestDetails(requestObj))
      ]).then(function(values) {
        self.scope.attr("entities").replace(values[0]["entities"][0]);
        licId = self.scope.attr("entities")[0].entities[0].id;
        self.scope.attr("pricingModels").replace(values[1].modelTypes);
        self.scope.attr("pricingMethods").replace(values[2]);
      }).then(function(values) {

        requestObj = {licensorId:licId};
        self.scope.currencies.replace(Currency.findAll(UserReq.formRequestDetails(requestObj)));

        Promise.all([
          Country.findAll(UserReq.formRequestDetails(requestObj))
          ]).then(function(values) {
            self.scope.attr("countries").replace(values[0]);
          }).then(function(){

            self.scope.pageState.entityCountryDetails.entityCountry.attr("entityId",self.scope.attr("entities")[0].id);
            self.scope.pageState.entityCountryDetails.entityCountry.attr("countryId",self.scope.attr("countries")[0].id);

          });
        })


      },
      helpers:{
        setHeight: function(){
          var vph = $(window).height()-180;
          return 'Style="height:'+vph+'px"';
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
          var self = this;


          reportConfigurationList = new can.List();
          revisionHistory = new can.List();



          $('#grid-report-config').append(stache('<rn-grid rows="{reportConfigurationList}"></rn-grid>')({reportConfigurationList}));
          $('#grid-revision-history').append(stache('<rn-grid-revision-history rows="{revisionHistory}"></rn-grid-revision-history>')({revisionHistory}));


          $('#invoiceform').on('init.form.bv', function(e, data) {
            data.bv.disableSubmitButtons(true);

          }).on('init.field.bv', function(e, data) {


          })

          $('#invoiceform').bootstrapValidator({
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
              entityPricingModelId :{
                validators: {
                  group:'.comments',
                  notEmpty: {
                    message: 'The Pricingmodel is required'
                  }
                }
              },
              invoiceCurr :{
                validators: {
                  group:'.comments',
                  notEmpty: {
                    message: 'The Currency is required'
                  }
                }
              },
              comments :{
                validators: {
                  group:'.comments',
                  notEmpty: {
                    message: 'The comments is required'
                  }
                }
              }
            }
          }).on('error.field.bv', function(e, data) {
            $('*[data-bv-icon-for="'+data.field +'"]').popover('show');

          }).on('success.field.bv', function(e, data) {


          });

        },
        ".rn-grid>tbody>tr td dblclick": function(item, el, ev){
          //var invoiceid = el.closest('tr').data('row').row.id;
          var self=this.scope;
          var row = item.closest('tr').data('row').row;


          var requestObj  = {
            entityCountryDetails:{
              entityCountry:{
                id:row.id
              }
            }
          }

          CountryLicensor.findOne(UserReq.formRequestDetails(requestObj),function(data){

            reportConfigurationList.replace(data.entityCountryDetails.reportConfigurationList);

            revisionHistory.replace(data.revisionHistory);

            self.pageState.entityCountryDetails.attr("entityCountry",data.entityCountryDetails.entityCountry);

            self.pageState.entityCountryDetails.attr("comment",data.entityCountryDetails.comment);

            // self.pageState.entityCountryDetails.entityCountry.attr("id",data.entityCountryDetails.entityCountry.id);


          },function(xhr){
            console.error("Error while loading: country-Entity Details"+xhr);
          });


        },

        '{scope} pageState.entityCountryDetails.entityCountry.entityId': function() {
          var self = this;

          var requestObj = {licensorId:self.scope.pageState.entityCountryDetails.entityCountry.entityId};

          this.scope.countries.replace(Country.findAll(UserReq.formRequestDetails(requestObj)));
          this.scope.currencies.replace(Currency.findAll(UserReq.formRequestDetails(requestObj)));

          // this.scope.pageState.entityCountryDetails.attr("entityId",4);
          //console.log(self.scope.pageState.entityCountryDetails.entityCountry.entityId);

        },
        '{scope} pageState.entityCountryDetails.pricingModelVersionNo': function() {


          var self = this;
          var requestObj  = {
            pricingModelId:this.scope.pageState.entityCountryDetails.attr("pricingModelVersionNo")
          }


          Promise.all([
            PricingModelVersions.findAll(UserReq.formRequestDetails(requestObj))
            ]).then(function(values) {
              //var aa = values[0];
              // console.log(" test "+aa[0].value);
              // console.log(" test 1:"+aa[1].value);
              self.scope.attr("pricingModelVersions").replace(values[0]);
              //console.log("lebgth: "+self.scope.pricingModelVersions.attr("length"));
            });

          },
          '#fetchDetailsBtn click':function(){

            //console.log(this.scope.pageState.entityCountryDetails.entityCountry.attr("entityId"));

            // console.log(this.scope.pageState.entityCountryDetails.entityCountry.attr("countryId"));

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
              reportConfigurationList.replace(data.entityCountryDetails.reportConfigurationList);


              revisionHistory.replace(data.revisionHistory);

              self.pageState.entityCountryDetails.attr("entityCountry",data.entityCountryDetails.entityCountry);

              self.pageState.entityCountryDetails.attr("comment",data.entityCountryDetails.comment);

              if(data.entityCountryDetails.entityCountry.status == "A") {
                self.attr("state","Edit");
              }else{
                self.attr("state","Read");
              }

              // self.pageState.entityCountryDetails.entityCountry.attr("id",data.entityCountryDetails.entityCountry.id);


            },function(xhr){
              console.error("Error while loading: country-Entity Details"+xhr);
            });


          },
          '#buttonCancel  click': function(){

            //form Reset
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

            if(entityCountry_data.laEnabled){
              entityCountry_data.laEnabled = "Y";
            }else{
              entityCountry_data.laEnabled = "N";
            }

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
                pricingModelVersionNo: this.scope.pageState.entityCountryDetails.pricingModelVersionNo,
                pricingModelId:this.scope.pageState.entityCountryDetails.pricingModelId,
                comment: this.scope.pageState.entityCountryDetails.comment,
                commentType:"ENTITY_COUNTRY"//TODO: Should be handled at server side. Not required to pass it.
              },

            };




            CountryLicensor.create(UserReq.formRequestDetails(requestObj));

            this.scope.attr("displayMessage","display:block");
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
            $(el).closest('.calendarcls').find('.box-modal').show().trigger( "focus" );
          },
          '{selectedperiod} change':function(val){
            var period = periodWidgetHelper.getFiscalPeriod(val[0].value);
            if(val[0].which=='periodFrom'){
              this.scope.pageState.entityCountryDetails.entityCountry.validFrom = period;
            }else{
              this.scope.pageState.entityCountryDetails.entityCountry.validTo = period;
            }

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


export default page;
