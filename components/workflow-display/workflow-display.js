import Component from 'can/component/';

import template from './template.stache!';
import _less from './workflow-display.less!';

var WorkflowDisplay = Component.extend({
  tag: 'rn-workflow-display',
  template: template,
  scope: {
    steps: null // passed in,
  },
  helpers: {
    approvedClass: function(step) {
      return step.state === 'APPROVED' ? 'approved' : 'not-approved';
    },
    past: function(step, options) {
      return step.state === 'APPROVED' ? options.fn(this) : '';
    },
    current: function(step, options) {
      var i = 0,
          iteratingStep;
      do {
        iteratingStep = this.attr('steps')[i];
      } while(iteratingStep === 'APPROVED');
      return iteratingStep === step ? options.fn(this) : '';
    },
    future: function(step, options) {
      var i = 0,
      iteratingStep;
      do {
        iteratingStep = this.attr('steps')[i];
      } while(iteratingStep === 'APPROVED');
      return iteratingStep !== step ? options.fn(this) : '';
    },
    notLastArrow: function(step, options) {
      if(step === this.attr('steps')[this.steps.length - 1]) {
        return '';
      } else {
        return options.fn(this);
      }
    }
  }
});

export default WorkflowDisplay;
