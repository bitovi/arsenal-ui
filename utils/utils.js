import Map from 'can/map/';
import Model from 'can/model/';


/**
 * rinsCommon object is used to maintain for the common Properties which can be used across.
 *
 **/

var rinsCommonObject = {
        //DOMAIN_SERVICE_URL:"http://localhost:8090/",
       UI_SERVICE_URL:"http://ma-rinsd-lapp01.corp.apple.com:10645/api/v1/rinsui/",
       DOMAIN_SERVICE_URL:"http://ma-rinst-lap01.corp.apple.com:10639/api/v1/",
       BOUNDARY : "XXXXX"
    },

    RinsCommon = new can.Map(rinsCommonObject);

export default RinsCommon;
