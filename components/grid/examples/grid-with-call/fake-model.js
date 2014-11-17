var FakeModel = {
  findAll: function() {
    var rows = _.times(10, i => {
      return {
        index: i,
        text: 'Invoice #' + _.random(1, 1000)
      };
    });

    var p = new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve(rows);
      }, 2000);
    });

    return p;
  }
};

export default FakeModel;
