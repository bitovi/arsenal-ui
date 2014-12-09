import Component from 'can/component/';

import template from './template.stache!';
import styles from './header-navigation.less!';

import GlobalParameterBar from 'components/global-parameter-bar/';


var headerNavigation = Component.extend({
    tag: 'header-navigation',
    template: template,
    scope: {
        appstate: undefined,// this gets passed in
        show:true
    },
    helpers: {
        isActive: function(pageName) {
            $('.popover').popover('destroy');/*To remove popover when going to other page*/
            return 'class="' + (pageName === this.appstate.attr('page') ? 'active' : '') + '"'
        },
        renderGlobalSearch: function(){
            //Used for appear/di-appear of the Global search, whic is based appstate.renderGlobalSearch
            //return 'style="' + (this.appstate.attr('renderGlobalSearch') ? '' : 'display:none') + '"'
        }
    },
    events:{
        init:function(){

        }
    }
});

export default headerNavigation;