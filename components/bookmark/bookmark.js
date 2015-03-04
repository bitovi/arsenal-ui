import Component from 'can/component/';
import template from './template.stache!';
import styles from './bookmark.less!';
import Bookmark from 'models/common/bookmark/';
import Bookmarkusers from 'models/common/bookmarkusers/';
import Sharedbookmarks from 'models/common/sharedbookmarks/';
import UserReq from 'utils/request/';
import _ from 'lodash';
import periodWidgetHelper from 'utils/periodWidgetHelpers';
import commonUtils from 'utils/commonUtils';

var bookmark = Component.extend({
  tag: 'book-mark',
  template: template,
  scope: {
    appstate: undefined,//passed
    counter:undefined,//passed
    checkedRows: [],
    bookMarkList:[],
    userList:[],
    sharedList:[],
    setFlag:[],
    settingsList:[],
    shareList:[],
    visible:[],
    bookmarkcount:0
  },
  init:function(){
    var self = this;
    //setTimeout(function(){$('.bookmark_loader').show();},2000);
    Promise.all([Bookmark.findOne(UserReq.formRequestDetails())]).then(function(data) { console.log(data);
      if(data[0].status=='SUCCESS'){
        $('.bookmark_loader').hide();
        self.scope.bookMarkList.replace(data[0].bookmarkList);
        if(data[0].bookmarkList.length>0){
          for(var i=0;i<self.scope.bookMarkList.length;i++){
            self.scope.bookMarkList[i].attr("pageId",i+1)
          }
          self.scope.bookmarkcount = data[0].bookmarkList.length;
           //$('.bookmark').html("<span class='bookmark-bubble'>"++"</span>")
          //self.scope.counter.attr('bookmark',self.scope.bookmarkcount);
        }

      }
    });
    Promise.all([Bookmarkusers.findOne(UserReq.formRequestDetails())]).then(function(data) {
      if(data[0].status=='SUCCESS'){
        self.scope.userList.replace(data[0].userList);
        $('.bookmark_loader').hide();
      }
    });
  },
  events:{
    '{document} keydown':function(el, ev){
      if(ev.which==27 && $('.bookmarkContainer').is(':visible')){
        $('book-mark').hide('fast');
      }
    },
    '{document} click':function(el,e){
      if($(e.target).closest(".bookmark").length === 0 && $(e.target).closest("book-mark").length === 0 && $('book-mark').css('display') === "block") {
        $('book-mark').hide('fast');
      }
    },
    '.bookmark_list dblclick':function(el){
      var page = el.attr('data-pageid');
      var filterData = el.attr('data-filter');
      page = page.replace("/","");
      var fileArr = filterData.split(",");
      var map1 = [];
      var customObj = {
        "key":"",
        "value":""
      }
      var temp;
      _.forEach(fileArr, function(n) {
          temp = n.split(":");
          customObj = {
            "key":"",
            "value":""
          };
          customObj.key = temp[0];
          customObj.value = temp[1];
          map1.push(customObj);
      });
      var periodType = _.result(_.find(map1, {'key':'PeriodType'}),'value');
      var lookingFor =  _.result(_.find(map1, {'key':'PeriodFrom'}),'value');
      if(lookingFor != undefined){
        this.scope.appstate.attr('periodFrom',lookingFor);
        this.scope.appstate.attr('periodType',periodType);
        $('#periodFrom').val(  periodWidgetHelper.getDisplayPeriod(lookingFor,periodType ));
        }

      lookingFor =  _.result(_.find(map1, {'key':'PeriodTo'}),'value');
      if(lookingFor != undefined){
        this.scope.appstate.attr('periodTo',lookingFor);
        $('#periodTo').val(  periodWidgetHelper.getDisplayPeriod(lookingFor,periodType ));
      }

      lookingFor =  _.result(_.find(map1, {'key':'StoreType'}),'value');
      if(lookingFor != undefined){
        this.scope.appstate.attr('storeType',  {id:lookingFor});
        $('#storeTypesFilter').val(lookingFor);
      }
      // lookingFor =  _.result(_.find(map1, {'key':'Region'}),'value');
      // if(lookingFor != undefined){
      //   this.scope.appstate.attr('region',  {id:lookingFor});
      //   $('#regionsFilter').val(lookingFor);
      // }



      // lookingFor =  _.result(_.find(map1, {'key':'PeriodFrom'}),'value');
      // if( _.result(_.find(map1, {'key':'PeriodFrom'}),'value')){
      //  "PeriodFrom":userRequest.searchRequest.periodFrom,
      // "PeriodTo": userRequest.searchRequest.periodFrom,
      // "StoreType": userRequest.searchRequest.serviceTypeId.toString(),
      // "Region": userRequest.searchRequest.regionId.toString(),
      // "Country": userRequest.searchRequest.country.toString(),
      // "Licensor": userRequest.searchRequest.entityId.toString(),
      // "ContentType": userRequest.searchRequest.contentGrpId.toString(),
      // "PeriodType": userRequest.searchRequest.periodType
      // }

      // console.log(fileArr[0]);
      // if(filterData.indexOf("PeriodTo")){
      //
      // }
      //if()
      //$('#periodFrom').val("P11FY15");

      // $('#periodTo').val(DefaultGlobalParameters.PeriodTo);
      // $('#storeTypesFilter').val(DefaultGlobalParameters.StoreType.value);
      // $('#regionsFilter').val(DefaultGlobalParameters.Region.value);

      commonUtils.navigateTo(page);
      //this.scope.appstate.attr('page',page);
    },
    '.bookmark_sharing :checkbox change':function(el,ev){
      if(el.attr('class')=='setshareall')el.closest('.bookmark_sharing').find('input:checkbox').not(el).prop('checked', el[0].checked);
      el.closest('.bookmark_sharing').find(':checkbox').is(':checked') ? el.closest('.bookmark_sharing_settings').find('.togglebtns').removeAttr('disabled'):el.closest('.bookmark_sharing_settings').find('.togglebtns').attr('disabled','disabled');
    },
    '.bookmark_list :checkbox change':function(el,ev){
      $('.bookmark_list .bookmarkchkbox').is(':checked') ? $('#bookmarkitem_remove').removeAttr('disabled'):$('#bookmarkitem_remove').attr('disabled','disabled');
    },
    '#add_new click':function(){
      $('.listofbookmark').slideUp('fast');
      $('.newbookmark').slideDown('fast');
    },
    '#bookmark_cancel click':function(){
      $('.newbookmark').slideUp('fast');
      $('.listofbookmark').slideDown('fast');
    },
    '#sharebk_cancel click':function(){
      $('.bookmark_sharing_settings').slideUp('fast');
      $('.listofbookmark').slideDown('fast');
    },
    '.bookmark_settings click':function(el){
      var gearid={},tempobj={}, self =this;
      gearid["bookmarkId"] = el.attr('data-id');
      $('.listofbookmark').slideUp('fast');
      $('.bookmark_sharing_settings').slideDown('fast').attr('data-gear',el.attr('data-id'));
      $('.bookmark_loader').show();
      for(var i=0;i<self.scope.settingsList.length;i++){
        self.scope.settingsList[i].removeAttr("flag");
      }
      self.scope.setFlag.attr("flag",false);
      Promise.all([Sharedbookmarks.findOne(UserReq.formRequestDetails(gearid))]).then(function(data) {
        if(data[0].status=='SUCCESS'){
          self.scope.settingsList.replace('');
          self.scope.settingsList.replace(self.scope.userList);
          for(var i=0;i<self.scope.userList.length;i++){
            for(var j=0;j<data[0].prsIdList.length;j++){
              if(self.scope.userList[i].attr("id")==data[0].prsIdList[j]){
                self.scope.settingsList[i].attr("flag",true);
                self.scope.setFlag.attr("flag",true);
              }
            }
          }
          $('.bookmark_loader').hide();
          self.scope.shareList.replace('');
          self.scope.shareList.replace(self.scope.settingsList);
        }
      });

    },
    '#newbk_cancel click':function(){
      $('.bookmark_sharing_settings').slideUp('fast');
      $('.listofbookmark').slideDown('fast');
    },
    '#sharebk_save click':function(){
      var total = $('[name="bookmarkforsettings"]:checked').length;
      var ids={};
      var temp=[]
      var root = {"sharedForIds":[]};
      root["bookmarkId"]=$('.bookmark_sharing_settings').attr('data-gear');
      $('.bookmark_sharing_settings  .bookmarkchkbox').not(':disabled').each(function(i,el){
        if($(el).is(':checked')){
          ids["prsId"] =$(el).attr('id');
          temp.push(ids);

        }
      });
      root["sharedForIds"] = temp;
      $('.bookmark_loader').show();
      Bookmarkusers.update(UserReq.formRequestDetails(root),"UPDATE",function(data){
        if(data.status=='SUCCESS'){
          $('.bookmark_loader').hide();
          $('.bookmark_sharing_settings').slideUp('fast');
          $('.listofbookmark').slideDown('fast');
        }
      });
    },
    '#bookmarkitem_remove click':function(){
      var total = $('[name="bookmark"]:checked').length,addspl='';
      var root = {"idsToBeDeleted":[]};
      var deleteId = [];
      var self = this;
      $('.bookmarklist .bookmark_list .bookmarkchkbox').closest('.bookmark_list').each(function(i,el){
        var bookMarkItems = {};
        if($(el).find('.bookmarkchkbox').is(':checked')){
          $(el).closest('.bookmark_list').remove();
          $('.bookmarklist .bookmark_list .bookmarkchkbox').is(':checked') ? $('#bookmarkitem_remove').removeAttr('disabled'):$('#bookmarkitem_remove').attr('disabled','disabled');
          total-1 > i ? addspl=',':addspl=''
          bookMarkItems.bookmarkName = $(el).find('.bookmarkchkbox').attr('id');
          deleteId.push(bookMarkItems);
        }
      });
      root["idsToBeDeleted"] =deleteId;
      $('.bookmark_loader').show();
      Bookmark.update(UserReq.formRequestDetails(root),"DELETE",function(data){
        //console.log(data);
        $('.bookmark_loader').hide();
        if(data.status=='SUCCESS'){
          // var counter = self.scope.counter.attr('bookmark');
          // self.scope.counter.attr('bookmark', (counter - deleteId.length ) );
          var params = {
            "messageDiv":".messageDivBK",
            "status":data.status,
            "message":data.responseText,
            "timer":true
          };
          commonUtils.showMessage(params);
          $('header-navigation').scope().getCounter()
        }
      });
    },
    '#new_bookmark_save click':function(){
      var self = this;
      if($('.newbookmark_name_txtbx').val()==null || $('.newbookmark_name_txtbx').val()==''){
        $('.shareerror').css('visibility','visible');return false;
      }else{
        $('.shareerror').css('visibility','hidden');
        var   use ='{'; var total = $('[name="bookmarkforshare"]:checked').length,addspl='';

        $('.newbookmark .bookmark_sharing .bookmarkchkbox').each(function(i,el){
          if($(el).is(':checked')){
            total-1 > i ? addspl=',':addspl=''
            use+='"id'+parseInt(i+1)+'":'+ $(el).attr('id')+addspl
          }
        });
        use+='}';
        var sharedForIds = $.parseJSON('[' + use + ']');

        var userRequest = UserReq.formGlobalRequest(this.scope.appstate);

        // "PeriodFrom": getDefaultPeriodFrom(),
        // "PeriodTo": getDefaultPeriodTo(),
        // "StoreType":{id:1, value:"iTunes Downloads"}, /* use {id:1, value:"iTunes Downloads"} if u want to select iTunes Downloads by default */
        // "Region":{id:2, value:"Europe"},
        // "Country":"ALL",//["AUT"], /* To select all pass "ALL" or "-1" as a string not in array, for multi select pass ["AUT","BEL", ...]*/
        // "Licensor":"ALL",//["17"], /* To select all pass "ALL" or "-1" as a string not in array, for multi select pass ["17","32", ...], 17 is for CELAS */
        // "ContentType":"-1"

         var filters ={
                  "PeriodFrom":userRequest.searchRequest.periodFrom,
                  "PeriodTo": userRequest.searchRequest.periodTo,
                  "StoreType": userRequest.searchRequest.serviceTypeId.toString(),
                  "Region": userRequest.searchRequest.regionId.toString(),
                  "Country": userRequest.searchRequest.country.toString(),
                  "Licensor": userRequest.searchRequest.entityId.toString(),
                  "ContentType": userRequest.searchRequest.contentGrpId.toString(),
                  "PeriodType": userRequest.searchRequest.periodType
         };

        var filterData=[filters];
        var passtoSave = {"screenId": this.scope.appstate.screenLookup.attr("screenid") ,"bookmarkName": $('.newbookmark_name_txtbx').val(),sharedForIds,filterData}
        //console.log(passtoSave);
        $('.bookmark_loader').show();
        Bookmark.update(UserReq.formRequestDetails(passtoSave),"SAVE",function(data){
          if(data.responseText=="SUCCESS"){
            Promise.all([Bookmark.findOne(UserReq.formRequestDetails())]).then(function(data) {
              if(data[0].status=='SUCCESS'){
                self.scope.bookMarkList.replace(data[0].bookmarkList);
                // var counter = self.scope.counter.attr('bookmark');
                // self.scope.counter.attr('bookmark', (self.scope.bookMarkList.length) );

                $('.bookmark_loader').hide();

                $('.newbookmark_name_txtbx').val('');
                $('.newbookmark :checkbox').prop('checked', false);

                $('.newbookmark').slideUp('fast');
                $('.listofbookmark').slideDown('fast');
              }
            });
            $('header-navigation').scope().getCounter()
          }
        });
      }

    }
  },
  helpers: {
    isAllowedForBK: function(){
      return this.appstate.attr("renderGlobalSearch") ? '': 'disabled';
    }
  }

});
function replacements(vals){
  return vals!=null ? vals.toString():'';
};
var pageIdMatcher =function(val){
  return val==1 ? 'dashboard':'invoices';
};



export default bookmark;
