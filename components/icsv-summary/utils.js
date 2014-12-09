var utils={
convertMapToCanListObject:function(summaryObjs){
   console.log(summaryObjs);
	var invoiceCurrency = new can.List();
	for(var i=0 ;i < summaryObjs.length; i++){
     // console.log(summaryObjs[i].localAmt);
     //  console.log(summaryObjs[i].altAmt);
		var invCurr={localAmt:this.CurrencyFormat(summaryObjs[i].localAmt),localCcy:summaryObjs[i].localCcy,altAmt:this.CurrencyFormat(summaryObjs[i].altAmt),altCcy:summaryObjs[i].altCcy};
		invoiceCurrency.push(invCurr);
	}
return invoiceCurrency;
},
calculateInvoiceTotal:function(object){
	//console.log("Amount---"+object);
 var totalAmount = 0;
//var canLists = canList.attr();
for(var i=0;i<object.length;i++){
	//var obj = canLists[i];
	//console.log("Amount"+object[i].altAmt);
	//var invoiceAmount = object.altAmt;
	totalAmount = totalAmount+parseFloat(object[i].altAmt);
	}
	return this.CurrencyFormat(totalAmount);
},
CurrencyFormat:function(number)
{
   var decimalplaces = 2;
   var decimalcharacter = ".";
   var thousandseparater = ",";
   number = parseFloat(number);
   var sign = number < 0 ? "-" : "";
   var formatted = new String(number.toFixed(decimalplaces));
   if( decimalcharacter.length && decimalcharacter != "." ) { formatted = formatted.replace(/\./,decimalcharacter); }
   var integer = "";
   var fraction = "";
   var strnumber = new String(formatted);
   var dotpos = decimalcharacter.length ? strnumber.indexOf(decimalcharacter) : -1;
   if( dotpos > -1 )
   {
      if( dotpos ) { integer = strnumber.substr(0,dotpos); }
      fraction = strnumber.substr(dotpos+1);
   }
   else { integer = strnumber; }
   if( integer ) { integer = String(Math.abs(integer)); }
   while( fraction.length < decimalplaces ) { fraction += "0"; }
  var temparray = new Array();
   while( integer.length > 3 )
   {
      temparray.unshift(integer.substr(-3));
      integer = integer.substr(0,integer.length-3);
   }
   temparray.unshift(integer);
   integer = temparray.join(thousandseparater);
   return sign + integer + decimalcharacter + fraction;

},

 numFormat:function(number)
{
  if($.isNumeric(number)){
    var n = number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
    return n;
  }else{
    return 0;
  }
  
}

};

export default utils;