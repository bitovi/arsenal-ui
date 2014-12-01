import Component from 'can/component/';
import stache from 'can/view/stache/';

import template from './template.stache!';
import gridtemplate from './gridtemplate.stache!';
import _less from './page-on-account.less!';

import stache from 'can/view/stache/';

import UserReq from 'models/rinsCommon/request/';

import OnAccountGrid from 'components/grid-onaccount-balance/';
import Grid from 'components/grid/';
import newOnAccountGrid from 'components/grid-new-onaccount/';
import fileUpload from 'components/file-uploader/';

import createpb from 'components/create-pb/';
import utils from 'components/page-on-account/utils';
import proposedOnAccountGrid from 'components/grid-proposed-onaccount/';

var page = Component.extend({
  tag: 'page-on-account',
  template: template,
  scope: {
    localGlobalSearch:undefined,
    request:{},
    onAccountRows:{},
    documents:[],
    newpaymentbundlenamereq:undefined,
    tabsClicked:"@",
    paymentBundleName:"@",
    usercommentsStore:"",
    paymentBundleNameText:"",
    proposedOnAccountData:{}

  },
  init: function(){
	 //console.log('inside Claim Review');

   this.scope.tabsClicked="NEW_ON_ACC";
	 
    },
    events: {
    	"inserted": function(){ 
       
    	},
      'period-calendar onSelected': function (ele, event, val) {  
         this.scope.attr('periodchoosen', val);
          var which = $(ele).parent().find('input[type=text]').attr('id');
         this.scope.appstate.attr(which, this.scope.periodchoosen);
        $(ele).parent().find('input[type=text]').val(this.scope.periodchoosen).trigger( "change" ); ;
         },
        '.updateperoid focus':function(el){ 
        $(el).closest('.calendarcls').find('.box-modal').is(':visible') ?
        $(el).closest('.calendarcls').find('.box-modal').hide():$(el).closest('.calendarcls').find('.box-modal').show();
        },
      "#paymentBundleNames change": function(){
          var self = this;
          var pbval = $("#paymentBundleNames").val();
          if(pbval=="createB"){
              
              var regId = self.scope.appstate.attr('region');


              var newBundleNameRequest = {"paymentBundle":{}};
              var bundleRequest = {};

              bundleRequest["region"] = regId['value'];
              bundleRequest["periodFrom"] = "201303";
              bundleRequest["periodTo"] = "201304";
              //bundleRequest["bundleType"] =lineType;
              bundleRequest["bundleType"] ="ON_ACCOUNT";

              newBundleNameRequest["paymentBundle"] = bundleRequest;
              //console.log("New Bundle name request is "+JSON.stringify(newBundleNameRequest));
              self.scope.attr('newpaymentbundlenamereq', JSON.stringify(newBundleNameRequest));
          } else {
            self.scope.attr('paymentBundleName',pbval);
            self.scope.attr('paymentBundleNameText',$("#paymentBundleNames option:selected").text());
            self.scope.attr('newpaymentbundlenamereq', "undefined");
          }
      },
      '{scope.appstate} change': function() {

        this.scope.attr("localGlobalSearch",this.scope.appstate.attr('globalSearch'));

        var request = frameRequest(this.scope.appstate); 

        this.scope.attr('request',request);

        if(this.scope.appstate.attr('globalSearch')){

            if(this.scope.tabsClicked=="ON_ACC_BALANCE"){
               //var request = frameRequest(this.scope.appstate);   
               $('#onAccountBalanceGrid').html(stache('<rn-onaccount-balance-grid request={request}></rn-onaccount-balance-grid>')({request}));
            }else if(this.scope.tabsClicked=="NEW_ON_ACC"){
              //console.log("inside NEW_ON_ACC");
              $('#newonAccountGrid, #newonAccountGridComps').show();
                $('#newonAccountGrid').html(stache('<rn-new-onaccount-grid request={request}></rn-new-onaccount-grid>')({request}));
            }else if(this.scope.tabsClicked=="PROPOSED_ON_ACC"){
              disableEditORDeleteButtons(true);
              $('#proposedOnAccountGrid').html(stache('<rn-proposed-onaccount-grid request={request}></rn-proposed-onaccount-grid>')({request}));
            }

        }

        this.scope.attr("localGlobalSearch",false);
        
      },
      "#onAccountBalance click":function(el, ev){
        ev.preventDefault();
        this.scope.tabsClicked="ON_ACC_BALANCE";
        $('#newonAccountGrid, #newonAccountGridComps, #proposedonAccountDiv').hide();
        $('#onAccountBalanceDiv').show();

        //console.log(this.scope.tabsClicked);
      },
      "#newonAccount click":function(el, ev){
        ev.preventDefault();
        this.scope.tabsClicked="NEW_ON_ACC";
        $('#newonAccountGrid, #newonAccountGridComps').show();
        $('#onAccountBalanceDiv, #proposedonAccountDiv').hide();
        //console.log(this.scope.tabsClicked);
      },
      "#proposedonAccount click":function(el, ev){
        ev.preventDefault();
        this.scope.tabsClicked="PROPOSED_ON_ACC";
        $('#newonAccountGrid, #onAccountBalanceDiv').hide();
        $('#proposedonAccountDiv').show();

       disableEditORDeleteButtons(true);

        //console.log(this.scope.tabsClicked);
      },
      "#propose click":function(el,ev){
        var self = this;
        //alert('user comment'+ this.scope.usercommentsStore);
        //console.log('scope value');
        //console.log(self.scope.onAccountRows);
        var quarters = utils.getQuarter(self.scope.request.searchRequest.periodFrom,self.scope.request.searchRequest.periodTo);
        var createrequest = utils.frameCreateRequest(self.scope.request,self.scope.onAccountRows,self.scope.documents,self.scope.usercommentsStore,quarters,self.scope.paymentBundleName);
        
      },
      "#proposedDelete click":function(el,ev){
        disableEditORDeleteButtons(true);
        var req = this.scope.request;
        var deletableRows = [];
        var rows = this.scope.proposedOnAccountData.rows;
        // console.log('checking');
        // console.log(rows);
        var type = 'DELETE';
        if(rows != undefined && rows.length >0){
            for(var i=0;i < rows.length;i++){
                  if(rows[i].__isChecked != undefined && rows[i].__isChecked){
                    deletableRows.push(rows[i]);
                    //alert('Deleting');
                    rows.splice(i,1);
                    i=i-1;
                  }
                }
            
         }
         //console.log('Delete');
         //console.log(rows);
        req.attr('deletableRows',rows); 

        $('#proposedOnAccountGrid').html(stache('<rn-proposed-onaccount-grid request={req} type={type} ></rn-proposed-onaccount-grid>')({req,type}));
      },
      "#proposedEdit click":function(el,ev){
          var req = this.scope.request;
        console.log(this.scope.proposedOnAccountData.rows);
        req.attr('editableRows',this.scope.proposedOnAccountData.rows);
        var type = 'EDIT';
        //console.log('Editing');
        //console.log(this.scope.proposedOnAccountData.rows);
        $('#proposedOnAccountGrid').html(stache('<rn-proposed-onaccount-grid request={req} type={type}></rn-proposed-onaccount-grid>')({req,type}));
      },
      'rn-new-onaccount-grid onSelected': function (ele, event, val) {  
              this.scope.attr('onAccountRows',val);
      },
      'rn-file-uploader onSelected':function (ele, event, val){
            this.scope.attr('documents').replace(val);
      },
      'rn-proposed-onaccount-grid onSelected':function(ele, event, val){
            this.scope.attr('proposedOnAccountData',val);
            if(val.checkedRows.length >0){
                disableEditORDeleteButtons(false);
            }else{
                disableEditORDeleteButtons(true);
            }
      },
      'rn-proposed-onaccount-grid save':function(ele, event, val){
           //alert('came'); 
      }
    },
    helpers: {
           createPBRequest: function(){
          var bundleNamesRequest = {"bundleSearch":{}};

          var serTypeId = this.appstate.attr('storeType');
          var regId = this.appstate.attr('region');

          if(typeof(serTypeId)!="undefined")
            bundleNamesRequest.bundleSearch["serviceTypeId"] = serTypeId['id'];

          if(typeof(regId)=="undefined")
            bundleNamesRequest.bundleSearch["region"] = "";
          else
            bundleNamesRequest.bundleSearch["region"] = regId['value'];
            
          bundleNamesRequest.bundleSearch["type"] = "ON_ACCOUNT";
          

          //console.log("GetBundleNamesRequest is "+JSON.stringify(bundleNamesRequest));

          return JSON.stringify(bundleNamesRequest);
        }
      }
});

