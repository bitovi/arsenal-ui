import Component from 'can/component/';
import template from './template.stache!';
import styles from './multiple-comments.less!';
import moment from 'moment';


var comments = Component.extend({
  tag: 'multiple-comments',
  template: template,
  scope: {
    appstate: undefined,
    optionselect:"", 
    options:[],
    isreadonly:"n",
    divheight:"@",
    divid:"@",
    textareaid:"@"
    
  },
  events: {
      "inserted": function(){
        var self = this;
        var commentsData=self.scope.options;
        var divid = $("#"+self.scope.divid);
        divid.empty();
        
          var msterObj=divid;
          var editableRecComment="";    
          $.each(commentsData,function(i,val){
            
            if(val.isEditable ==  undefined || val.isEditable == 'n'){        
              var textAreactrl=getTextArea();
              
              var tempDivID = "nonedit-div"+i;
               $(".multiple-comments-parent").append("<div id="+tempDivID+" class='comment-env'></div>");   
             
              if(val.createdDate != null){
                 var createdDateFormat = moment(val.createdDate).format("Do MMM, YYYY - HH:mm:ss");   
                if((val.createdByName != null) && (typeof val.createdByName != "undefined")){
                    $("#"+tempDivID).html("<span class='commentuser'>"+val.createdByName +"</span> <span class='commentdate'>On "+createdDateFormat+"</span><br><span class='commenttext'>"+val.comments+"</span>");
                }else{
                  $("#"+tempDivID).html("<span class='commentuser'></span> <span class='commentdate'>On "+createdDateFormat+"</span><br><span class='commenttext'>"+val.comments+"</span>");
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
            var editableTextarea=getTextArea();
            $(editableTextarea).attr('id', 'editableText');
            $(editableTextarea).attr('name',self.scope.divid);
            $(editableTextarea).addClass("multiple-comments-editable").addClass("form-control-comments new-comments multiple-comments-editable-height");
            $(editableTextarea).text(editableRecComment);
            $(msterObj).append(editableTextarea);
          } 
        }
      } 
});


   
    
    function getTextArea(){
      var textArea=document.createElement( 'textArea' );
      $(textArea).attr('maxlength','1000');
     
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
