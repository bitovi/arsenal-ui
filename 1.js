

      var rows = [];
      _.each(invoiceData,function(invoice){
        invoice['entityIdWithName'] = invoice.entityId +","+invoice.entityName;
        invoice.attr('__isChild',false);
        invoice.attr('hasChild',true);

        rows.push(invoice);
          _.each(invoice.reviewDetails,function(details){

          });

      });

      return rows;


  //console.log("invoiceData is "+JSON.stringify(invoiceData));
  var gridData = {"data":[], "footer":[]};
  var aggregateFlag=false;
  //rdar://problem/20018279> -start
  if($("#chkAggregate").is(':visible') && $("#chkAggregate").is(":checked")){
    aggregateFlag=true;
  }
  //rdar://problem/20018279> -end
        for(var i=0;i<invoiceData.length;i++){
            var invTemp = {};
            invTemp["entityId"] = invoiceData[i]["entityId"]+","+ invoiceData[i]["entityName"];
            invTemp["__isChild"] = false;
            invTemp["hasChild"] = true;
            invTemp["entityName"] = (invoiceData[i]["entityName"]==null)?"":invoiceData[i]["entityName"];
            invTemp["invoiceNumber"] = "";
            invTemp["currency"] = invoiceData[i]["currency"];

            invTemp["period"] = "";
            invTemp["country"] = "";
            invTemp["contentType"] = "";
            invTemp["invoiceAmount"] = CurrencyFormat(invoiceData[i]["invoiceAmount"]);
            invTemp["lineItemAmount"] = CurrencyFormat(invoiceData[i]["lineItemAmount"]);

            invTemp["overrepAmount"] = (invoiceData[i]["overrepAmount"])==null?0.00:CurrencyFormat(invoiceData[i]["overrepAmount"]);
            invTemp["lineDisputeAmount"] = (invoiceData[i]["lineDisputeAmount"])==null?0.00:CurrencyFormat(invoiceData[i]["lineDisputeAmount"]);
            invTemp["reconAmount"] = CurrencyFormat(invoiceData[i]["reconAmount"]);
            invTemp["oaAllocated"] = CurrencyFormat(invoiceData[i]["oaAllocated"]);
            invTemp["caAllocated"] = CurrencyFormat(invoiceData[i]["caAllocated"]);
            invTemp["balance"] = "";
            invTemp["priorPaid"] = CurrencyFormat(invoiceData[i]["priorPaid"]);
            invTemp["invPmtSaturation"] = CurrencyFormat(Number(invoiceData[i]["invPmtSaturation"])*100)+'%';
            invTemp["invoiceSaturation"] = CurrencyFormat(Number(invoiceData[i]["invoiceSaturation"])*100)+'%';
            invTemp["pmtSaturation"] = CurrencyFormat(Number(invoiceData[i]["pmtSaturation"])*100)+'%';
            invTemp["overrepDispPer"] = CurrencyFormat(invoiceData[i]["overrepDispPer"])+'%';
            invTemp["liDispPer"] = CurrencyFormat(invoiceData[i]["liDispPer"])+'%';
            invTemp["status"] = "";

            gridData.data.push(invTemp);

            var insertedId = gridData.data.length-1;
            //console.log("jfsdhfjshj is "+invoiceData[i]["claimReviewLicDetails"]);
            var invoiceLineItems = invoiceData[i]["reviewDetails"];

            var contentTypeArr = [], countryArr = [] , invoiceNumberArr = [], licensorTypeArr = [];
             var lowestPeriod = 0;
              var highestPeriod = 0;
              var tmpPeriod = 0;
              var hasChild=true;
              var periodType="";


              if(invoiceLineItems.length > 1){
                for(var j=0;j<invoiceLineItems.length;j++){
                  var invLITemp={};
                  var liPeriodtype=""
                   liPeriodtype = invoiceLineItems[j]["periodType"];
                   periodType=(periodType != null && periodType.length>0 && periodType != liPeriodtype) ? 'Multiple':liPeriodtype;
                  if(liPeriodtype == null || liPeriodtype == undefined ||(liPeriodtype !=null && liPeriodtype.length ==0)){
                    //periodType='P';
                    liPeriodtype="P";
                  }

                  invLITemp["entityId"] = invTemp["entityId"]+","+  invTemp["entityName"] ;
                  invLITemp["__isChild"] = true;
                  invLITemp["entityName"] = "";
                  invLITemp["invoiceNumber"] = invoiceLineItems[j]["invoiceNumber"];
                  invLITemp["currency"] = invTemp["currency"];

                  var period = invoiceLineItems[j]["period"];

                  invLITemp["period"] = "";
                  invTemp["period"] = invoiceLineItems[j]["period"];

                  invLITemp["country"] = invoiceLineItems[j]["countryId"];
                  invLITemp["contentType"] = invoiceLineItems[j]["contentTypeName"];

                  invLITemp["invoiceAmount"] = CurrencyFormat(invoiceLineItems[j]["invoiceAmount"]);
                  invLITemp["lineItemAmount"] = CurrencyFormat(invoiceLineItems[j]["lineItemAmount"]);


                  invLITemp["overrepAmount"] = (invoiceLineItems[j]["overrepAmount"])==null?0.00:CurrencyFormat(invoiceLineItems[j]["overrepAmount"]);

                  invLITemp["lineDisputeAmount"] = (invoiceLineItems[j]["lineDisputeAmount"])==null?0.00:CurrencyFormat(invoiceLineItems[j]["lineDisputeAmount"]);

                  invLITemp["reconAmount"] = CurrencyFormat(invoiceLineItems[j]["reconAmount"]);

                  invLITemp["oaAllocated"] = CurrencyFormat(invoiceLineItems[j]["oaAllocated"]);

                  invLITemp["caAllocated"] = CurrencyFormat(invoiceLineItems[j]["caAllocated"]);

                  invLITemp["balance"] = (invoiceLineItems[j]["balance"]==null)?0:CurrencyFormat(invoiceLineItems[j]["balance"]);

                  invLITemp["priorPaid"] = CurrencyFormat(invoiceLineItems[j]["priorPaid"]);

                  invLITemp["invPmtSaturation"] = CurrencyFormat(Number(invoiceLineItems[j]["invPmtSaturation"])*100)+'%';
                  invLITemp["invoiceSaturation"] = CurrencyFormat(Number(invoiceLineItems[j]["invoiceSaturation"])*100)+'%';


                  invLITemp["pmtSaturation"] = CurrencyFormat(Number(invoiceLineItems[j]["pmtSaturation"])*100)+'%';

                  invLITemp["overrepDispPer"] = (invoiceLineItems[j]["overrepDispPer"]==null)?'0.00%':CurrencyFormat(invoiceLineItems[j]["overrepDispPer"])+'%';

                  invLITemp["liDispPer"] = (invoiceLineItems[j]["liDispPer"]==null)?'0.00%':CurrencyFormat(invoiceLineItems[j]["liDispPer"])+'%';

                  invLITemp["status"] = getInvoiceStatus(invoiceLineItems[j]["status"]);
                  invTemp["status"] = invLITemp["status"];

                  //added for licensor
                  invLITemp["entityName"] = invoiceLineItems[j]["entityName"];
                  //end

                  if(period != undefined && period > 0){
                      invLITemp["period"] = periodWidgetHelper.getDisplayPeriod(period,liPeriodtype);
                      if(lowestPeriod==0 && highestPeriod == 0){
                        lowestPeriod=Number(period);
                        highestPeriod=Number(period);
                      }
                      tmpPeriod = Number(period);
                      if (tmpPeriod < lowestPeriod) lowestPeriod = tmpPeriod;
                      if (tmpPeriod > highestPeriod) highestPeriod = tmpPeriod;
                    }else if(period == 0){
                      invLITemp["period"] = '';
                    }

                  if(invLITemp["contentType"]!= undefined && invLITemp["contentType"] != 'TAX' && !_.contains(contentTypeArr, invLITemp["contentType"]) ){
                      contentTypeArr.push(invLITemp["contentType"]) ;
                      //contentTypeArr.push(invLITemp["contentType"]);
                  }
                  if(invLITemp["country"] != undefined && typeof(invLITemp["country"]) != 'null' && !_.contains(countryArr, invLITemp["country"])){
                    countryArr.push(invLITemp["country"]);
                  }

                  if(invLITemp["entityName"] != undefined && typeof(invLITemp["entityName"]) != 'null' && !_.contains(licensorTypeArr, invLITemp["entityName"])){
                      licensorTypeArr.push(invLITemp["entityName"]);
                  }

                  if(invLITemp["invoiceNumber"] != undefined && !  _.contains(invoiceNumberArr, invLITemp["invoiceNumber"]) ){
                      invoiceNumberArr.push(invLITemp["invoiceNumber"]);
                  }


                  //rdar://problem/20018279> -start
                  if(!aggregateFlag){
                    gridData.data.push(invLITemp);
                  }
                  //rdar://problem/20018279> -end
                }
              }else if(invoiceLineItems.length == 1){
                  hasChild=false;
                  var contentType=invoiceLineItems[0]["contentTypeName"];
                  var country=invoiceLineItems[0]["countryId"];
                  var entityName=invoiceLineItems[0]["entityName"];

                  if(contentType != undefined && contentType != 'TAX'){
                    _.contains(contentTypeArr, contentType) ?  "": contentTypeArr.push(contentType);

                  }

                  if(country != undefined && typeof(country) != 'null'){
                    _.contains(countryArr, contentType) ?  "": countryArr.push(country);
                    // countryArr.push(country);
                  }

                  if(entityName != undefined && typeof(entityName) != 'null'){
                    _.contains(licensorTypeArr, entityName) ?  "": licensorTypeArr.push(entityName);
                    //licensorTypeArr.push(entityName);
                  }


                  invoiceNumberArr.push(invoiceLineItems[0]["invoiceNumber"]);

                  var period = invoiceLineItems[0]["period"];
                  lowestPeriod=highestPeriod=period;
                  periodType=invoiceLineItems[0]["periodType"];
                  gridData.data[insertedId]["status"] = getInvoiceStatus(invoiceLineItems[0]["status"]);
              }

            //rdar://problem/20018279> -start
            if(aggregateFlag){
              hasChild=false;
            }
            //rdar://problem/20018279> -end
            //console.log("gridData is ffsdfs "+JSON.stringify(gridData));
            //console.log("countryArr is ffsdfs "+JSON.stringify(countryArr));

            /*Below function is to remove the duplicate content type and find the count */
            // contentTypeArr = contentTypeArr.filter( function( item, index, inputArray ) {
            //        return inputArray.indexOf(item) == index;
            // });
            if(contentTypeArr.length>1){
              gridData.data[insertedId]["contentType"] = contentTypeArr.length+" content types";
            }
            else if(contentTypeArr.length==1)
              gridData.data[insertedId]["contentType"] = contentTypeArr[0];


              /*Below function is to remove the duplicate Licensor and find the count */
              // licensorTypeArr = licensorTypeArr.filter( function( item, index, inputArray ) {
              //        return inputArray.indexOf(item) == index;
              // });

              if(licensorTypeArr.length>1){
                gridData.data[insertedId]["entityName"] = licensorTypeArr.length+" Licensors";
              }
              else if(licensorTypeArr.length==1)
                gridData.data[insertedId]["entityName"] = licensorTypeArr[0];
                //end

            /*Below function is to remove the duplicate country and find the count */
            // countryArr = countryArr.filter( function( item, index, inputArray ) {
            //   return inputArray.indexOf(item) == index;
            // });
            if(countryArr.length>1){
              gridData.data[insertedId]["country"] = countryArr.length+ " Countries";
            }
            else if(countryArr.length==1)
              gridData.data[insertedId]["country"] = countryArr[0];

            if(lowestPeriod != undefined && highestPeriod != undefined && periodType != 'Multiple'){
              gridData.data[insertedId]["period"] = periodWidgetHelper.getDisplayPeriod(lowestPeriod,periodType);
              if(lowestPeriod != highestPeriod){
                gridData.data[insertedId]["period"] = periodWidgetHelper.getDisplayPeriod(lowestPeriod,periodType)+' - '+periodWidgetHelper.getDisplayPeriod(highestPeriod,periodType);
              }
            }else{
              gridData.data[insertedId]["period"]='Multiple';
            }


            //invoiceNumberArr = $.unique(invoiceNumberArr);
             if(invoiceNumberArr.length==1){
              gridData.data[insertedId]["invoiceNumber"] = invoiceNumberArr[0];
             }
             gridData.data[insertedId]["hasChild"] = hasChild;
          }
          var footerJson = {"entityId":"","__isChild":false,
          "entityName":"Total in Regional Currency (EUR)","invoiceNumber":"","currency":"","period":"","country":"","contentType":"","invoiceAmount":"350000","overrepAmount":"20000","lineDisputeAmount":"40000","reconAmount":"30000","oaAllocated":"2000","caAllocated":"2000","balance":"76",
          "priorPaid":"0","invPmtSaturation":"","invoiceSaturation":"","pmtSaturation":"","overrepDispPer":"","liDispPer":"","status":""};
          //gridData.footer.push(footerJson);

          //console.log("footerData is "+JSON.stringify(footerData));
          var formatFooterData = generateFooterData(footerData);
          gridData.footer = formatFooterData;
          //console.log("gridData is "+JSON.stringify(gridData));
          return gridData;
}
