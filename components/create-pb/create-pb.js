import Component from 'can/component/';

import template from './template.stache!';
import styles from './create-pb.less!';

import BundleNamesModel from 'models/payment/bundleNames/';
import NewBundleNameModel from 'models/payment/newName/';


var page = Component.extend({
  tag: 'create-pb',
  template: template,
  scope: {
    name: "@",
    isCreatePB:true,
    "bundleNames":[],
    "paymentBundleId":"",
    "paymentBundleName":"",
    "bundleSearch":{}
  },
  init: function(){
        var self = this;
          Promise.all([
             BundleNamesModel.findAll()
          ]).then(function(values) {
            //console.log(values[0][0]["bundleNames"].attr("bundleId"));
            self.scope.bundleNames.replace(values[0][0]["bundleNames"]);
          });
    },
    events:{
      "#paymentBundleNames change":function(){
          if( this.scope.attr("paymentBundleId") == 'createB'){
            this.scope.attr("isCreatePB" , false);
            //TODO Load the Payment bundle name by calling service name
            this.scope.attr("paymentBundleName" , "TEST Bundle");
          }
      },
      "#btnCancel click":function(){
        this.scope.attr("isCreatePB" , true);
        this.scope.attr("paymentBundleId", '');
      }
    }

});

export default page;
