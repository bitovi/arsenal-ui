import Model from 'can/model/';

var UserReqMap = can.Map.extend({
   define: {
     request: {
       type: '*'
     }
   },
   formRequestDetails:function(params){
      var userRequest = {};
      var date = new Date();
      userRequest = params ;
      userRequest["prsId"] = "2002005722";
      userRequest["appId"] = "1179";
      userRequest["secretKey"] = "f4166789-30bb-4e12-9973-a76376745096";
      userRequest["roleIds"] = [""];
      userRequest["requestTimeStamp"]=date.getTime();

      return userRequest;
   }

});


var UserReq = new UserReqMap({});

export default UserReq;
