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
    regions:"",
    version:"",
    modeltypeGrid:[],
    basemodelContainer:[]

  },
  init:function(){
      var self = this;
      this.scope.appstate.attr("renderGlobalSearch",false);
      var genObj = {};
      Promise.all([
          Region.findAll(UserReq.formRequestDetails(genObj)),
          ContentType.findAll(UserReq.formRequestDetails(genObj))
        ]).then(function(values) {
          self.scope.attr("regionStore").replace(values[0]);
          self.scope.attr("contentType").replace(values[1].contentTypes);
      });       
  },
  events:{
  	"inserted":function(){
  		var self = this;
    },
    "{scope} regions":function(){
        var self = this;
        var genObj = {regionId:self.scope.attr("regionStore")};
        
        Promise.all([Pricingmodels.findAll()
             ]).then(function(values) {
                var gridData = [];
              
                var pricingmodels = values[0][0].pricingModels;
             
            for(var i =0; i < pricingmodels.length; i++){
                var tempObj = {};
                tempObj.model= pricingmodels[i].modelName;
                tempObj.modeltype= pricingmodels[i].modelDescription;  
                tempObj.version= pricingmodels[i].version;  
                tempObj.modelid= pricingmodels[i].modelId;  
                self.scope.modeltypeGrid.push(tempObj);
                console.log(self.scope.modeltypeGrid);
              }
          });
    },
     ".pricingmodelGrid tr click":function(el){
      var self = this;
      var selrow = el.closest('tr').attr("version");
      self.scope.attr("version", selrow);


      Promise.all([Pricingmodels.findOne()
             ]).then(function(values) {
              self.scope.attr("rownum").replace([]); /*cleaning table row to load new data on click*/
              self.scope.attr("basemodelContainer").replace(values[0][0].details.baseModelParameters);

               self.scope.attr("rowindex", 0);
              alert(self.scope.attr("rowindex"));

               var basemodelCount = self.scope.basemodelContainer.attr().length;

               var basemodelData = self.scope.basemodelContainer.attr();

             
             
             

             for(var i=0; i < basemodelCount; i++){
              console.log(basemodelData[i].contentGroup);
              var contenttype = "contenttype"+self.scope.rowindex;
              var baserate =  "baserate"+self.scope.rowindex;
              var minima = "minima"+self.scope.rowindex;
              var listhoursminima = "listhoursminima"+self.scope.rowindex;
              var discount = "discount"+self.scope.rowindex;
              var isdefault = "isdefault"+self.scope.rowindex;

              var tempgrid = {};
              tempgrid[contenttype] = basemodelData[i].contentGroup;
              tempgrid[baserate] = basemodelData[i].baseRate;
              tempgrid[minima] = basemodelData[i].minima;
              tempgrid[listhoursminima] = basemodelData[i].listenerMinima;
              tempgrid[discount] = basemodelData[i].discount;
              tempgrid[isdefault] = basemodelData[i].isDefault;

              
                 



               //  var tempgrid = {contenttype:3, baserate:basemodelData[i].baseRate,  minima:"", listhoursminima:"", discount:"", isdefault:""};

                  var temprows = new can.List(tempgrid);
                   self.scope.attr("rownum").push(temprows);

                  /*  self.scope.rownum.attr(contenttype, basemodelData[i].contentGroup);
                    self.scope.rownum.attr("0.baserate0", basemodelData[i].baseRate);
                    self.scope.rownum.attr(minima, basemodelData[i].minima);
                    self.scope.rownum.attr(listhoursminima, basemodelData[i].listenerMinima);
                    self.scope.rownum.attr(discount, basemodelData[i].discount);
                    self.scope.rownum.attr(isdefault, basemodelData[i].isDefault);*/
               
                //  self.scope.rownum.attr(temprows);
                //  console.log(self.scope.attr("rownum"));
                  var newrowindex = self.scope.attr("rowindex")+1;
                  self.scope.attr("rowindex", newrowindex);
                }

           //  var temprow = self.scope.rownum.attr();
           // console.log(temprow);


        });
    },
     
    "{basemodelContainer} change":function(){
        var self = this;
       
      //  console.log(basemodelCount);


        

        
        
      
      
      
      // console.log(self.scope.rownum.attr());
    },
    ".breakdownPeriod blur":function(){
      var self = this;
     /*  for(var i =0; i < self.scope.rownum.length; i++){
        var baseratenew = "baserate"+i;
        console.log(baseratenew)
        console.log(self.scope.rownum[0].attr(baseratenew));
      }*/
       console.log(self.scope.rownum.attr());
       /*Trying to get updated value of baserate textbox.*/
    },
    "#addbasemodel click":function(){
      var self = this;
    //  var baserate = "baserate"+self.scope.rowindex;
   //   var tempgrid = {baserate0: "dasda"};
      //var tempgrid = {};
   //   tempgrid.baserate = "adasda";

        var contenttype = "contenttype"+self.scope.rowindex;
        var baserate = "baserate"+self.scope.rowindex;
        var minima = "minima"+self.scope.rowindex;
        var listhoursminima = "listhoursminima"+self.scope.rowindex;
        var discount = "discount"+self.scope.rowindex;
        var isdefault = "isdefault"+self.scope.rowindex;

        var tempgrid = {};
        tempgrid[contenttype] = "";
        tempgrid[baserate] = "";
        tempgrid[minima] = "";
        tempgrid[listhoursminima] = "";
        tempgrid[discount] = "";
        tempgrid[isdefault] = "";

       /* self.scope.rownum.attr(contenttype, "");
        self.scope.rownum.attr(baserate, "");
        self.scope.rownum.attr(minima, "");
        self.scope.rownum.attr(listhoursminima, "");
        self.scope.rownum.attr(discount, "");
        self.scope.rownum.attr(isdefault, ""); */

        var temprows = new can.List(tempgrid);
       
        self.scope.attr("rownum").push(temprows);
        var newrowindex = self.scope.attr("rowindex")+1;
        self.scope.attr("rowindex", newrowindex);
        






    },
    "#addbasemodeldel click":function(el){
      var self = this;
      var selrow = el.closest('tr')[0].rowIndex;
      //console.log(selrow);
      
        var contenttype = "contenttype"+(selrow-1);
        var baserate = "baserate"+(selrow-1);
        var minima = "minima"+(selrow-1);
        var listhoursminima = "listhoursminima"+(selrow-1);
        var discount = "discount"+(selrow-1);
        var isdefault = "isdefault"+(selrow-1);
      
      self.scope.attr("rownum").removeAttr(contenttype);
      self.scope.attr("rownum").removeAttr(baserate);
      self.scope.attr("rownum").removeAttr(minima);
      self.scope.attr("rownum").removeAttr(listhoursminima);
      self.scope.attr("rownum").removeAttr(discount);
      self.scope.attr("rownum").removeAttr(isdefault);

      self.scope.attr("rownum").removeAttr(selrow-1);

       var temprow = self.scope.rownum.attr();
      console.log(temprow);
     
    }
  }
});

export default page;
