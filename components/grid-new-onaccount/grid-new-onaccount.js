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
    ]
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
      genObj["licensorId"]="18,21";
       Currency.findAll(UserReq.formRequestDetails(genObj)).then(function(data) {
       //console.log(JSON.stringify(data.attr()));
       var rows = frameRows("PAECOL",data,quarters);
        self.scope.rows.replace(rows);
      });
    }
//     events:{
//       'rn-onaccount-balance-grid onSelected': function (ele, event, val) {  
//             console.log('Inside new page');
//              }
//     }
});

var frameRows=function(licensor,data,quarters){
  var rows = new can.List();
  
  var row ={};
  row.licensor=licensor;
  row.currency="";
  for(var i=0;i<quarters.length;i++){
    row[quarters[i]]="";
  }
  row.__isChild=false;
  row.total="";
  rows.push(row);

  for(var i=0; i<data.length;i++){  
    var childrow ={};
    childrow.licensor="";
    childrow.currency=data[i].id;
    for(var k=0;k<quarters.length;k++){
        childrow[quarters[k]]=0;
      }
    childrow.__isChild=true;
    childrow.total=0;
    rows.push(childrow);
  }
  console.log('data created');
 // console.log(rows);
  return rows;
}

export default newOnAccountGrid;

