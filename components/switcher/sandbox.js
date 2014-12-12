import $ from 'jquery';
import stache from 'can/view/stache/';
import Switcher from './switcher';

var options = [{
  text: 'Option 1',
  value: 'option1'
},{
  text: 'Option 2',
  value: 'option2'
}, {
  text: 'Option 3',
  value: 'option3'
},{
  text: 'Option 4',
  value: 'option4'
}];

var state = new can.Map({
  options: options,
  selectedThing: options[3]
});

$('#sandbox').append(stache('<rn-switcher options="{options}" selected-option="{selectedThing}"></rn-switcher>{{selectedThing.text}}')(state));
