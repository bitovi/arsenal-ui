import _ from 'lodash';
import Grid from 'components/grid/';
import stache from 'can/view/stache/';
import styles from './grid-pricing-trackcounts.less!';

/* Extend grid with the columns */
var GridPricingTrackcounts = Grid.extend({
  tag: 'rn-grid-pricing-trackcounts',
  scope: {
    columns: [
      {
        id: 'description',
        title: 'Description'
      },
      {
        id: 'from',
        title: 'From'
      },
      {
        id: 'to',
        title: 'To'
      },
      {
        id: 'minima',
        title: 'Minima'
      }
    ]
  }
})
export default GridPricingTrackcounts;
