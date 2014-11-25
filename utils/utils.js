import Model from 'can/model/';


var rinsCommonObject = {
        //DOMAIN_SERVICE_URL:"http://localhost:8090/",
        UI_SERVICE_URL:"http://ma-rinsd-lapp01.corp.apple.com:10645/api/v1/rinsui/",
        DOMAIN_SERVICE_URL:"http://ma-rinsd-lapp01.corp.apple.com:8090/api/v1/"
    },

    RinsCommon = new can.Map(rinsCommonObject);

export default RinsCommon;
