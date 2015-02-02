import _ from 'lodash';
import Grid from 'components/grid/';
import stache from 'can/view/stache/';
import styles from './grid-report-congifuration.less!';
import template from './template.stache!';

var GridReportConfig =
/* Extend grid with the columns */
Grid.extend({
  tag: 'rn-grid-report-configuration',
  template: template,
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
