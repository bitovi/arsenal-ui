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
    which:'@',
    periodFrom: [],
    periodTo : [],
    inputMonth : [],
    inputDynamicMonth : []
  },
  init:function(){
        
  },
  events:{
    '.period li a click':function(li,ev){   
      var parent=li.closest('.calendarcls').find('input[type=text]');
      li.closest('.periods').find('.period li a').removeClass('period-active');
      li.addClass('period-active');
      if (li.find('span:first').text() == '') {
        //var addZ = li.text().slice(1)!=4 ? '0':'' 
        var value = li.text() + 'FY' + this.scope.year.slice(-2);
        var which = li.closest('.calendarcls').find('input[type=text]').attr('id');
        
        if (which == 'periodFrom' || which == 'periodTo') {
          which == 'periodFrom' ? this.scope.periodFrom.replace(value) : this.scope.periodTo.replace(value);
        } else{
          which == 'inputMonth0' ? this.scope.inputMonth.replace(value) : this.scope.inputDynamicMonth.replace(value);
        }

        console.log(which + "  Quaters click event ");

        this.scope.attr('selectedperiod').replace({
          value, which
        });

      } else {
        var value = li.find('span:last').text() + 'FY' + this.scope.year.slice(-2);
        var which = li.closest('.calendarcls').find('input[type=text]').attr('id');
       
        if (which == 'periodFrom' || which == 'periodTo') {
          which == 'periodFrom' ? this.scope.periodFrom.replace(value) : this.scope.periodTo.replace(value);
        } else{
          which == 'inputMonth0' ? this.scope.inputMonth.replace(value) : this.scope.inputDynamicMonth.replace(value);
        }

        this.scope.attr('selectedperiod').replace({
          value, which
        });

        console.log(which + "  Period click event");
      }
      li.closest('.calendarcls').find('input[type=text]').val(this.scope.attr('selectedperiod')[0].value).blur();
      li.closest('.calendarcls').find('.box-modal').hide();
    },
    '{periodFrom} change': function(el, ev) {   
         var comp ='from';
         showErrorMsg(this.scope.attr('periodFrom')[0],this.scope.attr('periodTo')[0],comp);
     },
     '{periodTo} change': function(el, ev) { 
          var comp ='to';
          showErrorMsg(this.scope.attr('periodFrom')[0],this.scope.attr('periodTo')[0],comp);
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
    },
    '{inputMonth} change': function(el, ev) {
      var comp = 'inputMonth0';
      var _root = $("input[id^='inputMonth']").not("input[id='inputMonth0']").not(':hidden').parent();
      if (_root.length > 0) {
        $("input[id^='inputMonth']").not("input[id='inputMonth0']").not(':hidden').val(" ");
      }
      showErrorMsg(this.scope.attr('inputMonth0'),this.scope.attr('inputDynamicMonth'),comp);
    },
    '{inputDynamicMonth} click': function(el, ev) {
      var comp = 'inputMonth0';
      showErrorMsg(this.scope.attr('inputMonth0'),this.scope.attr('inputDynamicMonth'),comp);
    }
  },
  helpers:function(){

  }
 
});


var showErrorMsg = function(periodFrom,periodTo,whichcomp){ 
      if(whichcomp=='from'){
          var _root = $('#periodTocontainer');
          _root.find('.period li a').removeClass('disabled period-active');
          if( $('#periodFromcontainer .period li:first-child').find('a').hasClass('period-active')){
              _root.find('.q1 li').not(":first").find('a').addClass('disabled');
              _root.find('.q2 li').not(":first").find('a').addClass('disabled');
              _root.find('.q3 li').not(":first").find('a').addClass('disabled');
              _root.find('.q4 li').not(":first").find('a').addClass('disabled');
           }else{
              _root.find('.period li:first-child').find('a').addClass('disabled');
           }
       }
}


export default PeriodCalendar;
