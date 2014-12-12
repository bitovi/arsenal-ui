import Model from 'can/model/';
import RinsCommon from 'utils/urls';

var CountryLicensor = Model.extend({
  findOne: function(params){

    if(params.entityCountryDetails.entityCountry.entityId == undefined){
      console.log("row select:"+params.entityCountryDetails.entityCountry.id);
      return $.ajax({
          url: RinsCommon.UI_SERVICE_URL+'getEntityCountryDetailsById',
          type: 'POST',
          data: JSON.stringify(params),
          dataType: 'json',
          contentType: 'application/json'
        })

    }else{
      return $.ajax({
          url: RinsCommon.UI_SERVICE_URL+'getEntityCountryDetails',
          type: 'POST',
          data: JSON.stringify(params),
          dataType: 'json',
          contentType: 'application/json'
        })
    }
  },
  create: function(params){
   return $.ajax({
      url: RinsCommon.UI_SERVICE_URL+'updateEntityCountryDetails',
      type: 'POST',
      data: JSON.stringify(params),
      dataType: 'json',
      contentType: 'application/json'
    })
  }
}, {});

export default CountryLicensor;
