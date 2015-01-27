import stache from 'can/view/stache/';
import formats from 'utils/formats';
import periodHelper from 'utils/periodWidgetHelpers';

export default [
{
  id: 'toggle',
  title: '<input type="checkbox" class="headerChkBox"/>',
  contents: function(row) {
    var value = row.dtlHdrId;
    var rejectable = false;

    if(row.rejectable && row.dtlHdrType != 'PDF') {

      rejectable = true;

    }

    if(!row.isFooterRow){
      return rejectable ? can.stache('<input type="checkbox" class="selectRow" value="'+  value +'"/>')() : can.stache('<input type="checkbox" disabled/>')();
    }
  }
},
{
  id: 'entityName',
  title: 'Licensor',
  sortable: true
},
{
  id: 'countryId',
  title: 'Country',
  sortable: true
},
{
  id: 'ccy',
  title: 'CCY',
  sortable: true
},
{
  id: 'contType',
  title: 'Content Type',
  sortable: true
},
{
  id: 'pubfee',
  title: 'PUB Fee',
  contents: function(row) {
    return formats.currencyFormat(row.pubfee == undefined || row.pubfee == null || row.pubfee == "" ? 0 :  row.pubfee);
  },
  sortable: true
},
{
  id: 'rcvdDate',
  title: 'Received Date',
  sortable: true
},
{
  id: 'invFileName',
  title: 'File Name',
  contents: function(row) {
    if(row.invFileName != undefined && row.invFileName != null){
      return can.stache('<a class="downloadLink fileName" href="#download">'+row.invFileName+'</a>')();  
    }else{
      return "null";
    }
  },
  sortable: true
},
{
  id: 'copConAmt',
  title: 'Cop Con',
  className: "amountColumn",
  format: formats.currencyFormat,
  sortable: true
},
{
  id: 'unMatchedAmt',
  title: 'Unmatched',
  className: "amountColumn",
  contents: function(row) {
    return formats.currencyFormat(row.unMatchedAmt == undefined || row.unMatchedAmt == null || row.unMatchedAmt == "" ? 0 :  row.unMatchedAmt);
  },
  sortable: true
},
{
  id: 'fiscalPeriod',
  title: 'Periods',
  contents: function(row) {
    if(row.fiscalPeriod == undefined || row.fiscalPeriod == ""){
      //nothing
    }else{
      return periodHelper.getDisplayPeriod(row.fiscalPeriod.toString(),"P");
    }
  },
  sortable: true
},
{
  id: 'status',
  title: 'Status',
  sortable: true
}
];
