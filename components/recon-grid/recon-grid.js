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
            if(parentScopeVar.recordsAvailable && tbody[0].scrollTop + tbody[0].clientHeight >= tbody[0].scrollHeight) {
              //console.log(JSON.stringify(self.element.closest('page-invoices').scope().appstate.attr()));

              var tabSelected = parentScopeVar.attr('tabSelected');

              /* Reset the offset value and call the webservice to fetch next set of records */
              if(tabSelected ==="Ingested"){
                var offsetVal = parentScopeVar.attr('ingestedOffset');
                parentScopeVar.attr('ingestedOffset', (parseInt(offsetVal)+1));
                parentScopeVar.attr('ingestedScrollTop', (tbody[0].scrollHeight-100));
              }
              parentScopeVar.appstate.attr('globalSearchButtonClicked', false);
              parentScopeVar.attr("load", true);

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
            if(tbody[0].scrollTop + tbody[0].clientHeight + 3 >= tbody[0].scrollHeight && parentScopeVar.recordsAvailable) {
              //console.log(JSON.stringify(self.element.closest('page-invoices').scope().appstate.attr()));

              var tabSelected = parentScopeVar.attr('tabSelected');
              parentScopeVar.attr("load", true);
              if(tabSelected=="Other") {
              /* Reset the offset value and call the webservice to fetch next set of records */
                var offsetVal = parentScopeVar.attr('offset');
                parentScopeVar.attr('offset', (parseInt(offsetVal)+1));
                parentScopeVar.attr('scrollTop', (tbody[0].scrollHeight-100));

                parentScopeVar.appstate.attr('globalSearchButtonClicked', false);
              } else {
                var offsetVal = parentScopeVar.attr('incomingOffset');
                parentScopeVar.attr('incomingOffset', (parseInt(offsetVal)+1));
                parentScopeVar.attr('incomingScrollTop', (tbody[0].scrollHeight-100));
                //parentScopeVar.attr('incomingScrollTop', 0);
                parentScopeVar.appstate.attr('globalSearchButtonClicked', false);
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
            //alignGrid("ingested");
            tableScrollTopVal = parentScopeVar.attr('ingestedScrollTop');
            $(tbody[0]).scrollTop(tableScrollTopVal);
          },10);
        }
      } else if(self.scope.attr("pagename")=="reconOther"){
        var parentScopeVar = self.element.closest('page-reconOther').scope();
        var tabSelected = parentScopeVar.attr('tabSelected');
        var tableScrollTopVal=0;
        if(tabSelected=="Other"){
          setTimeout(function(){
            //alignGrid("reconstatsOtherGrid");
            tableScrollTopVal = parentScopeVar.attr('scrollTop');
            $(tbody[0]).scrollTop(tableScrollTopVal);
          },10);
        }  else {
          setTimeout(function(){
            //alignGrid("incomingDetails");
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

export default reconGrid;
