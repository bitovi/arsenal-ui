import _ from 'lodash';

import FakeModel from './fake-model';

import _less from './grid-with-call.less!';
import template from './template.stache!';
import Grid from '../../grid';

var GridWithCall = Grid.extend({
  tag: 'rn-call-grid-example',
  template: template,
  scope: {
    columns: [
      {
        id: 'toggle',
        title: '',
        contents: function(row) { return row.__isChild ? '' : '<span class="open-toggle"></span>'; }
      },
      {
        id: 'index',
        title: '#'
      },
      {
        id: 'text',
        title: 'Text'
      }
    ]
  },
  events: {
    'inserted': function(ev) {
      var self = this;

      FakeModel.findAll().then(function(rows) {
        // mangle rows here
        _.each(rows, function(row, ix) {
          row.__isChild = (ix % 3) !== 0;
        });

        // replace them into the scope
        self.scope.rows.replace(rows);
      });

      // call super - it's only polite
      Grid.prototype['inserted'] && Grid.prototype['inserted'].apply(this, arguments);
    }
  }
});

export default GridWithCall;
