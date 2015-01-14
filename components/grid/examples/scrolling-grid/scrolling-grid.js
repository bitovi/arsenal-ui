import _ from 'lodash';
import _less from './scrolling-grid.less!';
import Grid from '../../grid';

var ScrollingGrid = Grid.extend({
  tag: 'rn-scrolling-grid-example',
  scope: {
    atBottom: false,
    // overwrite this when extending to do your work
    atBottomHandler: function(done) {
      done();
    }
  },
  helpers: {
    tableClass: function() {
      return 'scrolling';
    }
  },
  events: {
    'inserted': function(el, ev) {
      // Call super - you should do this if you extend this grid.
      if(_.isFunction(Grid.prototype.events['inserted'])) {
        Grid.prototype.events['inserted'].apply(this.arguments);
      }

      // we have to do this manually because scroll does not bubble
      // normally, you should not attach event handlers this way!
      var component = this;
      var tbody = this.element.find('tbody');
      var doneCallback = function() {
        console.log(" I am here ");
        component.scope.attr('atBottom', false);
      };

      $(tbody).on('scroll', function(ev) {
        if(tbody[0].scrollTop + tbody[0].clientHeight >= tbody[0].scrollHeight) {
          // we are at the bottom
          component.scope.attr('atBottom', true);
          component.scope.atBottomHandler.call(component, doneCallback);
        }
      });
    }
  }
});

export default ScrollingGrid;
