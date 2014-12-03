var utils={
getQuarter:function(periodFrom,periodTO){
  //console.log(periodFrom);
  //console.log(periodTO);
   var obj=[];
    var qFrom = periodFrom.substring(1, 2);
    var qTo = periodTO.substring(1, 2);
    var yearFrom = periodFrom.substring(periodFrom.length, periodFrom.length-2);
    var yearTo = periodTO.substring(periodTO.length, periodTO.length-2);  
    if(qFrom == qTo && yearFrom == yearTo){
        var sam = "Q"+qFrom+"FY"+yearFrom;
        obj.push(sam);
    } else if(yearFrom < yearTo){
         var count=0;
         for(var i=yearFrom;i<=yearTo;i++){
             var quarterTo = qTo;
             if(i != yearTo){
                quarterTo = 4;  
             }
              if(count>0){
               qFrom =1;  
             }
             for(var j = qFrom ; j <= quarterTo; j++){
                obj.push("Q"+j+"FY"+i);
            }
            count = count+1;  
         }
    }else{
        for(var i = qFrom ; i <= qTo; i++){
               obj.push("Q"+i+"FY"+yearFrom);
            }
    }
    return obj;
},
frameCreateRequest:function(request,onAccountRows,documents,comments,quarters,paymentBundleNameText){
var onAccountCreateRequest ={};

    onAccountCreateRequest.searchRequest = {};
    onAccountCreateRequest.searchRequest.regionId=request.searchRequest.regionId;
    onAccountCreateRequest.searchRequest.serviceTypeId="1";

    onAccountCreateRequest.onAccount={};
    onAccountCreateRequest.onAccount.bundleName=paymentBundleNameText;

    //console.log('documents');
    //console.log(documents);

    onAccountCreateRequest.onAccount.onAccountDetails=[];
    onAccountCreateRequest.onAccount.comments=[];
    onAccountCreateRequest.onAccount.documents=[];

    //console.log(onAccountRows.rows);
    var rows = onAccountRows.rows;

    //framing the onAccountDetails--start
    if(rows != null && rows.length >0){
        var licensorName="";
        for(var i=0; i < rows.length;i++){
           if(rows[i].__isChild){
                // var onAccountDetails={};
                // onAccountDetails.entityId=rows[i].entityId;
                // onAccountDetails.entityName=licensorName;
                // onAccountDetails.contentGroupId=request.searchRequest.contentGrpId[0];
                // onAccountDetails.currencyCode=rows[i].currency;
                // onAccountDetails.periodType="Q";

                var periodMap = {};
                for(var k=0;k<quarters.length;k++)
                {
                    var onAccountDetails={};
                    onAccountDetails.entityId=rows[i].entityId;
                    onAccountDetails.entityName=licensorName;
                    onAccountDetails.contentGroupId=request.searchRequest.contentGrpId[0];
                    onAccountDetails.currencyCode=rows[i].currency;
                    onAccountDetails.periodType="Q";
                    var period = this.getPeriodForQuarter(quarters[k]);
                    onAccountDetails.fiscalPeriod=period+'';
                    onAccountDetails.onAccountAmt=rows[i][quarters[k]];
                    onAccountCreateRequest.onAccount.onAccountDetails.push(onAccountDetails);
                }

                //onAccountDetails.periodMap=periodMap;
                //onAccountCreateRequest.onAccount.onAccountDetails.push(onAccountDetails);
           }else{
            // console.log(rows[i]['licensor']);
            licensorName=rows[i].licensor;
           }
           
        }
     }

    if(comments != null && comments.length>0 ){
        var commentobj={};
        commentobj.comments=comments;
        commentobj.createdBy="";
        commentobj.createdDate=Date.now();
        onAccountCreateRequest.onAccount.comments.push(commentobj);    
    }
    
    if(documents!= null && documents.length>0){
        for(var i=0;i<documents.length;i++){
            var documentsObj={};
            documentsObj.fileName=documents[0].fileName;
            documentsObj.location=documents[0].filePath;
            documentsObj.createdDate=Date.now();
            onAccountCreateRequest.onAccount.documents.push(documents);
        }
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
    //console.log(quart);
    //console.log(periods);
    return  '20'+year+periods[quart];
},
frameDeleteRequest:function(rowsToBedeleted,comments){
    var onAccountDeleteRequest ={};

    onAccountDeleteRequest.searchRequest = {};

    onAccountDeleteRequest.onAccount={};
    onAccountDeleteRequest.onAccount.bundleId="";
    onAccountDeleteRequest.onAccount.bundleName="";

    onAccountDeleteRequest.onAccount.onAccountDetails=[];
    onAccountDeleteRequest.onAccount.comments=[];
    onAccountDeleteRequest.onAccount.documents=[];

    if(rowsToBedeleted != null && rowsToBedeleted.length >0){
        for(var i=0; i < rowsToBedeleted.length;i++){
            var onAccountDetails={};
            onAccountDetails.id=rowsToBedeleted[i].id;
            onAccountDetails.bundleId=rowsToBedeleted[i].bundleId;
            onAccountDetails.bundleName=rowsToBedeleted[i].bundleName;
            onAccountDetails.currencyCode=rowsToBedeleted[i].Currency;
            onAccountDetails.fiscalPeriod="";
            onAccountDetails.onAccountAmt="";
            onAccountDetails.commentId="";
            onAccountDetails.countryId="";
            onAccountDetails.entityName=rowsToBedeleted[i].Licensor;
            onAccountDetails.entityId=rowsToBedeleted[i].entityId;
            onAccountDetails.contentGroupId=rowsToBedeleted[i].contentGroupId;
            onAccountDetails.periodType="Q";
            onAccountDetails.createdBy=rowsToBedeleted[i].createdBy;
            onAccountDetails.createdDate=rowsToBedeleted[i].createdDate;
            onAccountDetails.modifiedBy=rowsToBedeleted[i].createdBy;
            onAccountDetails.modifiedDate=Date.now();
            onAccountDetails.serviceTypeId=rowsToBedeleted[i].serviceTypeId;
            onAccountDetails.status="I";

           onAccountDeleteRequest.onAccount.onAccountDetails.push(onAccountDetails);
        }
     }
     return onAccountDeleteRequest;
},
getRow:function(rows,id){
    for(var i=0;i<rows.length;i++){
        if(id == rows[i].id){
            return rows[i];
        }
    }
    return null;
}

    
};

export default utils;