import Model from 'can/model/';
import RinsCommon from 'utils/urls';

var CountryLicensor = Model.extend({
  findOne: function(params){

    if(params.reqType === 'modelListAndVersion'){
        delete params.reqType;
        return $.ajax({
          url: RinsCommon.UI_SERVICE_URL +'getPricingModelList',
            type: 'POST',
            data: JSON.stringify(params),
            dataType:'json',
            contentType: 'application/json'
          });
    } else if(params.reqType === 'countryLicensordetails'){
        delete params.reqType;
        return $.ajax({
          url: RinsCommon.UI_SERVICE_URL +'getPricingModelDetails',
          type: 'POST',
            data: JSON.stringify(params),
            dataType:'json',
            contentType: 'application/json'
          });
      } else if(params.entityCountryDetails.entityCountry.entityId == undefined){
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
          url: RinsCommon.UI_SERVICE_URL +'getEntityCountryDetails',
          type: 'POST',
          data: JSON.stringify(params),
          dataType: 'json',
          contentType: 'application/json'
        })
    }
  },
  create: function(params){
   return $.ajax({
      url: RinsCommon.UI_SERVICE_URL + 'updateEntityCountryDetails',
      type: 'POST',
      data: JSON.stringify(params),
      dataType: 'json',
      contentType: 'application/json'
    })
  },


  propose: function(params){
   return $.ajax({
      url: 'http://localhost:10645/api/v1/rinsui/' + 'proposeEntityCountryDetails',
      type: 'POST',
      data: JSON.stringify(params),
      dataType: 'json',
      contentType: 'application/json'
    })
  },
  approve: function(params){
   return $.ajax({
      url: 'http://localhost:10645/api/v1/rinsui/' + 'approveEntityCountryDetails',
      type: 'POST',
      data: JSON.stringify(params),
      dataType: 'json',
      contentType: 'application/json'
    })
  },
  reject: function(params){
   return $.ajax({
      url: 'http://localhost:10645/api/v1/rinsui/' + 'rejectEntityCountryDetails',
      type: 'POST',
      data: JSON.stringify(params),
      dataType: 'json',
      contentType: 'application/json'
    })
  }
}, {});

export default CountryLicensor;
