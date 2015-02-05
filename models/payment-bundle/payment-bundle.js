import _ from 'lodash';
import Model from 'can/model/';
import can from 'can/';
import can_define from 'can/map/define/'
import URLs from 'utils/urls';
import requestHelper from 'utils/request/';
import constants from 'utils/constants';

import PaymentBundleDetailGroup from './payment-bundle-detail-group';

var PaymentBundle = Model.extend({
  id: 'bundleId',
  // parseModels: function(data, xhr) {
  //    return (typeof (data.exportExcelFileInfo)!="object") ? data:data;
  // },
  // parseModel: function(data, xhr) { //console.log(data);
  //   var temp='';
  //    if(data.hasOwnProperty('responseCode') && typeof (data.exportExcelFileInfo)!="object") temp=data.paymentBundle;
  //    else temp=data;
  //
  //
  //    return temp;
  // },
  //Removed the parseModel as its picking up old model. Can js Issue:
  //<rdar://problem/19350067> UI-PBR Details Country View: Incorrect Details
  // parseModel: function(data, xhr) {
  //   return data.hasOwnProperty('responseCode') ? data.paymentBundle : data;
  // },
  model: function(data) {
    // TODO: periodFrom, periodTo, paymentCurrency, and region probably need some more handling.
    // Apparently isHighPriority isn't coming back from the services anymore?
    // if(data.hasOwnProperty('priority')) {
    //   data.isHighPriority = (data.priority === 'Y');
    // }
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
  loadAll: function(params) {
    var appstate = params.appstate;
    var data = {}

    var excelOutput = appstate.attr('excelOutput') != undefined ? appstate.attr('excelOutput') : false;
     data = {
        bundleSearch:requestHelper.formGlobalRequest(appstate).searchRequest
      };
      if (params.paginate) {
        data.bundleSearch["offset"] = params.paginate.offset;
        data.bundleSearch["sortBy"] =  params.paginate.sortBy.attr().toString()
        data.bundleSearch["limit"] = appstate.attr("fetchSize");
        data.bundleSearch["sortOrder"] = params.paginate.sortDirection;
      }


     if(excelOutput!=false){
        data["excelOutput"]=true
     }

    return $.ajax({
      url: URLs.DOMAIN_SERVICE_URL + 'paymentBundle/getAll',
      type: 'POST',
      data: data,
      processData: false
    });
  },
  preview: function(invId){
    window.open(URLs.DOMAIN_SERVICE_URL + 'invoice/getPdfContent/'+invId, '_blank', 'width=300,height=200');
  },
  downloadFile:function(type,id){
    var url = "";
    if(type === 'ecsv'){
      url = URLs.DOMAIN_SERVICE_URL +'paymentBundle/ecsv/'+id;
    }else if(type === 'pcsv'){
      url = URLs.DOMAIN_SERVICE_URL +'paymentBundle/pcsv/'+id;
    }else if(type === 'all'){
      url = URLs.DOMAIN_SERVICE_URL +'paymentBundle/downloadInvoiceFiles/'+id;
    }else{
      console.log("invalid action");
    }
    window.location.href = url;
  },
  findOne: function(params) {
    var appstate = params.appstate;
    if(params.appstate.excelOutput){
       var excelOutput = appstate.attr('excelOutput') != undefined ? appstate.attr('excelOutput') : false;
       var paymentOption = params.paymentType,
            view =  params.view.toUpperCase(),
            bundleId = appstate.bundleId;

       var data = {
           paymentBundle: {
              bundleId,
              paymentOption,
              view,
              periodType: params.appstate.periodType
            },
            bundleSearch: requestHelper.formGlobalRequest(appstate).searchRequest
       };
       if(excelOutput!=false){
          data["excelOutput"]=true
       }
       if(params.preferredCcy !== ""){
         data.paymentBundle["preferredCcy"]=params.preferredCcy;
       }


       if(appstate.attr('detail')){
         appstate.attr('detail',false);
         return $.ajax({
            url: URLs.DOMAIN_SERVICE_URL + 'paymentBundle/get',
            type: 'POST',
            data: data,
            processData: false
          });
       }else{
         return $.ajax({
          url: URLs.DOMAIN_SERVICE_URL + 'paymentBundle/getAll',
          type: 'POST',
          data: data,
          processData: false
        });
      }

    }else{
        var paymentOption = params.paymentType,
            view = params.view.toUpperCase(),
            bundleId = params.bundleID;


            var filterFormatted = [];
            _.each(params.filterData, function(obj) {
              filterFormatted.push(obj.name);
            });

        // TODO: when infrastructure gets set up, fix this.
        data = {
          paymentBundle: {
            bundleId,
            paymentOption,
            view,
            periodType: params.appstate.periodType
          },
         bundleSearch: {
           filter: filterFormatted
          }
        };

        if(params.preferredCcy !== ""){
          data.paymentBundle["preferredCcy"]=params.preferredCcy;
        }

        if (params.paginate) {
          data.bundleSearch["offset"] = params.paginate.offset;
          data.bundleSearch["sortBy"] =  params.paginate.sortBy.attr().toString()
          data.bundleSearch["limit"] = appstate.attr("fetchSize");
          data.bundleSearch["sortOrder"] = params.paginate.sortDirection;
        }

        var excelOutput = appstate.attr('excelOutput') != undefined ? appstate.attr('excelOutput') : false;
        if(excelOutput!=false){
          data["excelOutput"]=true
        }

        return $.ajax({
          url: URLs.DOMAIN_SERVICE_URL + 'paymentBundle/get',
          type: 'POST',
          data: data,
          processData: false
      });

      }


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
  getDetails: function(params) {
    var self = this;

    params["bundleID"] = self.bundleId;

    return PaymentBundle.findOne(params).then(function(bundle) {

      can.batch.start();
        if(bundle.status == "FAILURE" ){


          self.attr('status',bundle.status);
          self.attr('responseText',bundle.responseText);


        }else{
          // merge all those new properties into this one
          bundle.hasOwnProperty('recordsAvailable') ? params.paginate.attr("recordsAvailable",bundle.recordsAvailable):"";

          //console.log(params.paginate.attr("offset") + ", Inside : "+params.paginate.attr("recordsAvailable"));
          bundle = bundle.hasOwnProperty('responseCode') ? bundle.paymentBundle : bundle;
          if(params.paginate.offset > 0){
            self.attr('bundleDetailsGroup', bundle.bundleDetailsGroup);
            self.attr('bundleFooter', transformFooter(bundle.bdlFooter));
          }else{
            self.attr(bundle.attr());
            self.attr('bundleDetailsGroup', bundle.bundleDetailsGroup);
            self.attr('bundleFooter', transformFooter(bundle.bdlFooter));
          }


        }
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
          view: view.toUpperCase()
        }
      },
      processData: false
    }).then(function(validationResponse) {
      // for now, we have no invoiceId to hook up bundles with, so...
      // I guess we have to do it the hard way.
      var rulesCompleted = 0,
          rulesTotal = 0;

      if(validationResponse.status != "FAILURE" && validationResponse.paymentBundle != undefined){ // On success

        // only update these if validation is done
        if(validationResponse.paymentBundle.vldtnStatus === 5) {
            can.batch.start();
            validationResponse.paymentBundle.bundleDetailsGroup.forEach(function(group) {
              var target = undefined;

                if(group.key != undefined){
                  var target = _.find(bundle.bundleDetailsGroup, {key: group.key});
                  if(target != undefined ){
                    group.vldtnMessage == undefined ? target.attr('validationMessages', "") : target.attr('validationMessages', group.vldtnMessage);
                    group.vldtnBatchResultColor == undefined ? target.attr('validationColor', "") : target.attr('validationColor', group.vldtnBatchResultColor);
                  }
                }

                group.bundleDetails.forEach(function(detail) {
                  // only update these if validation is done
                  //TODO code modification is needed when the servcice s is ready with Proper JSON.
                  // if(validationResponse.paymentBundle.vldtnStatus === 5) {
                  if(target != undefined ){
                    var lineTarget = _.find(target.bundleDetails, {bndlLineId: detail.bndlLineId});
                    lineTarget.attr('validationMessages', detail.vldtnMessage);
                    detail.vldtnBatchResultColor != undefined  ?  lineTarget.attr('validationColor', detail.vldtnBatchResultColor ) :  lineTarget.attr('validationColor', "" );
                  }
                  // }
                });
            });

            bundle.attr('validationStatus', validationResponse.paymentBundle.vldtnStatus);

            // bundle.attr({
            //   validationStatus: validationResponse.paymentBundle.vldtnStatus,
            //   validationRulesCompleted: rulesCompleted,
            //   validationRulesTotal: rulesTotal
            // });

            can.batch.stop();

          }

      }

      return bundle;
    });
  },
  moveInWorkflow: function(params) {
    if(['approve', 'reject', 'recall', 'delete'].indexOf(params.action) < 0) {
      throw new Error('Invalid action for payment bundle move. Only "approve", "reject", "recall", and "delete" are valid.');
    }

    var bundleData = this.attr();
    // now to reverse all the stuff we did in the name of science
    delete bundleData.bundleFooter;


    delete bundleData.validationStatus;
    //delete bundleData.validationRulesCompleted;
    //delete bundleData.validationRulesTotal;



    bundleData.bundleDetailsGroup && bundleData.bundleDetailsGroup.forEach(function(group) {
      delete group.__isChild;
      delete group.__isOpen;

      delete group.contentGrpName;
      delete group.country;
      delete group.fiscalPeriodDisplay;
      delete group.adhocTypeNameDisplay;
      delete group.entityNameCnt;
      delete group.view;
      delete group.validationMessages;
      delete group.validationColor;

      group.bundleDetails.forEach(function(detail) {
        delete detail.__isChild;
        delete detail.__isOpen;
        delete detail.view;
        delete detail.validationMessages;
        delete detail.validationColor;
        delete detail.fiscalPeriodDisplay;
      });
    });

    if(bundleData.bdlFooter) {
      delete bundleData.bdlFooter.paymentCcy;
      delete bundleData.bdlFooter.isFooterRow;
      delete bundleData.bdlFooter.view;
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

    if(params.priority != undefined ) {
      bundleData["priority"] = params.priority;
    }

    if(params.action !== 'delete' &&  params.preferredCcy !== ""){
      bundleData["preferredCcy"] = params.preferredCcy;
    }


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
          refLineId: group.invoiceId,
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
