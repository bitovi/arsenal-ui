import $ from 'jquery';
import stache from 'can/view/stache/';
import GridWithCheckboxes from './grid-with-checkboxes';

var rows = new can.List(_.times(10, i => {
  return {
    index: i,
    text: 'Row ' + i
  };
}));

var pagestate = new can.Map({
  selectedRows: []
});

// note here that I have to use a dash to trigger camel casing on the checkedRows scope property.
// camel-case-attr <-> camelCaseAttr
$('#sandbox').append(stache(
  '<rn-checkbox-grid-example rows="{rows}" checked-rows="{pagestate.selectedRows}"></rn-checkbox-grid-example>' +
  '<h3>Selected rows: {{pagestate.selectedRows.length}}</h3>'
)({rows, pagestate}));
