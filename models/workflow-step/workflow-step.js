import $ from 'jquery';
import Model from 'can/model/';
import URLs from 'utils/urls';

var WorkflowStep = Model.extend({
  id: 'stepId',
  parseModels: 'nodes',
  findAll: function(params) {
    return $.ajax({
      url: URLs.INTEGRATION_SERVICE_URL + 'rinsworkflow/view',
      type: 'POST',
      data: {
        workflowInstanceId: params.workflowInstanceId
      },
      processData: false
    });
  }
}, {});

export default WorkflowStep;
