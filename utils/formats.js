var formats = {
  number: value => parseFloat(value),
  int: value => parseInt(value, 10),
  fixed: function(numberOfDigits) {
    return function(value) {
      return formats.number(value).toFixed(numberOfDigits);
    };
  }
};

formats.currency = formats.fixed(2);
formats.percent = (value => formats.fixed(2) + '%');

export default formats;
