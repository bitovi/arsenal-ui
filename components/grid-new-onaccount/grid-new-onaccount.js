import $ from 'jquery';
import stache from 'can/view/stache/';
import GridWithEditing from './grid-with-editing';
//import utils from 'components/page-on-account/utils';

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
        getEditingValue: function(row,column) {
          console.log(column);
          return row.attr(quarters[i]);
        },
        setValue: function(row, newValue) {
          row.attr(quarters[i]);
        }
      };
      self.scope.columns.push(column);

      var rows = new can.List(_.times(2, i => {
        return {
          licensor: 'Licensor ' + (i + 1),
          Q1FY13: '30',
          '__isChild': (i % 2) !== 0
        };
      }));

      self.scope.rows.replace(rows);


     }
    
    }
});

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

