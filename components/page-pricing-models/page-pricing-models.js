import Component from 'can/component/';

/** for pricing model*/
import View from 'can/view/';
import _ from 'lodash';
import Grid from 'components/grid/';
import stache from 'can/view/stache/';
/** for pricing model*/

import UserReq from 'utils/request/';
import template from './template.stache!';
import styles from './page-pricing-models.less!';
import Region from 'models/common/region/';
import ContentType from 'models/common/content-type/';
import Country from 'models/common/country/';
import Licensor from 'models/common/licensor/';
import Pricingmodels from 'models/pricing-models/';



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
  		var self = this;
    },
    "#fetch click":function(){
        var self = this;
        var genObj = {region:"Europe"};
        console.log(JSON.stringify(UserReq.formRequestDetails(genObj)));
        
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
          });
    },
     ".pricingmodelGrid tr click":function(el){
      var self = this;
      var selrow = el.closest('tr').attr("version");
      self.scope.attr("version", selrow);
      var genObj = {modelId:"24005"};

      Promise.all([Pricingmodels.findOne(UserReq.formRequestDetails(genObj), 'details')
             ]).then(function(values) {
              /** Base Model Parameter Grid*/

              self.scope.attr("modelname", values[0].pricingModel.pricingModel.modelDescription);
              self.scope.attr("pricingmodeltype", values[0].pricingModel.pricingModel.modelName);
              

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


                  self.scope.attr("rownum").push(tempgrid);
                }
          
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
        
        var tempgrid = {};
        tempgrid["contentGroup"] = "";
        tempgrid["baseRate"] = "";
        tempgrid["minima"] = "";
        tempgrid["listenerMinima"] = "";
        tempgrid["discount"] = "";
        tempgrid["isDefault"] = "";
        tempgrid["modelId"] = self.scope.attr("modelId");
        self.scope.attr("rownum").push(tempgrid);
    },
    "#addbasemodeldel click":function(el){
        var self = this;
        var selrow = el.closest('tr')[0].rowIndex;
        self.scope.attr("rownum").removeAttr(selrow-1);

    },
    "#addtrack click":function(){
        var self = this;
        
        var tempgrid = {};
        tempgrid["description"] = "";
        tempgrid["from"] = "";
        tempgrid["to"] = "";
        tempgrid["minima"] = "";
        tempgrid["modelId"] = self.scope.attr("modelId");
        
        self.scope.attr("rownumtrack").push(tempgrid);
       
    },
    "#trackdel click":function(el){
        var self = this;
        var selrow = el.closest('tr')[0].rowIndex;
        self.scope.attr("rownumtrack").removeAttr(selrow-1);

    },
    "#save click":function(){
      var self = this;

        console.log(self.scope.rownum.attr());

      var saveRecord = {
        "details":{  
          "country":"GBR",
          "region":null,
          "entityId":19,
          "trackCounts":self.scope.rownumtrack.attr(),
          "createdBy":0,
          "userComments":"JUnitUserComment",
          "baseModelParameters":self.scope.rownum.attr(),
          "pricingModel":{  
             "region":"Europe",
             "modelId":221,
             "commentId":9685,
             "comments":null,
             "createdBy":299221510,
             "modelDescription":"JUnitTest:Tue Nov 25 15:52:45 IST 2014",
             "modelName":"STANDARD",
             "version":59
          },
          "entity":null
        }
      }

    

    
     
      



      Promise.all([Pricingmodels.create(UserReq.formRequestDetails(saveRecord))
             ]).then(function(values) {
                console.log(values);
                 
          });



    }
  }
});

export default page;
