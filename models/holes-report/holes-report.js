import Model from 'can/model/';
import URLs from 'utils/urls';
import requestHelper from 'utils/request/';

var HolesReport = Model.extend({
  parseModels: 'holesReport',
  findOne: function(params) {
    var appstate = params.appstate;

    var excelOutput = appstate.attr('excelOutput') != undefined ? appstate.attr('excelOutput') : false;
    
    var data = {
      searchRequest: requestHelper.formGlobalRequest(appstate).searchRequest
    };

    if(excelOutput!=false){
        data["excelOutput"]=true
    }

    return $.ajax({
      url: URLs.DOMAIN_SERVICE_URL + 'dashboard/holesreport',
      type: 'POST',
      data: data,
      processData: false
    });
  }
}, {});

export default HolesReport;
