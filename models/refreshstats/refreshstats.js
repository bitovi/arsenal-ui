import Model from 'can/model/';
import RinsCommon from 'utils/urls';


var Stats = Model.extend({
  // using finaAll top get the recon stats.
  //findAll: 'GET /recon/refresh'

  findOne: function(params){
    return $.ajax({
      url: RinsCommon.DOMAIN_SERVICE_URL+'recon/refresh',
      type: 'POST',
      datatype:'json',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(params)
    })
  }

}

,{});


export default Stats;
