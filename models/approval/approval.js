import Model from 'can/model/';
import URLs from 'utils/urls';

var Approval = can.Model.extend({
  parseModels: 'approvals',

  findAll: function(params) {
    return $.ajax({
      url: URLs.DOMAIN_SERVICE_URL + 'workflow/analytics/' + (params.mailbox || 'inbox'),
      type: 'POST',
      data: {
        comment: params.comment || null,
        workflowName: params.workflowName || 'myWorkflow',
        workflowInstanceId: params.workflowInstanceId || 0,
        settings: {
          LevelsOfApprovalNeeded: params.levels || 2
        },

        limit: params.limit || 10,
        offset: params.offset || 0
      }
    });
  }

}, {});

export default Approval;
