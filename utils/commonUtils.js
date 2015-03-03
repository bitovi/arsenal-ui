import appstate from 'models/appstate/';
import constants from 'utils/constants';
import fieldPermission from 'utils/fieldPermission';
import screenPermission from 'utils/screenPermission';

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
    var params = {
      "messageDiv":".messageDiv",
      "status": status,
      "message":message
    };
    commonUIDisplay(params);
  },
  displayUIMessageWithDiv : function(messageDiv, status,message){
    var params = {
      "messageDiv":messageDiv,
      "status": status,
      "message":message
    };
    commonUIDisplay(params);
  },
  showMessage : function(params){
    commonUIDisplay(params);
  },
  showSuccessMessage: function(message){
    var params = {
      "messageDiv": ".messageDiv",
      "status": "0000",
      "message":message
    };
    commonUIDisplay(params);
  },
  showErrorMessage: function(message){
    var params = {
      "messageDiv": ".messageDiv",
      "status": "ERROR",
      "message":message
    };
    commonUIDisplay(params);
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
        //console.log("role="+role.permissions[i].screenId);
        screenId.push(role.permissions[i].screenId) ;
     }

     return screenId;
   },
   isReadOnlyScreen:function() {
     var screenId = appstate.screenLookup.attr("screenid") ;
     return screenPermission.formRequestDetails(screenId);
   }

};

var commonUIDisplay  = function(params){

  if(params.timer == undefined){
    params["timer"] = false;
  }

  var className = 'errorMessage';
  if(params.status === '0000' ||  params.status === 'SUCCESS' || params.status === "SUCCESS" ){
    className= 'successMessage';
  }


  if($(params.messageDiv).is(':visible')){
    $(params.messageDiv).html("").hide();
  }
  $(params.messageDiv).html("<label class='"+className+"'>"+params.message+"<a href='#' id='messageClose' class='close messageClose'> &times;</a></label>").show();

  if($(".messageClose").is(':visible')){
    $(".messageClose").on("click", function(){
      $(params.messageDiv).hide();
    });
  }

  if(params.timer){
    setTimeout(function() {
      $(params.messageDiv).hide();
    }, 2000);
  }



}


export default rinsCommonUtils;
