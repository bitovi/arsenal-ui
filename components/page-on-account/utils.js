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
                  if(Number(rows[i][quarters[k]]) != 0){
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
            documentsObj.fileName=documents[i].fileName;
            documentsObj.location=documents[i].filePath;
            documentsObj.createdDate=Date.now();
            onAccountCreateRequest.onAccount.documents.push(documentsObj);
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

    //framing the onAccountDetails--start
    if(onAccountRows != null && onAccountRows.length >0){
        for(var i=0; i < onAccountRows.length;i++){
                for(var k=0;k<quarters.length;k++)
                {
                   if(Number(onAccountRows[i][quarters[k]]) != 0){
                      var onAccountDetails={};
                      onAccountDetails.id=onAccountRows[i].id;
                      onAccountDetails.bundleId=onAccountRows[i].bundleId;
                      onAccountDetails.bundleName=onAccountRows[i].bundleName;
                      onAccountDetails.currencyCode=onAccountRows[i].Currency;
                      var period = this.getPeriodForQuarter(quarters[k]);
                      onAccountDetails.fiscalPeriod=period+'';
                      onAccountDetails.onAccountAmt=onAccountRows[i][quarters[k]];
                      onAccountDetails.commentId=onAccountRows[i].commentId;
                      onAccountDetails.countryId=''; 
                      if(onAccountRows[i].countryId != undefined){
                        onAccountDetails.countryId=onAccountRows[i].countryId;  
                      }
                      onAccountDetails.entityId=onAccountRows[i].entityId;
                      onAccountDetails.entityName=onAccountRows[i].Licensor;
                      onAccountDetails.contentGroupId=onAccountRows[i].contentGroupId;
                      onAccountDetails.periodType=this.getOnAccountPeriodType();
                      onAccountDetails.createdBy=onAccountRows[i].createdBy;
                      onAccountDetails.createdDate=onAccountRows[i].createdDate;
                      onAccountDetails.modifiedBy=onAccountRows[i].createdBy;
                      onAccountDetails.modifiedDate=Date.now();
                      onAccountDetails.serviceTypeId=onAccountRows[i].serviceTypeId;
                      onAccountUpdateRequest.onAccount.onAccountDetails.push(onAccountDetails);
                  }
                }
        }
     }

    if(comments != null && comments.length>0 ){
        var commentobj={};
        commentobj.comments=comments;
        commentobj.createdBy="2002005722";
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
            onAccountUpdateRequest.onAccount.documents.push(documentsObj);
        }
    }

    //console.log(JSON.stringify(onAccountUpdateRequest));

    return onAccountUpdateRequest;
    },
