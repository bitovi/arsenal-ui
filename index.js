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
import Alert from 'components/alert/';

// Models
import appstate from 'models/appstate/';

// Util
import URLs from 'utils/urls';
import requestHelper from 'utils/request/';

// App
import index_template from 'index.stache!';
import less_common from 'common.less!';
import less_index from 'index.less!';

// Fixtures?
//import _fixtures from 'models/fixtures/';


appstate.bind('page', function(ev, newVal, oldVal) {
  newVal = newVal || appstate.constuctor.prototype.defaults.page;

  System.import('components/page-' + newVal + '/').then(function(pageComponent) {
    var template = '<page-' + newVal + ' appstate=  "{appstate}"></page-' + newVal + '>';
    $('#page').html(can.stache(template)({appstate: appstate}));
  }).catch(function(ex) {
    // TODO: Do something more intelligent with miss cases, like defaulting to the Dashboard.
    $('#page').html('<p class="error">Invalid page!</p>');
    console.log(ex);
    console.error('Invalid page linked!');
    throw ex;
  });
});

$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
 //FIX: <rdar://problem/19231697> Wave M2 : Invoice Entry/iCSV Entr
 //skip for multipart/form-data
 if(!options.data || options.data.constructor === FormData) {
   return;
 }

 // Otherwise, every domain service call requires some common params, so we do them here to save effort.
 if( options.url.indexOf(URLs.DOMAIN_SERVICE_URL) === 0 ||
     options.url.indexOf(URLs.UI_SERVICE_URL) === 0 ||
     options.url.indexOf(URLs.INTEGRATION_SERVICE_URL) === 0
 ) {
   var data = (options.data.constructor === String ? JSON.parse(options.data) : options.data);
   can.extend(data, requestHelper.formRequestDetails({}, appstate));
   options.data = JSON.stringify(data);
   options.contentType = 'application/json';
 }
});

// Every time a service fails, display an error with the error text.
$(document).ajaxComplete(function(ev, xhr, options) {
  // ony do this for regular requests
  if(options.contentType !== 'application/json') {
    return;
  }
  var response = xhr.status === 200 ? JSON.parse(xhr.responseText) : null,
      error;

  if(xhr.status !== 200) {
    error = xhr.status + ' ' + xhr.statusText;
  } else if(response.status !== 'SUCCESS') {
    error = response.responseText;
  }

  if(error) {
    var url = options.url.substr(options.url.indexOf('/', 8)); // the "8" offset avoids https://
    Alert.displayAlert(url + ': ' + error, 'warning');
  }
});

$(document.body).append(index_template({appstate: appstate}));

appstate.startRouting();

// TODO: REMOVE BEFORE DEPLOYING
// FOR DEV ONLY
window.AppState = appstate;
