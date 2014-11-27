import Component from 'can/component/';
import Map from 'can/map/';

/** for pricing model*/
import View from 'can/view/';
import _ from 'lodash';
import Grid from 'components/grid/';
import stache from 'can/view/stache/';
import validation from 'can/map/validations/';
/** for pricing model*/

import UserReq from 'utils/request/';
import template from './template.stache!';
import styles from './page-pricing-models.less!';
import Region from 'models/common/region/';
import ContentType from 'models/common/content-type/';
import Country from 'models/common/country/';
import Licensor from 'models/common/licensor/';
import Pricingmodels from 'models/pricing-models/';
import css_bootstrapValidator from 'bootstrapValidator.css!';
import bootstrapValidator from 'bootstrapValidator';




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
    validatePM:can.Map.extend({
            init : function(){
            // validates that birthday is in the future
              this.validatePresenceOf(["field"]);
            }
          },{}),
    validateStatus:new can.Map({}),
    validateDynamic:function(dynamicobj, i){
      var self = this;
      var validatePMinstance = new self.validatePM(),
            validState;

        for(var prop in dynamicobj){
            validState = validatePMinstance.errors("field", dynamicobj[prop]);
            var elid = prop+"-"+i;
                  if(validState){
                        self.validateStatus.attr(elid, false);
                    } else {
                        self.validateStatus.attr(elid, true);
                }
            }
        }




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
          console.log(values[4]);

         

          


          
      });       
  },
  events:{
  	"inserted":function(){
  		
       
    },
    "#fetch click":function(){
        var self = this;
        var genObj = {region:self.scope.attr("regions")};
        console.log(JSON.stringify(UserReq.formRequestDetails(genObj)));

        self.scope.modeltypeGrid.replace([]); 
        
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
            alert("yes");
            $('#bottomsection').removeClass('bottomparthide').addClass('bottompartshow');
            $('#pricingmodelGrid tbody tr:nth-child(1)').trigger('click').addClass("selected");
           // $(this).addClass("selected").siblings().removeClass("selected");
          });
    },
     ".pricingmodelGrid tr click":function(el){
      
      //alert(el.closest('tr')[0].rowIndex);
      var self = this;

    



      self.scope.attr("selectedPriceModel", el.closest('tr')[0].rowIndex);
      var selrow = el.closest('tr').attr("version");
      el.addClass("selected").siblings().removeClass("selected");
      self.scope.attr("version", selrow);
      var genObj = {modelId:"24005"};
      
      Promise.all([Pricingmodels.findOne(UserReq.formRequestDetails(genObj), 'details')
             ]).then(function(values) {
              /** Base Model Parameter Grid*/

              



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

                  self.scope.validateDynamic(tempgrid, i);

                  



                  self.scope.attr("rownum").push(tempgrid);
                }

                console.log(self.scope.validateStatus);
          
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

                        self.scope.validateDynamic(tempgrid, i);
                       
                        self.scope.attr("rownumtrack").push(tempgrid);

                       
                  }

                console.log(self.scope.rownum.attr());

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

        self.scope.validateDynamic(tempgrid, lastIndex);


        self.scope.attr("rownum").push(tempgrid);
    },
    "#addbasemodeldel click":function(el){
        var self = this;
        var selrow = el.closest('tr')[0].rowIndex;
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

        self.scope.validateDynamic(tempgrid, lastIndex);

        
        self.scope.attr("rownumtrack").push(tempgrid);
       
    },
    "#trackdel click":function(el){
        var self = this;
        var selrow = el.closest('tr')[0].rowIndex;
        self.scope.attr("rownumtrack").removeAttr(selrow-1);

    },
    "#add click":function(){
       //Cleaning data for add
       var self = this;
       self.scope.attr("editstate", false);
       self.scope.attr("country", "");
       self.scope.attr("entity", "");
       self.scope.attr("rownumtrack").replace([]); 
       self.scope.attr("rownum").replace([]); 
       self.scope.attr("modelname", "");
       self.scope.attr("pricingmodeltype", "");

       $('#pricingmodelGrid tbody tr').removeClass("selected");

    },
    "#addCancel click":function(){
       //Cleaning data for add
       $('#bottomsection').removeClass('bottompartshow').addClass('bottomparthide');
       alert("add");

    },
    "#editCancel click":function(){
       //Cleaning data for add
       var self = this;
      // $('#bottomsection').removeClass('bottompartshow').addClass('bottomparthide');
       var selRow = self.scope.attr("selectedPriceModel");
       $('#pricingmodelGrid tbody tr:nth-child('+selRow+')').trigger('click').addClass("selected");
       alert("edit");


    },
    ".form-control blur":function(event){
        var self = this;
        var elid = event[0].id;
        var validatePMinstance = new self.scope.validatePM(),
            validState;

          console.log(elid);
        

        if(elid == "regions"){
           validState = validatePMinstance.errors("field", self.scope.attr(elid));
            if(validState){
                showError(event[0].id, "Region is mandatory");
                self.scope.validateStatus.attr(event[0].id, false);
              } else {
                removeError(event[0].id);
                self.scope.validateStatus.attr(event[0].id, true);
               
            }
          }

          if(elid == "countrypm"){
           validState = validatePMinstance.errors("field", self.scope.attr(elid));
            if(validState){
                showError(event[0].id, "Country is mandatory");
                self.scope.validateStatus.attr(event[0].id, false);
                alert("error");
              } else {
                removeError(event[0].id);
                self.scope.validateStatus.attr(event[0].id, true);

               
            }
          }

          if(elid == "entity"){
           validState = validatePMinstance.errors("field", self.scope.attr(elid));
            if(validState){
                showError(event[0].id, "Entity is mandatory");
                self.scope.validateStatus.attr(event[0].id, false);
              } else {
                removeError(event[0].id);
                self.scope.validateStatus.attr(event[0].id, true);
               
            }
          }

          if(elid == "modelname"){
           validState = validatePMinstance.errors("field", self.scope.attr(elid));
            if(validState){
                showError(event[0].id, "Modelname is mandatory");
                self.scope.validateStatus.attr(event[0].id, false);
              } else {
                removeError(event[0].id);
                self.scope.validateStatus.attr(event[0].id, true);
               
            }
          }

          if(elid == "modelname"){
           validState = validatePMinstance.errors("field", self.scope.attr(elid));
            if(validState){
                showError(event[0].id, "Modelname is mandatory");
                self.scope.validateStatus.attr(event[0].id, false);
              } else {
                removeError(event[0].id);
                self.scope.validateStatus.attr(event[0].id, true);
               
            }
          }

          if(elid == "pricingmodeltype"){
           validState = validatePMinstance.errors("field", self.scope.attr(elid));
            if(validState){
                showError(event[0].id, "Pricing model is mandatory");
                self.scope.validateStatus.attr(event[0].id, false);
              } else {
                removeError(event[0].id);
                self.scope.validateStatus.attr(event[0].id, true);
               
            }
          }
          



          console.log(self.scope.validateStatus);

      /*  var rowid = elid.split("-");
        console.log(rowid[1]+"|"+rowid[0]);
        var pid = rowid[1];
        var pstr = rowid[0];

        console.log(self.scope.rownum[2].baseRate);

         var task = new self.scope.validatePM(),
          errors = task.errors("minima", self.scope.rownum[pid].attr(pstr));
          //console.log(self.scope.rownum[1].baseRate);
          //var err = self.scope.rownum[1].baseRate
          
          if(errors){
            // give a warning
              showError(event[0].id, "Maximum 1024 characters allowed");

              
          } else {
            removeError(event[0].id);
          }
     console.log(task.errors("minima"));
         // console.log(task.errors("minima", self.scope.rownum[1].baseRate));*/
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
