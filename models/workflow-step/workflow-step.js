import $ from 'jquery';
import Model from 'can/model/';

var WorkflowStep = Model.extend({
  id: 'stepId',
  parseModels: 'nodes',
  findAll: function(params) {
    return $.ajax({
      url: 'localhost:8090/rins/rinsworkflow/view',
      type: 'POST',
      data: {
        workflowInstanceId: params.workflowInstanceId
      }
    });
  }
}, {});

export default WorkflowStep;
