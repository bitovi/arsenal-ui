import stache from 'can/view/stache/';
import formats from 'utils/formats';
import periodHelper from 'utils/periodWidgetHelpers';

export default [
  {
    id: 'toggle',
    title: '',
    contents: function(row) {
      if(row.isFooterRow == undefined){
        return (row.ccidId == null || row.ccidId == "0" ) ? "": can.stache('<input type="checkbox"/>' )() ;
      }
    }
  },
  {
    id: 'ccidId',
    title: 'CCID ID',
    sortable: true,
    contents: function(row) {
        return (row.ccidId == null || row.ccidId == "0" ) ? "": row.ccidId ;
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
    id: 'fiscalPeriod',
    title: 'Period',
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
    id: 'pubfee',
    title: 'Pub Fee',
    className: "amountColumn",
    format: formats.currencyFormat,
    sortable: true
  },
  {
    id: 'reconAmt',
    title: 'Recon',
    className: "amountColumn",
    format: formats.currencyFormat,
    sortable: true
  },
  {
    id: 'liDispAmt',
    title: 'Line Item Dispute',
    format: formats.currencyFormat,
    className: "amountColumn",
    contents: function(row) {
      if(row.isFooterRow){
        return formats.currencyFormat(row.liDispAmt);
      }else{
        return can.stache('<a class="downloadLink liDispAmt" href="#download">'+formats.currencyFormat(row.liDispAmt)+'</a>')();
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
    format: formats.currencyFormat,
    sortable: true
  },
  {
    id: 'badLines',
    title: 'Bad Lines',
    className: "amountColumn",
    contents: function(row) {
      if(row.isFooterRow){
        return formats.currencyFormat(row.badLines);
      }else{
        return can.stache('<a class="downloadLink badLines" href="#download">'+formats.currencyFormat(row.badLines)+'</a>')();
      }
    },
    format: formats.currencyFormat,
    sortable: true
  },
  {
    id: 'ingstdDate',
    title: 'Ingestion Date',
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
    id: 'status',
    title: 'Status',
    sortable: true
  }
];
