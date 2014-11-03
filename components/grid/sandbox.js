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
        contents: function(row) { return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}} {{licensor}}')({licensor: row.licensor, isChild: row.__isChild}); }
      },
      {
        id: 'type',
        title: 'Type',
        contents: function(row) { return 'Payment'; }
      },
      {
        id: 'description',
        title: 'Description',
        sortable: true,
        compare: function(a, b) { return (a.description < b.description ? -1 : (a.description > b.description ? 1 : 0)); }
      },
      {
        id: 'region',
        title: 'Region',
        sortable: true,
        defaultSortDirection: 'desc'
      }
    ]
  }
});

var rows = new can.List(_.times(10, i => {
  return {
    licensor: 'Licensor ' + (i + 1),
    type: 'Payment',
    description: 'Invoice #' + _.random(1, 1000),
    region: 'Europe ' + _.random(1, 9),
    '__isChild': (i % 3) !== 0
  };
}));

$('#sandbox').append(stache('<rn-grid rows="{rows}"></rn-grid>')({rows}));
