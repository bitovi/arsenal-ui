import template from './template.stache!';
import styles from './grid-revision-history.less!';
import _ from 'lodash';
import Grid from 'components/grid/';
import stache from 'can/view/stache/';

/* Extend grid with the columns */
var GridRevisionHistory = Grid.extend({
  tag: 'rn-grid-revision-history',
  template: template,
  scope: {
    columns: [
      {
        id: 'id',
        title: 'ID'
      },
      {
        id: 'validFrom',
        title: 'Valid From',
        contents: function(row) {
          if(row.validFrom == null)
            return "";
          else
          return row.validFrom;
        }
      },
      {
        id: 'validTo',
        title: 'Valid To',
        contents: function(row) {
          if(row.validTo == null)
            return "";
          else
          return row.validTo;
        }
      },
      {
        id: 'status',
        title: 'Status',
        contents: function(row) {
          if(row.status == "A")
            return "Active";
          else
          return "InActive";
        }
      },
      {
        id: 'comment',
        title: 'Comments'
      }
    ]
  }
});


export default GridRevisionHistory;
