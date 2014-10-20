import Component from 'can/component/';

import datatables from 'datatables';
import css_datatables from 'datatables.css!';

import moment from 'moment';


import template from './template.stache!';
import styles from './data-tables.less!';

var dataTables = Component.extend({
    tag: 'data-grid',
    template: template,
    scope: {
     name: "@",
     dataMap:statsGrid
    },
    events: {
        "inserted": function(){
            var datasrc = this.scope.attr().statsMap.data;
            var columnNames = this.scope.attr().statsMap.coulmnText;
            var id = this.scope.attr().name;
            //console.log("hahahaha"+JSON.stringify(columnNames));
            $('#'+id).dataTable({
                data: datasrc,
                searching: false,
                paging: false,
                scrollY: "300px",
                scrollCollapse: true,
                sort: false,
                bInfo: false,
                aoColumns: columnNames
            });
        }
    }
});

export default dataTables;
