import Model from 'can/model/';

var requestHelper = {
  formRequestDetails:function(params){
    var userRequest = {};
    var date = new Date();
    if(params != null || params != undefined){
      userRequest = params ;
    }
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
    var serTypeId = appstate.attr('storeType').id;
    var countryId = appstate.attr()['country'];
    var licId = appstate.attr()['licensor'].map(id => +id);
    var contGrpId = appstate.attr()['contentType'].map(id => +id);
    var region = appstate.attr('region');
    var serviceType = appstate.attr('storeType');
    // var serTypeId = "";
    // if(typeof(serviceType)=="undefined"){
    //   serTypeId= "";
    // }
    //   else
    //     {
    //       serTypeId = serviceType['id'];
    //     }


    // var regId = "";
    // if(typeof(region )=="undefined"){
    //   regId = "";
    // }else{
    //   regId = region['id'];
    // }

    var searchRequestObj={};
    searchRequestObj.searchRequest = {};
    searchRequestObj.searchRequest["periodFrom"] = appstate.periodFrom;
    searchRequestObj.searchRequest["periodTo"] = appstate.periodTo;
    searchRequestObj.searchRequest["periodType"] = appstate.periodType;
    searchRequestObj.searchRequest["serviceTypeId"] = "";
    searchRequestObj.searchRequest["regionId"] = "";
    searchRequestObj.searchRequest["country"] = [];
    searchRequestObj.searchRequest["entityId"] = [];
    searchRequestObj.searchRequest["contentGrpId"] = [];
    
      if(typeof(serTypeId)!="undefined"){
        searchRequestObj.searchRequest["serviceTypeId"] = serTypeId['id'];
      }

      if(typeof(regId)!="undefined"){
        searchRequestObj.searchRequest["regionId"] = regId['id'];
      }

      if(typeof(countryId)!="undefined"){
        searchRequestObj.searchRequest["country"]=countryId;
      }

      if(typeof(licId)!="undefined"){
        searchRequestObj.searchRequest["entityId"]=licId;
      }

      if(typeof(contGrpId)!="undefined"){
        searchRequestObj.searchRequest["contentGrpId"]=contGrpId;
      }


    // var searchRequestObj = {
    //   "searchRequest":{
    //     periodFrom:appstate.periodFrom,
    //     periodTo:appstate.periodTo,
    //     periodType:appstate.periodType,
    //     entityId:licId,
    //     regionId:regId,
    //     contentGrpId:contGrpId,
    //     country:countryId,
    //     serviceTypeId:serTypeId
    //   }
    // };

    return searchRequestObj;

  }
};

export default requestHelper;
