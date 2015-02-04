import Component from 'can/component/';
import RinsCommon from 'utils/urls';

import template from './template.stache!';
import styles from './page-logout.less!';


var page = Component.extend({
  tag: 'page-logout',
  template: template,
  events:{
    '.login click':function(){
      window.location.href = RinsCommon.UI_SERVICE_URL_CONTEXT;
      console.log("Login ");
    }
  }


});

export default page;
