import _ from 'lodash';
import Model from 'can/model/';
import can_define from 'can/map/define/'

import PaymentBundleDetailGroup from './payment-bundle-detail-group';

var PaymentBundle = Model.extend({
  VALIDATION_CODES: {
    RED: 1,
    YELLOW: 2,
    GREEN: 3
  },
  id: 'bundleId',
  parseModels: function(data, xhr) {
    return data.paymentBundle;
  },
  //parseModels: 'paymentBundle',
  model: function(data) {
    // TODO: periodFrom, periodTo, paymentCurrency, and region probably need some more handling.
    data.isHighPriority = (data.isHighPriority === 'Y');
    data.isEditable = !!data.isEditable;
    data.isRecallable = !!data.isRecallable;
    data.isDeletable = !!data.isDeletable;

    return Model.model.apply(this, arguments);
  },
  // TODO: Make sure the appropriate bits are models that get parsed into this
  // rather than just being passed around as strings.
  /* Available parameters include:
   * @option storeType {String} ex. "iTunesStore"
   * @option contentTypes {Array<String>} ex. ["Music"]
   * @option licensors {Array<String>} ex. ["CELAS"]
   * @option regions {Array<String>} ex. ["Europe"]
   * @option countries {Array<String>} ex. ["GBR"]
   * @option periodType {String} ex. "P"
   * @option period {String} ex. "201303"
   */
  findAll: function(params) {
    var appstate = params.appstate;
    // TODO: when infrastructure gets set up, fix this.
    var data = {
      token: appstate.userinfo.token,
      "bundleSearch": {
        "serviceTypeId": appstate.storeType.id, // store type
        "entityId": [appstate.licensor.id], // selected licensors
        "regionId": appstate.region.id,
        "contentGrpId": appstate.contentType.id,
        "country": [appstate.country.id],
        "periodType": "P",
        "periodFrom": "201303",
        "periodTo": "201303",
      }
    };

    return $.ajax({
      url: 'localhost:8090/rins/paymentBundle/getAll',
      type: 'POST',
      data: data
    });
  },
  findOne: function(params) {
    var appstate = params.appstate,
        isCashAdjusted = !!params.isCashAdjusted,
        paymentType = params.paymentType,
        view = params.view,
        bundleID = params.bundleID;

    // TODO: when infrastructure gets set up, fix this.
    var data = {
      token: appstate.userinfo.token,
      paymentBundle: {
        bundleID,
        isCashAdjusted,
        paymentType,
        view
      }
    };

    return $.ajax({
      url: 'localhost:8090/rins/paymentBundle/get',
      type: 'POST',
      data: data
    });
  }
}, {
  define: {
    bundleDetailsGroup: {
      set: function(newGroups) {
        var list = this.bundleDetailsGroup || new PaymentBundleDetailGroup.List([]);
        var groups = _.map(newGroups, group => group instanceof PaymentBundleDetailGroup ? group : new PaymentBundleDetailGroup(group));
        list.splice(0, list.length, ...groups);
        return list;
      }
    }
  },
  getDetails: function(appstate, view, isCashAdjusted, paymentType) {
    var self = this;

    return PaymentBundle.findOne({
      appstate,
      bundleID: self.bundleId,
      isCashAdjusted,
      paymentType,
      view
    }).then(function(bundle) {
      // merge all those new properties into this one
      can.batch.start();
      self.attr(bundle.attr());
      self.attr('bundleDetailsGroup', bundle.bundleDetailsGroup);
      can.batch.stop();
      return self;
    }, function() {
      console.error('error', arguments);
    });
  }
});

export default PaymentBundle;
