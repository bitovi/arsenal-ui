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
    inputDynamicMonth : [],
    selectedCtrl:'',
    selectedYear:new Date().getFullYear()
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
    /*'{periodFrom} change': function(el, ev) {
         var comp ='from';
         showErrorMsg(this.scope.attr('periodFrom')[0],this.scope.attr('periodTo')[0],comp);
     },
     '{periodTo} change': function(el, ev) {
          var comp ='to';
          showErrorMsg(this.scope.attr('periodFrom')[0],this.scope.attr('periodTo')[0],comp);
     },*/
    '.period-calendar-rightbtn click':function(btn,eve){
      var temp = this.scope.year.split(" ")[1];
      this.scope.year ='FY '+(parseInt(temp)+1);
      btn.closest('.box-modal').find('.periods .period li a').removeClass('period-active');
      btn.closest('.topmenucontainer').find('.period-calendar-yearbtn').val('FY '+(parseInt(temp)+1));
      if(new Date().getFullYear()-this.scope.previousYearLimit<=temp){
        $('.period-calendar-leftbtn').removeClass('disabled');
      }
      //if it equal to user selected year then apply the selected style.
      callSetstyle(this.scope);
    },
    '.period-calendar-leftbtn click':function(btn,eve){
      var temp = this.scope.year.split(" ")[1];
      btn.closest('.box-modal').find('.periods .period li a').removeClass('period-active');
      if(new Date().getFullYear()-this.scope.previousYearLimit==temp){
        btn.addClass('disabled');
      }else{
        this.scope.year ='FY '+(parseInt(temp)-1);
        btn.closest('.topmenucontainer').find('.period-calendar-yearbtn').val('FY '+(parseInt(temp)-1));
      }
      callSetstyle(this.scope);
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
    '.box-modal popup-shown': function(el, ev) {
        var periodFrom=el.data('selected-period-from');
        var periodTo=el.data('selected-period-to');
        var fromCtrl=el.data('selected-id');
        var periodType=el.data('selected-period-type');
        var selectedPeriod="";
        this.scope.selectedCtrl=fromCtrl;
        this.scope.periodTo.replace(periodTo);
        this.scope.periodFrom.replace(periodFrom);
        var comp='';
        if(fromCtrl == 'periodTo'){
          selectedPeriod=periodTo;
          comp='to';
        }else if(fromCtrl == 'periodFrom'){
          selectedPeriod=periodFrom;
          comp='from';
        }
        showErrorMsg(this.scope.attr('periodFrom')[0],this.scope.attr('periodTo')[0],comp,periodType);
        setActiveStyle(selectedPeriod,this.scope);
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

function callSetstyle(scope){
  var userSelectYear = parseInt(scope.year.split(" ")[1]);
  if(userSelectYear == scope.selectedYear){
    if(scope.selectedCtrl == 'periodTo'){
      setActiveStyle(scope.periodTo[0],scope);
    }else if(scope.selectedCtrl == 'periodFrom'){
      setActiveStyle(scope.periodFrom[0],scope);
    }
  }else{
    //set the default style for year button
    $('.topmenucontainer .period-calendar-yearbtn').css('background-color','#fff');
    $('.topmenucontainer .period-calendar-yearbtn').css('border-color','#ccc');
    $('.topmenucontainer .period-calendar-yearbtn').css('background-image','');
  }
}

function setActiveStyle(selectedPeriod,scope){
  if(selectedPeriod != null && selectedPeriod != ""){
    var period='';
    var year='';
    if(selectedPeriod.indexOf('Q') > -1){ //for quarter
      period=selectedPeriod.substring(0,2);
      year=selectedPeriod.substring(2,selectedPeriod.length);
    }else{ //for perid
      period=selectedPeriod.substring(0,3);
      year=selectedPeriod.substring(3,selectedPeriod.length);
    }
    //set the selected year attribute here. It will help to check when we are traversing accross
    //different year.
    var fullyear=new Date().getFullYear().toString().substring(0,2)+year.substring(2,year.length);
    scope.selectedYear=parseInt(fullyear);
    //calculate display year
    var dispYear=year.replace(year.substring(0,2),'FY '+new Date().getFullYear().toString().substring(0,2));
    scope.year=dispYear;
    $('.topmenucontainer .period-calendar-yearbtn').val(dispYear);
    //change color for selected country
    $('.topmenucontainer .period-calendar-yearbtn').css('background-color','#1581F4');
    $('.topmenucontainer .period-calendar-yearbtn').css('background-image','linear-gradient(to bottom, #1581f4, #63adf1)');
    $('.topmenucontainer .period-calendar-yearbtn').css('border-color','#0a66cb');
    //remove selected class from li element.
    $('.period li a').removeClass('period-active');
    //add the selected color back ground
    if(!$('.period li .'+period).hasClass('disabled')){
      $('.period li .'+period).addClass('period-active');
    }
  }
}

var showErrorMsg = function(periodFrom,periodTo,whichcomp,periodType){
  if(whichcomp=='to'){
      var _root = $('#periodTocontainer');
      _root.find('.period li a').removeClass('disabled period-active');
      if(periodType === 'P'){
        _root.find('.period li:first-child').find('a').addClass('disabled');
      }else if(periodType === 'Q'){
        _root.find('.q1 li').not(":first").find('a').addClass('disabled');
        _root.find('.q2 li').not(":first").find('a').addClass('disabled');
        _root.find('.q3 li').not(":first").find('a').addClass('disabled');
        _root.find('.q4 li').not(":first").find('a').addClass('disabled');
      }

   }
}

export default PeriodCalendar;
