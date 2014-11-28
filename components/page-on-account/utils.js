var utils={
getQuarter:function(periodFrom,periodTO){
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
},
frameCreateRequest:function(){
    
},getPeriodForQuarter:function(quarter){
    var periods={
       "Q1":"03",
        "Q2":"06",
        "Q3":"09",
        "Q4":"12"
    }
    var quart= quarter.substring(0, 2);
    var year= quarter.substring(quarter.length, quarter.length-2);
    console.log(quart);
    console.log(periods);
    return  '20'+year+periods[quart];
}
    
};

export default utils;