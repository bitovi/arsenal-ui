import _ from 'lodash';
import Grid from 'components/grid/';
import stache from 'can/view/stache/';
import styles from './grid-model-society-mapping.less!';
import template from './template.stache!';
import periodWidgetHelper from 'utils/periodWidgetHelpers';

/* Extend grid with the columns */
var GridSocietyModelMapping = Grid.extend({
  tag: 'rn-grid-society-model',
  template: template,
  scope: {
    columns: [
      {
        id: 'society',
        title: 'Society',
        contents: function(row){
          return "<a href='javascript:void(0)' class='society' value='" + row.society + "'>"+row.society+"</a>";
        }
      },
      {
        id: 'model',
        title: 'Model',
        contents: function(row){
          return "<a href='javascript:void(0)' class='pricingModel' value='" + row.modelId +"' >"+row.model+"</a>";
        }
      },
      {
        id: 'version',
        title: 'Version'
      },
      {
        id: 'validFrom',
        title: 'Valid From',
        contents: function(row) {
          return row.validFrom == null || row.validFrom == undefined || row.validFrom == "0"  ? "" : periodWidgetHelper.getDisplayPeriod(row.validFrom,"P");
        }
      },
      {
        id: 'validTo',
        title: 'Valid To',
        contents: function(row) {
          return row.validTo == null || row.validTo == undefined || row.validTo == "0" ? "" : periodWidgetHelper.getDisplayPeriod(row.validTo,"P");
        }
      },
    ]
  }
})
export default GridSocietyModelMapping;
