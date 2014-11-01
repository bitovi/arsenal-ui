import Model from 'can/model/';

/**
  * rinsCommon object is used to maintain for the common Properties which can be used across.
  *
  **/

var rinsCommonObject = {
    DOMAIN_SERVICE_URL:"http://ma-rinsd-lapp01.corp.apple.com:8090/",
    UI_SERVICE_URL:"http://ma-rinsd-lapp01.corp.apple.com:8090/"
  },

RinsCommon = new can.Map(rinsCommonObject);

export default RinsCommon;
