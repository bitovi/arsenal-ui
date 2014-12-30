import _ from 'lodash';
import Model from 'can/model/';
import can from 'can/';
import can_define from 'can/map/define/'
import URLs from 'utils/urls';
import requestHelper from 'utils/request/';

import PaymentBundleDetailGroup from './payment-bundle-detail-group';

var PaymentBundle = Model.extend({
  id: 'bundleId',
  parseModels: function(data, xhr) {
    return data.paymentBundles;
  },
  // parseModel: function(data, xhr) {
  //   return data.hasOwnProperty('responseCode') ? data.paymentBundle : data;
  // },
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
    var d = can.Deferred();
    d.resolve(this);
    return d;
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
      bundle = bundle.hasOwnProperty('responseCode') ? bundle.paymentBundle : bundle;
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

    var bundleData = this.attr();
    // now to reverse all the stuff we did in the name of science
    delete bundleData.bundleFooter;

    bundleData.bundleDetailsGroup && bundleData.bundleDetailsGroup.forEach(function(group) {
      delete group.__isChild;
      delete group.__isOpen;

      group.bundleDetails.forEach(function(detail) {
        delete detail.__isChild;
        delete detail.__isOpen;
      });
    });

    if(bundleData.bdlFooter) {
      delete bundleData.bdlFooter.paymentCcy;
      delete bundleData.bdlFooter.isFooterRow;
      bundleData.bdlFooter.bdlFooterDetails.forEach(function(detail) {
        delete detail.__isChild;
        delete detail.__isOpen;
        delete detail.paymentCcy;
      });
    }

    bundleData = can.extend(bundleData, {
      comments: params.approvalComment,
      paymentOption: params.paymentOption
    });

    var requestData = {
      paymentBundle: bundleData
    };

    //console.log(JSON.stringify(requestData));

    return $.ajax({
      url: URLs.DOMAIN_SERVICE_URL + 'paymentBundle/' + (params.action === 'delete' ? 'abort' : params.action),
      type: 'POST',
      data: requestData,
      processData: false
    });
  },
  removeBundleGroups: function(groups, appstate) {
    var requestData = {
      prsId: appstate.userInfo.prsId,
      paymentBundle: {
        bundleId: this.bundleId,
        bundleName: this.bundleName,
        bundleType: this.bundleType,
        mode: 'REMOVE',
        bundleDetailsGroup: _.map(groups, function(group) { return {
          refLineId: group.refLineId,
          refLineType: group.refLineType,
          periodType: appstate.periodType
        }})
      }
    };

    return $.ajax({
      url: URLs.DOMAIN_SERVICE_URL + 'paymentBundle/manage',
      type: 'POST',
      data: requestData,
      processData: false
    }).then(function(response) {
      if(response.status === 'SUCCESS') {
        //debugger;
        groups.forEach(group => group.destroy());
      }

      return response;
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
