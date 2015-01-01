import appstate from 'models/appstate/';

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
  }
};


export default rinsCommonUtils;
