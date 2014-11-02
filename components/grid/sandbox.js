import $ from 'jquery';
import stache from 'can/view/stache/';
import Grid from './grid';

/* Extend grid with the columns */
Grid.extend({
  scope: {
    columns: [
      {
        id: 'licensor',
        title: 'Licensor',
        value: function(row) { return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}} {{licensor}}')({licensor: row.licensor, isChild: row.__isChild}); }
      },
      {
        id: 'type',
        title: 'Type',
        value: function(row) { return 'Payment'; }
      },
      {
        id: 'description',
        title: 'Description'
      },
      {
        id: 'region',
        title: 'Region'
      }
    ]
  }
});

var rows = new can.List(_.times(10, i => {
  return {
    licensor: 'Licensor ' + (i + 1),
    type: 'Payment',
    description: 'Invoice #' + (i + 1),
    region: 'Europe',
    '__isChild': (i % 3) !== 0
  };
}));

$('#sandbox').append(stache('<rn-grid rows="{rows}"></rn-grid>')({rows}));
