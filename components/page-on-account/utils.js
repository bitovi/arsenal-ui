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
frameCreateRequest:function(request,onAccountRows,documents,comments,quarters,paymentBundleName){
var onAccountCreateRequest ={};

    onAccountCreateRequest.searchRequest = {};
    onAccountCreateRequest.searchRequest.regionId=request.searchRequest.regionId;
    onAccountCreateRequest.searchRequest.serviceTypeId="";

    onAccountCreateRequest.onAccount={};
    onAccountCreateRequest.onAccount.bundleName=paymentBundleName;

    
    onAccountCreateRequest.onAccount.onAccountDetails=[];
    onAccountCreateRequest.onAccount.comments=[];
    onAccountCreateRequest.onAccount.documents=[];

    console.log(onAccountRows.rows);
    var rows = onAccountRows.rows;

    //framing the onAccountDetails--start
    for(var i=0; i<rows.length;i++){
        var licensorName="";
       if(rows[i].__isChild){
            var onAccountDetails={};
            onAccountDetails.entityId="";
            onAccountDetails.entityName=licensorName;
            onAccountDetails.contentGroupId="";
            onAccountDetails.currencyCode=rows[i].currency;
            onAccountDetails.periodType="Q";

            // console.log(quarters);
            // console.log(rows[i]);

            var periodMap = {};
            for(var k=0;k<quarters.length;k++)
            {
                // console.log(rows[i]);
                // console.log(quarters[k]);
                // console.log(rows[i][quarters[k]]);
                // console.log('Fiscal period:'+rows[i][quarters[k]]);
                periodMap[quarters[k]]=rows[i][quarters[k]];
            }

            onAccountDetails.periodMap=periodMap;

       }else{
        // console.log(rows[i]['licensor']);
        licensorName=rows[i].licensor;
       }
       onAccountCreateRequest.onAccount.onAccountDetails.push(onAccountDetails);
    }

    if(comments.length>0){
        onAccountCreateRequest.onAccount.comments.push(comments);    
    }
    
    if(documents.length>0){
        onAccountCreateRequest.onAccount.documents.push(documents);
    }

    //console.log('onAccountCreateRequest');
    console.log(JSON.stringify(onAccountCreateRequest));

    return onAccountCreateRequest;
    },
getPeriodForQuarter:function(quarter){
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