import _ from 'lodash';

//import FakeModel from './fake-model';

import onAccountBalance from 'models/onAccount/onAccountBalance/';

import _less from './on-account-balance.less!';
import template from './template.stache!';
import Grid from 'components/grid/';

var OnAccountBalance = Grid.extend({
  tag: 'on-account-grid',
  template: template,
  scope: {
    columns: [
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
    ],
    request:{}
    //sample:"@"
  },
  init: function(){

    var self = this;
     console.log(JSON.stringify(self.scope.request.searchRequest.attr()));
     var quarters = getQuarter(self.scope.request.searchRequest.periodFrom,self.scope.request.searchRequest.periodTo);

     for(var i=0;i<quarters.length;i++){
      var column={
        id:quarters[i],
        title:quarters[i]
      };
      self.scope.columns.push(column);
     }

      var balanceColumn={
        id:'onAccountBalance',
        title:'onAccount Bal'
      };
      self.scope.columns.push(balanceColumn);

      var cashAdjustColumn={
        id:'cashAdjust',
        title:'Licensor Cash Adjustment'
      };
      self.scope.columns.push(cashAdjustColumn);



   
     onAccountBalance.findAll().then(function(rows) {
        self.scope.rows.replace(rows);
      });
      //Grid.prototype['inserted'] && Grid.prototype['inserted'].apply(self, arguments);

    },
  events: {
    'inserted': function(ev) {


      // onAccountBalance.findAll().then(function(data) {
        
      //   this.scope.rows.replace(data);
      // });

      // // call super - it's only polite
      // Grid.prototype['inserted'] && Grid.prototype['inserted'].apply(this, arguments);
    },
    '{scope} request change':function(){
      
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

export default OnAccountBalance;
