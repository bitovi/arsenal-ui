import _ from 'lodash';
import gridtemplate from './gridtemplate.stache!';
import stache from 'can/view/stache/';
import formats from 'utils/formats';
import _less from './inbox-grid.less!';
import ScrollingGrid from 'components/grid/examples/scrolling-grid/';

var InboxGrid = ScrollingGrid.extend({
  tag: 'rn-inbox-grid',
  template: gridtemplate,
  scope: {
    columns: [{
      id: 'type',
      title: 'Type'
    }, {
      id: 'region',
      title: 'Region'
    }, {
      id: 'createdBy',
      title: 'Initiated By',
      contents: row => row.createdBy || ''
    }, {
      id: 'description',
      title: 'Description'
    },  {
      id: 'previousApprover',
      title: 'Previous Approver',
      contents: row => row.previousApprover || ''
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
    }, {
      id: 'comments',
      title: 'Comments',
      contents: row => row.comments || ''
    }],
    strippedGrid:true
  },
  helpers: {

  },
  events: {
    inserted: function(){
      var self= this;
      var tbody = self.element.find('tbody');

      //setting tbody height - end
      var parentScopeVar = self.element.closest('rn-dashboard-approvals').scope();
      var tableScrollTopVal = parentScopeVar.attr('inboxScrollTop');
      $(tbody[0]).scrollTop(tableScrollTopVal);
      $(tbody).on('scroll', function(ev) {
          if(tbody[0].scrollTop + tbody[0].clientHeight >= tbody[0].scrollHeight-1  && parentScopeVar.inboxRows.recordsAvailable) {

            var offsetVal = parentScopeVar.attr('inboxOffset');

            $("#inboxGrid").prepend("<div class='loading_img'></div>");

            /* Reset the offset value and call the webservice to fetch next set of records */
            parentScopeVar.attr('mailboxType', 'inbox');
            parentScopeVar.attr('inboxOffset', (parseInt(offsetVal)+1));
            parentScopeVar.attr('inboxScrollTop', (tbody[0].scrollHeight-200));
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

export default InboxGrid;
