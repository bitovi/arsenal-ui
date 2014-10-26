import Model from 'can/model/';

var NewPBName = Model.extend({

  findAll: function(param){
    return $.ajax({
      url: 'http://localhost:8090/paymentBundle/newName',
      type: 'POST',
      params: param,
      dataType: 'json'
    })
  }
}, {});

/* able to get data in ajax done function*/

export default NewPBName;
