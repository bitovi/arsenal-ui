import Model from 'can/model/';

/**
 * Status Codes object gives the Status Name for the Status code.
 *
 **/

var statusCodesObject = {
		"0":"Unbundled",
		"1":"Pending with BM",
		"2":"Pending with FA",
		"3":"Pending with FC",
		"5":"Final approved",
		"9":"Rejected by BM"
    },

StatusCodes = new can.Map(statusCodesObject);

export default StatusCodes;
