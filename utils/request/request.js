import Model from 'can/model/';

var requestHelper = {
  formRequestDetails:function(params){
    var userRequest = {};
    var date = new Date();
    userRequest = params ;
    userRequest["prsId"] = "2002005722";
    userRequest["appId"] = "1179";
    userRequest["secretKey"] = "f4166789-30bb-4e12-9973-a76376745096";
    userRequest["roleIds"] = [""];
    userRequest["requestTimeStamp"]=date.getTime();
    console.log('Request:'+ JSON.stringify(userRequest));
    return userRequest;
  },
  formGlobalRequest: function(appstate){
    /*
      forms the common global request, which further
        neds to be extended on on each page.

      Ex: {
      "searchRequest" : {
        "entityId" : [ 1 ],
        "contentGrpId" : [ "1" ],
        "periodFrom" : 201404,
        "periodTo" : 201406,
        "regionId" : 1,
        "serviceTypeId" : 1,
        "country" : [ "FRA" ]
      }
    }

    */
    var serTypeId = appstate.attr('storeType');
    var countryId = appstate.attr()['country'];
    var licId = appstate.attr()['licensor'];
    var contGrpId = appstate.attr()['contentType'];
    var region = appstate.attr('region');

    var regId = "";
    if(typeof(region )=="undefined"){
      regId = "";
    }else{
      regId = region['id'];
    }

    var searchRequestObj = {
      "searchRequest":{
        periodFrom:appstate.periodFrom,
        periodTo:appstate.periodTo,
        periodType:appstate.periodType,
        entityId:licId,
        regionId:regId,
        contentGrpId:contGrpId,
        country:countryId,
        serviceTypeId:serTypeId
      }
    };

    return searchRequestObj;

  }
};

export default requestHelper;
