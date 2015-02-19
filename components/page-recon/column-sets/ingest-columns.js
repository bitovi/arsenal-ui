import stache from 'can/view/stache/';
import formats from 'utils/formats';
import periodHelper from 'utils/periodWidgetHelpers';

export default [
  {
    id: 'toggle',
    title: '<input type="checkbox" class="headerChkBox"/>',
    contents: function(row) {
      var value = row.dtlHdrId;
      var rejectableVal = false;

      if(row.rejectable && row.dtlHdrType != 'PDF') { 

        rejectableVal = true;

      }

      if(!row.isFooterRow){
        return rejectableVal ? can.stache('<input type="checkbox" class="selectRow" value="'+  value +'"/>')() : can.stache('<input type="checkbox" disabled/>')();
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
    id: 'pubFee',
    title: 'Pub Fee',
    //className: "amountColumn",
    contents: function(row) {
      return formats.currencyFormat(row.pubFee == undefined || row.pubFee == null || row.pubFee == "" ? 0 :  row.pubFee);
    },
    sortable: true
  },
  {
    id: 'reconAmt',
    title: 'Recon',
    //className: "amountColumn",
    format: formats.currencyFormat,
    sortable: true
  },
  {
    id: 'liDispAmt',
    title: 'Line Item Dispute',
    format: formats.currencyFormat,
    //className: "amountColumn",
    contents: function(row) {
      if(row.isFooterRow){
        return formats.currencyFormat(row.liDispAmt);
      }else{
        if(row.liDispAmt!= undefined && row.liDispAmt!= null && row.liDispAmt!= 0.00 ){
          return can.stache('<a class="downloadLink liDispAmt" href="#download">'+formats.currencyFormat(row.liDispAmt)+'</a>')();
        } else {
          return "null";
        }
      }
    },
    sortable: true
  },
  {
    id: 'copConAmt',
    title: 'Cop Con',
    //className: "amountColumn",
    format: formats.currencyFormat,
    sortable: true
  },
  {
    id: 'unMatchedAmt',
    title: 'Unmatched',
    //className: "amountColumn",
    contents: function(row) {
      return formats.currencyFormat(row.unMatchedAmt == undefined || row.unMatchedAmt == null || row.unMatchedAmt == "" ? 0 :  row.unMatchedAmt);
    },
    sortable: true
  },
  {
    id: 'badLines',
    title: 'Bad Lines',
    //className: "amountColumn",
    contents: function(row) {
      if(row.isFooterRow){
        return formats.currencyFormat(row.badLines);
      }else{
        if(row.badLines!= undefined && row.badLines!= null && row.badLines!= 0.00 ){
          return can.stache('<a class="downloadLink badLines" href="#download">'+formats.currencyFormat(row.badLines)+'</a>')();
        } else {
          return "null";
        }
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
      if(row.invFileName != undefined && row.invFileName != null ) {
        return can.stache('<a class="downloadLink fileName" href="#download">'+row.invFileName+'</a>')();
      } else {
        return "null";
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
