import Component from 'can/component/';
import Map from 'can/map/';

/** for pricing model*/
import View from 'can/view/';
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
import Pricingmodels from 'models/pricing-models/';


import Comments from 'components/multiple-comments/';



var page = Component.extend({
  tag: 'page-pricing-models',
  template: template,
  scope: {
    //rownum:[{baserate0: "Austin"},{baserate1: "Justin"}]
    rownum:new can.List(),
    rowindex:0,
    appstate:undefined,
    regionStore:[],
    contentType:[],
    countryStore:[],
    licensorStore:[],
    regions:"",
    version:"",
    modeltypeGrid:[],
    basemodelContainer:[],
    rowindextrack:0,
    rownumtrack:new can.List(),
    trackContainer:[],
    modelname:"",
    pricingmodeltypeStore:[],
    pricingmodeltype:"",
    
    modelId:"",
    country:"",
    entity:"",
    editstate:true,
    selectedPriceModel:"",
    multipleComments : []
    

   


  },
  init:function(){
      var self = this;
      this.scope.appstate.attr("renderGlobalSearch",false);
      var genObj = {};
      Promise.all([
          Region.findAll(UserReq.formRequestDetails(genObj)),
          ContentType.findAll(UserReq.formRequestDetails(genObj)),
          Country.findAll(UserReq.formRequestDetails(genObj)),
          Licensor.findAll(UserReq.formRequestDetails(genObj)),
          Pricingmodels.findOne(UserReq.formRequestDetails(genObj),'modeltype')

        ]).then(function(values) {
          self.scope.attr("regionStore").replace(values[0]);
          self.scope.attr("contentType").replace(values[1].contentTypes);
          self.scope.attr("countryStore").replace(values[2]);
          self.scope.attr("licensorStore").replace(values[3].entities[0].entities);
          self.scope.attr("pricingmodeltypeStore").replace(values[4].modelTypes);
      });       
  },
  events:{
  	"inserted":function(){
  		var self = this;

        $('#pmform').on('init.form.bv', function(e, data) {
                  //data.bv.disableSubmitButtons(true);

              }).on('init.field.bv', function(e, data) {


              })
            .bootstrapValidator({
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
                'baseRate[]': {
                      group:'.baseRate',
                      validators: {
                          callback: {
                                  message: 'Baserate is mandatory',
                                  callback: function (value, validator, $field) {
                                    if(value == ""){
                                         return false;
                                    }
                                    return true;
                                  }
                          }
                      }
                  },
                'minima[]': {
                      group:'.minima',
                      validators: {
                          callback: {
                                  message: 'Minima is mandatory',
                                  callback: function (value, validator, $field) {
                                    if(value == ""){
                                         return false;
                                    }
                                    return true;
                                  }
                          }
                      }
                  },
                'listenerMinima[]': {
                      group:'.listenerMinima',
                      validators: {
                          callback: {
                                  message: 'ListenerMinima is mandatory',
                                  callback: function (value, validator, $field) {
                                    if(value == ""){
                                         return false;
                                    }
                                    return true;
                                  }
                          }
                      }
                  },
                  'discount[]': {
                      group:'.discount',
                      validators: {
                          callback: {
                                  message: 'Discount is mandatory',
                                  callback: function (value, validator, $field) {
                                    if(value == ""){
                                         return false;
                                    }
                                    return true;
                                  }
                          }
                      }
                  },
                  'description[]': {
                      group:'.description',
                      validators: {
                          callback: {
                                  message: 'Description is mandatory',
                                  callback: function (value, validator, $field) {
                                    if(value == ""){
                                         return false;
                                    }
                                    return true;
                                  }
                          }
                      }
                  },
                  'from[]': {
                      group:'.from',
                      validators: {
                          callback: {
                                  message: 'from is mandatory',
                                  callback: function (value, validator, $field) {
                                    if(value == ""){
                                         return false;
                                    }
                                    return true;
                                  }
                          }
                      }
                  },
                  'to[]': {
                      group:'.to',
                      validators: {
                          callback: {
                                  message: 'to is mandatory',
                                  callback: function (value, validator, $field) {
                                    if(value == ""){
                                         return false;
                                    }
                                    return true;
                                  }
                          }
                      }
                  },
                  'minimatrack[]': {
                      group:'.minimatrack',
                      validators: {
                          callback: {
                                  message: 'Minima is mandatory',
                                  callback: function (value, validator, $field) {
                                    if(value == ""){
                                         return false;
                                    }
                                    return true;
                                  }
                          }
                      }
                  }
            

          }
          }).on('error.field.bv', function(e, data) {
           /*  if((data.field != "amount[]") && (data.field != "inputMonth[]") && (data.field != "inputCountry[]")){
                $("#"+data.field+"-err").css("display", "block");
              }*/
              

              $('*[data-bv-icon-for="'+data.field +'"]').popover('show');

        }).on('success.field.bv', function(e, data) {
            //    $('*[data-bv-icon-for="'+data.field +'"]').popover('destroy');
           /*     if((data.field != "amount[]") && (data.field != "inputMonth[]") && (data.field != "inputCountry[]")){
                $("#"+data.field+"-err").css("display", "none");
              }
           
                if(!self.scope.editpage){
                  var requireField = (self.scope.attr("invoicetypeSelect") == "2")?mandatoryFieldAdhoc:mandatoryField;

                  for(var i= 0; i < requireField.length; i++){
                    if(!data.bv.isValidField(mandatoryField[i])){
                       data.bv.disableSubmitButtons(true);
                       break;
                    }
                  }
                }
                if(self.scope.editpage){
                  if(!data.bv.isValid()){
                    data.bv.disableSubmitButtons(true);
              }
                 }*/

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
        var genObj = {region:self.scope.attr("regions")};
        console.log(JSON.stringify(UserReq.formRequestDetails(genObj)));

        self.scope.modeltypeGrid.replace([]); 
        self.scope.attr("editstate", true);
        
        Promise.all([Pricingmodels.findOne(UserReq.formRequestDetails(genObj), 'summary')
             ]).then(function(values) {
                var pricingmodels = values[0].pricingModels;
                 for(var i =0; i < pricingmodels.length; i++){
                    var tempObj = {};
                    tempObj.model= pricingmodels[i].modelDescription;
                    tempObj.modeltype= pricingmodels[i].modelName;  
                    tempObj.version= pricingmodels[i].version;  
                    tempObj.modelid= pricingmodels[i].modelId;  
                    self.scope.modeltypeGrid.push(tempObj);
                    //console.log(self.scope.modeltypeGrid);
                }
          }).then(function(){
            
            $('#bottomsection').removeClass('bottomparthide').addClass('bottompartshow');
            $('#pricingmodelGrid tbody tr:nth-child(1)').trigger('click').addClass("selected");
           // $(this).addClass("selected").siblings().removeClass("selected");
          });

           $("#pmform").data('bootstrapValidator').resetForm();
            return false;
    },
     ".pricingmodelGrid tr click":function(el){
      
      //alert(el.closest('tr')[0].rowIndex);
      var self = this;

    



      self.scope.attr("selectedPriceModel", el.closest('tr')[0].rowIndex);
      var selrow = el.closest('tr').attr("version");
      var selmodelid = el.closest('tr').attr("modelid");
      el.addClass("selected").siblings().removeClass("selected");
      self.scope.attr("version", selrow);
      var genObj = {modelId:selmodelid};
      
      Promise.all([Pricingmodels.findOne(UserReq.formRequestDetails(genObj), 'details')
             ]).then(function(values) {
              /** Base Model Parameter Grid*/

              self.scope.attr("multipleComments", values[0].pricingModel.pricingModel.comments);

              self.scope.attr("modelname", values[0].pricingModel.pricingModel.modelDescription);
              self.scope.attr("pricingmodeltype", values[0].pricingModel.pricingModel.modelName);

              self.scope.attr("country", values[0].pricingModel.country);
              console.log(self.scope.attr("country"));
              self.scope.attr("entity", values[0].pricingModel.entityId);
              

              self.scope.attr("rownum").replace([]); /*cleaning table row to load new data on click*/
              self.scope.attr("basemodelContainer").replace(values[0].pricingModel.baseModelParameters);
              self.scope.attr("rowindex", 0);
             
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

                 // self.scope.validateDynamic(tempgrid, i);


                $.when(self.scope.attr("rownum").push(tempgrid)).then(function(){

                        var $option   = $("#baseModelTable").find('[name="baseRate[]"], [name="minima[]"], [name="listenerMinima[]"], [name="discount[]"]');
                            $option.each(function(index){
                              $('#pmform').bootstrapValidator('addField', $(this));
                            });
                    });
                 
                }

               // console.log(self.scope.validateStatus);
          
                 /** Track count minima Grid*/


                  self.scope.attr("rownumtrack").replace([]); /*cleaning table row to load new data on click*/
                  console.log(self.scope.attr("rownumtrack"));

                  self.scope.attr("trackContainer").replace(values[0].pricingModel.trackCounts);
                  self.scope.attr("rowindextrack", 0);


             
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

                     //   self.scope.validateDynamic(tempgrid, i);
                       
                       // self.scope.attr("rownumtrack").push(tempgrid);

                         $.when(self.scope.attr("rownumtrack").push(tempgrid)).then(function(){

                          var $option = $("#trackCount").find('[name="description[]"], [name="from[]"], [name="to[]"], [name="minimatrack[]"]');
                            $option.each(function(index){
                              $('#pmform').bootstrapValidator('addField', $(this));
                            });
                        });

                       
                  }

                console.log(self.scope.rownum.attr());

          }).then(function(){
					var tempcommentObj = self.scope.multipleComments;
					$('#multipleComments').html(stache('<multiple-comments divid="usercommentsdiv" options="{tempcommentObj}" divheight="100" isreadOnly="n"></multiple-comments>')({tempcommentObj}));
			});
    },
     
    "{basemodelContainer} change":function(){
        var self = this;
       
      //  console.log(basemodelCount);


        

        
        
      
      
      
      // console.log(self.scope.rownum.attr());
    },
    ".breakdownPeriod blur":function(){
      var self = this;
       console.log(self.scope.rownum.attr());
      
    },
    "#addbasemodel click":function(){
        var self = this;

        var lastIndex = self.scope.rownum.attr("length");
        
        var tempgrid = {};
        tempgrid["contentGroup"] = "";
        tempgrid["baseRate"] = "";
        tempgrid["minima"] = "";
        tempgrid["listenerMinima"] = "";
        tempgrid["discount"] = "";
        tempgrid["isDefault"] = "";
        tempgrid["modelId"] = self.scope.attr("modelId");

       // self.scope.validateDynamic(tempgrid, lastIndex);


        //self.scope.attr("rownum").push(tempgrid);

        $.when(self.scope.attr("rownum").push(tempgrid)).then(function(){

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
                      self.scope.attr("rownum").push(tempgrid)
                    });


        self.scope.attr("rownum").removeAttr(selrow-1);

    },
    "#addtrack click":function(){
        var self = this;

         var lastIndex = self.scope.rownumtrack.attr("length");
        
        var tempgrid = {};
        tempgrid["description"] = "";
        tempgrid["from"] = "";
        tempgrid["to"] = "";
        tempgrid["minima"] = "";
        tempgrid["modelId"] = self.scope.attr("modelId");

      //  self.scope.validateDynamic(tempgrid, lastIndex);

        
        //self.scope.attr("rownumtrack").push(tempgrid);
        $.when(self.scope.attr("rownumtrack").push(tempgrid)).then(function(){
          var $option = $("#trackCount").find('[name="description[]"], [name="from[]"], [name="to[]"], [name="minimatrack[]"]');
              $option.each(function(index){
                $('#pmform').bootstrapValidator('addField', $(this));
              });
          });
       
    },
    "#trackdel click":function(el){
        var self = this;
        var selrow = el.closest('tr')[0].rowIndex;
        self.scope.attr("rownumtrack").removeAttr(selrow-1);

    },
    "#regions change":function(el){
      //console.log(el[0].value);
      if(el[0].value != ""){
        $("button#fetch").attr("disabled", false);
        $("button#add").attr("disabled", false);
      }else{
        $("button#fetch").attr("disabled", true);
        $("button#add").attr("disabled", true);
      }
    },
    "#add click":function(){
       //Cleaning data for add
      
       $("#modelSummaryCont").addClass("modelsummaryInVisible").removeClass("col-sm-4").addClass("col-sm-0");
       $("#modelDetailCont").removeClass("col-sm-8").addClass("col-sm-12");

       $("#countrypm").attr("readonly", false);
       $("#entity").attr("readonly", false);


      $('#bottomsection').removeClass('bottomparthide').addClass('bottompartshow');





       var self = this;
       self.scope.attr("editstate", false);
       self.scope.attr("entity", "");
       self.scope.attr("country", "");
       self.scope.attr("rownumtrack").replace([]); 
       self.scope.attr("rownum").replace([]); 
       self.scope.attr("modelname", "");
       self.scope.attr("pricingmodeltype", "");
        $("#addbasemodel").trigger("click");
        $("#addtrack").trigger("click");
        $('#pricingmodelGrid tbody tr').removeClass("selected");

        $(".old-comments").remove();
     
       $("#pmform").data('bootstrapValidator').resetForm();
       return false;
  

    },
    "#addCancel click":function(){
       //Cleaning data for add
       $('#bottomsection').removeClass('bottompartshow').addClass('bottomparthide');
       

    },
    "#editCancel click":function(){
       //Cleaning data for add
       var self = this;
      // $('#bottomsection').removeClass('bottompartshow').addClass('bottomparthide');
       var selRow = self.scope.attr("selectedPriceModel");
       $('#pricingmodelGrid tbody tr:nth-child('+selRow+')').trigger('click').addClass("selected");
      


    },
   
    "#save click":function(){
      var self = this;

        console.log(self.scope.rownum.attr());

      var saveRecord = {
        "details":{  
          "country":self.scope.attr("country"),
          "region":self.scope.attr("regions"),
          "entityId":self.scope.attr("entity"),
          "trackCounts":self.scope.rownumtrack.attr(),
          //"createdBy":0,
          "userComments":"JUnitUserComment",
          "baseModelParameters":self.scope.rownum.attr(),
          "pricingModel":{  
             "region":self.scope.attr("regions"),
             "modelId":self.scope.attr("modelid"),
            // "commentId":9685,
            // "comments":null,
            // "createdBy":299221510,
             "modelDescription":self.scope.attr("modelname"),
             "modelName":self.scope.attr("pricingmodeltype"),
             "version":self.scope.attr("version") 
          }
          //,"entity":null
        }
      }

    Promise.all([Pricingmodels.create(UserReq.formRequestDetails(saveRecord))
             ]).then(function(values) {
                  
                   if(values[0]["status"]=="SUCCESS"){
                          var msg = "Pricing model was saved successfully."
                            $("#pbmessageDiv").html("<label class='successMessage'>"+msg+"</label>")
                            $("#pbmessageDiv").show();
                               setTimeout(function(){
                                  $("#pbmessageDiv").hide();
                               },5000);
                            }
                            else
                            {
                              // $("#invoiceform").data('bootstrapValidator').resetForm();
                                var msg = "Pricing model not was saved successfully."
                                $("#pbmessageDiv").html("<label class='errorMessage'>"+msg+"</label>");
                                $("#pbmessageDiv").show();
                                setTimeout(function(){
                                    $("#pbmessageDiv").hide();
                                 },5000);
                              
                              }
                });



    }
  }
});


function showError(id, message){
 
  $('#'+id).popover({"content":message, "placement":"top"});
  $('#'+id).popover('show');
   
  //$("#"+id+"-err").css("display", "block");
  $('#'+id).parent().addClass("has-error");
  console.log($('#'+id).parent());
  $("#addInvSubmit").attr("disabled", true);
}

function removeError(id){
  $('#'+id).popover('destroy');
  $("#"+id+"-err").css("display", "none");
  $('#'+id).parent().removeClass("has-error");
  $("#addInvSubmit").attr("disabled", false);
}

export default page;
