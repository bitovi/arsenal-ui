
var gridUtil = {
  /*
  The below method will calculate the height for the given element.
  This will take the current Y position of the given element and
  from that postion it will find out the available space on the page.
  And will return the percentage height. If the user want to give 50% of the availble
  space in the page to a component then he need to pass 50 as paramenter
  along with the element id.
  */
  getTableBodyHeight:function (element,requireHghtPercent){
    var offset = $('#'+element).offset();
    var posYOfelement = offset.top - $(window).scrollTop();
    var windowHeight=$(window).height();
    var heightRemain=windowHeight-posYOfelement;
    var percentHeight=heightRemain*(requireHghtPercent/100);
    var tableHeadheight=$('#'+element+' table>thead').height();
    var tableFootheight=$('#'+element+' table>tfoot').height();
    var tableBodyHeight=percentHeight-(tableHeadheight+tableFootheight+30); //30 pixel left out for the bottom space
    console.log('WindowHiehgt',$('#'+element).offset().top,$(window).scrollTop(),$(window).height(),$("body").innerHeight(),posYOfelement,heightRemain,tableBodyHeight);
    return tableBodyHeight;
  }
};
export default gridUtil;
