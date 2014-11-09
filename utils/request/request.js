import Model from 'can/model/';

var UserReqMap = can.Map.extend({
   define: {
     request: {
       type: '*'
     }
   },
   formRequestDetails:function(params){
      var userRequest = {};
      userRequest = params ;
      userRequest["prsId"] = "12345";
      userRequest["appId"] = "12345";
      userRequest["requestTimeStamp"] = "1371450037289";
      userRequest["authToken"] = "3B9LrucRihXmNuM6";
      userRequest["secretKey"] = "";
      userRequest["roleIds"] = [""];
      return userRequest;
   }

});


var UserReq = new UserReqMap({});

export default UserReq;
