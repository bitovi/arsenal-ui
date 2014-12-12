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
import PricingModels from 'models/common/pricingmodels/';
import PricingModelVersions from 'models/common/pricingModelVersions/';
import PricingMethods from 'models/common/pricingMethods/';
import PeriodFrom from 'models/common/periodFrom/';
import PeriodTo from 'models/common/periodTo/';



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
    periodFromList:[],
    periodToList:[],
    displayMessage:"display:none",
    state:"Edit"
  },

  init: function(){

        var self = this;
        var requestObj = {};



        Promise.all([
            Licensor.findAll(UserReq.formRequestDetails(requestObj)),
            PricingModels.findAll(UserReq.formRequestDetails(requestObj)),
            PricingMethods.findAll(UserReq.formRequestDetails(requestObj)),
            PeriodFrom.findAll(UserReq.formRequestDetails(requestObj)),
            PeriodTo.findAll(UserReq.formRequestDetails(requestObj))
        ]).then(function(values) {
              self.scope.attr("entities").replace(values[0]);
              self.scope.attr("pricingModels").replace(values[1]);
              self.scope.attr("pricingMethods").replace(values[2]);
              self.scope.attr("periodFromList").replace(values[3]);
              self.scope.attr("periodToList").replace(values[4]);
        }).then(function(values) {

              var licId = self.scope.attr("entities")[0].id;
              requestObj = {licensorId:licId};


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



          },function(xhr){
              console.error("Error while loading: country-Entity Details"+xhr);
          });


    },

    '{scope} pageState.entityCountryDetails.entityCountry.entityId': function() {
      var self = this;

      var requestObj = {licensorId:self.scope.pageState.entityCountryDetails.entityCountry.entityId};

      this.scope.countries.replace(Country.findAll(UserReq.formRequestDetails(requestObj)));
      this.scope.currencies.replace(Currency.findAll(UserReq.formRequestDetails(requestObj)));

    },
    '{scope} pageState.entityCountryDetails.pricingModelVersionNo': function() {


        var self = this;
        var requestObj  = {
          pricingModelId:this.scope.pageState.entityCountryDetails.attr("pricingModelVersionNo")
        }


        Promise.all([
            PricingModelVersions.findAll(UserReq.formRequestDetails(requestObj))
            ]).then(function(values) {
              self.scope.attr("pricingModelVersions").replace(values[0]);
        });

    },
    '.btn-fetchDetails click':function(){

      //console.log(this.scope.pageState.entityCountryDetails.entityCountry.attr("entityId"));
      // console.log(this.scope.pageState.entityCountryDetails.entityCountry.attr("countryId"));

      var requestObj  = {
        entityCountryDetails:{
          entityCountry:{
            entityId:this.scope.pageState.entityCountryDetails.entityCountry.attr("entityId"),
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
    '.buttonCancel  click': function(){

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
    '.buttonSubmit click': function(){
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


    }
  }
});


export default page;
