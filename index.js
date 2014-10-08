// jQuery
import $ from 'jquery';
// Bootstrap
import bootstrap from 'bootstrap';
import css_bootstrap from 'bootstrap.css!';

// CanJS
import can from 'can/';
import can_stache from 'can/view/stache/';

// App
import headerNavigation from 'components/header-navigation/';
import index_template from 'index.stache!';
import less_index from 'index.less!';

$(document.body).append(index_template());
