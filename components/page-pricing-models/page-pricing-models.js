import Component from 'can/component/';

/** for pricing model*/
import View from 'can/view/';
import _ from 'lodash';
import Grid from 'components/grid/';
import stache from 'can/view/stache/';
/** for pricing model*/

import template from './template.stache!';
import styles from './page-pricing-models.less!';



Grid.extend({
  tag: 'base-model-parameter',
  scope: {
    appstate:undefined,
    columns: [
      {
        id: 'contentgroup',
        title: 'Content Group'
      },
      {
        id: 'baserate',
        title: 'Base Rate[%]'
      },
      {
        id: 'minima',
        title: 'Minima'
      },
      {
        id: 'listenersminima',
        title: 'Listener Hours Minima'
      },
      {
        id: 'discount',
        title: 'Discount(%)'
      },
      {
        id: 'isdefault',
        title: 'is Default'
      },
      {
        id: 'addbasemodel',
        title: '<a id="addbasemodel" href="#">Add</a>'
      }

    ],
    baserate:0
    
  },
  events:{
  "#baserate change":function(){
     var self = this;
      console.log(self.scope.baserate); /*Trying to get updated value of baserate textbox.*/
    }
   } 
});



var page = Component.extend({
  tag: 'page-pricing-models',
  template: template,
  scope: {
    rows:[],
  	gridData:{
  			contentgroup:"<select><option value=''>Select</option></select>",
  			baserate:"<input id='baserate' can-value='baserate'>",
  			minima:"<input type='text'>",
  			listenersminima:"<input type='text'>",
  			discount:"<input type='text'>",
  			isdefault:"<input type='text'>",
  			addbasemodel: '<a id="addbasemodeldel" href="#">Delete</a>'
		},
    baserate:0
  },
  events:{
  	"inserted":function(){
  		var self = this;
      var temprows = new can.List(self.scope.gridData);
  		self.scope.attr("rows", temprows);
  		},
    "#addbasemodel click":function(){
  		var self = this;
  		var tempgrid = self.scope.gridData;
  		self.scope.attr("rows").push(tempgrid);
      },
	 "#addbasemodeldel click":function(el){
  		var self = this;
  		var selrow = el.closest('tr')[0].rowIndex;
  		console.log(selrow);
  		self.scope.attr("rows").removeAttr(selrow-1);
  	},
    "#baserate change":function(){
      var self = this;
      console.log(self.scope.baserate); /*Trying to get updated value of baserate textbox.*/
    },
	 "{scope} rows":function(){
  		var self = this;
  		var rows = self.scope.rows;
      $('#pricingbasemodelGrid').html(stache('<base-model-parameter rows="{rows}"></base-model-parameter>')({rows}));
    }
}
});

export default page;
