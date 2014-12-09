import Model from 'can/model/';
import RinsCommon from 'utils/';

var CountryLicensor = Model.extend({
  findOne: function(params){
    console.log("params "+JSON.stringify(params));
    if(params.id != undefined && params.id != ""){
      console.log("row select:"+params.id);
      return $.ajax({
          url: RinsCommon.UI_SERVICE_URL+'getCountryDetailsById',
          type: 'POST',
          data: JSON.stringify(params),
          dataType: 'json',
          contentType: 'application/json'
        })

    }else{
      return $.ajax({
          //url: RinsCommon.UI_SERVICE_URL+'getEntityCountryDetails',
          url: RinsCommon.UI_SERVICE_URL+'getCountryDetails',
          type: 'POST',
          data: JSON.stringify(params),
          dataType: 'json',
          contentType: 'application/json'
        })
    }
  },
  create: function(params){
   return $.ajax({
      url: RinsCommon.UI_SERVICE_URL+'updateCountryDetails',
      type: 'POST',
      data: JSON.stringify(params),
      dataType: 'json',
      contentType: 'application/json'
    })
  }
}, {});

export default CountryLicensor;
