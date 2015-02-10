import _ from 'lodash';
import $ from 'jquery';
import ScrollingGrid from 'components/grid/examples/scrolling-grid/';
import gridUtils from 'utils/gridUtil';
import template from './template.stache!';
import _less from './bundle-detail-grid.less!';
import PeriodWidgetHelper from 'utils/periodWidgetHelpers';

var BundleDetailGrid = ScrollingGrid.extend({
  tag: 'rn-bundle-detail-grid',
  template: template,
  scope: {
    paginateAttr:null,//passed in value
    localOffsetTracker:0,
    strippedGrid:true,
    makeRowsFromBundle: function(bundle) {
      // so the bundle has a bundleDetailsGroup (which is a List of BundleDetailGroup model instances)
      // and each of those instances is a parent row
      // each BundleDetailGroup instance has a bundleDetails (which is a List of BundleDetail model instances)
      // and each of those is a child row
      var contentType = [],country = [],periods = [],licensors = [],periodType="",adhocTypes= [];

      can.batch.start();
      var rows = [];
      bundle.bundleDetailsGroup && _.each(bundle.bundleDetailsGroup, function(group) {
        contentType = [];
        country = [];
        periods = [];
        periodType = "";
        licensors = [];
        rows.push(group);
        _.each(group.bundleDetails, function(detail) {

          if(detail.contentGrpName != undefined && detail.contentGrpName != 'TAX'){
            _.contains(contentType, detail.contentGrpName) ?  "": contentType.push(detail.contentGrpName) ;
          }

          if(detail.country != undefined){
            _.contains(country, detail.country) ?  "" : country.push(detail.country);
          }

          if(detail.fiscalPeriod != undefined){
            //Group Header row, needs the below logic
            _.contains(periods, detail.fiscalPeriod) ?  "" : periods.push(detail.fiscalPeriod);
            periodType = detail.periodType;

            //Detailed row, apply logic now only as being traversed
            detail.attr("fiscalPeriodDisplay",PeriodWidgetHelper.getDisplayPeriod(detail.fiscalPeriod.toString(), detail.periodType));
          }
          if(detail.adhocTypeName != undefined &&  detail.adhocTypeName != 'TAX'){
            _.contains(adhocTypes, detail.adhocTypeName) ?  "" : adhocTypes.push(detail.adhocTypeName);
          }


          if(bundle.view != undefined && bundle.view == "COUNTRY"
              &&   detail.entityName != undefined ){
                _.contains(licensors, detail.entityName) ?  "" : licensors.push(detail.entityName);
            }



          detail.attr('__isChild', true);
          detail.attr("view",bundle.view);
          rows.push(detail);
        });

        var arrSize = _.size(contentType) ;
        arrSize > 1 ? group.attr('contentGrpName', arrSize+" types of Content") : group.attr('contentGrpName',contentType[0]) ;

        arrSize = _.size(country) ;
        arrSize > 1 ? group.attr('country',arrSize+" Countries") : group.attr('country',country[0]) ;

        arrSize = _.size(periods) ;
        arrSize > 1 ? group.attr('fiscalPeriodDisplay',"Multiple") : group.attr('fiscalPeriodDisplay',PeriodWidgetHelper.getDisplayPeriod(periods[0].toString(), periodType)) ;

        if(bundle.view == "COUNTRY"){
          //<rdar://problem/19396429> UI-PBR: Country tab missing licensor
          arrSize = _.size(licensors) ;
          arrSize > 1 ? group.attr('entityNameCnt',arrSize+" Licensors") : group.attr('entityNameCnt',licensors[0])  ;
          group.attr("view",bundle.view);
        }

        arrSize = _.size(adhocTypes) ;
        if(arrSize == 0){
          group.attr('adhocTypeNameDisplay',"")
        }else{
          arrSize > 1 ? group.attr('adhocTypeNameDisplay', arrSize+" AdhocTypes") : group.attr('adhocTypeNameDisplay',adhocTypes[0]) ;
        }


      });
      can.batch.stop();

      return rows;
    },
    aggregateRows: [],
    makeAggregateRowsFromBundle: function(bundle) {
      can.batch.start();
      var rows = [];
      if(bundle.bundleFooter) {
        bundle.bundleFooter.attr("isFooterRow",true);
        bundle.bundleFooter.attr("view",bundle.view);
        rows.push(bundle.bundleFooter);
        bundle.bundleFooter.bdlFooterDetails.forEach(function(detail) {
          detail.attr('__isChild', true);
          rows.push(detail);
        });
      }
      can.batch.stop();

      return rows;
    },

    selectedRows: [],

    prefilteredColumns: [],
    filterColumns: function() {
      this.scope.prefilteredColumns.splice(0, this.scope.prefilteredColumns.length);

      var filteredColumns = this.scope.attr('columns');
      if(! this.scope.pageState.attr('verboseGrid')) {
        // use only the ones without verboseOnly = true
        filteredColumns = _.filter(filteredColumns, column => !column.verboseOnly);
      }
      if(!_.some(this.scope.attr('rows'), row => row.attr('validationMessages') && row.attr('validationMessages').attr('length'))) {
        filteredColumns = _.filter(filteredColumns, column => !column.validationsOnly);
      }

      this.scope.prefilteredColumns.attr(
        filteredColumns
      );

    //  return filteredColumns;
    }
  },
  helpers: {
    filteredColumns: function(options) {
      this.prefilteredColumns.attr('length');
      return _.map(this.attr('prefilteredColumns'), column => options.fn({column}));
    },
    filteredRows: function (options) {
      return ScrollingGrid.prototype.helpers.filteredRows.apply(this, arguments);
    },
    footerRows: function(options) {
      // By default, rows are a bit more complex.
      // We have to account for child rows being invisible when their parents aren't open.

      var isRowAChild = function(row) {
        // by default, just looking for __isChild = true
        return !!row.attr('__isChild');
      };

      var isRowOpen = function(row) {
        // by default, just looking for __isOpen = true
        return !!row.attr('__isOpen');
      };

      var out = [],
          childRowsAreVisible = false;
      can.__reading(this.aggregateRows, 'change'); // TODO: figure out if there's a better way to do this.
                                          // Note for others - don't use can.__reading yourself!

      return _.map(this.aggregateRows, function(row) {
        var isChild = isRowAChild(row);

        // if the row is a parent and isn't open, its children shouldn't be visible -
        // this flag is only true for the children of an open parent row
        if(!isChild) {
          childRowsAreVisible = isRowOpen(row);
        }

        return options.fn({
          row: row,
          isOpen: isChild ? false : isRowOpen(row), // child rows are never open
          isChild: isChild,
          isVisible: isChild ? childRowsAreVisible : true // parent rows are always visible
        });
      });
    },
    // override rowClass handler to add a class if the row is selected
    rowClass: function(row) {
      if(this.selectedRows.indexOf(row) > -1) {
        return 'selected';
      } else {
        return '';
      }
    }
  },
  events: {
    '{scope.pageState} selectedBundle': function(scope, ev, newBundle) {
      this.scope.localOffsetTracker = 0;
      this.scope.rows.splice(0, this.scope.rows.length, ...(newBundle ? this.scope.makeRowsFromBundle(newBundle) : []));
      this.scope.aggregateRows.splice(0, this.scope.aggregateRows.length, ...(newBundle ? this.scope.makeAggregateRowsFromBundle(newBundle) : []));
    },
    '{scope.pageState.selectedBundle.bundleDetailsGroup} length': function() {

      if(this.scope.paginateAttr.attr("offset") > 0) {
          if(this.scope.paginateAttr.attr("offset") != this.scope.localOffsetTracker){
            this.scope.localOffsetTracker = this.scope.paginateAttr.attr("offset")
            $.merge(this.scope.rows, this.scope.makeRowsFromBundle(this.scope.pageState.selectedBundle));
            this.scope.rows.replace(this.scope.rows);
          }
      }else{
        this.scope.localOffsetTracker = 0;
        this.scope.rows.splice(0, this.scope.rows.length, ...this.scope.makeRowsFromBundle(this.scope.pageState.selectedBundle));
      }
      this.scope.aggregateRows.splice(0, this.scope.aggregateRows.length, ...this.scope.makeAggregateRowsFromBundle(this.scope.pageState.selectedBundle));

    },
    'tbody tr click': function(el, ev) {
      if(ev.target.classList.contains('open-toggle')) {
        return;
      }

      var row = el.data('row').row;

      // toggle selecting a row
      var ix = this.scope.selectedRows.indexOf(row);
      if(ix > -1) {
        this.scope.selectedRows.splice(ix, 1);
      } else {
        this.scope.selectedRows.push(row);
      }
    },
    'td.validations img mouseover': function(el, ev) {
      var row = el.data('row');
      el.popover({
        content: row.validationMessages.join('<br/>'),
        trigger: 'manual',
        html:true
      });
      el.popover('show');
    },
    'td.validations img mouseout': function(el, ev) {
      el.popover('hide');
    },
    init: function() {
      this.scope.filterColumns.apply(this);
    },
    'inserted': function() {
      this.scope.filterColumns.apply(this);

      var component = this;
      var tbody = this.element.find('tbody');
      var $window = $(window).on('resize', function(){

        var getTblBodyHght=gridUtils.getTableBodyHeight('bundleDetailGridDiv',40);
        gridUtils.setElementHeight(tbody,getTblBodyHght,getTblBodyHght);
      }).trigger('resize');
      var doneCallback = function() {

        console.log(" is Bottom grid data Available :"+component.scope.paginateAttr.recordsAvailable);

        //recordsAvailable is to know, if there is next set records available, if yes, invoke
        if(!component.scope.paginateAttr.isInProgress && component.scope.paginateAttr.recordsAvailable){
          component.scope.paginateAttr.attr("paginateRequest",true);

        }
        component.scope.attr('atBottom', false);
      };
      $(tbody).on('scroll', function(ev) {
        if(tbody[0].scrollTop + tbody[0].clientHeight >= tbody[0].scrollHeight - 100 ) {
          // we are at the bottom
          component.scope.attr('atBottom', true);
          component.scope.atBottomHandler.call(component, doneCallback);
        }
      });

    },
    '{scope.pageState} verboseGrid': function() {
      this.scope.filterColumns.apply(this);
    },
    '{scope.pageState} validationGrid': function() {

      if(this.scope.pageState.attr('validationGrid')) {
        this.scope.filterColumns.apply(this);
      }

    },
    '{scope.columns} length': function() {
      this.scope.filterColumns.apply(this);
    },
    '{scope} columns': function() {
      this.scope.filterColumns.apply(this);
    }
  }
});
