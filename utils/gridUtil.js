
var gridUtil = {
  /*
  The below method will calculate the height for the given element.
  This will take the current Y position of the given element and
  from that postion it will find out the available space on the page.
  And will return the percentage height. If the user want to give 50% of the availble
  space in the page to a component then he need to pass 50 as paramenter
  along with the element id.

  Make sure the grid element or grid parent element is visible in the viewport. Because for the
  element which are having the display:none property will not render or will not occupy any space in the brwoser.
  So we can not get the position of the element to calculate height.

  */
  getTableBodyHeight:function (element,requireHghtPercent){
    var tableBodyHeight='200px'; // set the default value
    if(!typeof $('#'+element) != 'undefined' ){
      var offset = $('#'+element).offset();
      var posYOfelement = offset.top - $(window).scrollTop();
      var windowHeight=$(window).height();
      var heightRemain=windowHeight-posYOfelement;
      var percentHeight=heightRemain*(requireHghtPercent/100);
      var tableHeadheight=$('#'+element+' table>thead').height();
      var tableFootheight=$('#'+element+' table>tfoot').height();
      tableBodyHeight=percentHeight-(tableHeadheight+tableFootheight+30); //30 pixel left out for the bottom space
    }
    return tableBodyHeight;
  },

  setElementHeight:function (obj,minHeight,maxHeight){
    if(typeof obj != undefined){
      $(obj).css('min-Height',minHeight);
      $(obj).css('max-Height',maxHeight);
    }
  }
};
export default gridUtil;
