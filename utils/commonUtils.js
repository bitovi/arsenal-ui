import appstate from 'models/appstate/';
import constants from 'utils/constants';
import fieldPermission from 'utils/fieldPermission';

var rinsCommonUtils = {
  triggerGlobalSearch:function (){
    appstate.attr('globalSearch', !appstate.attr('globalSearch'));
  },
  navigateTo:function(page){
    var a = document.createElement('a');
    a.setAttribute('href', "/"+page);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
  hideUIMessage: function(){
    var messageDiv = ".messageDiv";

    if($(messageDiv).is(':visible')){
      $(messageDiv).html("").hide();
    }
  },
  displayUIMessage : function(status,message){
    commonUIDisplay(  ".messageDiv", status,message);
  },
  displayUIMessageWithDiv : function(messageDiv, status,message){
    commonUIDisplay(messageDiv, status,message);
  },
  showSuccessMessage: function(message){
    commonUIDisplay(  ".messageDiv", "0000",message);
  },
  showErrorMessage: function(message){
    commonUIDisplay(  ".messageDiv", "ERROR",message);
  },
  getDefaultParameters:function(appstate){
    var defaultFilterData={};
    defaultFilterData.periodFrom = appstate.defaultPeriodFrom;
    defaultFilterData.periodType = appstate.defaultPeriodType;
    defaultFilterData.periodTo = appstate.defaultPeriodTo;
    defaultFilterData.storeType = appstate.defaultStoreType;
    defaultFilterData.country = appstate.defaultcountry;
    defaultFilterData.licensor = appstate.defaultlicensor;
    defaultFilterData.contentType = appstate.defaultcontentType;
    defaultFilterData.region = appstate.defaultRegion;
    return defaultFilterData;
  },
  isReadOnly:function() {
    return appstate.userInfo.roleIds.indexOf(constants.ROLES.RO) > -1 ? 'true' : 'false';
  },
  getFieldAttribute:function(screenId,fieldId){
    var role = appstate.userInfo.roleIds ;
    return fieldPermission.formRequestDetails(fieldId,screenId,role);

  },
  getAllowedScreenIds:function(){
    var role =   appstate.userInfo.attr(role);
     var screenId= [] ;
     for(var i = 0, size = role.permissions.length; i < size ; i++)
    {
        console.log("role="+role.permissions[i].screenId);
         screenId.push(role.permissions[i].screenId) ;
     }

     return screenId;
   }

};

var   commonUIDisplay  = function(messageDiv, status,message){

  var className = 'errorMessage';
  if(status === '0000' ||  status === 'SUCCESS' ){
    className= 'successMessage';
  }


  if($(messageDiv).is(':visible')){
    $(messageDiv).html("").hide();
  }
  $(messageDiv).html("<label class='"+className+"'>"+message+"<a href='#' id='messageClose' class='close messageClose'> &times;</a></label>").show();

  if($(".messageClose").is(':visible')){
    $(".messageClose").on("click", function(){
      $(messageDiv).hide();
    });
  }
}


export default rinsCommonUtils;
