import ScrollingGrid from 'components/grid/examples/scrolling-grid/';
import gridtemplate from './gridtemplate.stache!';
import stache from 'can/view/stache/';
import formats from 'utils/formats';
import _less from './outbox-grid.less!';

import EmailConfirmModal from 'components/email-confirm-modal/';

var OutboxGrid = ScrollingGrid.extend({
  tag: 'rn-outbox-grid',
  appstate:undefined,
  template: gridtemplate,
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
        return stache('<span class="name">{{previousApprover}}</span><button class="remind btn btn-primary btn-custom-small">Remind</button>')(row);
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
    }],
    strippedGrid:true
  },
  helpers: {

  },
  events: {
    '.remind click': function(el, ev) {
      var approval = el.closest('tr').data('row').row;

      $(document.body).append(stache('<rn-email-confirm-modal approval="{approval}"></rn-email-confirm-modal>')({approval}));
    },
    inserted: function(){
      var self= this;
      var tbody = self.element.find('tbody');

      //setting tbody height - end
      var parentScopeVar = self.element.closest('rn-dashboard-approvals').scope();
      var tableScrollTopVal = parentScopeVar.attr('outboxScrollTop');
      $(tbody[0]).scrollTop(tableScrollTopVal);
      $(tbody).on('scroll', function(ev) {
          if(tbody[0].scrollTop + tbody[0].clientHeight >= tbody[0].scrollHeight-1  && parentScopeVar.inboxRows.recordsAvailable) {

            var offsetVal = parentScopeVar.attr('outboxOffset');

            $("#outboxGrid").prepend("<div class='loading_img'></div>");

            /* Reset the offset value and call the webservice to fetch next set of records */
            parentScopeVar.attr('mailboxType', 'outbox');
            parentScopeVar.attr('outboxOffset', (parseInt(offsetVal)+1));
            parentScopeVar.attr('outboxScrollTop', (tbody[0].scrollHeight-200));
            parentScopeVar.appstate.attr('globalSearchButtonClicked', false);

            /* The below code calls {scope.appstate} change event that gets the new data for grid*/
            /* All the neccessary parameters will be set in that event */
           if(parentScopeVar.appstate.attr('globalSearch')){
              parentScopeVar.appstate.attr('globalSearch', false);
            }else{
              parentScopeVar.appstate.attr('globalSearch', true);
            }
          }
        });
    }
  }
});

export default OutboxGrid;
