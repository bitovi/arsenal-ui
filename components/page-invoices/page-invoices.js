import Component from 'can/component/';
import View from 'can/view/';

import dataTables from 'components/data-tables/';
import treetables from 'treetables';
import css_treetables from 'treetables.css!';

import createpb from 'components/create-pb/';

import tokeninput from 'tokeninput';
import css_tokeninput from 'tokeninput.css!';
import css_tokeninput_theme from 'tokeninput_theme.css!';

import template from './template.stache!';
import styles from './page-invoices.less!';



var page = Component.extend({
  tag: 'page-invoices',
  template: template,
  scope: {
    "tokenInputData": []
  },
  events: {
  	"inserted": function(){

	  	/*var ingTemplate = View.stache("<data-grid name='invoiceSearchTable' type='getAllInvoices' columnText='{gridCoulmnText}'></data-grid>");
	    var f = ingTemplate();
	    $("#invoiceGrid").html( f );*/
      var self = this;
      $("#tokenSearch").tokenInput([
          {id: 1, name: "Search"} //This is needed
        ],
        {
            theme: "facebook",
            preventDuplicates: true,
            onResult: function (item) {
              //alert(item);
                if($.isEmptyObject(item)){
                      return [{id:$("#token-input-tokenSearch").val(),name: $("#token-input-tokenSearch").val()}];
                }else{
                      return item;
                }
            },
            onAdd: function (item) {
              //alert(JSON.stringify(item));
                //doSearch(item,"add");
                self.scope.tokenInputData.replace(item);
                var $subComp = $('data-grid', self.element);
                $subComp.scope().refreshTokenInput(item,"Add");

            },
            onDelete: function (item) {
                //doSearch(item,"delete");
                 self.scope.tokenInputData.replace(item);
                var $subComp = $('data-grid', self.element);
                $subComp.scope().refreshTokenInput(item,"Delete");
            }
      });

  	}
  }
});

export default page;
