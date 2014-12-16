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
frameCreateRequest:function(request,onAccountRows,documents,comments,quarters,paymentBundleNameText,bundleId){
var onAccountCreateRequest ={};
    onAccountCreateRequest.searchRequest = {};
    onAccountCreateRequest.searchRequest.regionId=request.searchRequest.regionId;
    onAccountCreateRequest.searchRequest.serviceTypeId=request.searchRequest.serviceTypeId;
    onAccountCreateRequest.onAccount={};
    onAccountCreateRequest.onAccount.bundleName=paymentBundleNameText;
    if(bundleId !=null && bundleId != undefined){
      onAccountCreateRequest.onAccount.bundleId=bundleId;
    }
    onAccountCreateRequest.onAccount.onAccountDetails=[];
    onAccountCreateRequest.onAccount.comments=[];
    onAccountCreateRequest.onAccount.documents=[];

 //   console.log("rows "+onAccountRows.rows);
    var rows = onAccountRows.rows;
    //framing the onAccountDetails--start
    if(rows != null && rows.length >0){
        var licensorName="";
        for(var i=0; i < rows.length;i++){
           if(rows[i].__isChild){
                var periodMap = {};
                for(var k=0;k<quarters.length;k++)
                {
                    var onAccountDetails={};
                    onAccountDetails.entityId=rows[i].entityId;
                    onAccountDetails.entityName=licensorName;
                    onAccountDetails.contentGroupId=request.searchRequest.contentGrpId[0];
                    onAccountDetails.currencyCode=rows[i].currency;
                    onAccountDetails.periodType=this.getOnAccountPeriodType();
                    var period = this.getPeriodForQuarter(quarters[k]);
                    onAccountDetails.fiscalPeriod=period+'';
                    onAccountDetails.onAccountAmt=rows[i][quarters[k]];
                    onAccountCreateRequest.onAccount.onAccountDetails.push(onAccountDetails);
                }
           }else{
            licensorName=rows[i].licensor;
           }
           
        }
     }

    if(comments != null && comments.length>0 ){
        var commentobj={};
        commentobj.comments=comments;
        commentobj.createdBy="2002005722";
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
    //console.log(JSON.stringify(onAccountCreateRequest));

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
            onAccountDetails.periodType=this.getOnAccountPeriodType();
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
frameUpdateRequest:function(request,onAccountRows,documents,comments,quarters){
var onAccountUpdateRequest ={};

    onAccountUpdateRequest.searchRequest = {};

    onAccountUpdateRequest.onAccount={};
    onAccountUpdateRequest.onAccount.bundleId="";
    onAccountUpdateRequest.onAccount.bundleName="";

 
    onAccountUpdateRequest.onAccount.onAccountDetails=[];
    onAccountUpdateRequest.onAccount.comments=[];
    onAccountUpdateRequest.onAccount.documents=[];

    //console.log(onAccountRows.rows);
    var rows = onAccountRows.rows;

    //framing the onAccountDetails--start
    if(rows != null && rows.length >0){
        for(var i=0; i < rows.length;i++){
                for(var k=0;k<quarters.length;k++)
                {
                    var onAccountDetails={};
                    onAccountDetails.id=rows[i].id;
                    onAccountDetails.bundleId=rows[i].bundleId;
                    onAccountDetails.bundleName=rows[i].bundleName;
                    onAccountDetails.currencyCode=rows[i].Currency;
                    var period = this.getPeriodForQuarter(quarters[k]);
                    onAccountDetails.fiscalPeriod=period+'';
                    onAccountDetails.onAccountAmt=rows[i][quarters[k]];
                    onAccountDetails.commentId=rows[i].commentId;
                    onAccountDetails.countryId=rows[i].countryId;
                    onAccountDetails.entityId=rows[i].entityId;
                    onAccountDetails.entityName=rows[i].Licensor;
                    onAccountDetails.contentGroupId=rows[i].contentGroupId;
                    onAccountDetails.periodType=this.getOnAccountPeriodType();
                    onAccountDetails.createdBy=rows[i].createdBy;
                    onAccountDetails.createdDate=rows[i].createdDate;
                    onAccountDetails.modifiedBy=rows[i].createdBy;
                    onAccountDetails.modifiedDate=Date.now();
                    onAccountDetails.serviceTypeId=rows[i].serviceTypeId;
                    onAccountUpdateRequest.onAccount.onAccountDetails.push(onAccountDetails);
                }
        }
     }

    if(comments != null && comments.length>0 ){
        var commentobj={};
        commentobj.comments=comments;
        commentobj.createdBy="";
        commentobj.createdDate=Date.now();
        onAccountUpdateRequest.onAccount.comments.push(commentobj);    
    }
    
    if(documents!= null && documents.length>0){
        for(var i=0;i<documents.length;i++){
            var documentsObj={};
            documentsObj.fileName=documents[0].fileName;
            documentsObj.location=documents[0].filePath;
            documentsObj.createdDate=Date.now();
            //documentsObj.deleteFlag=true;
            onAccountUpdateRequest.onAccount.documents.push(documents);
        }
    }

    //console.log(JSON.stringify(onAccountUpdateRequest));

    return onAccountUpdateRequest;
    },
frameRowsForCopyOnAcc:function(originalRows,data,quarters,period){
var onAccountDetails = data.onAccount.onAccountDetails;
    if(onAccountDetails != null && onAccountDetails.length>0){
        var licensorName="";
        for(var i=0; i<originalRows.length;i++){
           if(originalRows[i].__isChild){
                var periodMap = {};
                var value = this.getPeriodValue(licensorName,originalRows[i].entityId,originalRows[i].currency,onAccountDetails,period);
                for(var k=0;k<quarters.length;k++)
                {
                    originalRows[i][quarters[k]]=value;
                }
           }else{
            licensorName=originalRows[i].licensor;
           }
           
        }
    }
    return originalRows;
},
getPeriodValue:function(licensorName,entityId,currency,onAccountDetails,quarter){
    var fiscalPeriod=this.getPeriodForQuarter(quarter);
    var value =0;
    for(var i=0;i<onAccountDetails.length;i++){
        if(licensorName == onAccountDetails[i].entityName && entityId==onAccountDetails[i].entityId 
            && currency==onAccountDetails[i].currencyCode && fiscalPeriod == onAccountDetails[i].fiscalPeriod){
            return onAccountDetails[i].onAccountAmt+'';
        }
    }
    return value;
},
getRow:function(rows,id){
    for(var i=0;i<rows.length;i++){
        if(id == rows[i].id){
            return rows[i];
        }
    }
    return null;
},
frameRows:function(data,quarters){
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
},
getOnAccountPeriodType:function(){
    return "Q";
},
getProposedOnAccRows:function(quarters,data){
      var onAccountDetails = data.onAccount.onAccountDetails
      var periodData = data.onAccount.fiscalPeriodAmtMap;
      var bundleNames=[];
      var rows=[];
      if(onAccountDetails != undefined){
      for (var i=0;i<onAccountDetails.length;i++){
          var row = {};
          row['id']= onAccountDetails[i].id;
          row['entityId']=onAccountDetails[i].entityId;
          row['Licensor']=onAccountDetails[i].entityName;
          row['Currency']=onAccountDetails[i].currencyCode;
          row['ContentType']=onAccountDetails[i].contentGroupName;
          //row['ContentType']="";
          row['contentGroupId']=onAccountDetails[i].contentGroupId;
          row['serviceTypeId']=onAccountDetails[i].serviceTypeId;
          row['bundleId']=onAccountDetails[i].bundleId;
          row['bundleName']=onAccountDetails[i].bundleName;
          row['docId']=onAccountDetails[i].docId;
          row['commentId']=onAccountDetails[i].commentId;
          row['createdBy']=onAccountDetails[i].createdBy;
          row['createdDate']=onAccountDetails[i].createdDate;

          for(var k=0;k<quarters.length;k++){
            var period = utils.getPeriodForQuarter(quarters[k]);
            var amtObject = periodData[period];
            row[quarters[k]]=0;
            if(amtObject != undefined){
              var value = amtObject[onAccountDetails[i].id];
              if(value == undefined){
                value =0;
              }
              row[quarters[k]]=this.currencyFormat(value);
            }
          }
          row['total']=this.currencyFormat(onAccountDetails[i].totalAmt);

          bundleNames.push(onAccountDetails[i].bundleName);

          rows.push(row);
        }
     }
      //console.log(rows);
      var returnValue = new Array();
      returnValue['ROWS']=rows;
      returnValue['BUNDLE_NAMES']=bundleNames;
      return returnValue;
    },
currencyFormat : function (number)
  {
    var n = number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
    return n;
  }

    
};

export default utils;