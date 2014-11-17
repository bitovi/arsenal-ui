import $ from 'jquery';
import stache from 'can/view/stache/';
import ScrollingGrid from './scrolling-grid';

/* Extend grid with the columns */
ScrollingGrid.extend({
  scope: {
    columns: [
      {
        id: 'index',
        title: '#'
      },
      {
        id: 'text',
        title: 'Text'
      },
      {
        id: 'text',
        title: 'Text'
      },
      {
        id: 'text',
        title: 'Text'
      }
    ]
  }
});

var rows = new can.List(_.times(50, i => {
  return {
    index: i,
    text: 'Row ' + i
  };
}));

$('#sandbox').append(stache('<rn-scrolling-grid-example rows="{rows}"></rn-scrolling-grid-example>')({rows}));
