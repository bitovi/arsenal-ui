import Component from 'can/component/';
import RinsCommon from 'utils/urls';

import template from './template.stache!';
import styles from './page-logout.less!';


var page = Component.extend({
  tag: 'page-logout',
  template: template,
  init: function() {
    appstate.attr('userInfo',undefined);
  //console.log("I am herea ");
  var backlen = history.length;
  history.go(-backlen);

  },

  events:{
    '.login click':function(){
      window.location.href = RinsCommon.UI_SERVICE_URL_CONTEXT;
      console.log("Login ");
    }
  }


});


// <SCRIPT LANGUAGE="javascript">
// function ClearHistory()
// {
//      var backlen = history.length;
//      history.go(-backlen);

// }
// </SCRIPT>

export default page;
