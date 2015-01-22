import _ from 'lodash';
import Component from 'can/component/';
import Map from 'can/map/';
import can from 'can/';
import stache from 'can/view/stache/';

// Models
import PaymentBundle from 'models/payment-bundle/';

// Components
import PaymentBundleGrid from 'components/bundle-grid/';
import PaymentBundleDetail from 'components/bundle-detail/';

import commonUtils from 'utils/commonUtils';

import template from './template.stache!';
import styles from './page-payment-bundles.less!';

import exportToExcel from 'components/export-toexcel/';
import copy from 'components/copy-clipboard/';

var pageState = new Map({
  bundles: new PaymentBundle.List([]),
  selectedBundle: null,
  verboseGrid: false,
  isPaginateReq: false,//triggers the paginate Event from bundle-grid.js
  recordsAvailable:undefined
});

var page = Component.extend({
  tag: 'page-payment-bundles',
  template: template,
  scope: {
    appstate: null, // will be passed in
    pageState: pageState,
    isPageSearch: undefined,//To controll Gloable search
    paginateAttr:{
      offset: 0,
      sortBy: [],
      sortDirection: "asc"
    },
    refreshBundles: _.debounce(function() {
      var self=this;


      if(pageState.attr("isPaginateReq")){

        this.scope.paginateAttr.attr('offset',  this.scope.paginateAttr.attr('offset')+1);

        this.scope.appstate.attr('excelOutput',false);

        PaymentBundle.loadAll({appstate: this.scope.appstate, paginate: this.scope.paginateAttr}).done(function(data) {

          if(data.responseCode === '0000'){

            can.batch.start();

            $.merge(pageState.bundles, data.paymentBundles);

            pageState.bundles.replace(pageState.bundles);

            pageState.attr("recordsAvailable",data.recordsAvailable);

            can.batch.stop();
          }else{
            commonUtils.displayUIMessage( data.responseCode, data.responseText);
          }

        });

        pageState.attr("isPaginateReq",false);



      }else{
        if(this.scope.isPageSearch != this.scope.appstate.globalSearch) {

          this.scope.appstate.attr('excelOutput',false);
          this.scope.paginateAttr.attr('offset',  0);

          resetGrids(pageState);

          this.scope.isPageSearch  = this.scope.appstate.globalSearch;
          PaymentBundle.loadAll ({appstate: this.scope.appstate,paginate: this.scope.paginateAttr}).done(function(data) {

            if(data.responseCode === '0000'){
              can.batch.start();
              pageState.bundles.splice(0, pageState.bundles.length);
              pageState.bundles.replace(data.paymentBundles);
              pageState.attr("recordsAvailable",data.recordsAvailable);
              can.batch.stop();
            }else{
              commonUtils.displayUIMessage( data.responseCode, data.responseText);
            }

          });


        }
        // else {
        //   if(!this.scope.appstate.excelOutput){
        //
        //     resetGrids(pageState);
        //
        //   }
        // }
      }

    }, 200)
  },
  helpers: {
    showPage: function(options) {
    //  return options.fn(this);
      // if(this.appstate.attr('globalSearch')) {
      //
      // } else {
      //   return '';
      // }
    }
  },
  events: {
    'inserted': function(ev, el) {
      this.scope.appstate.attr('renderGlobalSearch', true);
      this.scope.appstate.attr('excelOutput',false);
      this.scope.refreshBundles.apply(this);
    },
    '{scope} change': function(scope, ev, attr) {
      var self=this;

      if(self.scope.pageState.attr("isPaginateReq")){
        this.scope.refreshBundles.apply(this);
      }

      if(attr.substr(0, 8) === 'appstate') {
        this.scope.refreshBundles.apply(this);
      }
    },
    //Removed the Delete bundle as its not require for top grid. It only need to be available in the bottom grid
    // '.delete-bundle click': function(el, ev) {
    //   if(!this.scope.pageState.selectedBundle) {
    //     return;
    //   }
    //
    //   PbrDeleteConfirmModal.displayModal(this.scope.pageState.selectedBundle, {
    //     action: 'delete',
    //     approvalComment: '',
    //     paymentOption: 1
    //   });
    //   this.scope.attr('selectedBundle', null);
    // },
    '.add-invoice click': function(el, ev) {
      commonUtils.navigateTo("invoices");
    },
//     ".rn-grid>thead>tr>th:gt(0) click": function(item, el, ev){
//           var self=this;
//            //console.log($(item[0]).attr("class"));
//           var val = $(item[0]).attr("class").split(" ");
//           var existingSortColumns =self.scope.sortColumns.attr();
//           var existingSortColumnsLen = existingSortColumns.length;
//           var existFlag = false;
//           if(existingSortColumnsLen==0){
//             self.scope.attr('sortColumns').push(val[0]);
//           } else {
//             for(var i=0;i<existingSortColumnsLen;i++){
//               /* The below condition is to selected column to be sorted in asc & dec way */
//               console.log(val[0]+","+existingSortColumns[i] )
//               if(existingSortColumns[i] == val[0]){
//                 existFlag = true;
//               }
//             }
//             if(existFlag==false){
//               self.scope.attr('sortColumns').replace([]);
//               self.scope.attr('sortColumns').push(val[0]);
//             } else {
//               var sortDirection = (self.scope.attr('sortDirection') == 'asc') ? 'desc' : 'asc';
//               self.scope.attr('sortDirection', sortDirection);
//             }
//
//           }
//
//           console.log("aaa "+self.scope.sortColumns.attr());
//            /* The below code calls {scope.appstate} change event that gets the new data for grid*/
//            /* All the neccessary parameters will be set in that event */
//            if(self.scope.appstate.attr('globalSearch')){
//               self.scope.appstate.attr('globalSearch', false);
//             }else{
//               self.scope.appstate.attr('globalSearch', true);
//             }
//
//     },
    '.excel click': function(el, ev) {
      var self = this;

      // self.scope.appstate.attr('excelOutput', true);

      // if(this.scope.appstate.excelOutput ) {

      //    PaymentBundle.loadAll({appstate: this.scope.appstate}).then(function(data) {
      //       if(data["status"]=="0000"){
      //           $('#exportExcel').html(stache('<export-toexcel csv={data}></export-toexcel>')({data}));
      //      }
      //    },function(err){
      //       console.log(err);
      //   });
      //  }

    },
    '.clipboard click': function(el, ev) {
      // copy bundle list information to clipboard
       $('#clonetable').empty().html($('#page').find('table:visible').clone(true).attr('id','dynamic'));
         $('copy-clipboard').slideDown(function(){
           $('body').css('overflow','hidden');
           $('#copyall').trigger('click');
        });
    }
  }
});



var resetGrids = function(pageState){
  //Reset the grid

  can.batch.start();
  pageState.bundles.splice(0, pageState.bundles.length);
  pageState.attr('selectedBundle', null);
  can.batch.stop();
}




export default page;
