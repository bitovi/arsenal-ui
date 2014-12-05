import Model from 'can/model/';
import URLs from 'utils/urls';

var HolesReport = Model.extend({
  parseModels: 'holesReport',
  findAll: function(params) {
    var appstate = params.appstate;

    // TODO: when infrastructure gets set up, fix this.
    var data = {
      "bundleSearch": {
        "serviceTypeId": +appstate.storeType.id, // store type
        "entityId": [+appstate.licensor.id], // selected licensors
        "regionId": +appstate.region.id,
        "contentGrpId": [+appstate.contentType.id],
        "country": [appstate.country.abbr],
        "periodType": "P",
        "periodFrom": 201401,
        "periodTo": 201403,
      }
    };

    return $.ajax({
      url: URLs.DOMAIN_SERVICE_URL + 'dashboard/holesreport',
      type: 'POST',
      data: data
    });
  }
}, {});

export default HolesReport;
