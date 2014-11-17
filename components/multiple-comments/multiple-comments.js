import Component from 'can/component/';
import template from './template.stache!';
import styles from './multiple-comments.less!';


var comments = Component.extend({
  tag: 'multiple-comments',
  template: template,
  scope: {
    appstate: undefined, 
    options:[],
    isreadonly:"@",
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
            var commentsString=val.modifiedTime+"\t"+val.modifiedUser+":\n"+val.Comments;
            if(val.isEditable == 'n'){        
              var textAreactrl=getTextArea();
              $(textAreactrl).text(commentsString);
              $(textAreactrl).addClass("multiple-comments-editable").addClass("form-control");
              $(textAreactrl).attr('readonly', 'readonly');
              $(msterObj).append(textAreactrl);     
              $(msterObj).append(getLine());
              textAreaAdjust(textAreactrl);
            }else if(val.isEditable == 'y'){
              editableRecComment=val.Comments;
            }       
          });
          
          if(self.scope.isreadonly === 'n'){
            console.log("inside add method");
            var editableTextarea=getTextArea();
            $(editableTextarea).attr('id',self.scope.textareaid);
            $(editableTextarea).attr('name',self.scope.textareaid);
            $(editableTextarea).addClass("multiple-comments-editable").addClass("form-control");
            $(editableTextarea).text(editableRecComment);
            $(editableTextarea).unbind('input propertychange').bind('input propertychange',function(e) {
              editableTextarea.style.height = '1px';
                  editableTextarea.style.height = (25+editableTextarea.scrollHeight)+"px";
            });
            $(msterObj).append(editableTextarea);
            textAreaAdjust(editableTextarea);
              
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
