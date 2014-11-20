import $ from 'jquery';
import stache from 'can/view/stache/';
import WorkflowDisplay from './workflow-display';

import WorkflowStep from 'models/workflow-step/';
import _fixtures from 'models/fixtures/';

WorkflowStep.findAll({workflowInstanceId: 0}).then(function(steps) {
  var scope = new can.Map({
    steps
  });

  $('#sandbox').append(stache('<rn-workflow-display steps="{steps}"></rn-workflow-display>')(scope));
});
