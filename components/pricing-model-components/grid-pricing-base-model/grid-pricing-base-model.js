import _ from 'lodash';
import Grid from 'components/grid/';
import stache from 'can/view/stache/';
import styles from './grid-pricing-base-model.less!';

/* Extend grid with the columns */
var GridPricingBaseModel = Grid.extend({
  tag: 'rn-grid-pricing-base-model',
  scope: {
    columns: [
      {
        id: 'contentGroup',
        title: 'Content Type'
      },
      {
        id: 'baseRate',
        title: 'Base Rate(%)'
      },
      {
        id: 'minima',
        title: 'Minima'
      },
      {
        id: 'listenerMinima',
        title: 'Listener Hours Minima'
      },
      {
        id: 'discount',
        title: 'Discount(%)'
      },
      {
        id: 'isDefault',
        title: 'Is Default'
      }
    ]
  }
})
export default GridPricingBaseModel;
