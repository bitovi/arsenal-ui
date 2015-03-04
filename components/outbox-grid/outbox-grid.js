import ScrollingGrid from 'components/grid/examples/scrolling-grid/';
import gridtemplate from './gridtemplate.stache!';
import stache from 'can/view/stache/';
import formats from 'utils/formats';
import _less from './outbox-grid.less!';
import Approval from 'models/approval/';
import commonUtils from 'utils/commonUtils';

import EmailConfirmModal from 'components/email-confirm-modal/';

var OutboxGrid = ScrollingGrid.extend({
  tag: 'rn-outbox-grid',
  appstate:undefined,
  template: gridtemplate,
  scope: {
    columns: [{
      id: 'type',
      title: 'Type',
      sortable: true
    }, {
      id: 'region',
      title: 'Region',
      sortable: true
    }, {
      id: 'description',
      title: 'Description',
      sortable: true
    }, {
      id: 'pendingGroupName',
      title: 'Currently With',
      sortable: true,
      contents: function(row) { //we are hoping that these values will not change from DS.
        if (row.pendingGroupName == 'RINS-BusinessManager'){
          return 'Business';
        }else if (row.pendingGroupName == 'RINS-FinanceApprover'){
          return 'Finance Analyst';
        }else if (row.pendingGroupName == 'RINS-FinanceController'){
          return 'Controller';
        }else{
          return '';
        }
      }
    }, {
      id: 'pendingDays',
      title: 'Pending',
      sortable: true,
      contents: row => row.pendingDays + ' Day' + (row.pendingDays === 1 ? '' : 's')
    },  {
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
      sortable: true
    }, {
      id: 'remind',
      title: 'Remind',
      contents: function(row) {
        return stache('<span class="name">{{previousApprover}}</span><img class="remind" src="/resources/images/rn_NotifyActive@2x.png"/>')(row);
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
          if(tbody[0].scrollTop + tbody[0].clientHeight >= tbody[0].scrollHeight-1  && parentScopeVar.outboxRows.recordsAvailable) {

            var offsetVal = parentScopeVar.attr('outboxOffset');

            $("#outboxGrid").prepend("<div class='loading_img'></div>");

            /* Reset the offset value and call the webservice to fetch next set of records */
            parentScopeVar.attr('mailboxType', 'outbox');
            parentScopeVar.attr('outboxOffset', (parseInt(offsetVal)+10));
            parentScopeVar.attr('outboxScrollTop', (tbody[0].scrollHeight-200));
            parentScopeVar.appstate.attr('globalSearchButtonClicked', false);
            parentScopeVar.attr('sortBy', parentScopeVar.attr('sortColumns')[0]);
            parentScopeVar.attr('sortDirection',parentScopeVar.attr('sortDirection') );

            /* The below code calls {scope.appstate} change event that gets the new data for grid*/
            /* All the neccessary parameters will be set in that event */
           if(parentScopeVar.appstate.attr('globalSearch')){
              parentScopeVar.appstate.attr('globalSearch', false);
            }else{
              parentScopeVar.appstate.attr('globalSearch', true);
            }
          }
        });
    },
    ".rn-grid>thead>tr>th click": function(item, el, ev) {
        var self = this;
        var parentScopeVar = self.element.closest('rn-dashboard-approvals').scope();  //console.log($(item[0]).attr("class"));
        var val = $(item[0]).attr("class").split(" ");
        var existingSortColumns = parentScopeVar.sortColumns.attr();
        var existingSortColumnsLen = existingSortColumns.length;
        var existFlag = false;
        var sortAttr = val[0];

        if (sortAttr === "approvalStage" || sortAttr === "remind") {
          commonUtils.showErrorMessage("SortBy not permitted for Approvals, Remind");
          return false;
        }

        if (existingSortColumnsLen == 0) {
          parentScopeVar.attr('sortColumns').push(sortAttr);
        } else {
          for (var i = 0; i < existingSortColumnsLen; i++) {
            /* The below condition is to selected column to be sorted in asc & dec way */
            console.log(val[0] + "," + existingSortColumns[i])
            if (existingSortColumns[i] == val[0]) {
              existFlag = true;
            }
          }
          if (existFlag == false) {
            parentScopeVar.attr('sortColumns').replace([]);
            parentScopeVar.attr('sortColumns').push(sortAttr);
          } else {
            var sortDirection = (parentScopeVar.attr('sortDirection') == 'asc') ? 'desc' : 'asc';
            parentScopeVar.attr('sortDirection', sortDirection);
          }
        }

        parentScopeVar.attr('mailboxType', 'outbox');
        parentScopeVar.attr('sortColumns', parentScopeVar.attr('sortColumns'));
        //self.scope.attr('sortcolumnnames',parentScopeVar.attr('sortColumns'));
        parentScopeVar.attr('sortdir', parentScopeVar.attr('sortDirection'));
        //  self.scope.attr('sortdir',parentScopeVar.attr('sortDirection'));
        parentScopeVar.attr('outboxOffset', 0);
        parentScopeVar.triggerChild(parentScopeVar);
    }
  }
});

export default OutboxGrid;
