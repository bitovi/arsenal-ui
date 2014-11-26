import _ from 'lodash';
import Model from 'can/model/';
import can_define from 'can/map/define/'
import URLs from 'utils/urls';

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
  model: function(data) {
    // TODO: periodFrom, periodTo, paymentCurrency, and region probably need some more handling.
    if(data.hasOwnProperty('isHighPriority')) {
      data.isHighPriority = (data.isHighPriority === 'Y');
    }
    if(data.hasOwnProperty('isEditable')) {
      data.isEditable = !!data.isEditable;
    }
    if(data.hasOwnProperty('isRecallable')) {
      data.isRecallable = !!data.isRecallable;
    }
    if(data.hasOwnProperty('isDeletable')) {
      data.isDeletable = !!data.isDeletable;
    }

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
      url: URLs.DOMAIN_SERVICE_URL + 'rins/paymentBundle/getAll',
      type: 'POST',
      data: data
    });
  },
  findOne: function(params) {
    var paymentType = params.paymentType,
        view = params.view,
        bundleID = params.bundleID;

    // TODO: when infrastructure gets set up, fix this.
    var data = {
      paymentBundle: {
        bundleID,
        paymentType,
        view
      }
    };

    return $.ajax({
      url: URLs.DOMAIN_SERVICE_URL + 'rins/paymentBundle/get',
      type: 'POST',
      data: data
    });
  },
  destroy: function(id, bundle) {
    // TODO: when infrastructure gets set up, fix this.
    var data = {
      searchRequest: {
        ids: [id]
      }
    };

    return $.ajax({
      url: URLs.DOMAIN_SERVICE_URL + 'rins/paymentBundle/delete',
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
  getDetails: function(appstate, view, paymentType) {
    var self = this;

    return PaymentBundle.findOne({
      appstate,
      bundleID: self.bundleId,
      paymentType,
      view
    }).then(function(bundle) {
      // merge all those new properties into this one
      can.batch.start();
      self.attr(bundle.attr());
      self.attr('bundleDetailsGroup', bundle.bundleDetailsGroup);
      self.attr('bundleFooter', transformFooter(bundle.bdlFooter));
      can.batch.stop();

      bundle.getValidations();
      return self;
    });
  },
  getValidations: function(view) {
    var bundle = this;

    return $.ajax({
      url: URLs.DOMAIN_SERVICE_URL + 'rins/paymentBundle/validationResult',
      type: 'POST',
      data: {
        paymentBundle: {
          bundleId: bundle.bundleId,
          view: view
        }
      }
    }).then(function(validationResponse) {
      // for now, we have no invoiceId to hook up bundles with, so...
      // I guess we have to do it the hard way.
      var rulesCompleted = 0,
          rulesTotal = 0;

      can.batch.start();
      validationResponse.paymentBundle.bundleDetailsGroup.forEach(function(group) {
        var target = _.find(bundle.bundleDetailsGroup, {invoiceId: group.invoiceId});
        target.attr('validationMessages', group.vldtnMessage);
        target.attr('validationColor', group.vldtnBatchResultColor);

        group.bundleDetails.forEach(function(detail) {
          var lineTarget = _.find(target.bundleDetails, {bndlLineId: detail.bndlLineId});
          lineTarget.attr('validationMessages', detail.vldtnMessage);
          lineTarget.attr('validationColor', detail.vldtnBatchResultColor);

          rulesCompleted += detail.vldtnRulesCompletedCnt;
          rulesTotal += detail.vldtnRulesTotalCnt;
        });
      });

      bundle.attr({
        validationRulesCompleted: rulesCompleted,
        validationRulesTotal: rulesTotal
      });

      can.batch.stop();

      return validationResponse;
    });
  },
  moveInWorkflow: function(params) {
    if(['approve', 'reject', 'recall', 'delete'].indexOf(params.action) < 0) {
      throw new Error('Invalid action for payment bundle move. Only "approve", "reject", "recall", and "delete" are valid.');
    }

    var requestData = {
      paymentBundle: {
        action: params.action.toUpperCase(), // APPROVE, REJECT, RECALL, DELETE
        bundleType: this.bundleType,
        bundleLines: _.map(this.bundleDetailsGroup, (group) => ({
          refLineId: group.refLineId,
          refLineType: group.refLineType,
          periodType: group.periodType
        })),
        comments: params.approvalComment
      }
    };

    return $.ajax({
      url: URLs.DOMAIN_SERVICE_URL + 'rins/paymentBundle/' + (params.action === 'delete' ? 'manage' : params.action),
      type: 'POST',
      data: requestData
    });
  }
});

var transformFooter = function(bundleFooter) {
  bundleFooter.attr('paymentCcy', bundleFooter.currency);
  bundleFooter.bdlFooterDetails.forEach(function(detail) {
    detail.attr('paymentCcy', detail.currency);
  });

  return bundleFooter;
};

export default PaymentBundle;
