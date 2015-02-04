import appstate from 'models/appstate/';
import constants from 'utils/constants';

var rinsCommonUtils = {
  triggerGlobalSearch:function (){
    if(appstate.attr('globalSearch')){
      appstate.attr('globalSearch', false);
    }else{
      appstate.attr('globalSearch', true);
    }
  },
  navigateTo:function(page){
    appstate.attr('page', page);
    appstate.attr('navigationRequired', true);
    appstate.attr('navigationRequired', false);
  },
  displayUIMessage : function(statusCode,message){

    var className = 'errorMessage';
    if(statusCode === '0000'){
      className= 'successMessage';
    }

    $("#messageDiv").html("<label class='"+className+"' style='padding: 0px 15px;'>"+message+"</label>")
    $("#messageDiv").show();

    setTimeout(function(){
      $("#messageDiv").hide();
    },constants.MESSAGE_DISPLAY_TIME);
  },
  displayUIMessageWithDiv : function(messageDiv, status,message){

    var className = 'errorMessage';
    if(status === 'SUCCESS'){
      className= 'successMessage';
    }

    $(messageDiv).html("<label class='"+className+"' style='padding: 0px 15px;'>"+message+"</label>")
    $(messageDiv).show();

    setTimeout(function(){
      $(messageDiv).hide();
    },constants.MESSAGE_DISPLAY_TIME);
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
  }


};


export default rinsCommonUtils;
