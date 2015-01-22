import Component from 'can/component/';
import template from './template.stache!';
import styles from './recon-stats.less!';
import Stats from 'models/refreshstats/refreshstats';
import Grid from 'components/grid/';
import injestiontemplate from './stat-injestion.stache!';
import stache from 'can/view/stache/';
import Currency from 'models/common/currency/';
import UserReq from 'utils/request/';
import formats from 'utils/formats';

/* Extend grid with the columns */
Grid.extend({
  tag: 'rn-grid-ingestionstats',
  template: injestiontemplate,
  scope: {
    appstate:undefined,
    columns: [

      {
        id: 'disputeType',
        title: 'Dispute'
      },
      {
        id: 'noOfRecords',
        title: '# Records'
      },
      {
        id: 'recordsPercentage',
        title: '% Records'
      },
      {
        id: 'totalPubFee',
        title: 'Total Pub Fee'
      },
      {
        id: 'pubFeePercentage',
        title: '% Pub Fee'
      }
    ]
  }
});

var page = Component.extend({
  tag: 'recon-stats',
  template: template,

  scope: {

      refreshstatsreq : {},

      loadrefresh : false,

      refreshParam : {
        "searchRequest": {
  				"ids" : []
			   }
			},

		summaryStatsData : [],
    currency:"",

    fn_RefreshReconStatsRequest : function() {

      var id = [];

      $('.rn-grid-ingestionstats1').each(function (i, row) {

            // reference all the stuff you need first
            var $row = $(row);
            var $disputeTypeCheck = $row.find('input[id*="disputeCheckBox"]');
            var $disputeType = $row.find('td[class*="disputeType"]');
            var $noOfRecords = $row.find('td[class*="noOfRecords"]');
            var $recordsPercentage = $row.find('td[class*="recordsPercentage"]');
            //var $noOfAdamIds = $row.find('td[class*="noOfAdamIds"]');
            var $pubFeePercentage = $row.find('td[class*="pubFeePercentage"]');



            for(var j=0;j<$disputeTypeCheck.length;j++) {

                if ($disputeTypeCheck[j].checked === true) {

                    id[j] = $disputeType[j].innerHTML;

                }

            }


        });

      return id;

    },

    fn_refreshReconStats : function(dtlHDRIds,currency) {

        var self = this;

        if(dtlHDRIds.length > 0)  {

            self.refreshParam.searchRequest.ids = dtlHDRIds;

            $('.statsTable').show();
            $('#summaryStatsDiv').hide();
            $('#ingestionStatsDiv').hide();

            var value = {};



            var selectedIds = [];

            for(var i=0; i<dtlHDRIds.length; i++) {

              selectedIds[i] = dtlHDRIds[i].toString();

            }

            var reqArr = {
              searchRequest:{
              "ids" : selectedIds,
              "currency": currency
              }
            };


            var genObj = reqArr;

            Promise.all([Stats.findOne(UserReq.formRequestDetails(genObj))]).then(function(values) {

              self.summaryStatsData.splice(0,1);

              var data = values[0];

              self.loadRefreshStats(data,self);
              

            },function(xhr){

               console.error("Error while loading: bundleNames"+xhr);
            });

          }

      },

       loadRefreshStats: function(data, self) {

          if( data.ingestionStats != null && data.ingestionStats.length > 0 && data.summaryStats!= null)
          {

              var ingestionStats = data.ingestionStats;

              // Grid data
              var grid = {"data" : []};

              for(var i=0;i<ingestionStats.length;i++) {

                var ingestionArr = {};

                ingestionArr["disputeType"] = ingestionStats[i]["disputeType"];
                ingestionArr["noOfRecords"] = (formats.numberFormatDecimal(ingestionStats[i]["noOfRecords"], 1)).toString().split(".")[0];
                ingestionArr["recordsPercentage"] = ingestionStats[i]["recordsPercentage"] == "0" ? "0.0" : ingestionStats[i]["recordsPercentage"];
                ingestionArr["noOfAdamIds"] = (formats.numberFormatDecimal(ingestionStats[i]["noOfAdamIds"], 1)).toString().split(".")[0];
                ingestionArr["totalPubFee"] = formats.currencyFormatDecimal(ingestionStats[i]["totalPubFee"] != "" ? ingestionStats[i]["totalPubFee"] : "0", 1);
                ingestionArr["pubFeePercentage"] = ingestionStats[i]["pubFeePercentage"] == "0" ? "0.0" : ingestionStats[i]["pubFeePercentage"];

                grid.data.push(ingestionArr);

              }

              var ingestionSummaryStats = {};

              ingestionSummaryStats.reconRecordsPercentage = data.summaryStats.reconRecordsPercentage;
              ingestionSummaryStats.reconAmountPercentage = data.summaryStats.reconAmountPercentage;
              ingestionSummaryStats.overRepDispute = data.summaryStats.overRepDispute;


              ingestionSummaryStats.noOfReconRecords = (formats.numberFormatDecimal(data.summaryStats.noOfReconRecords).toString()).split(".")[0];

              ingestionSummaryStats.reconAmount = formats.currencyFormatDecimal(data.summaryStats.reconAmount, 1);

              ingestionSummaryStats.lineItemDispute = formats.currencyFormatDecimal(data.summaryStats.lineItemDispute, 1);

              ingestionSummaryStats.totalPubFee = formats.currencyFormatDecimal(data.summaryStats.totalPubFee, 1);

              ingestionSummaryStats.recommendedPayment = formats.currencyFormatDecimal(data.summaryStats.recommendedPayment, 1);

              ingestionSummaryStats.actualPayment = formats.currencyFormatDecimal(data.summaryStats.actualPayment == "" ? 0 : data.summaryStats.actualPayment, 1);

              var summaryData = [];

              self.summaryStatsData.splice(0, self.summaryStatsData.length);

              self.summaryStatsData.push(ingestionSummaryStats);

              var rows = new can.List(grid.data);

              $('#ingestionReconStats').html(stache('<rn-grid-ingestionstats rows="{rows}"></rn-grid-ingestionstats>')({rows}));

              setTimeout(function(){
                alignGridStats('ingestionReconStats');
              },10);
              

              $('.statsTable').show();
              $('#ingestionStatsDiv').show();
              $('#summaryStatsDiv').show();

          }

       }

  },

	events: {

    'inserted' : function() {
      $('.statsTable').hide();
      this.element.parent().scope().addRefresh(this.scope);

    },

		".refreshReconStats click": function(item,el,ev) {
      self = this;
      var ccids = this.element.parent().scope().ingestCcidSelected;

      //console.log(JSON.stringify(ccids));
      self.scope.fn_refreshReconStats(ccids,this.scope.currency);
		}
	}



});

function alignGridStats(divId){
  var colLength = $('#'+divId+' table>thead>tr>th').length;
  var rowLength = $('#'+divId+' table>tbody>tr').length;
  var divWidth = $('#'+divId).outerWidth();
  var tableWidth = 0;
  var tdWidth, cellWidthArr = [];
  if(rowLength>0){
    $('#'+divId+' table').css("width",divWidth);
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

export default page;
