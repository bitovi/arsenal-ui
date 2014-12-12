import appstate from 'models/appstate/';

var rinsCommonUtils = {
  triggerGlobalSearch:function (){
    if(appstate.attr('globalSearch')){
      appstate.attr('globalSearch', false);
    }else{
      appstate.attr('globalSearch', true);
    }
  }
};


export default rinsCommonUtils;
