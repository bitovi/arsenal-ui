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
import PricingModelsValidation from './pricingmodels.validation';

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
    usercommentsStore:"",
    addEditUIProperty:{},
    showbottomSection:false,
    isCommentData:false
  
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
            self.scope.licensorStore.replace(values[3]["entities"][0]);
            self.scope.pricingmodeltypeStore.replace(values[4].modelTypes);
      });       
  },
  events:{
  	"inserted":function(){
  		var self = this;
          $('#pmform').bootstrapValidator(PricingModelsValidation).on('error.field.bv', function(e, data) {
              $('[data-bv-icon-for="'+data.field +'"]').popover('show');
          });
  	 },
    "#fetch click":function(){
      var self = this;
      self.scope.addEditUIProperty.attr("country", true);
      self.scope.addEditUIProperty.attr("entity", true);
      var genObj = {region:self.scope.attr("regions"),reqType:'summary'};
        
        self.scope.pricingModelList.replace([]); 
        self.scope.attr("editstate", true);
        PricingModels.findOne(UserReq.formRequestDetails(genObj),function(data){
                  var pricingmodels = data.pricingModels;
                   for(var i =0; i < pricingmodels.length; i++){
                     
                      self.scope.pricingModelList.push({
                          model:pricingmodels[i].modelDescription,
                          modeltype:pricingmodels[i].modelName,  
                          version:pricingmodels[i].version,
                          modelid:pricingmodels[i].modelId
                        });
                    }
                },function(xhr){
                /*Error condition*/
              }).then(function(){
                self.scope.attr("showbottomSection", true);
                self.scope.attr('isCommentData',true);
                $('#multipleComments').html('<textarea class="form-control new-comments" maxlength="1024" name="usercommentsdiv"  style="height:100px; margin-bottom:10px; min-height:100px; max-height:100px;"></textarea>');
                //$('#pricingmodelGrid tbody tr:nth-child(1)').trigger('click').addClass("selected");
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
              var tempcommentObj = data.pricingModel.pricingModel.comments;
              $('#multipleComments').html(stache('<multiple-comments divid="usercommentsdiv" options="{tempcommentObj}" divheight="100" isreadOnly="n"></multiple-comments>')({tempcommentObj}));
              self.scope.attr("modelname", data.pricingModel.pricingModel.modelDescription);
              self.scope.attr("pricingmodeltype", data.pricingModel.pricingModel.modelName);

              self.scope.attr("country", data.pricingModel.country);
              self.scope.attr("entity", data.pricingModel.entityId);
              

              self.scope.attr("baseModelParamList").replace([]); /*cleaning table row to load new data on click*/
              self.scope.attr("basemodelContainer").replace(data.pricingModel.baseModelParameters);
             
             
              var basemodelCount = self.scope.basemodelContainer.attr().length;
              var basemodelData = self.scope.basemodelContainer.attr();

              for(var i=0; i < basemodelCount; i++){
                  
                  self.scope.attr("modelId", basemodelData[i].modelId);
                  self.scope.baseModelParamList.push({contentGroup:basemodelData[i].contentGroup, baseRate:basemodelData[i].baseRate, 
                                                      minima:basemodelData[i].minima, listenerMinima:basemodelData[i].listenerMinima,
                                                      discount:basemodelData[i].discount, isDefault:basemodelData[i].isDefault.toString(),
                                                      baseId:basemodelData[i].baseId, modelId:basemodelData[i].modelId
                                                    });

                  var $option   = $("#baseModelTable").find('[name="baseRate[]"], [name="minima[]"], [name="listenerMinima[]"], [name="discount[]"]');
                  DynamicFieldValidation($option, 'addField');
                 
                 }

              /** Track count minima Grid*/


                  self.scope.attr("trackCountMinimaList").replace([]); /*cleaning table row to load new data on click*/
                  self.scope.attr("trackContainer").replace(data.pricingModel.trackCounts);
                  

                  var trackCount = self.scope.trackContainer.attr().length;
                  var trackData = self.scope.trackContainer.attr();

                  for(var i=0; i < trackCount; i++){
                        self.scope.attr("trackCountMinimaList").push({description:trackData[i].description, from:trackData[i].from,
                                                                      to:trackData[i].to, modelId:trackData[i].modelId,
                                                                      minima:trackData[i].minima, tierId:trackData[i].tierId,
                                                                      paramId:trackData[i].paramId});
                                                              

                        var $option = $("#trackCount").find('[name="description[]"], [name="from[]"], [name="to[]"], [name="minimatrack[]"]');
                        DynamicFieldValidation($option, 'addField');
                            
                        }
                    },function(xhr){
                /*Error condition*/
              }).then(function(){
                  self.scope.attr("isCommentData", true);
                  $('#pmform').bootstrapValidator('addField', 'usercommentsdiv');
               });
          },
        "#addbasemodel click":function(){
        var self = this;
        self.scope.baseModelParamList.push({contentGroup:"", baseRate:"", 
                                                      minima:"", listenerMinima:"",
                                                      discount:"", isDefault:"",
                                                      modelId:self.scope.attr("modelId")
                                                    });

        var $option   = $("#baseModelTable").find('[name="baseRate[]"], [name="minima[]"], [name="listenerMinima[]"], [name="discount[]"]');
        DynamicFieldValidation($option, 'addField');
                          
      },
    "#basemodeldel click":function(el){
        var self = this;
        var selrow = el.closest('tr')[0].rowIndex;

        var $option   = $("#baseModelTable tbody tr:nth-child("+selrow+")").find('[name="baseRate[]"], [name="minima[]"], [name="listenerMinima[]"], [name="discount[]"]');
        DynamicFieldValidation($option, 'removeField');                  
        self.scope.attr("baseModelParamList").removeAttr(selrow-1);                  
    },
    "#addtrack click":function(){
        var self = this;
        self.scope.attr("trackCountMinimaList").push({description:"", from:"",
                                                      to:"", minima:"", 
                                                      modelId:self.scope.attr("modelId")});

         var $option = $("#trackCount").find('[name="description[]"], [name="from[]"], [name="to[]"], [name="minimatrack[]"]');
         DynamicFieldValidation($option, 'addField');
            
    },
    "#trackdel click":function(el){
        var self = this;
        var selrow = el.closest('tr')[0].rowIndex;
        var $option = $("#trackCount tbody tr:nth-child("+selrow+")").find('[name="description[]"], [name="from[]"], [name="to[]"], [name="minimatrack[]"]');
        DynamicFieldValidation($option, 'removeField');
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
        var self = this;  
      self.scope.attr("showbottomSection", true);
      self.scope.attr("editstate", false);
       self.scope.addEditUIProperty.attr("country", false);
       self.scope.addEditUIProperty.attr("entity", false);
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
      this.scope.attr("showbottomSection", false);
    },
    "#editCancel click":function(){
       
       var self = this;
       var selRow = self.scope.attr("selectedPriceModel");
       $('#pricingmodelGrid tbody tr:nth-child('+selRow+')').trigger('click').addClass("selected");
    },
   
    "#save click":function(){
      var self = this;

      var usercomments = (self.scope.editstate === false)?self.scope.usercommentsStore:$(".new-comments").val();

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
            // "commentId":9685,
            // "comments":null,
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


function DynamicFieldValidation($option, type){
     $option.each(function(index){
            $('#pmform').bootstrapValidator(type, $(this));
      });
}

export default page;
