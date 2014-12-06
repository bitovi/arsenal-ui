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

      refreshStatsReq : {},

      loadRefresh : "false",

      refreshParam : {

  			"prsId": "12345",
  			"appId": "12345",
  			"requestTimeStamp": "1371450037289",
  			"authToken" : "3B9LrucRihXmNuM6",
  			"searchRequest": {
  				"ids" : []
			   }

  		},

  		defaultStatsData : {
			"status" : "SUCCESS",
			"responseCode": "0000",
			"responseText": "Data retrieved successfully",

			"reconStatsDetails": [
				{

					"ingestionStats": [
						{
							"disputeType": "SR Matched",
							"noOfRecords": "1040",
							"recordsPercentage": "0.03",
							"noOfAdamIds": "876",
							"totalPubFee": "24",
							"pubFeePercentage": "0"
						},
						{
							"disputeType": "UnitPubFee Violation",
							"noOfRecords": "18083",
							"recordsPercentage": "0.46",
							"noOfAdamIds": "16937",
							"totalPubFee": "7003",
							"pubFeePercentage": "1"
						}
					],
					"summaryStats": {
						"currency": "EUR",
						"noOfReconRecords": "2850248",
						"reconRecordsPercentage": "0",
						"reconAmount": "864376",
						"reconAmountPercentage": "75.38",
						"lineItemDispute": "282171",
						"overRepDispute": "0",
						"totalPubFee": "1146674",
						"recommendedPayment": "57856",
						"actualPayment": "67307"
					}

				}

			]

		},

		summaryStatsData : [],

    currencyScope: [],

   //
    init: function() {

        self = this;

        if(self.loadRefresh === "true") {

          self.fn_refreshReconStats(self.refreshStatsReq);

        }

    },

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

    fn_refreshReconStats : function(reconState) {

        self = this;

        self.refreshParam.searchRequest.ids = self.fn_RefreshReconStatsRequest(self.refreshParam);

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

          data.reconStatsDetails[0].summaryStats.noOfReconRecords = (CurrencyFormat(data.reconStatsDetails[0].summaryStats.noOfReconRecords)).toString();

          data.reconStatsDetails[0].summaryStats.reconAmount = CurrencyFormat(data.reconStatsDetails[0].summaryStats.reconAmount);

          data.reconStatsDetails[0].summaryStats.lineItemDispute = CurrencyFormat(data.reconStatsDetails[0].summaryStats.lineItemDispute );

          data.reconStatsDetails[0].summaryStats.totalPubFee = CurrencyFormat(data.reconStatsDetails[0].summaryStats.totalPubFee );

          data.reconStatsDetails[0].summaryStats.recommendedPayment = CurrencyFormat(data.reconStatsDetails[0].summaryStats.recommendedPayment );

          data.reconStatsDetails[0].summaryStats.actualPayment = CurrencyFormat(data.reconStatsDetails[0].summaryStats.actualPayment );

          var summaryData = [];

          summaryData = data.reconStatsDetails[0].summaryStats;

          self.summaryStatsData.push(summaryData);

          var rows = new can.List(grid.data);

          $('#ingestionReconStats').html(stache('<rn-grid-ingestionstats rows="{rows}"></rn-grid-ingestionstats>')({rows}));

          $('#ingestionStatsDiv').show();
          $('#summaryStatsDiv').show();

        },function(xhr){

           console.error("Error while loading: bundleNames"+xhr);
        });


      }

  },


	events: {

		"#refreshReconStats click": function(item,el,ev) {


      //var reconState = $('#reconStatsTopTab').html();
      self = this;

      self.scope.fn_refreshReconStats();

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
