import $ from 'jquery';
import stache from 'can/view/stache/';
import GridWithFooter from './grid-with-footer';

/* Extend grid with the columns */
GridWithFooter.extend({
  scope: {
    columns: [
      {
        id: 'index',
        title: '#'
      },
      {
        id: 'text',
        title: 'Text'
      }
    ]
  }
});

var rows = new can.List(_.times(10, i => {
  return {
    index: i,
    text: 'Row ' + i
  };
}));

$('#sandbox').append(stache('<rn-footer-grid-example rows="{rows}"></rn-footer-grid-example>')({rows}));
