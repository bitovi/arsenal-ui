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
      userRequest["prsId"] = "1234";
      return userRequest;
   }

});


var UserReq = new UserReqMap({});

export default UserReq;
