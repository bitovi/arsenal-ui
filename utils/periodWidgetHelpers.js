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
  }
};


function getPeriodForQuarter(quarter){
  console.log("getPeriodForQuarter");
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
