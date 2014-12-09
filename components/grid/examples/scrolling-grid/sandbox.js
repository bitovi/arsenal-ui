<<<<<<< HEAD
import _ from 'lodash';
import $ from 'jquery';
import stache from 'can/view/stache/';
import ScrollingGrid from './scrolling-grid';
import _less from './sandbox.less!';
=======
import $ from 'jquery';
import stache from 'can/view/stache/';
import ScrollingGrid from './scrolling-grid';
>>>>>>> dev/claim-country-more

/* Extend grid with the columns */
ScrollingGrid.extend({
  scope: {
    columns: [
      {
        id: 'index',
        title: '#'
      },
      {
        id: 'text1',
        title: 'Text 1'
      },
      {
        id: 'text2',
        title: 'Text 2'
      },
      {
        id: 'text3',
        title: 'Text 3'
      }
    ],
    atBottomHandler: function(done) {
      rows.push.apply(rows, _.times(50, i => {
        return {
          index: i,
          text1: 'Row ' + i,
          text2: 'Row ' + _.random(0, 1000000000),
          text3: 'Row ' + i
        };
      }));
      done();
    }
  }
});

var rows = new can.List(_.times(50, i => {
  return {
    index: i,
    text1: 'Row ' + i,
    text2: 'Row ' + _.random(0, 1000000000),
    text3: 'Row ' + i
  };
}));

$('#sandbox').append(stache('<rn-scrolling-grid-example rows="{rows}"></rn-scrolling-grid-example>')({rows}));
