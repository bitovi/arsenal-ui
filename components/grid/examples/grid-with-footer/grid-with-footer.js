import _less from './grid-with-footer.less!';
import template from './template.stache!';
import Grid from '../../grid';

var GridWithFooter = Grid.extend({
  tag: 'rn-footer-grid-example',
  template: template
});

export default GridWithFooter;
