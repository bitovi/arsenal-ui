import Model from 'can/model/';

var PaymentBundleDetail = can.Model.extend({
  VALIDATION_CODES: {
    RED: 1,
    YELLOW: 2,
    GREEN: 3
  },
  parseModels: function(data, xhr) {
    return data.paymentBundle.bundleLines;
  },
  model: function(data) {
    // TODO: fiscalPeriod probably needs some more handling.

    return Model.model.apply(this, arguments);
  },
  findAll: function(params) {
    var appstate = params.appstate,
        isCashAdjusted = !!params.isCashAdjusted,
        paymentType = params.paymentType,
        bundleId = params.bundle.bundleId;

    // TODO: when infrastructure gets set up, fix this.
    var data = {
      token: appstate.userinfo.token,
      paymentBundle: {
        bundleId,
        isCashAdjusted,
        paymentType
      }
    };

    return $.ajax({
      url: 'localhost:8090/rins/paymentBundle/get',
      type: 'POST',
      data: data
    });
  }
}, {});

export default PaymentBundleDetail;
