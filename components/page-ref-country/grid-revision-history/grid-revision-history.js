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
          else if(row.status == "I")
          return "InActive";
          else if(row.status == "N")
            return "New";
        }
      },
      {
        id: 'commentText',
        title: 'Comments',
        contents: function(row) {
          if(row.commentList != undefined && row.commentList != null && row.commentList.length > 0 ) {
            return row.commentList[0].comments;
          } else {
            return "";
          }
          
        }
      }
    ]
  }
});


export default GridRevisionHistory;
