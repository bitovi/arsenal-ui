import _ from 'lodash';
import Grid from 'components/grid/';
import stache from 'can/view/stache/';

var GridReportConfig =
/* Extend grid with the columns */
Grid.extend({
  scope: {
    columns: [
      {
        id: 'reportType',
        title: 'Report Type'
      }
    ]
  }
});

export default GridReportConfig;
