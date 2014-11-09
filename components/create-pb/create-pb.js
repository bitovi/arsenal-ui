import Component from 'can/component/';

import template from './template.stache!';
import styles from './create-pb.less!';

import BundleNamesModel from 'models/payment/bundleNames/';
import NewBundleNameModel from 'models/payment/newName/';

import UserReq from 'utils/request/';



var page = Component.extend({
  tag: 'create-pb',
  template: template,
  scope: {
    appstate: undefined,// this gets passed in
    type: "@",
    isCreatePB:true,
    "bundleNames":[],
    "paymentBundleId":"",
    "paymentBundleName":"",
    "bundleSearch":{},
    "localGlobalSearch":undefined
  },
  init: function(){
        var self = this;

         console.log("formBundleSearch");
         var bundleSearchRequest = {};
         bundleSearchRequest.bundleSearch = {};
         bundleSearchRequest.bundleSearch["serviceTypeId"] = this.scope.appstate.attr('storeType');
         bundleSearchRequest.bundleSearch["region"] = this.scope.appstate.attr('region');
         bundleSearchRequest.bundleSearch["type"] = this.scope.attr('type');
         console.log("bundleSearchRequest : "+JSON.stringify(bundleSearchRequest.bundleSearch));

          BundleNamesModel.findOne(UserReq.formRequestDetails(bundleSearchRequest),function(data){
              //console.log("passing params is "+JSON.stringify(data[0].attr()));
              self.scope.bundleNames.replace(data[0]["paymentBundles"]);
          },function(xhr){
            console.error("Error while loading: bundleNames"+xhr);
          });

    },
    events:{

      "#paymentBundleNames change":function(){
        var self = this;

          if( this.scope.attr("paymentBundleId") == 'createB'){
            this.scope.attr("isCreatePB" , false);
            //TODO : form the request based on the user selection on the each page
            var newBundleNameRequest = {};
            newBundleNameRequest.paymentBundle = {};
            newBundleNameRequest.paymentBundle["region"] = 'Europe';
            //TODO : periodFrom/to,bundleType has to be populated
            newBundleNameRequest.paymentBundle["periodFrom"] = "201303";
            newBundleNameRequest.paymentBundle["periodTo"] = "201304";
            newBundleNameRequest.paymentBundle["bundleType"] = "Regular";

              NewBundleNameModel.findOne(UserReq.formRequestDetails(newBundleNameRequest),function(data){
                  //console.log("passing params is "+JSON.stringify(data[0].attr()));
                  self.scope.attr("paymentBundleName" , data[0].paymentBundle.bundleName);
              },function(xhr){
                console.error("Error while loading: bundleNames"+xhr);
              });


          }
      },
      "#btnCancel click":function(){
        this.scope.attr("isCreatePB" , true);
        this.scope.attr("paymentBundleId", '');
      },
      '{scope.appstate} change': function() {
          // Triggers when Global Search is clicked and loads the Payment bundles accordingly.
          if(this.scope.attr("localGlobalSearch") != this.scope.appstate.attr('globalSearch') ){
            this.scope.attr("localGlobalSearch",this.scope.appstate.attr('globalSearch'));
            console.log("User clicked on bundle search");

            var self = this;
            var bundleSearchRequest = {};
            bundleSearchRequest.bundleSearch = {};
            bundleSearchRequest.bundleSearch["serviceTypeId"] = this.scope.appstate.attr('storeType');
            bundleSearchRequest.bundleSearch["region"] = this.scope.appstate.attr('region');
            bundleSearchRequest.bundleSearch["type"] = this.scope.appstate.attr('page');

            BundleNamesModel.findOne(UserReq.formRequestDetails(bundleSearchRequest),function(data){
                self.scope.bundleNames.replace(data["paymentBundles"]);
            },function(xhr){
              console.error("Error while loading: bundleNames"+xhr);
            });


            //console.log("  User clicked "+this.scope.localGlobalSearch+" Other:"+this.scope.appstate.attr('globalSearch') );
          }
          //console.log("glo2balFetch Global Search: "+this.scope.appstate.attr('globalSearch'));
      }
    }


});


export default page;
