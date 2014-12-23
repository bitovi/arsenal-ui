var formats = {
  number: value => parseFloat(value),
  int: value => parseInt(value, 10),
  fixed: function(numberOfDigits) {
      return function(value) {
        if(value == ""){
          return "";
        }else{
          return (formats.number(value)*100).toFixed(numberOfDigits);
        }
      };
  },
  currencyFormat: function (numberVal)
  {
    if(numberVal == "" || numberVal == null){
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
    if(numberVal == "" || numberVal == null){
      return "";
    }else  {
      var n = numberVal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
    return n;
    }

  },

  formatIf: function(test, format, elseValue) {
    return value => test.call(null, value) ? format(value) : elseValue
  }
};

formats.currency = formats.fixed(2);
formats.percent = (value => formats.fixed(2)(value)+ '%');

export default formats;