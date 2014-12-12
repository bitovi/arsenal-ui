import Component from 'can/component/';

import template from './template.stache!';
import _less from './switcher.less!';

var Switcher = Component.extend({
  tag: 'rn-switcher',
  template: template,
  scope: {
    options: [/*
    By default:
    {
      text: 'Option 1',
      value: 'option1'
    }
    */],
    textProperty: 'text',
    valueProperty: 'value',
    selectedOption: null
  },
  helpers: {
    optionClass: function(option) {
      return '';
    },
    selectedClass: function(option) {
      this.attr('selectedOption');
      return this.selectedOption === option ? 'selected' : '';
    },
    optionValue: function(option) {
      return (option.attr(this.attr('valueProperty')) || '').toString();
    },
    optionText: function(option) {
      return (option.attr(this.attr('textProperty')) || '').toString();
    }
  },
  events: {
    'li click': function(el, ev) {
      var option = el.data('option');
      this.scope.attr('selectedOption', option);
    }
  }

});

export default Switcher;