var frameRequest = function(appstate){
      var onAccountrequest = {};
      var periodFrom = appstate.attr('periodFrom');
      var periodTo = appstate.attr('periodTo');
      var serTypeId = appstate.attr('storeType');
      var regId = appstate.attr('region');
      var countryId = appstate.attr()['country'];
      var licId = appstate.attr()['licensor'];
      var contGrpId = appstate.attr()['contentType'];

      
      onAccountrequest.searchRequest = {};
      onAccountrequest.searchRequest["periodFrom"] = "";
      onAccountrequest.searchRequest["periodTo"] = "";
      onAccountrequest.searchRequest["serviceTypeId"] = "";
      onAccountrequest.searchRequest["regionId"] = "";
      onAccountrequest.searchRequest["country"] = [];
      onAccountrequest.searchRequest["entityId"] = [];
      onAccountrequest.searchRequest["contentGrpId"] = [];
      onAccountrequest.searchRequest["periodType"] = "Q";
      onAccountrequest.searchRequest["type"] = "BALANCE";

      if(typeof(periodFrom) != "undefined"){
        onAccountrequest.searchRequest["periodFrom"] = periodFrom;
      }

      if(typeof(periodTo)!="undefined"){
        onAccountrequest.searchRequest["periodTo"] = periodTo;
      }

      if(typeof(serTypeId)!="undefined"){
        onAccountrequest.searchRequest["serviceTypeId"] = serTypeId['id'];
      }

      if(typeof(regId)!="undefined"){
        onAccountrequest.searchRequest["regionId"] = regId['id'];
      }
      
      
      if(typeof(countryId)!="undefined"){
        onAccountrequest.searchRequest["country"]=countryId;
      }

      
      if(typeof(licId)!="undefined"){
        onAccountrequest.searchRequest["entityId"]=licId;
      }

      
      if(typeof(contGrpId)!="undefined"){
        onAccountrequest.searchRequest["contentGrpId"]=contGrpId;
      }

      //console.log('The request is :'+JSON.stringify(onAccountrequest));
  return onAccountrequest;
} 

var disableEditORDeleteButtons = function(disable){
  if(disable){
       $("#proposedDelete").attr("disabled","disabled");
       $("#proposedEdit").attr("disabled","disabled");
  }else{
      $("#proposedDelete").removeAttr("disabled");
      $("#proposedEdit").removeAttr("disabled");
  }

}

export default page;
