import stache from 'can/view/stache/';

export default [
  {
    id: 'toggle',
    title: '',
    contents: function(row) {
      if(row.toggleCheck =="N"){
        return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}}')({isChild: row.__isChild});
      }else{
        return can.stache('<input type="checkbox"/>')();
      }
    }
  },
  {
    id: 'ccidId',
    title: 'CCID ID',
    sortable: true
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
    sortable: true
  },
  {
    id: 'pubfee',
    title: 'PUB Fee',
    sortable: true
  },
  {
    id: 'reconAmt',
    title: 'Recon',
    sortable: true
  },
  {
    id: 'liDispAmt',
    title: 'Line Item Dispute',
    contents: function(row) {
      return can.stache('<a class="downloadLink liDispAmt" href="#download">'+row.liDispAmt+'</a>')();
    },
    sortable: true
  },
  {
    id: 'copConAmt',
    title: 'Cop Con',
    sortable: true
  },
  {
    id: 'unMatchedAmt',
    title: 'Unmatched',
    sortable: true
  },
  {
    id: 'badLines',
    title: 'Bad Lines',
    contents: function(row) {
      return can.stache('<a class="downloadLink badLines" href="#download">'+row.badLines+'</a>')();
    },
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
    title: 'State',
    sortable: true
  }
];
