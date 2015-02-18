import appstate from 'models/appstate/';

    var screenPermission = {
      formRequestDetails:function(screenId){

        var role = appstate.userInfo;

        var ScreenPerm = [] ;

          if(role != "" && role.permissions != undefined && role.permissions!= null)
          {
            for(var i = 0, size = role.permissions.length; i < size ; i++)
            {
              if(role.permissions[i].screenId == screenId)
                {
                  console.log("Screen ID ="+role.permissions[i].screenId + "  Read Write="+role.permissions[i].readwrite)

                  return role.permissions[i].readwrite ;

                }

              }



          }
        return 'none';
      }
  }

export default screenPermission;
