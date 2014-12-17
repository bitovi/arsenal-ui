import _ from 'lodash';
import Model from 'can/model/';
import can_define from 'can/map/define/'
import URLs from 'utils/urls';
import requestHelper from 'utils/request/';

import PaymentBundleDetailGroup from './payment-bundle-detail-group';

var PaymentBundle = Model.extend({
  VALIDATION_CODES: {
    RED: 1,
    YELLOW: 2,
    GREEN: 3
  },
  id: 'bundleId',
  parseModels: function(data, xhr) {
    return data.paymentBundles;
  },
  parseModel: function(data, xhr) {
    return data.hasOwnProperty('responseCode') ? data.paymentBundle : data;
  },
  model: function(data) {
    // TODO: periodFrom, periodTo, paymentCurrency, and region probably need some more handling.
    // Apparently isHighPriority isn't coming back from the services anymore?
    if(data.hasOwnProperty('isHighPriority')) {
      data.isHighPriority = (data.isHighPriority === 'Y');
    }
    if(data.hasOwnProperty('editable')) {
      data.editable = !!data.editable;
    }
    if(data.hasOwnProperty('recallable')) {
      data.recallable = !!data.recallable;
    }
    if(data.hasOwnProperty('deletable')) {
      data.deletable = !!data.deletable;
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

    var data = {
      bundleSearch: requestHelper.formGlobalRequest(appstate).searchRequest
    };

    return $.ajax({
      url: URLs.DOMAIN_SERVICE_URL + 'paymentBundle/getAll',
      type: 'POST',
      data: data,
      processData: false
    });
  },
  findOne: function(params) {
    var paymentOption = params.paymentType,
        view = params.view.toUpperCase(),
        bundleId = params.bundleID;

    // TODO: when infrastructure gets set up, fix this.
    var data = {
      paymentBundle: {
        bundleId,
        paymentOption,
        view
      }
    };

    return $.ajax({
      url: URLs.DOMAIN_SERVICE_URL + 'paymentBundle/get',
      type: 'POST',
      data: data,
      processData: false
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
      url: URLs.DOMAIN_SERVICE_URL + 'paymentBundle/delete',
      type: 'POST',
      data: data,
      processData: false
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

      return self;
    });
  },
  getValidations: function(view) {
    var bundle = this;

    return $.ajax({
      url: URLs.DOMAIN_SERVICE_URL + 'paymentBundle/getPaymentValidationResult',
      type: 'POST',
      data: {
        paymentBundle: {
          bundleId: bundle.bundleId,
          view: view
        }
      },
      processData: false
    }).then(function(validationResponse) {
      // for now, we have no invoiceId to hook up bundles with, so...
      // I guess we have to do it the hard way.
      var rulesCompleted = 0,
          rulesTotal = 0;

      can.batch.start();
      validationResponse.paymentBundle.bundleDetailsGroup.forEach(function(group) {
        // only update these if validation is done
        if(validationResponse.paymentBundle.vldtnStatus === 5) {
          var target = _.find(bundle.bundleDetailsGroup, {invoiceId: group.invoiceId});
          target.attr('validationMessages', group.vldtnMessage);
          target.attr('validationColor', group.vldtnBatchResultColor);
        }

        group.bundleDetails.forEach(function(detail) {
          // only update these if validation is done
          if(validationResponse.paymentBundle.vldtnStatus === 5) {
            var lineTarget = _.find(target.bundleDetails, {bndlLineId: detail.bndlLineId});
            lineTarget.attr('validationMessages', detail.vldtnMessage);
            lineTarget.attr('validationColor', detail.vldtnBatchResultColor);
          }

          rulesCompleted += detail.vldtnRulesCompletedCnt;
          rulesTotal += detail.vldtnRulesTotalCnt;
        });
      });

      bundle.attr({
        validationStatus: validationResponse.paymentBundle.vldtnStatus,
        validationRulesCompleted: rulesCompleted,
        validationRulesTotal: rulesTotal
      });

      can.batch.stop();

      return bundle;
    });
  },
  getPreview: function(params) {
    
  },
  moveInWorkflow: function(params) {
    if(['approve', 'reject', 'recall', 'delete'].indexOf(params.action) < 0) {
      throw new Error('Invalid action for payment bundle move. Only "approve", "reject", "recall", and "delete" are valid.');
    }

    var bundleDetailsGroup = this.bundleDetailsGroup.attr();
    bundleDetailsGroup.forEach(function(group) {
      group.bundleDetails.forEach(function(detail) {
        delete detail.__isChild;
      });
    });

    var requestData = {
      paymentBundle: {
        comments: params.approvalComment,
        bundleId: this.bundleId,
        approvalId: this.approvalId,
        periodFrom: this.periodFrom,
        periodTo: this.periodTo,
        paymentAmt: this.paymentAmt,
        paymentCcy: this.paymentCcy,
        status: this.status,
        bundleDetailsGroup: bundleDetailsGroup
      }
    };

    return $.ajax({
      url: URLs.DOMAIN_SERVICE_URL + 'paymentBundle/' + (params.action === 'delete' ? 'manage' : params.action),
      type: 'POST',
      data: requestData,
      processData: false
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
