var formats = {
  number: value => parseFloat(value),
  int: value => parseInt(value, 10),
  fixed: function(numberOfDigits) {
    return function(value) {
      return formats.number(value).toFixed(numberOfDigits);
    };
  },
  currencyFormat: function (numberVal)
  {
    if(numberVal == ""){
      return "";
    }else  {
      return formats.number(numberVal).toFixed(2);
    }
    //var n = number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
    //return n;
  },
  formatIf: function(test, format, elseValue) {
    return value => test.call(null, value) ? format(value) : elseValue
  }
};

formats.currency = formats.fixed(2);
formats.percent = (value => formats.fixed(0)(value) + '%');

export default formats;
