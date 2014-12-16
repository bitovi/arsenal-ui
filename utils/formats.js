var formats = {
  number: value => parseFloat(value),
  int: value => parseInt(value, 10),
  fixed: function(numberOfDigits) {
    return function(value) {
      return formats.number(value).toFixed(numberOfDigits);
    };
  },
  formatIf: function(test, format, elseValue) {
    return value => test.call(null, value) ? format(value) : elseValue
  }
};

formats.currency = formats.currencyFormat = (value => formats.fixed(2)(value).replace(/(\d)(?=(\d{3})+\.)/g, "$1,"));
formats.percent = (value => formats.fixed(0)(value) + '%');

export default formats;
