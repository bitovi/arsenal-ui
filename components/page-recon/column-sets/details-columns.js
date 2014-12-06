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
  sortable: true
},
{
  id: 'unMatchedAmt',
  title: 'Unmatched',
  sortable: true
},
{
  id: 'fiscalPeriod',
  title: 'Periods',
  sortable: true
},
{
  id: 'status',
  title: 'State',
  sortable: true
}
];
