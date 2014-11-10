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
      userRequest["secretKey"] = "";
      userRequest["roleIds"] = [""];
      return userRequest;
   }

});


var UserReq = new UserReqMap({});

export default UserReq;
