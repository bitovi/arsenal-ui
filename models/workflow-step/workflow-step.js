import $ from 'jquery';
import Model from 'can/model/';
import URLs from 'utils/urls';

var WorkflowStep = Model.extend({
  id: 'stepId',
  //parseModels: 'workflowView.nodes',
  loadWorkFlowView: function(params) {
    return $.ajax({
      url: URLs.UI_SERVICE_URL + 'view',
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
