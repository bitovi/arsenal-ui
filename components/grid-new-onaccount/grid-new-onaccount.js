import $ from 'jquery';
import stache from 'can/view/stache/';
import GridWithEditing from './grid-with-editing';
import Currency from 'models/common/currency/';
import UserReq from 'utils/request/';
import utils from 'components/page-on-account/utils';

var newOnAccountGrid = GridWithEditing.extend({
  scope: {
    columns: [
    {
        id: 'toggle',
        title: '<span class="open-toggle-all"></span>',
        editable:false,
        contents: function(row) { return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}}')({isChild: row.__isChild}); }
      },
      {
        id: 'licensor',
        title: 'Licensor',
        editable:false
      },
      {
        id: 'currency',
        title: 'Currency',
        editable:false
      }
    ],
    type:""
  },
  init: function(){

    
    },
    events:{
      'inserted': function () {  
          
          var self = this;
    
     var quarters = self.scope.request.quarters;

     for(var i=0;i<quarters.length;i++){
        var column={
          id:quarters[i],
          title:quarters[i],
           editable:true,
          getEditingValue: function(row,title) {
            return row.attr(title);
          },
          setValue: function(row, newValue,title) {
            row.attr(title,newValue);
          }
        };
        self.scope.columns.push(column);
      }
      
      var totalcolumn={
          id:'total',
          title:'Total',
           editable:false,
          getEditingValue: function(row,title) {
            return row.attr(title);
          },
          setValue: function(row, newValue,title) {
            row.attr(title,newValue);
          }
        };
        self.scope.columns.push(totalcolumn);
        self.scope.quarters.replace(quarters);


      // var genObj = {};
      // genObj["licensorId"]=self.scope.request.searchRequest.entityId.attr().toString();
      //  Currency.findAll(UserReq.formRequestDetails(genObj)).then(function(data) {
      //  //console.log(JSON.stringify(data.attr()));
      // // console.log(JSON.stringify(data.licensorCurrencies.attr()));
      //  var rows = frameRows(data.licensorCurrencies,quarters);
      //   self.scope.rows.replace(rows);
      // });
      self.scope.rows.replace(self.scope.request.rows);

        },
      "{rows} change": function(){
        $(this.element).trigger('rowsForCopyOnAccount', this.scope.rows);
        //alert($(this.element)))
      }
    }
});

export default newOnAccountGrid;

