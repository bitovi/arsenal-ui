import _ from 'lodash';
import Grid from '../grid/';
import stache from 'can/view/stache/';
import formats from 'utils/formats';
import _less from './inbox-grid.less!';

var InboxGrid = Grid.extend({
  tag: 'rn-inbox-grid',
  scope: {
    columns: [{
      id: 'type',
      title: 'Type'
    }, {
      id: 'description',
      title: 'Description'
    }, {
      id: 'region',
      title: 'Region'
    }, {
      id: 'createdBy',
      title: 'Initiated By',
      contents: row => row.createdBy || ''
    }, {
      id: 'previousApprover',
      title: 'Previous Approver',
      contents: row => row.previousApprover || ''
    }, {
      id: 'comments',
      title: 'Comments',
      contents: row => row.comments || ''
    }, {
      id: 'pendingDays',
      title: 'Pending',
      contents: row => row.pendingDays + ' Day' + (row.pending === 1 ? '' : 's')
    }, {
      id: 'approvalStage',
      title: 'Approvals',
      contents: function(row) {
        var steps = _.times(row.totalLevels, function(n) {
          return '<div class="step' + (n < row.approvedLevels ? ' approved' : '') +'">&nbsp;</div>';
        });
        var connectedSteps = steps.join('<div class="step-connector">&mdash;</div>');
        return stache(connectedSteps)({});
      }
      //contents: row => (row.approvedLevels + ' / ' + row.totalLevels)
    }, {
      id: 'approvalId',
      title: 'Approval ID'
    }]
  },
  helpers: {

  },
  events: {

  }
});

export default InboxGrid;
