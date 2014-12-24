import _ from 'lodash';
import $ from 'jquery';
import stache from 'can/view/stache/';
import PaymentChart from './payment-chart';

$('#sandbox').append(stache('<rn-payment-chart title="{title}" value="{value}"></rn-payment-chart>')({
  text: 'WWW',
  value: 100
}));

var charts = _.times(6, function(i) {
  return {
    text: 'EX' + i,
    value: _.random(0, 100)
  };
});

charts.forEach(function(data) {
  $('#sandbox').append(stache('<rn-payment-chart text="{text}" value="{value}"></rn-payment-chart>')(data));
});
