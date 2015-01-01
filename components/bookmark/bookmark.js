import Component from 'can/component/';
import template from './template.stache!';
import styles from './bookmark.less!';
import Bookmark from 'models/common/bookmark/';
import Bookmarkusers from 'models/common/bookmarkusers/';
import Sharedbookmarks from 'models/common/sharedbookmarks/';
import UserReq from 'utils/request/';

import commonUtils from 'utils/commonUtils';

var bookmark = Component.extend({
  tag: 'book-mark',
  template: template,
  scope: {
    appstate: undefined,
    checkedRows: [],
    bookMarkList:[],
    userList:[],
    sharedList:[],
    setFlag:[],
    settingsList:[],
    shareList:[],
    visible:[]
 },
  init:function(){
    var self = this;
    //setTimeout(function(){$('.bookmark_loader').show();},2000);
    Promise.all([Bookmark.findOne(UserReq.formRequestDetails())]).then(function(data) { console.log(data);
         if(data[0].responseCode=='0000'){
            $('.bookmark_loader').hide();
            self.scope.bookMarkList.replace(data[0].bookmarkList);
            if(data[0].bookmarkList.length>0){
              for(var i=0;i<self.scope.bookMarkList.length;i++){
                  self.scope.bookMarkList[i].attr("pageId",i+1)
              }
            }

        }
    });
    Promise.all([Bookmarkusers.findOne(UserReq.formRequestDetails())]).then(function(data) {
      if(data[0].responseCode=='0000'){
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
      '{document}  click':function(el,e){
        if($(e.target).closest(".bookmark").length === 0 && $('book-mark').is(':visible')) {
          //$('book-mark').hide('fast');
        }
      },
      '.bookmark_list dblclick':function(el){
          var page = pageIdMatcher(el.attr('data-pageid'));
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
            if(data[0].responseCode=='0000'){
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
              if(data.responseCode=='0000'){
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
          var bookMarkItems = {};
          $('.bookmarklist .bookmark_list .bookmarkchkbox').closest('.bookmark_list').each(function(i,el){
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
          Bookmark.update(UserReq.formRequestDetails(root),"DELETE",function(data){ console.log(data);
            if(data.responseCode=='0000'){
              $('.bookmark_loader').hide();
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
                 var filters ={
                          "filter1": $('#periodFrom').val(),
                          "filter2": $('#periodTo').val(),
                          "filter3": $('#storeTypesFilter').val(),
                          "filter4": $('#regionsFilter').val(),
                          "filter5": replacements($('#countriesFilter').val()),
                          "filter6": replacements($('#licensorsFilter').val()),
                          "filter7": replacements($('#contentTypesFilter').val())
                      };
                  var filterData=[filters];
                  var passtoSave = {"screenId": 1,"bookmarkName": $('.newbookmark_name_txtbx').val(),sharedForIds,filterData}
                  $('.bookmark_loader').show();
                  Bookmark.update(UserReq.formRequestDetails(passtoSave),"SAVE",function(data){
                      if(data.responseText=="SUCCESS"){
                         Promise.all([Bookmark.findOne(UserReq.formRequestDetails())]).then(function(data) {
                           if(data[0].responseCode=='0000'){
                              self.scope.bookMarkList.replace(data[0].bookmarkList);
                              $('.bookmark_loader').hide();

                              $('.newbookmark_name_txtbx').val('');
                              $('.newbookmark :checkbox').prop('checked', false);

                            $('.newbookmark').slideUp('fast');
                            $('.listofbookmark').slideDown('fast');
                        }
                      });
                    }
                 });
            }

          }
   },
  helpers:function(){

  }

});
function replacements(vals){
  return vals!=null ? vals.toString():'';
};
var pageIdMatcher =function(val){
   return val==1 ? 'dashboard':'invoices';
};

export default bookmark;
