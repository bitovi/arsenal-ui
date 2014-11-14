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

        if(requestObj.mode == "Create"){

            BundleNamesModel.findOne(UserReq.formRequestDetails(requestObj["searchRequest"]),function(data){
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

      "#paymentBundleNames change":function(){
        var self = this;
        var requestObj = JSON.parse(self.scope.attr("request"));
        

        //console.log("requestObj "+JSON.stringify(UserReq.formRequestDetails(requestObj["newNameRequest"])));
          if( this.scope.attr("paymentBundleId") == 'createB'){
              self.scope.attr("createPBFlag",{input:true});
              NewBundleNameModel.findOne(UserReq.formRequestDetails(requestObj["newNameRequest"]),function(data){
                      //console.log("NewBundleNameModel response is "+JSON.stringify(data));
                      self.scope.attr("paymentBundleName" , data.paymentBundle.bundleName);
              },function(xhr){
                    console.error("Error while loading: bundleNames"+xhr);
              });

          }else{

          }


      },
      "#btnCancel click":function(){
        this.scope.attr("createPBFlag",{select:true});
        this.scope.attr("paymentBundleId", '');
      }
    }


});


export default page;
