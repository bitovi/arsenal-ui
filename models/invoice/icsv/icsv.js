import Model from 'can/model/';
import RinsCommon from 'models/rinsCommon/';

var ICSVInvoices = Model.extend({
 findAll: 'GET /invoiceicsv'
}, {});

export default ICSVInvoices;
