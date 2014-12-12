import Component from 'can/component/';
import template from './template.stache!';
import styles from './recon-stats.less!';
import Stats from 'models/refreshstats/refreshstats';
import Grid from 'components/grid/';
import injestiontemplate from './stat-injestion.stache!';
import stache from 'can/view/stache/';
import Currency from 'models/common/currency/';
import UserReq from 'utils/request/';


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

    currencyScope: [],

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

    fn_refreshReconStats : function(ccids) {

        self = this;

        if(ccids.length > 0)  {

            self.refreshParam.searchRequest.ids = ccids;

            $('.statsTable').show();
            $('#summaryStatsDiv').hide();
            $('#ingestionStatsDiv').hide();

            var value = {};

            Stats.findOne(self.refreshParam, function(data){

              self.summaryStatsData.splice(0,1);

              var ingestionStats = data.reconStatsDetails[0].ingestionStats;

              var genObj = {};

              Promise.all([Currency.findAll(UserReq.formRequestDetails(genObj))
                 ]).then(function(values) {


                  self.attr("currencyScope").replace(values[0]);

               });

              // Grid data
              var grid = {"data" : []};

              for(var i=0;i<ingestionStats.length;i++) {

                var tempArr = {};

                tempArr["disputeType"] = ingestionStats[i]["disputeType"];
                tempArr["noOfRecords"] = CurrencyFormat(ingestionStats[i]["noOfRecords"]);
                tempArr["recordsPercentage"] = ingestionStats[i]["recordsPercentage"];
                tempArr["noOfAdamIds"] = CurrencyFormat(ingestionStats[i]["noOfAdamIds"]);
                tempArr["totalPubFee"] = CurrencyFormat(ingestionStats[i]["totalPubFee"]);
                tempArr["pubFeePercentage"] = ingestionStats[i]["pubFeePercentage"];

                grid.data.push(tempArr);

              }

              var tempSummaryStats = {};

              tempSummaryStats.reconRecordsPercentage = data.reconStatsDetails[0].summaryStats.reconRecordsPercentage;
              tempSummaryStats.reconAmountPercentage = data.reconStatsDetails[0].summaryStats.reconAmountPercentage;
              tempSummaryStats.overRepDispute = data.reconStatsDetails[0].summaryStats.overRepDispute;


              tempSummaryStats.noOfReconRecords = (CurrencyFormat(data.reconStatsDetails[0].summaryStats.noOfReconRecords)).toString();

              tempSummaryStats.reconAmount = CurrencyFormat(data.reconStatsDetails[0].summaryStats.reconAmount);

              tempSummaryStats.lineItemDispute = CurrencyFormat(data.reconStatsDetails[0].summaryStats.lineItemDispute );

              tempSummaryStats.totalPubFee = CurrencyFormat(data.reconStatsDetails[0].summaryStats.totalPubFee );

              tempSummaryStats.recommendedPayment = CurrencyFormat(data.reconStatsDetails[0].summaryStats.recommendedPayment );

              tempSummaryStats.actualPayment = CurrencyFormat(data.reconStatsDetails[0].summaryStats.actualPayment );

              var summaryData = [];

              self.summaryStatsData.push(tempSummaryStats);

              var rows = new can.List(grid.data);

              $('#ingestionReconStats').html(stache('<rn-grid-ingestionstats rows="{rows}"></rn-grid-ingestionstats>')({rows}));

              $('#ingestionStatsDiv').show();
              $('#summaryStatsDiv').show();

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

		"#refreshReconStats click": function(item,el,ev) {

      self = this;

      var ccids = this.element.parent().scope().ingestCcidSelected;

      self.scope.fn_refreshReconStats(ccids);

		}

	}



});

function CurrencyFormat(number)
{
  var n = number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
  var splitNum = n.split('.');
  return splitNum[0];
}

export default page;
