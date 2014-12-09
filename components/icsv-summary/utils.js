var utils={
convertMapToCanListObject:function(currencies,invoiceMap){
	var totalAmount = 0;
	var invoiceCurrency = new can.List();
	for(var i in currencies){
		var invoiceAmount = invoiceMap[currencies[i]];
		var invCurr={currency:currencies[i],amount:this.CurrencyFormat(invoiceAmount),amountInUSD:''};
		invoiceCurrency.push(invCurr);
		totalAmount = totalAmount+parseFloat(invoiceAmount);
	}
return invoiceCurrency;
},
calculateInvoiceTotal:function(canList){
 var totalAmount = 0;
var canLists = canList.attr();
for(var i=0;i<canLists.length;i++){
	var obj = canLists[i];
	var invoiceAmount = obj.amount.replace(/\,/g,'');
	totalAmount = totalAmount+parseFloat(invoiceAmount);
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
}

};

export default utils;