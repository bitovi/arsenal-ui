import Model from 'can/model/';

import RinsCommon from 'utils/';

var NewPBName = Model.extend({

  findOne: function(param){
    return $.ajax({
      url: RinsCommon.DOMAIN_SERVICE_URL+'paymentBundle/proposeNewName',
      type: 'post',
      data: JSON.stringify(param),
      dataType:'json'
    })
   }
}, {});


/* able to get data in ajax done function*/

export default NewPBName;
