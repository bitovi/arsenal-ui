import Model from 'can/model/';

import RinsCommon from 'utils/urls';

var NewPBName = Model.extend({

  findOne: function(param){
    return $.ajax({
      url: RinsCommon.DOMAIN_SERVICE_URL+'paymentBundle/proposeNewName',
      type: 'post',
      datatype:'json',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(param)

    })
   }
}, {});


/* able to get data in ajax done function*/

export default NewPBName;
