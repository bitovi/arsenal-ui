import $ from 'jquery';
import stache from 'can/view/stache/';
import GridWithEditing from './grid-with-editing';

GridWithEditing.extend({
  scope: {
    columns: [
      {
        id: 'index',
        title: '#'
      },
      {
        id: 'name',
        title: 'Name',
        contents: function(row) {
          return row.attr('firstName').substr(0, 1) + '. ' + row.attr('lastName');
        },
        editable: true,
        getEditingValue: function(row) {
          return row.attr('firstName') + ' ' + row.attr('lastName');
        },
        setValue: function(row, newValue) {
          var nameParts = newValue.split(' ');
          row.attr('firstName', nameParts[0]);
          row.attr('lastName',  nameParts[1]);
        }
      }
    ]
  }
})

var firstNames = ['Ed', 'Edna', 'Gwendolyn', 'Ernestine', 'Matt', 'Kyle', 'Raquel', 'Roman', 'Ron', 'Paulette'];
var lastNames = ['Underwood', 'Barker', 'Todd', 'Arnold', 'Campbell', 'Wilkins', 'Jefferson', 'Cannon', 'Lucas', 'Francis'];
var rows = new can.List(_.times(10, i => {
  return {
    index: i,
    firstName: firstNames[i],
    lastName: lastNames[i]
  };
}));

$('#sandbox').append(stache(
  '<rn-editing-grid-example rows="{rows}"></rn-editing-grid-example>'
)({rows}));
