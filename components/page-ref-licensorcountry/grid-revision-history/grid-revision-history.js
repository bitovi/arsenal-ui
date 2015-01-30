import template from './template.stache!';
import styles from './grid-revision-history.less!';
import _ from 'lodash';
import Grid from 'components/grid/';
import stache from 'can/view/stache/';
import periodWidgetHelper from 'utils/periodWidgetHelpers';

var GridRevisionHistory =
/* Extend grid with the columns */
Grid.extend({
  tag: 'rn-grid-revision-history',
  template: template,
  scope: {
    columns: [
      {
        id: 'id',
        title: 'ID'
      },
      {
        id: 'countryName',
        title: 'Country'
      },
      {
        id: 'entity',
        title: 'Entity'
      },
      {
        id: 'validFrom',
        title: 'Valid From',
        contents: function(row) {
          return row.validFrom == null || row.validFrom == undefined || row.validFrom == "0"  ? "" : periodWidgetHelper.getDisplayPeriod(row.validFrom,"P");
        }
      },
      {
        id: 'validTo',
        title: 'Valid To',
        contents: function(row) {
          return row.validTo == null || row.validTo == undefined || row.validTo == "0" ? "" : periodWidgetHelper.getDisplayPeriod(row.validTo,"P");
        }
      },
      {
        id: 'status',
        title: 'Status',
        contents: function(row) {
          return row.status === "A" ? "Active" : "InActive";
        }
      },
      {
        id: 'commentText',
        title: 'Comments'
      }
    ]
  }
});


export default GridRevisionHistory;
