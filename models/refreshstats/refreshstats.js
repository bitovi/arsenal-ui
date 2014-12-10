import Model from 'can/model/';
import RinsCommon from 'utils/';


var Stats = Model.extend({
  // using finaAll top get the recon stats.
  //findAll: 'GET /recon/refresh'

  findOne: function(params){
    return $.ajax({
      //url: RinsCommon.DOMAIN_SERVICE_URL+'/recon/refresh',
      url: 'http://ma-rinsd-lapp01.corp.apple.com:10649/recon/refresh',
      type: 'POST',
      //datatype:'json',
      //contentType: 'application/json; charset=utf-8',
      //data: JSON.stringify(params)
    })
  }

}




, {});


export default Stats;
