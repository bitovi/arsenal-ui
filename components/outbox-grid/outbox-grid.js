import ScrollingGrid from 'components/grid/examples/scrolling-grid/';
import stache from 'can/view/stache/';
import formats from 'utils/formats';
import _less from './outbox-grid.less!';

import EmailConfirmModal from 'components/email-confirm-modal/';

var OutboxGrid = ScrollingGrid.extend({
  tag: 'rn-outbox-grid',
  appstate:undefined,
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
      id: 'comments',
      title: 'Comments'
    }, {
      id: 'pendingDays',
      title: 'Pending',
      contents: row => row.pendingDays + ' Day' + (row.pending === 1 ? '' : 's')
    }, {
      id: 'currentlyWith',
      title: 'Currently With',
      contents: function(row) {
        return stache('<span class="name">{{previousApprover}}</span><button class="remind">Remind</button>')(row);
      }
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
    }]
  },
  helpers: {

  },
  events: {
    '.remind click': function(el, ev) {
      var approval = el.closest('tr').data('row').row;

      $(document.body).append(stache('<rn-email-confirm-modal approval="{approval}"></rn-email-confirm-modal>')({approval}));
    }
  }
});

export default OutboxGrid;
