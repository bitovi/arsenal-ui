import Component from 'can/component/';
import Map from 'can/map/';

/** for pricing model*/
import view from 'can/view/';
import _ from 'lodash';
import Grid from 'components/grid/';
import stache from 'can/view/stache/';
import validation from 'can/map/validations/';

import css_bootstrapValidator from 'bootstrapValidator.css!';
import bootstrapValidator from 'bootstrapValidator';
/** for pricing model*/

import UserReq from 'utils/request/';
import template from './template.stache!';
import styles from './page-pricing-models.less!';
import Region from 'models/common/region/';
import ContentType from 'models/common/content-type/';
import Country from 'models/common/country/';
import Licensor from 'models/common/licensor/';
import PricingModels from 'models/pricing-models/';


import Comments from 'components/multiple-comments/';



var page = Component.extend({
  tag: 'page-pricing-models',
  template: template,
  scope: {
    baseModelParamList:new can.List(),
    appstate:undefined,
    regionStore:[],
    contentType:[],
    countryStore:[],
    licensorStore:[],
    regions:"",
    version:"",
    pricingModelList:[],
    basemodelContainer:[],
    
    trackCountMinimaList:new can.List(),
    trackContainer:[],
    modelname:"",
    pricingmodeltypeStore:[],
    pricingmodeltype:"",
    
    modelId:"",
    country:"",
    entity:"",
    editstate:true,
    selectedPriceModel:"",
    multipleComments : [],
    usercommentsStore:""
  },
  init:function(){
      var self = this;
      this.scope.appstate.attr("renderGlobalSearch",false);
      var genObj = {};
      var modelObj = {reqType:'modeltype'};
      Promise.all([
          Region.findAll(UserReq.formRequestDetails(genObj)),
          ContentType.findAll(UserReq.formRequestDetails(genObj)),
          Country.findAll(UserReq.formRequestDetails(genObj)),
          Licensor.findAll(UserReq.formRequestDetails(genObj)),
          PricingModels.findOne(UserReq.formRequestDetails(modelObj))
        ]).then(function(values) {
            self.scope.regionStore.replace(values[0]);
            self.scope.contentType.replace(values[1].contentTypes);
            self.scope.countryStore.replace(values[2]);
            self.scope.licensorStore.replace(values[3].entities[0].entities);
            self.scope.pricingmodeltypeStore.replace(values[4].modelTypes);
      });       
  },
  events:{
  	"inserted":function(){
  		var self = this;
          $('#pmform').on('init.form.bv', function(e, data) {
              }).on('init.field.bv', function(e, data) {
              }).bootstrapValidator({
              container: 'popover',
              feedbackIcons: {
                  valid: 'valid-rnotes',
                  invalid: 'alert-rnotes',
                  validating: 'glyphicon glyphicon-refreshas'
              },
              fields: {
                  regions: {
                      group:'.regions',
                      validators: {
                          notEmpty: {
                              message: 'Region is mandatory'
                          }
                          
                      }
                },
                country :{
                   validators: {
                        notEmpty: {
                            message: 'country is mandatory'
                        }
                        
                    }
                },
                entity :{
                    validators: {
                        notEmpty: {
                            message: 'Entity is mandatory'
                        }
                        
                    }
                },
                pricingmodeltype :{
                    validators: {
                        notEmpty: {
                            message: 'Pricing Model is mandatory'
                        }
                        
                    }
                },
                modelname :{
                    validators: {
                        notEmpty: {
                            message: 'Model name is mandatory'
                        }
                        
                    }
                },
                usercommentsdiv :{
                    group:'#multipleComments',
                    validators: {
                        notEmpty: {
                            message: 'Comment is mandatory'
                        }
                        
                    }
                },
                'baseRate[]': {
                      group:'.baseRate',
                      validators: {
                          notEmpty: {
                              message: 'Baserate is mandatory'
                          },
                          numeric: {
                            separator:'.',
                            message: 'Please provide numeric value for baserate'
                          }
                      }
                  },
                'minima[]': {
                      group:'.minima',
                      validators: {
                          notEmpty: {
                              message: 'Minima is mandatory'
                          },
                          numeric: {
                            separator:'.',
                            message: 'Please provide numeric value for minima'
                          }
                      }
                  },
                'listenerMinima[]': {
                      group:'.listenerMinima',
                      validators: {
                          notEmpty: {
                              message: 'Listener Hours Minima is mandatory'
                          },
                          numeric: {
                            separator:'.',
                            message: 'Please provide numeric value for Listener Hours Minima'
                          }
                      }
                  },
                  'discount[]': {
                      group:'.discount',
                      validators: {
                          notEmpty: {
                              message: 'Discount is mandatory'
                          },
                          numeric: {
                            separator:'.',
                            message: 'Please provide numeric value for Discount'
                          }
                      }
                  },
                  'description[]': {
                      group:'.description',
                      validators: {
                          notEmpty: {
                              message: 'Description is mandatory'
                          }
                          
                      }
                  },
                  'from[]': {
                      group:'.from',
                      validators: {
                          notEmpty: {
                              message: 'From is mandatory'
                          },
                          numeric: {
                            separator:'.',
                            message: 'Please provide numeric value for From'
                          }
                      }
                  },
                  'to[]': {
                      group:'.to',
                      validators: {
                          notEmpty: {
                              message: 'To is mandatory'
                          },
                          numeric: {
                            separator:'.',
                            message: 'Please provide numeric value for To'
                          }
                      }
                  },
                  'minimatrack[]': {
                      group:'.minimatrack',
                      validators: {
                          notEmpty: {
                              message: 'Minima is mandatory'
                          },
                          numeric: {
                            separator:'.',
                            message: 'Please provide numeric value for Minima'
                          }
                      }
                  }
            

          }
          }).on('error.field.bv', function(e, data) {
              $('*[data-bv-icon-for="'+data.field +'"]').popover('show');
          }).on('success.field.bv', function(e, data) {
          }).on('success.form.bv', function(e) {
              e.preventDefault();
          });
  		
       
    },
    "#fetch click":function(){

       $("#modelSummaryCont").removeClass("modelsummaryInVisible").addClass("modelsummaryVisible").removeClass("col-sm-0").addClass("col-sm-4");
       $("#modelDetailCont").removeClass("col-sm-12").addClass("col-sm-8");

       $("#countrypm").attr("readonly", true);
       $("#entity").attr("readonly", true);
        
        var self = this;
        var genObj = {region:self.scope.attr("regions"),reqType:'summary'};
        
        self.scope.pricingModelList.replace([]); 
        self.scope.attr("editstate", true);
        PricingModels.findOne(UserReq.formRequestDetails(genObj),function(data){
                  var pricingmodels = data.pricingModels;
                   for(var i =0; i < pricingmodels.length; i++){
                      var tempObj = {};
                      tempObj.model= pricingmodels[i].modelDescription;
                      tempObj.modeltype= pricingmodels[i].modelName;  
                      tempObj.version= pricingmodels[i].version;  
                      tempObj.modelid= pricingmodels[i].modelId;  
                      self.scope.pricingModelList.push(tempObj);
                  }
                },function(xhr){
                /*Error condition*/
              }).then(function(){
                $('#bottomsection').removeClass('bottomparthide').addClass('bottompartshow');
                $('#pricingmodelGrid tbody tr:nth-child(1)').trigger('click').addClass("selected");
              });

            $("#pmform").data('bootstrapValidator').resetForm();
            return false;
    },
     ".pricingmodelGrid tr click":function(el){
        var self = this;
        self.scope.attr("selectedPriceModel", el.closest('tr')[0].rowIndex);
        var selrow = el.closest('tr').attr("version");
        var selmodelid = el.closest('tr').attr("modelid");
        el.addClass("selected").siblings().removeClass("selected");
        self.scope.attr("version", selrow);
        var genObj = {modelId:selmodelid,reqType:'details'};

        PricingModels.findOne(UserReq.formRequestDetails(genObj),function(data){
                  
              self.scope.attr("multipleComments", data.pricingModel.pricingModel.comments);
              self.scope.attr("modelname", data.pricingModel.pricingModel.modelDescription);
              self.scope.attr("pricingmodeltype", data.pricingModel.pricingModel.modelName);

              self.scope.attr("country", data.pricingModel.country);
              self.scope.attr("entity", data.pricingModel.entityId);
              

              self.scope.attr("baseModelParamList").replace([]); /*cleaning table row to load new data on click*/
              self.scope.attr("basemodelContainer").replace(data.pricingModel.baseModelParameters);
             
             
              var basemodelCount = self.scope.basemodelContainer.attr().length;
              var basemodelData = self.scope.basemodelContainer.attr();

              for(var i=0; i < basemodelCount; i++){
                  
                  var tempgrid = {};
                  tempgrid["contentGroup"] = basemodelData[i].contentGroup;
                  tempgrid["baseRate"] = basemodelData[i].baseRate;
                  tempgrid["minima"] = basemodelData[i].minima;
                  tempgrid["listenerMinima"] = basemodelData[i].listenerMinima;
                  tempgrid["discount"] = basemodelData[i].discount;
                  tempgrid["isDefault"] = basemodelData[i].isDefault.toString();
                  tempgrid["baseId"] = basemodelData[i].baseId;
                  tempgrid["modelId"] = basemodelData[i].modelId;

                  self.scope.attr("modelId", basemodelData[i].modelId);

                 $.when(self.scope.attr("baseModelParamList").push(tempgrid)).then(function(){

                        var $option   = $("#baseModelTable").find('[name="baseRate[]"], [name="minima[]"], [name="listenerMinima[]"], [name="discount[]"]');
                            $option.each(function(index){
                              $('#pmform').bootstrapValidator('addField', $(this));
                            });
                    });
                 
                }

              /** Track count minima Grid*/


                  self.scope.attr("trackCountMinimaList").replace([]); /*cleaning table row to load new data on click*/
                  self.scope.attr("trackContainer").replace(data.pricingModel.trackCounts);
                  

                  var trackCount = self.scope.trackContainer.attr().length;
                  var trackData = self.scope.trackContainer.attr();

                  for(var i=0; i < trackCount; i++){
                  
                        var tempgrid = {};
                        tempgrid["description"] = trackData[i].description;
                        tempgrid["from"] = trackData[i].from;
                        tempgrid["to"] = trackData[i].to;
                        tempgrid["modelId"] = trackData[i].modelId;
                        tempgrid["minima"] = trackData[i].minima;
                        tempgrid["tierId"] = trackData[i].tierId;
                        tempgrid["paramId"] = trackData[i].paramId;

                        $.when(self.scope.attr("trackCountMinimaList").push(tempgrid)).then(function(){
                          var $option = $("#trackCount").find('[name="description[]"], [name="from[]"], [name="to[]"], [name="minimatrack[]"]');
                            $option.each(function(index){
                              $('#pmform').bootstrapValidator('addField', $(this));
                            });
                        });
                      }
                    },function(xhr){
                /*Error condition*/
              }).then(function(){
                  var tempcommentObj = self.scope.multipleComments;
                  $('#multipleComments').html(stache('<multiple-comments divid="usercommentsdiv" options="{tempcommentObj}" divheight="100" isreadOnly="n"></multiple-comments>')({tempcommentObj}));
                  $('#pmform').bootstrapValidator('addField', 'usercommentsdiv');
              });
          },
        "#addbasemodel click":function(){
        var self = this;

        var lastIndex = self.scope.baseModelParamList.attr("length");
        
        var tempgrid = {};
        tempgrid["contentGroup"] = "";
        tempgrid["baseRate"] = "";
        tempgrid["minima"] = "";
        tempgrid["listenerMinima"] = "";
        tempgrid["discount"] = "";
        tempgrid["isDefault"] = "";
        tempgrid["modelId"] = self.scope.attr("modelId");
        $.when(self.scope.attr("baseModelParamList").push(tempgrid)).then(function(){

                        var $option   = $("#baseModelTable").find('[name="baseRate[]"], [name="minima[]"], [name="listenerMinima[]"], [name="discount[]"]');
                            $option.each(function(index){
                              $('#pmform').bootstrapValidator('addField', $(this));
                            });
                    });
    },
    "#addbasemodeldel click":function(el){
        var self = this;
        var selrow = el.closest('tr')[0].rowIndex;
        $.when(selrow).then(function(){
                    var $option   = $("#baseModelTable").find('[name="baseRate[]"], [name="minima[]"], [name="listenerMinima[]"], [name="discount[]"]');
                            $option.each(function(index){
                              $('#pmform').bootstrapValidator('addField', $(this));
                            });
                    }).then(function(){
                      self.scope.attr("baseModelParamList").push(tempgrid)
                    });


        self.scope.attr("baseModelParamList").removeAttr(selrow-1);

    },
    "#addtrack click":function(){
        var self = this;

         var lastIndex = self.scope.trackCountMinimaList.attr("length");
        
        var tempgrid = {};
        tempgrid["description"] = "";
        tempgrid["from"] = "";
        tempgrid["to"] = "";
        tempgrid["minima"] = "";
        tempgrid["modelId"] = self.scope.attr("modelId");
        $.when(self.scope.attr("trackCountMinimaList").push(tempgrid)).then(function(){
          var $option = $("#trackCount").find('[name="description[]"], [name="from[]"], [name="to[]"], [name="minimatrack[]"]');
              $option.each(function(index){
                $('#pmform').bootstrapValidator('addField', $(this));
              });
          });
       
    },
    "#trackdel click":function(el){
        var self = this;
        var selrow = el.closest('tr')[0].rowIndex;
        self.scope.attr("trackCountMinimaList").removeAttr(selrow-1);

    },
    "#regions change":function(el){
      if(el[0].value != ""){
        $("button#fetch").attr("disabled", false);
        $("button#add").attr("disabled", false);
      }else{
        $("button#fetch").attr("disabled", true);
        $("button#add").attr("disabled", true);
      }
    },
    "#add click":function(){
       
      
       $("#modelSummaryCont").addClass("modelsummaryInVisible").removeClass("col-sm-4").addClass("col-sm-0");
       $("#modelDetailCont").removeClass("col-sm-8").addClass("col-sm-12");

       $("#countrypm").attr("readonly", false);
       $("#entity").attr("readonly", false);


      $('#bottomsection').removeClass('bottomparthide').addClass('bottompartshow');





       var self = this;
       self.scope.attr("editstate", false);
       self.scope.attr("entity", "");
       self.scope.attr("country", "");
       self.scope.attr("trackCountMinimaList").replace([]); 
       self.scope.attr("baseModelParamList").replace([]); 
       self.scope.attr("modelname", "");
       self.scope.attr("pricingmodeltype", "");
        $("#addbasemodel").trigger("click");
        $("#addtrack").trigger("click");
        $('#pricingmodelGrid tbody tr').removeClass("selected");

        $(".old-comments").remove();
        $('#pmform').bootstrapValidator('addField', 'usercommentsdiv');
       $("#pmform").data('bootstrapValidator').resetForm();
       return false;
    },
    "#addCancel click":function(){
      $('#bottomsection').removeClass('bottompartshow').addClass('bottomparthide');
    },
    "#editCancel click":function(){
       
       var self = this;
       var selRow = self.scope.attr("selectedPriceModel");
       $('#pricingmodelGrid tbody tr:nth-child('+selRow+')').trigger('click').addClass("selected");
    },
   
    "#save click":function(){
      var self = this;

      var usercomments = (self.scope.editstate === true)?self.scope.usercommentsStore:$(".new-comments").val();

      var saveRecord = {
        "details":{  
          "country":self.scope.attr("country"),
          "region":self.scope.attr("regions"),
          "entityId":self.scope.attr("entity"),
          "trackCounts":self.scope.trackCountMinimaList.attr(),
          "createdBy":0,
          "userComments":usercomments,
          "baseModelParameters":self.scope.baseModelParamList.attr(),
          "pricingModel":{  
             "region":self.scope.attr("regions"),
             "modelId":self.scope.attr("modelid"),
             "commentId":9685,
             "comments":null,
             "createdBy":299221510,
             "modelDescription":self.scope.attr("modelname"),
             "modelName":self.scope.attr("pricingmodeltype"),
             "version":self.scope.attr("version") 
          }
          
        }
      }

       PricingModels.create(UserReq.formRequestDetails(saveRecord), function(data){
                  if(data["status"]=="SUCCESS"){
                              var msg = "Pricing model was saved successfully."
                              $("#pbmessageDiv").html("<label class='successMessage'>"+msg+"</label>")
                              $("#pbmessageDiv").show();
                                 setTimeout(function(){
                                    $("#pbmessageDiv").hide();
                                 },5000);
                              }
                            else
                            {
                                var msg = "Pricing model not was saved successfully."
                                $("#pbmessageDiv").html("<label class='errorMessage'>"+msg+"</label>");
                                $("#pbmessageDiv").show();
                                setTimeout(function(){
                                    $("#pbmessageDiv").hide();
                                 },5000);
                            }
                },function(xhr){
                /*Error condition*/
              });
            }
    }
});

export default page;
