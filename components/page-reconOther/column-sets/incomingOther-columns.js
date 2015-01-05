import stache from 'can/view/stache/';

export default [
  {
    id: 'entityName',
    title: 'FTP folder',
    sortable: true
  },
  {
    id: 'countryId',
    title: 'Country',
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
    id: 'rcvdDate',
    title: 'Received Date',
    sortable: true
  }
];
