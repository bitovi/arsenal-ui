import Model from 'can/model/';
import periodWidgetHelper from 'utils/periodWidgetHelpers';

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
    //TODO few more request s
    var serTypeId = appstate.attr('storeType');
    var regId = appstate.attr('region');
    var countryId = appstate.attr()['country'];
    var licId = appstate.attr()['licensor'];
    var contGrpId = appstate.attr()['contentType'];

    var searchRequestObj = {
      "searchRequest":{
        periodFrom:appstate.periodFrom,
        periodTo:appstate.periodTo,
        periodType:appstate.periodType,
        entityId:licId,
        contentGrpId:contGrpId,
        countryId:countryId,
        serviceTypeId:serTypeId
      }
    };

    return searchRequestObj;

  }
};

export default requestHelper;
