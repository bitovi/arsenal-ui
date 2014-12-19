import can from 'can/';
import Model from 'can/model/';

var requestHelper = {
  formRequestDetails: function(params){
    var appstate = can.route.data;
    var userRequest = params || {};
    var userInfo = appstate.userInfo.attr() || {};

    can.extend(userRequest, {
      prsId: userInfo.prsId,
      appId: userInfo.appId,
      secretKey: userInfo.secretKey,
      roleIds: userInfo.roleIds,
      requestTimeStamp: (new Date()).getTime()
    });

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
    var serTypeId = appstate.attr('storeType') != undefined ? appstate.attr('storeType').id : "";
    var countryId = appstate.attr()['country'] != undefined ? appstate.attr()['country'] : [];
    var licId = appstate.attr()['licensor'] != undefined ? appstate.attr()['licensor'].map(id => +id) : [];
    var contGrpId = appstate.attr()['contentType'] != undefined ? appstate.attr()['contentType'].map(id => +id) : [];
    var region = appstate.attr('region') != undefined ? appstate.attr('region').id : "";
    var serviceType = appstate.attr('storeType') != undefined ? appstate.attr('storeType') : "";

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
        searchRequestObj.searchRequest["serviceTypeId"] = serTypeId;
      }

      if(typeof(region)!="undefined"){
        searchRequestObj.searchRequest["regionId"] = region;
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
