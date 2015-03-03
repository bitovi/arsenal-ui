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
       $('copy-clipboard').slideUp(function(){
            $('body').css('overflow','auto');
       });
    },
    '{document} keyup' : function(el,ev){
      if (ev.keyCode == 27){
        $('copy-clipboard').slideUp(function(){
            $('body').css('overflow','auto');
       });
      }
    },
    '{document} dblclick' : function(el,ev){
      ev.stopPropagation();
      ev.preventDefault();
      return false;
    },
    '#copyall click':function(){
        var el = $('#clonetable'), range, sel;
        function selectElementContents(el) {
        var body = document.body, range, sel;
        if (document.createRange && window.getSelection) {
            range = document.createRange();
            sel = window.getSelection();
            sel.removeAllRanges();
            try {
                range.selectNodeContents(el);
                sel.addRange(range);
            } catch (e) {
                range.selectNode(el);
                sel.addRange(range);
            }
        } else if (body.createTextRange) { 
            range = body.createTextRange(); 
            range.moveToElementText(el);
            range.select();
            range.execCommand("Copy");
        }
        return; 
      }
      selectElementContents(document.getElementById('dynamic'))
    }
   },
  helpers:function(){

  }
 
});
export default copyClipboard;
