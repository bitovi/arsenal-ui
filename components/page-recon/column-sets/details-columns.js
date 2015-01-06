import stache from 'can/view/stache/';
import formats from 'utils/formats';
import periodHelper from 'utils/periodWidgetHelpers';

export default [
{
  id: 'toggle',
  title: '',
  contents: function(row) {
    if(!row.isFooterRow){
      return row.rejectable ? can.stache('<input type="checkbox"/>')() : "" ;
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
  format: formats.currencyFormat,
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
    return can.stache('<a class="downloadLink fileName" href="#download">'+row.invFileName+'</a>')();
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
  format: formats.currencyFormat,
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
