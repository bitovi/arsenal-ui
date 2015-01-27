import _ from 'lodash';
import Grid from 'components/grid/';
import stache from 'can/view/stache/';
import styles from './grid-model-society-mapping.less!';

/* Extend grid with the columns */
var GridSocietyModelMapping = Grid.extend({
  tag: 'rn-grid-society-model',
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
          if(row.validFrom == null)
            return "";
          else
          return row.validFrom;
        }
      },
      {
        id: 'validTo',
        title: 'Valid To',
        contents: function(row) {
          if(row.validTo == null || row.validTo == "0" )
            return "";
          else
          return row.validTo;
        }
      },
    ]
  }
})
export default GridSocietyModelMapping;
