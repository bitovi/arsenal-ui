import Component from 'can/component/';
import template from './template.stache!';
import styles from './period-calendar.less!';
var PeriodCalendar = Component.extend({
  tag: 'period-calendar',
  template: template,
  scope: {
    appstate: undefined,// this gets passed in
    year: 'FY '+new Date().getFullYear(),
    previousYearLimit:10,
    selectedperiod:[],
    which:'@'
  },
  init:function(){
        
  },
  events:{
    '.period li a click':function(li,ev){   
      var parent=li.closest('.calendarcls').find('input[type=text]');
      li.closest('.periods').find('.period li a').removeClass('period-active');
      li.addClass('period-active');
      if(li.find('span:first').text()==''){
         var addZ = li.text().slice(1)!=4 ? '0':'' 
         var value = this.scope.year.replace('FY ','')+addZ+parseInt(li.text().slice(1))*3;
         var which = li.closest('period-calendar').attr('which');
         this.scope.attr('selectedperiod').replace({value,which});
        }else{
          var value = this.scope.year.replace('FY ','')+li.find('span:last').text().slice(1);
          var which = li.closest('period-calendar').attr('which');
          this.scope.attr('selectedperiod').replace({value,which});
       }
      
      li.closest('.calendarcls').find('input[type=text]').val(this.scope.attr('selectedperiod')[0].value).blur();
      li.closest('.calendarcls').find('.box-modal').hide();
    },
    '.period-calendar-rightbtn click':function(btn,eve){ 
      var temp = this.scope.year.split(" ")[1]; 
      this.scope.year ='FY '+(parseInt(temp)+1);
      btn.closest('.box-modal').find('.periods .period li a').removeClass('period-active');
      btn.closest('.topmenucontainer').find('.period-calendar-yearbtn').val('FY'+(parseInt(temp)+1));
      if(new Date().getFullYear()-this.scope.previousYearLimit<=temp){
        $('.period-calendar-leftbtn').removeClass('disabled');  
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
    '{document}  click':function(el,e){ 
      if ($(e.target).closest(".calendarcls").length === 0) {
        $(".box-modal").hide();
      }
    }
  },
  helpers:function(){

  }
 
});
export default PeriodCalendar;
