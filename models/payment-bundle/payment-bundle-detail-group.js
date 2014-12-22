import Model from 'can/model/';
import URLs from 'utils/urls';

import PaymentBundleDetail from './payment-bundle-detail';

var PaymentBundleDetailGroup = Model.extend({
  id: "invoiceId", // I think?
  destroy: function(id, invoice) {
    // TODO: when infrastructure gets set up, fix this.
    var data = {
      searchRequest: {
        ids: [id]
      }
    };

    return $.ajax({
      url:  URLs.DOMAIN_SERVICE_URL + 'paymentBundle/manage',
      type: 'POST',
      data: data,
      processData: false
    });
  }
}, {
  define : {
    bundleDetails: {
      set: function(newDetails) {
        var list = this.bundleDetails || new PaymentBundleDetail.List([]);

        var details = _.map(newDetails, detail => detail instanceof PaymentBundleDetail ? detail : new PaymentBundleDetail(detail));
        list.splice(0, list.length, ...details);
        return list;
      }
    }
  }
});

export default PaymentBundleDetailGroup;
