import Model from 'can/model/';

import PaymentBundleDetail from './payment-bundle-detail';

var PaymentBundleDetailGroup = Model.extend({
  id: "invoiceId" // I think?
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
