import Model from 'can/model/';

/**
 * Status Codes object gives the Status Name for the Status code.
 *
 **/

var statusCodesObject = {
		"0":"UNBUNDLED",
		"1":"PENDING_WITH_BM (Bundled)",
		"2":"PENDING_WITH_FA",
		"3":"PENDING_WITH_FC",
		"5":"FINAL_APPROVED",
		"9":"BM_REJECTED"
    },

    StatusCodes = new can.Map(statusCodesObject);

export default StatusCodes;
