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
        id: 'noOfAdamIds',
        title: '# Adam ID'
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

      loadrefresh : "false",

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
            var $noOfAdamIds = $row.find('td[class*="noOfAdamIds"]');
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

        self = this;

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

            //
            // reqArr.searchRequest = {};
            // reqArr.searchRequest.ids = ids;

            var genObj = reqArr;

            Promise.all([Stats.findOne(UserReq.formRequestDetails(genObj))]).then(function(values) {

              self.summaryStatsData.splice(0,1);

              var data = values[0];


              if( data.ingestionStats != null && data.ingestionStats.length > 0 && data.summaryStats!= null)
              {

                  var ingestionStats = data.ingestionStats;

                  // Grid data
                  var grid = {"data" : []};

                  for(var i=0;i<ingestionStats.length;i++) {

                    var tempArr = {};

                    tempArr["disputeType"] = ingestionStats[i]["disputeType"];
                    tempArr["noOfRecords"] = formats.currencyFormat(ingestionStats[i]["noOfRecords"]);
                    tempArr["recordsPercentage"] = ingestionStats[i]["recordsPercentage"];
                    tempArr["noOfAdamIds"] = formats.currencyFormat(ingestionStats[i]["noOfAdamIds"]);
                    tempArr["totalPubFee"] = formats.currencyFormat(ingestionStats[i]["totalPubFee"]);
                    tempArr["pubFeePercentage"] = ingestionStats[i]["pubFeePercentage"];

                    grid.data.push(tempArr);

                  }

                  var tempSummaryStats = {};

                  tempSummaryStats.reconRecordsPercentage = data.summaryStats.reconRecordsPercentage;
                  tempSummaryStats.reconAmountPercentage = data.summaryStats.reconAmountPercentage;
                  tempSummaryStats.overRepDispute = data.summaryStats.overRepDispute;


                  tempSummaryStats.noOfReconRecords = (formats.currencyFormat(data.summaryStats.noOfReconRecords)).toString();

                  tempSummaryStats.reconAmount = formats.currencyFormat(data.summaryStats.reconAmount);

                  tempSummaryStats.lineItemDispute = formats.currencyFormat(data.summaryStats.lineItemDispute );

                  tempSummaryStats.totalPubFee = formats.currencyFormat(data.summaryStats.totalPubFee );

                  tempSummaryStats.recommendedPayment = formats.currencyFormat(data.summaryStats.recommendedPayment );

                  tempSummaryStats.actualPayment = formats.currencyFormat(data.summaryStats.actualPayment );

                  var summaryData = [];

                  self.summaryStatsData.push(tempSummaryStats);

                  var rows = new can.List(grid.data);

                  $('#ingestionReconStats').html(stache('<rn-grid-ingestionstats rows="{rows}"></rn-grid-ingestionstats>')({rows}));

                  $('#ingestionStatsDiv').show();
                  $('#summaryStatsDiv').show();

              }

            },function(xhr){

               console.error("Error while loading: bundleNames"+xhr);
            });

          }

      }

  },
	events: {
    'inserted' : function() {
      $('.statsTable').hide();
    },
		".refreshReconStats click": function(item,el,ev) {
      self = this;
      var ccids = this.element.parent().scope().ingestCcidSelected;
      //console.log(JSON.stringify(ccids));
      self.scope.fn_refreshReconStats(ccids,this.scope.currency);
		}
	}



});


export default page;
