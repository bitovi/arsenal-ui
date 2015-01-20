import $ from 'jquery';
import Grid from 'components/grid/';

import template from './template.stache!';
import _less from './recon-grid.less!';

var reconGrid = Grid.extend({
  tag: 'rn-recon-grid',
  template: template,
  scope: {
    checkedRows: [],
    footerrows: [],
    pagename : ""
  },
  helpers: {
    getColumnLength: function(options){
      //console.log("column length is "+ JSON.stringify(this.attr("columns").length));
      return this.attr("columns").length;
    }
  },
  events:{
    'inserted': function(){
      var self= this;
      var tbody = self.element.find('tbody');
      if(self.scope.attr("pagename")=="recon"){
        var parentScopeVar = self.element.closest('page-recon').scope();
        var tableScrollTopVal = parentScopeVar.attr('ingestedScrollTop');
        $(tbody[0]).scrollTop(tableScrollTopVal);
          $(tbody).on('scroll', function(ev) {
            if(tbody[0].scrollTop + tbody[0].clientHeight >= tbody[0].scrollHeight && parentScopeVar.recordsAvailable) {
              //console.log(JSON.stringify(self.element.closest('page-invoices').scope().appstate.attr()));
              
              var tabSelected = parentScopeVar.attr('tabSelected');
              /* Reset the offset value and call the webservice to fetch next set of records */
              if(tabSelected=="Ingested"){
                var offsetVal = parentScopeVar.attr('ingestedOffset');
                parentScopeVar.attr('ingestedOffset', (parseInt(offsetVal)+1));
                parentScopeVar.attr('ingestedScrollTop', (tbody[0].scrollHeight-100));
              } 
              parentScopeVar.appstate.attr('globalSearchButtonClicked', false);
              parentScopeVar.attr("load", false);

              /* The below code calls {scope.appstate} change event that gets the new data for grid*/
              /* All the neccessary parameters will be set in that event */
             if(parentScopeVar.appstate.attr('globalSearch')){
                parentScopeVar.appstate.attr('globalSearch', false);
              }else{
                parentScopeVar.appstate.attr('globalSearch', true);
              }
            }
          });
        } else if(self.scope.attr("pagename")=="reconOther"){
          var parentScopeVar = self.element.closest('page-reconOther').scope();
          var tableScrollTopVal = parentScopeVar.attr('scrollTop');
          $(tbody[0]).scrollTop(tableScrollTopVal);
          $(tbody).on('scroll', function(ev) {
            if(tbody[0].scrollTop + tbody[0].clientHeight >= tbody[0].scrollHeight && parentScopeVar.recordsAvailable) {
              //console.log(JSON.stringify(self.element.closest('page-invoices').scope().appstate.attr()));
              
              var tabSelected = parentScopeVar.attr('tabSelected');
              if(tabSelected=="Incoming Other") {
              /* Reset the offset value and call the webservice to fetch next set of records */
                var offsetVal = parentScopeVar.attr('offset');
                parentScopeVar.attr('offset', (parseInt(offsetVal)+1));
                parentScopeVar.attr('scrollTop', (tbody[0].scrollHeight-100));

                parentScopeVar.appstate.attr('globalSearchButtonClicked', false);
              } else {
                var offsetVal = parentScopeVar.attr('incomingOffset');
                parentScopeVar.attr('incomingOffset', (parseInt(offsetVal)+1));
                parentScopeVar.attr('incomingScrollTop', (tbody[0].scrollHeight-100));
              }

              /* The below code calls {scope.appstate} change event that gets the new data for grid*/
              /* All the neccessary parameters will be set in that event */
             if(parentScopeVar.appstate.attr('globalSearch')){
                parentScopeVar.appstate.attr('globalSearch', false);
              }else{
                parentScopeVar.appstate.attr('globalSearch', true);
              }
            }
          });
        }
    },
    '{rows} change':function(){
      var self = this;
      var tbody = self.element.find('tbody');
      if(self.scope.attr("pagename")=="recon"){
        var parentScopeVar = self.element.closest('page-recon').scope();
        var tabSelected = parentScopeVar.attr('tabSelected');
        var tableScrollTopVal=0;
        if(tabSelected=="Ingested"){
          setTimeout(function(){
            alignGrid("ingested");
            tableScrollTopVal = parentScopeVar.attr('ingestedScrollTop');
            $(tbody[0]).scrollTop(tableScrollTopVal);
          },10);
        }
      } else if(self.scope.attr("pagename")=="reconOther"){
        var parentScopeVar = self.element.closest('page-reconOther').scope();
        var tabSelected = parentScopeVar.attr('tabSelected');
        var tableScrollTopVal=0;
        if(tabSelected=="Incoming Other"){
          setTimeout(function(){
            alignGrid("reconstatsOtherGrid");
            tableScrollTopVal = parentScopeVar.attr('scrollTop');
            $(tbody[0]).scrollTop(tableScrollTopVal);
          },10);
        }  else {
          setTimeout(function(){
            alignGrid("incomingDetails");
            tableScrollTopVal = parentScopeVar.attr('incomingScrollTop');
            $(tbody[0]).scrollTop(tableScrollTopVal);
          },10);
        }
      }
      
    },
    '.checkbox :checkbox change': function(el, ev) {
      var row = el.closest('tr').data('row').row;

      if(el[0].checked) {
        this.scope.checkedRows.push(row);
      } else {
        var index = _.find(this.scope.checkedRows, checkedRow => { checkedRow.index === row.index; });
        (index > -1) && this.scope.checkedRows.splice(index, 1);
      }
    }

  }
});

function alignGrid(divId){
  var colLength = $('#'+divId+' table>thead>tr>th').length;
  var rowLength = $('#'+divId+' table>tbody>tr').length;
  var divWidth = $('#'+divId).outerWidth();
  var tableWidth = 0;
  var tdWidth, cellWidthArr = [];
  if(rowLength>0){
    $('#'+divId+' table').css("width",divWidth-300);
      for(var i=1;i<=colLength;i++){
        var theadTdWidth = $('#'+divId+' table>thead>tr>th:nth-child('+i+')').outerWidth();
        var tbodyTdWidth = $('#'+divId+' table>tbody>tr>td:nth-child('+i+')').outerWidth();
        var tfootTdWidth = $('#'+divId+' table>tfoot>tr>td:nth-child('+i+')').outerWidth();

        if(theadTdWidth >= tbodyTdWidth && theadTdWidth >= tfootTdWidth)
          tdWidth = theadTdWidth;
        else if(tfootTdWidth >= tbodyTdWidth && tfootTdWidth >= theadTdWidth)
          tdWidth = tfootTdWidth;
        else 
          tdWidth = tbodyTdWidth;

        if(i==1)
          tdWidth = 35;
        
        tableWidth += tdWidth;
        cellWidthArr.push(tdWidth);
      }

      if(tableWidth < divWidth){
        var moreWidth = (divWidth-tableWidth)/colLength;
        for(var j=1;j<=cellWidthArr.length;j++){
          var width = cellWidthArr[j-1]+moreWidth;

          $('#'+divId+' table>thead>tr>th:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tbody>tr>td:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tfoot>tr>td:nth-child('+j+')').css("width",width);
        }
        $('#'+divId+' table').css("width",divWidth);
      } else {
        for(var j=1;j<=cellWidthArr.length;j++){
          var width = cellWidthArr[j-1];
          $('#'+divId+' table>thead>tr>th:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tbody>tr>td:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tfoot>tr>td:nth-child('+j+')').css("width",width);

        }
        $('#'+divId+' table').css("width",tableWidth);
      }
  }
}

export default reconGrid;
