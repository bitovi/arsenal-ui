import $ from 'jquery';
import stache from 'can/view/stache/';
import GridWithEditing from './grid-with-editing';
import Currency from 'models/common/currency/';
import UserReq from 'utils/request/';

var newOnAccountGrid = GridWithEditing.extend({
  scope: {
    columns: [
    {
        id: 'toggle',
        title: '<span class="open-toggle-all"></span>',
        contents: function(row) { return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}}')({isChild: row.__isChild}); }
      },
      {
        id: 'licensor',
        title: 'Licensor'
      },
      {
        id: 'currency',
        title: 'Currency'
      }
    ],
    request:{}
  },
  init: function(){

    var self = this;
     //console.log(JSON.stringify(self.scope.request.searchRequest.attr()));
     //var quarters = getQuarter(self.scope.request.searchRequest.periodFrom,self.scope.request.searchRequest.periodTo);
     console.log('Inside new on Account')
     console.log(self.scope.request.searchRequest.periodFrom);

     //var self = this;
     //console.log(JSON.stringify(self.scope.request.searchRequest.attr()));
     var quarters = getQuarter(self.scope.request.searchRequest.periodFrom,self.scope.request.searchRequest.periodTo);

         console.log(quarters);

     for(var i=0;i<quarters.length;i++){
      var column={
        id:quarters[i],
        title:quarters[i],
         editable: true,
        getEditingValue: function(row,title) {
          console.log(title);
          return row.attr(title);
        },
        setValue: function(row, newValue,title) {
          row.attr(title,newValue);
        }
      };

      self.scope.columns.push(column);

      var genObj = {};
      genObj["licensorId"]="18";
       Currency.findAll(UserReq.formRequestDetails(genObj)).then(function(data) {
       console.log(JSON.stringify(data.attr()));
       var rows = frameRows("PAECOL",data,quarters);
        self.scope.rows.replace(rows);
      });

     }
    
    }
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
  rows.push(row);

  for(var i=0; i<data.length;i++){  
    var childrow ={};
    childrow.licensor="";
    childrow.currency=data[i].id;
    for(var k=0;k<quarters.length;k++){
        childrow[quarters[k]]=0;
      }
    childrow.__isChild=true;
    rows.push(childrow);
  }
  console.log('data created');
  console.log(rows);
  return rows;
}



var getQuarter=function(periodFrom,periodTO){
  console.log(periodFrom);
  console.log(periodTO);
   var obj=[];
    var qFrom = periodFrom.substring(1, 2);
    var qTo = periodTO.substring(1, 2);
    var yearFrom = periodFrom.substring(periodFrom.length, periodFrom.length-2);
    var yearTo = periodTO.substring(periodTO.length, periodTO.length-2);  
    if(qFrom == qTo && yearFrom == yearTo){
        var sam = "Q"+qFrom+"FY"+yearFrom;
        obj.push(sam);
    } else if(yearFrom < yearTo){
         for(var i=yearFrom;i<=yearTo;i++){
             var quarterTo = qTo;
             if(i != yearTo){
                quarterTo = 4;  
             }
             for(var j = qFrom ; j <= quarterTo; j++){
                obj.push("Q"+j+"FY"+i);
            }
         }
    }else{
        for(var i = qFrom ; i <= qTo; i++){
               obj.push("Q"+i+"FY"+yearFrom);
            }
    }
    return obj;
}

export default newOnAccountGrid;

