
import Map from 'can/map/';

/**
 * rinsCommon object is used to maintain for the common Properties which can be used across.
 *
 **/

var rinsCommonObject = {
        //DOMAIN_SERVICE_URL:"http://localhost:8090/",
       // UI_SERVICE_URL:"http://ma-rinsd-lapp01.corp.apple.com:10645/api/v1/rinsui/",
       // UPLOAD_SERVICE_URL:"http://ma-rinsd-lapp01.corp.apple.com:10645/api/v1/rinsui/uploadFiles",
        UPLOAD_SERVICE_URL:"http://localhost:10645/api/v1/rinsui/uploadFiles"
    },

    RinsCommon = new Map(rinsCommonObject);

export default RinsCommon;
