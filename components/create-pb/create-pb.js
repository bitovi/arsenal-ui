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
    request: "@",
    newbundlenamereq:"@",
    /*
    Ex: Create
    {
        mode:"Create",//Create or Read
        //Other request object is mentioned below
        "searchRequest":{
        bundleSearch:{
          type:"invoices"
        },
      },
      "newNameRequest":{
        paymentBundle:{
          region:"Europe",
          periodFrom:'201303',
          periodTo:'201304',
          bundleType:'Regular'
        }
      }
      };

      Ex: Read
      {
        mode:"Read",
        paymentBundleName:<bundlename>,
        paymentBundleId:<bundleId>
      };

    */
    createPBFlag:{select:true},
    "bundleNames":[],
    "paymentBundleId":"",
    "paymentBundleName":"",
    "bundleSearch":{}
  },
  init: function(){

        var self = this;


        var requestObj = JSON.parse(self.scope.attr("request"));
        //console.log("requestObj is "+JSON.stringify(requestObj));

        if(requestObj!="undefined"){
            BundleNamesModel.findOne(UserReq.formRequestDetails(requestObj),function(data){
                  //console.log(" BundleNamesModel response is "+JSON.stringify(data.attr()));
                  self.scope.bundleNames.replace(data["paymentBundles"]);
            },function(xhr){
                console.error("Error while loading: bundleNames"+xhr);
            });

        }else if (requestObj.mode == "Read"){

          self.scope.attr("createPBFlag",{read:true});
          self.scope.attr("paymentBundleName",requestObj.paymentBundleName);
          self.scope.attr("paymentBundleId",requestObj.paymentBundleId);

        }else{
          console.error("Craete Payment Bundle: Invalid Mode!!");
        }
    },
    events:{

      "#btnCancel click":function(){
        this.scope.attr("createPBFlag",{select:true});
        this.scope.attr("paymentBundleId", '');
      },
      "{scope} newbundlenamereq": function(){
        var self= this;

        var requestObj = self.scope.attr("newbundlenamereq");
        if(requestObj!="undefined"){
          requestObj = JSON.parse(requestObj);
          self.scope.attr("createPBFlag",{input:true});
          NewBundleNameModel.findOne(UserReq.formRequestDetails(requestObj),function(data){
            if(data.status == "FAILURE"){
                 console.error("Failed to load the bundleName: "+data.responseText);
               }else{
                  self.scope.attr("paymentBundleName", data.paymentBundle.bundleName);
              }
          },function(xhr){
                console.error("Error while loading: bundleNames"+xhr);
          });
        }
      }
    }
});


export default page;
