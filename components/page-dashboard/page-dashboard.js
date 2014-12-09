import Component from 'can/component/';

import GlobalParameterBar from 'components/global-parameter-bar/';
import template from './template.stache!';
import styles from './page-dashboard.less!';

var page = Component.extend({
    tag: 'page-dashboard',
    template: template,
    scope: {},
    init: function(){
        //console.log("inside init");
        this.scope.appstate.attr("renderGlobalSearch",true);

    }
});

export default page;
