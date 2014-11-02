import _less from './grid-with-footer.less!';
import footerTemplate from './footer.stache!';
import Grid from '../../grid';

var GridWithFooter = Grid.extend({
  tag: 'rn-footer-grid-example',
  helpers: {
    tfoot: function() {
      // `this` is the scope of the grid template
      return footerTemplate(this);
    }
  }
});

export default GridWithFooter;
