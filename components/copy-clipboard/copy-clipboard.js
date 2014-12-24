import Component from 'can/component/';
import template from './template.stache!';
import styles from './copy-clipboard.less!';

var copyClipboard = Component.extend({
  tag: 'copy-clipboard',
  template: template,
  scope: {
    appstate: undefined,
    table:[]
   
 },
  init:function(){
   
  
    
   },
  events:{
    '.clipboardClose click':function(){
          $('copy-clipboard').hide();
    }
   },
  helpers:function(){

  }
 
});
export default copyClipboard;
