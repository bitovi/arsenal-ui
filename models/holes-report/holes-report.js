import Model from 'can/model/';
import URLs from 'utils/urls';
import requestHelper from 'utils/request/';

var HolesReport = Model.extend({
  parseModels: 'holesReport',
  findAll: function(params) {
    var appstate = params.appstate;

    var data = {
      searchRequest: requestHelper.formGlobalRequest(appstate).searchRequest
    };

    return $.ajax({
      url: URLs.DOMAIN_SERVICE_URL + 'dashboard/holesreport',
      type: 'POST',
      data: data,
      processData: false
    });
  }
}, {});

export default HolesReport;