frameRowsForCopyOnAcc:function(originalRows,data,quarters,period){
var currencyAmtMap = this.prepareCurrencyDataMap(data.onAccount.onAccountDetails);
var onAccountDetails = data.onAccount.onAccountDetails;
    for(var i=0; i<originalRows.length;i++){
       if(originalRows[i].__isChild){
            //var value = this.getPeriodValue(onAccountDetails,period);
            var total = 0;
            for(var k=0;k<quarters.length;k++)
            {
              var period = this.getPeriodForQuarter(quarters[k]);
              var value = currencyAmtMap[period+originalRows[i].currency];
              if(value == undefined){
                value = 0;
              }
              originalRows[i][quarters[k]]=value;
              total = total+Number(value);
            }
            originalRows[i]['total']=total+'';
       }
    }
    return originalRows;
},
prepareCurrencyDataMap:function(onAccountDetails){
  var currencyAmtMap = new Object();
  if(onAccountDetails != null && onAccountDetails.length>0){
    for(var i=0;i<onAccountDetails.length;i++){
      currencyAmtMap[''+onAccountDetails[i].fiscalPeriod+onAccountDetails[i].currencyCode]=onAccountDetails[i].onAccountAmt;
    }
  }
  return currencyAmtMap;
},
getPeriodValue:function(onAccountDetails,quarter){
    var fiscalPeriod=this.getPeriodForQuarter(quarter);
    var value =0;
    for(var i=0;i<onAccountDetails.length;i++){
        if(fiscalPeriod == onAccountDetails[i].fiscalPeriod){
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
prepareRowsForDisplay:function(onAccountDetails){
  var rows=[];
  var previousEntityId="";
  var previousCurrency="";
  var previousContentType="";
  var row={};
  if(onAccountDetails != undefined && onAccountDetails.length >0){
    for(var i=0;i<onAccountDetails.length;i++){
      var entityId = onAccountDetails[i].entityId;
      var currency = onAccountDetails[i].currencyCode;
      var contentType = onAccountDetails[i].contentGroupName;
      if(entityId==previousEntityId && currency == previousCurrency && contentType==previousContentType){
        if(i==0){
          row = this.createRow(onAccountDetails[i],false,row)
        }else{
          row[onAccountDetails[i].fiscalPeriod]=utils.currencyFormat(onAccountDetails[i].onAccountAmt);
        }
      }else{
           previousEntityId=entityId;
           previousCurrency=currency;
           previousContentType=contentType;
        if(i!=0){
          rows.push(row);
        }
        row=this.createRow(onAccountDetails[i],true,"");
      }
    }
    rows.push(row);
  }
   return rows;
},
createRow:function(onAccountDetail,newRow,row){
  if(newRow){
    row={};
  }
  row['entityId']=onAccountDetail.entityId;
  row['Licensor']=onAccountDetail.entityName;
  row['Currency']=onAccountDetail.currencyCode;
  row['ContentType']=onAccountDetail.contentGroupName;
  row['contentGroupId']=onAccountDetail.contentGroupId;
  row['serviceTypeId']=onAccountDetail.serviceTypeId;
  row['onAccountBalance']= utils.currencyFormat(onAccountDetail.onAccountAmtTotal);
  row['cashAdjust']= utils.currencyFormat(onAccountDetail.entityCashAdjAmtTotal);
  var period = this.getDisplayPeriod(onAccountDetail.fiscalPeriod);
  row[period]=utils.currencyFormat(onAccountDetail.onAccountAmt);
  return row;
},
getDisplayPeriod: function(quarter){
     quarter  = quarter.toString();
    var quarters={
    "03":"Q1",
    "06":"Q2",
    "09":"Q3",
    "12":"Q4"
  }
    var year = quarter.substring(0, 4);
    var period = quarter.substring(quarter.length, quarter.length-2);
    return (quarters[period]+'FY'+year.substring(year.length, year.length-2));  
  },
  createFooterRow:function(onAccountFooter){
    var footerRows=[];
    if(onAccountFooter.onAccountFooterSummary != undefined && onAccountFooter.onAccountFooterSummary.length >0){
      footerRows.push(this.getFooterRow(onAccountFooter.onAccountFooterSummary,true));  
    }
    if(onAccountFooter.onAccountFooterDetails != undefined && onAccountFooter.onAccountFooterDetails.length >0){
        footerRows.push(this.getFooterRow(onAccountFooter.onAccountFooterDetails,false));
    }
    return footerRows;
  },
  getFooterRow:function(footerData,parent){
    var footerRows=[];
    var footerRow={};
    var previousCurrency="";
    for(var i=0;i < footerData.length;i++){
      var currency = footerData[i].currencyCode;
      if(currency == previousCurrency){
        if(i==0){
            footerRow = this.createNewFooterRow(footerRow[i],false,footerRow,parent)
        }else{
          footerRow[footerData[i].fiscalPeriod]=utils.currencyFormat(footerData[i].onAccountAmt);
        }
      }else{
           previousCurrency=currency;
          if(i!=0){
            footerRows.push(footerRow);
          }
        footerRow=this.createNewFooterRow(footerData[i],true,"",parent);
      }
    }
    footerRows.push(footerRow);
    return footerRows;
  },
  createNewFooterRow:function(footerData,newRow,footerRow,isParent){
  if(newRow){
    footerRow={};
  } 
  if(isParent){
    footerRow["Licensor"]= "Total";
    footerRow["__isChild"]=false;
  }else{
    footerRow["Licensor"]= "";
    footerRow["__isChild"]=true;
  }
  footerRow["Currency"]= footerData.currencyCode;
  footerRow["ContentType"]= "";
  footerRow["onAccountBalance"]=utils.currencyFormat(footerData.onAccountAmtTotal);
  footerRow["cashAdjust"]=utils.currencyFormat(footerData.entityCashAdjAmtTotal);
  footerRow["tfooter"]=true;
  var period = this.getDisplayPeriod(footerData.fiscalPeriod);
  footerRow[period]=utils.currencyFormat(footerData.onAccountAmt);
  return footerRow;
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
      if(bundleNames != undefined && bundleNames.length>1){
        returnValue['BUNDLE_NAMES']='Multiple';
      }else{
        returnValue['BUNDLE_NAMES']=bundleNames;
      } 
      return returnValue;
    },
currencyFormat : function (number)
  {
    if(number != undefined && $.isNumeric(number)){
      var n = number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
      return n;
    }else{
      return 0;
    }
  }

    
};

export default utils;