import _ from 'lodash';
import Component from 'can/component/';
import template from './template.stache!';
import styles from './multiple-comments.less!';
import moment from 'moment';


var comments = Component.extend({
  tag: 'multiple-comments',
  template: template,
  scope: {
    appstate: undefined,
    modulestate:undefined,
    optionselect:"",
    options:[],
    isreadonly:"n",
    divheight:"@",
    divid:"@",
    textareaid:"@"

  },
  events: {
      '.corner click':function(){
      //  console.log("multiple-comments-child");
        $(".multiple-comments-parent").toggleClass("showMultipleP");
        $(".multiple-comments-child").toggleClass("showMultipleCh");
      },
      // '.corner click':function(){
      //   console.log("multiple-comments-child");
      //   $(".multiple-comments-parent").toggleClass("showMultipleP");
      //   $(".multiple-comments-child").toggleClass("showMultipleCh");
      // },
      "inserted": function(){
        var self = this;
        var commentsData=self.scope.options;
        //Specific to PBR module - start
        if(self.scope.modulestate != undefined){
           commentsData = self.scope.modulestate.pageState.selectedBundle.approvalComments;

           if(commentsData.length > 1){
             var commentsData1 = [];
             _.each(commentsData, function(comment) {
               commentsData1.push(comment);
             });




             commentsData1.sort(function(obj1, obj2) {
               if(obj1.id != undefined && obj2.id != undefined){
                 var nameA=obj1.id, nameB=obj2.id;
                 if (nameA < nameB) //sort string ascending
                   return 1
                   if (nameA > nameB)
                     return -1
                   }
                   return 0 //default return value (no sorting)
                 });

                 commentsData = commentsData1;
           }


        }
        //Specific to PBR module - End

        var divid = $("#"+self.scope.divid);
        divid.empty();

          var msterObj=divid;
          var editableRecComment="";
          $.each(commentsData,function(i,val){

            if(val.isEditable ==  undefined || val.isEditable == 'n'){
              var textAreactrl=getTextArea();

              var tempDivID = "nonedit-div"+i;
               $(".multiple-comments-child").append("<div id="+tempDivID+" class='comment-env '></div>");

              if(val.createdDate != null){
                 var createdDateFormat = moment(val.createdDate).format("Do MMM, YYYY - HH:mm:ss");
                if((val.createdByName != null) && (typeof val.createdByName != "undefined")){
                    $("#"+tempDivID).html("<span class='commentuser'>"+val.createdByName +"</span> <span class='commentdate'>on "+createdDateFormat+"</span><br><span class='commenttext'>"+val.comments+"</span>");
                }else{
                  $("#"+tempDivID).html("<span class='commentuser'></span> <span class='commentdate'>on "+createdDateFormat+"</span><br><span class='commenttext'>"+val.comments+"</span>");
                }

              }
              else
              {
                $("#"+tempDivID).html("<span class='commenttext'>"+val.comments+"</span>");
              }


              $(msterObj).append("<div class='separator'></div>");

            }else if(val.isEditable == 'y'){
              editableRecComment=val.Comments;
            }
          });

          if(self.scope.isreadonly === 'n'){
            var editableTextarea=$("#editableText");
            // editableTextarea.attr('placeholder', '');
            editableTextarea.attr('name',self.scope.divid);
            //editableTextarea.addClass("multiple-comments-editable").addClass("form-control-comments new-comments multiple-comments-editable-height");
            editableTextarea.text(editableRecComment);
            // $(msterObj).append(editableTextarea);
          }
        }
      }
});




    function getTextArea(){
      var textArea=$("#editableText");
      textArea.attr('maxlength','1000');

      return textArea;
    }

    function getLine(){
      var lineDiv=document.createElement( 'hr' );
      $(lineDiv).css("padding","0px");
      $(lineDiv).css("margin-right","2%");
      $(lineDiv).css("margin-left","2%");
      return lineDiv;
    }

    function textAreaAdjust(o) {
      o.style.height = "1px";
      if(o.scrollHeight <= 10){
        o.style.height = "25px";
      }else{
        o.style.height=o.scrollHeight+"px";
      }
    }



export default comments;
