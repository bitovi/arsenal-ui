import Component from 'can/component/';

import template from './template.stache!';
import _less from './workflow-display.less!';

var WorkflowDisplay = Component.extend({
  tag: 'rn-workflow-display',
  template: template,
  scope: {
    steps: null // passed in
  },
  helpers: {
    approvedClass: function(step) {
      return step.state === 'APPROVE' ? 'approved' : 'not-approved';
    },
    notLastArrow: function(step, options) {
      if(step === this.attr('steps')[this.steps.length - 1]) {
        return '';
      } else {
        return options.fn(this);
      }
    }
  },
  events: {
    '{scope} steps': function() { console.log('wds', arguments); }
  }
});

export default WorkflowDisplay;
