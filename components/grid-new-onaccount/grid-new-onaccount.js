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

    var self = this;
    
     var quarters = utils.getQuarter(self.scope.request.searchRequest.periodFrom,self.scope.request.searchRequest.periodTo);

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


      var genObj = {};
      genObj["licensorId"]=self.scope.request.searchRequest.entityId.attr().toString();
       Currency.findAll(UserReq.formRequestDetails(genObj)).then(function(data) {
       //console.log(JSON.stringify(data.attr()));
      // console.log(JSON.stringify(data.licensorCurrencies.attr()));
       var rows = frameRows(data.licensorCurrencies,quarters);
        self.scope.rows.replace(rows);
      });
    },
    events:{
      'inserted': function () {  
      
        },
      "{rows} change": function(){
        $(this.element).trigger('rowsForCopyOnAccount', this.scope.rows);
        //alert($(this.element)))
      }
    }
});

var frameRows=function(data,quarters){
  var rows = new can.List();
  if(data !=null){
    for(var i=0;i<data.length;i++){
      var row ={};
      row.licensor=data[i].licensor;
      row.currency="";
      for(var j=0;j<quarters.length;j++){
        row[quarters[j]]="";
      }
      row.__isChild=false;
      row.total="";
      rows.push(row);

      var currencies = data[i].currencies;
      for(var k=0;k<currencies.length;k++){
        var childrow ={};
        childrow.licensor="";
        childrow.entityId=currencies[k].id;
        childrow.currency=currencies[k].value;  
        for(var z=0;z<quarters.length;z++){
            childrow[quarters[z]]=0;
          }
          childrow.__isChild=true;
          childrow.total=0;
          rows.push(childrow);
      }

    }
  }
  return rows;
}

export default newOnAccountGrid;

