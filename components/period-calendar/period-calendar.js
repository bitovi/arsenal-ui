import Component from 'can/component/';
import template from './template.stache!';
import styles from './period-calendar.less!';
var calander = Component.extend({
  tag: 'period-calendar',
  template: template,
  scope: {
    appstate: undefined,// this gets passed in
    year: 'FY '+new Date().getFullYear(),
    previousYearLimit:10
  },
  events:{
  	'.period li a click':function(li,ev){  
  		li.closest('.periods').find('.period li a').removeClass('period-active');
  		li.addClass('period-active');
  		if(li.find('span:first').text()==''){
  			this.scope.updateValue = li.text()+'FY'+this.scope.year.slice(-2);
        }else{
  			this.scope.updateValue = li.find('span:last').text()+'FY'+this.scope.year.slice(-2);
  		}
      $(this.element).trigger('onSelected', this.scope.updateValue);
      return false;
 	  },
  	'.period-calendar-rightbtn click':function(btn,eve){ 
  		var temp = this.scope.year.split(" ")[1]; 
  		this.scope.year ='FY '+(parseInt(temp)+1);
      btn.closest('.box-modal').find('.periods .period li a').removeClass('period-active');
  		btn.closest('.topmenucontainer').find('.period-calendar-yearbtn').val('FY'+(parseInt(temp)+1));
  		if(new Date().getFullYear()-this.scope.previousYearLimit<=temp){
  			$('#year').removeClass('disabled');	
  		}
  	},
  	'.period-calendar-leftbtn click':function(btn,eve){   
  		var temp = this.scope.year.split(" ")[1]; 
      btn.closest('.box-modal').find('.periods .period li a').removeClass('period-active');
  		if(new Date().getFullYear()-this.scope.previousYearLimit==temp){
  			btn.addClass('disabled');	
  		}else{
  			this.scope.year ='FY '+(parseInt(temp)-1);
  			btn.closest('.topmenucontainer').find('.period-calendar-yearbtn').val('FY'+(parseInt(temp)-1));
  		}
  	},
    '{document} keydown':function(el, ev){
      if(ev.which==27 && $('.box-modal').is(':visible')){
          $('.box-modal').hide();
      }
    },
    '{document}  click':function(el,ev){ 
     /* var $temp =ev.target;
      var tar = $($temp).attr('class');
          tar = tar.split(" "); 
      var other = $('.' +tar[tar.length-1]).parent().attr('class')
      if(tar[tar.length-1]!='updateperoid' && other!='flbtn' && other!=undefined && other!='topmenucontainer' && other!='box-modal' && other!='fl'){
          $('.box-modal').hide();
       }*/



    }
  }
});
export default calander;
