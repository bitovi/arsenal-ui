import Map from 'can/map/';
import can_define from 'can/map/define/';
import can_delegate from 'can/map/delegate/';
import _ from 'lodash';
import Grid from 'components/grid/';

var icsvObj = {
    invoiceid:"",
    invoiceData:{},
    uploadiCSV:{},
    showediticsv:false
},
icsvMap = new can.Map(icsvObj);

export default icsvMap; 