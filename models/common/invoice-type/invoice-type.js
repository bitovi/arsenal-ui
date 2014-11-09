import Model from 'can/model/';
import RinsCommon from 'utils/';



var InvoiceType = Model.extend({
    findAll: 'POST ' + RinsCommon.UI_SERVICE_URL + 'getInvoiceTypes'

}, {});

export default InvoiceType;
