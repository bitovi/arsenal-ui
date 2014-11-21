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
    regions:"",
    version:"",
    modeltypeGrid:[]

  },
  init:function(){
      var self = this;
      this.scope.appstate.attr("renderGlobalSearch",false);
      var genObj = {};
      Promise.all([
          Region.findAll(UserReq.formRequestDetails(genObj))
        ]).then(function(values) {
          self.scope.attr("regionStore").replace(values[0]);
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
                self.scope.modeltypeGrid.push(tempObj);
                console.log(self.scope.modeltypeGrid);
              }
          });
    },
     ".pricingmodelGrid tr click":function(el){
      var self = this;
      var selrow = el.closest('tr').attr("version");
      self.scope.attr("version", selrow);

    },
    ".breakdownPeriod blur":function(){
      var self = this;
       for(var i =0; i < self.scope.rownum.length; i++){
        var baseratenew = "baserate"+i;
        console.log(baseratenew)
        console.log(self.scope.rownum.attr(baseratenew));
      }
       /*Trying to get updated value of baserate textbox.*/
    },
    "#addbasemodel click":function(){
      var self = this;
      var baserate = "baserate"+self.scope.rowindex;
      var tempgrid = {baserate: ""};
      var temprows = new can.List(tempgrid);
      self.scope.attr("rownum").push(temprows);
      var newrowindex = self.scope.attr("rowindex")+1;
      self.scope.attr("rowindex", newrowindex);
       console.log(self.scope.rownum.attr());

    },
    "#addbasemodeldel click":function(el){
      var self = this;
      var selrow = el.closest('tr')[0].rowIndex;
      //console.log(selrow);
       var baserate = "baserate"+(selrow-1);
     self.scope.attr("rownum").removeAttr(baserate);
      self.scope.attr("rownum").removeAttr(selrow-1);
     
    }
  }
});

export default page;
