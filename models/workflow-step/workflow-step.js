import $ from 'jquery';
import Model from 'can/model/';
import URLs from 'utils/urls';

var WorkflowStep = Model.extend({
  id: 'stepId',
  parseModels: 'nodes',
  findAll: function(params) {
    return $.ajax({
      url: URLs.UI_SERVICE_URL + 'rins/rinsworkflow/view',
      type: 'POST',
      data: {
        workflowInstanceId: params.workflowInstanceId
      }
    });
  }
}, {});

export default WorkflowStep;
