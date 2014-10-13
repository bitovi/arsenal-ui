// jQuery
import $ from 'jquery';
// Bootstrap
import bootstrap from 'bootstrap';
import css_bootstrap from 'bootstrap.css!';

// CanJS
import can from 'can/';
import can_stache from 'can/view/stache/';

// Components
import headerNavigation from 'components/header-navigation/';

// Models
import appstate from 'models/appstate/';

// App
import index_template from 'index.stache!';
import less_index from 'index.less!';

appstate.bind('page', function(ev, newVal, oldVal) {
  newVal = newVal || appstate.constuctor.prototype.defaults.page;

  System.import('components/page-' + newVal + '/').then(function(pageComponent) {
    var template = '<page-' + newVal + '></page-' + newVal + '>';
    $('#page').html(can.stache(template)());
  }).catch(function(ex) {
    // TODO: Do something more intelligent with miss cases, like defaulting to the Dashboard.
    $('#page').html('<p class="error">Invalid page!</p>');
    console.error('Invalid page linked!');
  });
});

$(document.body).append(index_template({appstate: appstate}));

appstate.startRouting();
