var formats = {
  number: value => parseFloat(value),
  int: value => parseInt(value, 10),
  fixed: function(numberOfDigits) {
      return function(value) {
        if(value === ""){
          return "";
        }else{
          return formats.number(value).toFixed(numberOfDigits);
        }
      };
  },
  currencyFormat: function (numberVal)
  {
    if(numberVal === '' || numberVal == null){
    //  console.log("numberVal : "+numberVal);
      return "";
    }else  {
      var n =  formats.number(numberVal).toFixed(2);
      return n.replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
    }
    //var n = number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
    //return n;
  },
  numberFormat: function (numberVal)
  {
    if(isNaN(numberVal) && (numberVal == "" || numberVal == null)){
      return "";
    }else  {
      var n = numberVal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
    return n;
    }

  },
  numberFormatDecimal: function (numberVal, decimal)
  {
    if(isNaN(numberVal) && (numberVal == "" || numberVal == null)){
      return "";
    }else  {
      var n = numberVal.toFixed(decimal).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
    return n;
    }

  },
  currencyFormatDecimal: function (numberVal, decimal)
  {
    if(isNaN(numberVal) && (numberVal == "" || numberVal == null)){
      return "";
    }else  {
      var n =  formats.number(numberVal).toFixed(decimal);
      return n.replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
    }
    //var n = number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
    //return n;
  },
  formatIf: function(test, format, elseValue) {
    return value => test.call(null, value) ? format(value) : elseValue
  },
  formatIfValue: function(valuePassed,test, format, elseValue) {
    if ( valuePassed == null){
      return elseValue;
    }else if(valuePassed == undefined){
      return "";
    }
    else{
      return test.call(null, valuePassed) ? format(valuePassed) : elseValue;
    }
  },
  formatToFixedDecimalAspercent: function(valuePassed,test, decimalplace, elseValue,isPercentVal){
    if(test.call(null, valuePassed)){
      var convertVal=formats.number(valuePassed);
      if(!isPercentVal){
        convertVal=convertVal*100;
      }
      return convertVal.toFixed(decimalplace);
    }else{
      return elseValue;
    }
  }
};

formats.currency = formats.fixed(2);
formats.percent = (value => formats.fixed(0)(value) + '%');
formats.decimalAsPercent = (value => formats.fixed(2)(value * 100) + '%');

export default formats;
