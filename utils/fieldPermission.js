import appstate from 'models/appstate/';

    var fieldPermission = {
      formRequestDetails:function(fieldId , screenId){

        var role = appstate.userInfo;

        var fieldPerm = [] ;

          if(role != "" && role.permissions != undefined && role.permissions!= null)
          {
            for(var i = 0, size = role.permissions.length; i < size ; i++)
            {
              if(role.permissions[i].screenId == screenId)
                {
                  fieldPerm = role.permissions[i].fieldPermissions ;

                }

              }

            for(var i=0, size = fieldPerm.length;i < size ; i++)
            {


              if(fieldPerm[i].fieldId == fieldId){

                if(fieldPerm[i].isReadHidden=="H")
                {
                    return 'hidden' ;
                }
                if(fieldPerm[i].isReadHidden=="R")
                {
                      return 'disabled' ;
                }

                }
            }

          }
        return 'none';
      }
  }

export default fieldPermission;
