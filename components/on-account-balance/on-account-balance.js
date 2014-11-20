import _ from 'lodash';

//import FakeModel from './fake-model';

import onAccountBalance from 'models/onAccount/onAccountBalance/';

import _less from './on-account-balance.less!';
import template from './template.stache!';
import Grid from 'components/grid/';

var GridWithCall = Grid.extend({
  tag: 'on-account-grid',
  template: template,
  scope: {
    columns: [
      // {
      //   id: 'toggle',
      //   title: '',
      //   contents: function(row) { return row.__isChild ? '' : '<span class="open-toggle"></span>'; }
      // },
      {
        id: 'Licensor',
        title: 'Licensor'
      },
      {
        id: 'Currency',
        title: 'Currency'
      },
      {
        id: 'ContentType',
        title: 'Content Type'
      }
    ]
  },
  events: {
    'inserted': function(ev) {
      var self = this;
      var obj={id: 'Naveen',
        title: 'Naveen'
      };
      self.scope.columns.replace(obj);

      onAccountBalance.findAll().then(function(rows) {
        // // mangle rows here
        // _.each(rows, function(row, ix) {
        //   row.__isChild = (ix % 3) !== 0;
        // });

        console.log('Got exception');
      //self.scope.columns.push(obj);
        console.log(JSON.stringify((self.scope.columns.attr())));

        // replace them into the scope
        //self.scope.rows.replace(rows);
      });

      // call super - it's only polite
      Grid.prototype['inserted'] && Grid.prototype['inserted'].apply(this, arguments);
    }
  }
});

export default GridWithCall;
