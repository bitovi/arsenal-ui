var periodWidgetHelper = {
  getFiscalPeriod: function (period){
    if(period==undefined){
      return "";
    }else if(period.indexOf('P') > -1){
      return getPeriod(period);
    }else if(period.indexOf('Q') > -1 ){
      return getPeriodForQuarter(period);
    }else{
      return null;
    }
  },
  getPeriodType: function (period){
    if(period==undefined){
      return "";
    }else if(period.indexOf('P') > -1){
      return "P"
    }else if(period.indexOf('Q') > -1 ){
      return "Q";
    }else{
      return null;
    }
  },
   getDisplayPeriod: function(quarter,periodType){
    var quarters={
    "03":"Q1",
    "06":"Q2",
    "09":"Q3",
    "12":"Q4"
  }
    var periods={
        "01":"P01",
        "02":"P02",
        "03":"P03",
        "04":"P04",
        "05":"P05",
        "06":"P06",
        "07":"P07",
        "08":"P08",
        "09":"P09",
        "10":"P10",
        "11":"P11",
        "12":"P12",
    }
    var year = quarter.substring(0, 4);
    var period = quarter.substring(quarter.length, quarter.length-2);
    if(periodType.indexOf('P') > -1){
      return (periods[period]+'FY'+year.substring(year.length, year.length-2));
    }else if(periodType.indexOf('Q') > -1 ){
      return (quarters[period]+'FY'+year.substring(year.length, year.length-2));
    }else{
      return null;
    }  
  }
};


function getPeriodForQuarter(quarter){
  //console.log("getPeriodForQuarter");
  var periods={
    "Q1":"03",
    "Q2":"06",
    "Q3":"09",
    "Q4":"12"
  }
  var quart= quarter.substring(0, 2);
  var year= quarter.substring(quarter.length, quarter.length-2);
  return  '20'+year+periods[quart];
}

function getPeriod(fiscalPeriod) {
  var period= fiscalPeriod.substring(1, 3);
  var year= fiscalPeriod.substring(fiscalPeriod.length, fiscalPeriod.length-2);
  return  '20'+year+period;
}



export default periodWidgetHelper;
