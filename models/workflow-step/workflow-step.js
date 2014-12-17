import $ from 'jquery';
import Model from 'can/model/';
import URLs from 'utils/urls';

var WorkflowStep = Model.extend({
  id: 'stepId',
  parseModels: 'workflowView.nodes',
  findAll: function(params) {
    return $.ajax({
      url: URLs.INTEGRATION_SERVICE_URL + 'rinsworkflow/view',
      type: 'POST',
      data: {
        workflowName: "PaymentBundleWorkflow",
        workflowInstanceId: params.workflowInstanceId
      },
      processData: false
    });
  }
}, {});

export default WorkflowStep;
