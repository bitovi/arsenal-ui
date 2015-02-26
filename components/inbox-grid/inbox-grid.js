import _ from 'lodash';
import gridtemplate from './gridtemplate.stache!';
import stache from 'can/view/stache/';
import formats from 'utils/formats';
import _less from './inbox-grid.less!';
import ScrollingGrid from 'components/grid/examples/scrolling-grid/';
import commonUtils from 'utils/commonUtils';

var InboxGrid = ScrollingGrid.extend({
  tag: 'rn-inbox-grid',
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
      id: 'createdBy',
      title: 'Initiated By',
      contents: row => row.createdBy || ''
    }, {
      id: 'pendingDays',
      title: 'Pending',
      sortable: true,
      contents: row => row.pendingDays + ' Day' + (row.pendingDays === 1 ? '' : 's')
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
    },  {
      id: 'previousApprover',
      title: 'Previous Approver',
      contents: row => row.previousApproverName || ''
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
            parentScopeVar.attr('inboxOffset', (parseInt(offsetVal)+10));
            parentScopeVar.attr('inboxScrollTop', (tbody[0].scrollHeight-200));
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
    "tbody tr dblclick": function(el, ev){
      var row = el.data('row').row;
      console.log(" Clicked "+row.tableName+", value :"+row.tableValue);

      if(row.tableName === 'RINS_PMT_BUNDLE'){
        var data = {bundleId:row.tableValue,loadedFrom:"dashboard"};
        this.scope.appstate.screenLookup.attr("PBR" ,data);
        console.log(" Bundle Id Selected :  "+this.scope.appstate.screenLookup.PBR.bundleId);
        commonUtils.navigateTo("payment-bundles");
      }
      if(row.tableName === 'RINS_REF_ENTITY'){
        var data = {  tableName:row.tableName, tableId: row.tableValue, user:row.createdBy};
        console.log(" Entity Id :  "+ row.tableValue);
        this.scope.appstate.attr("screendetails" ,data);
        commonUtils.navigateTo("licensor");
      }
      if(row.tableName === 'RINS_REF_COUNTRY'){
        var data = {  tableName:row.tableName, tableId: row.tableValue, user:row.createdBy};
        this.scope.appstate.attr("screendetails" ,data);
        console.log(" Country Id :  "+ row.tableValue);
        commonUtils.navigateTo("ref-country");
      }
      if(row.tableName === 'RINS_REF_ENTITY_COUNTRY'){
        var data = {  tableName:row.tableName, tableId: row.tableValue, user:row.createdBy};
        this.scope.appstate.attr("screendetails" ,data);
        console.log(" Entity Country Id :  "+ row.tableValue);
        commonUtils.navigateTo("ref-licensorcountry");
      }

    },
    ".rn-grid>thead>tr>th click": function(item, el, ev) {
        var self = this;
        var parentScopeVar = self.element.closest('rn-dashboard-approvals').scope();  //console.log($(item[0]).attr("class"));
        var val = $(item[0]).attr("class").split(" ");
        var existingSortColumns = parentScopeVar.sortColumns.attr();
        var existingSortColumnsLen = existingSortColumns.length;
        var existFlag = false;
        var sortAttr = val[0];

        if (sortAttr === "createdBy" || sortAttr === "approvalStage") {
          commonUtils.showErrorMessage("SortBy not permitted for Initiated-By & Approvals.");
          return false;
        } else {
          commonUtils.hideUIMessage();
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
        parentScopeVar.attr('mailboxType', 'inbox');
        parentScopeVar.attr('sortColumns', parentScopeVar.attr('sortColumns'));
        //self.scope.attr('sortcolumnnames',parentScopeVar.attr('sortColumns'));
        parentScopeVar.attr('sortdir', parentScopeVar.attr('sortDirection'));
        //self.scope.attr('sortdir',parentScopeVar.attr('sortDirection'));
        parentScopeVar.attr('inboxOffset', 0);
        parentScopeVar.triggerChild(parentScopeVar);
    }
  }
});

export default InboxGrid;
