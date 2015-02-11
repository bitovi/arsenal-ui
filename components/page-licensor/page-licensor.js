import Component from 'can/component/';
import template from './template.stache!';
import styles from './page-licensor.less!';
import Licensor from 'models/common/licensor/';
import UserReq from 'utils/request/';
import Analytics from 'models/entityLicensor/';
import stache from 'can/view/stache/';
import Comments from 'components/multiple-comments/';
import countryModelTemplate from './countryModel_template.stache!';
import revisionHistoryTemplate from './revisionHistory_template.stache!';
import Grid from 'components/grid/';
import periodCalendar from 'components/period-calendar/';
import validations from 'can/map/validations/';
import bootstrapValidator from 'bootstrapValidator';
import css_bootstrapValidator from 'bootstrapValidator.css!';
import PeriodWidgetHelper from 'utils/periodWidgetHelpers';


var lDetails = new can.Map({
  data: null,

});

var newCDetails = new can.Map({
  data: []
});


Grid.extend({
  tag: 'rn-grid-countrymodelmapping',
  template: countryModelTemplate,
  scope: {
    appstate:undefined,
    columns: [

      {
        id: 'countryID',
        title: 'Country'
      },
      {
        id: 'modelName',
        title: 'Model'
      },
      {
        id: 'verNo',
        title: 'Version'
      },
      {
        id: 'validFrom',
        title: 'Valid From'
      },
      {
        id: 'validTo',
        title: 'Valid To'
      }
    ]
  }
});


Grid.extend({
  tag: 'rn-grid-revisionhistory',
  template: revisionHistoryTemplate,
  scope: {
    appstate:undefined,

    columns: [

      {
        id: 'id',
        title: 'ID'
      },
      {
        id: 'entity',
        title: 'Licensor'
      },
      {
        id: 'validFrom',
        title: 'Valid From'
      },
      {
        id: 'validTo',
        title: 'Valid To'
      },
      {
        id: 'status',
        title: 'Status'
      },
      {
        id: 'commentText',
        title: 'Comments'
      }


    ]
  }
});

var page = Component.extend({
  tag: 'page-licensor',
  template: template,

  scope: {

    tabSelected :"",
    licensors : [],

    licDetails : lDetails,

    countries : [],
    reportTypes : [],

    reqCountries : [],
    reqReportTypes : [],

    reqc : [],
    reqr : [],

    submitAllCountires : false,
    submitAllReports : false,

    contactDetails : [],
    newContactDetails: newCDetails,
    contactCounter: 0,
    periodFrom: [],
    periodTo : [],
    periodFromInput: "",
    periodToInput : "",
    revisionHistory : [],
    invoiceTypes : [],
    periodFromVal : "",

    invoiceType : "",

    invoiceTypeList : [],
    //["CCID V12", "CCID V5e", "CCID V5hprs", "CCID12", "CCID13", "CCID5e", "CCID5hPRS", "CSI", "Standard Apple"],

    selectedperiod:[],
    selectedEntity: "",

    selectedInvoiceDetails: "",

    status: "",

    mode : "",

    societyContactsDeleteList: [],

    newSocietyContactsDeleteList : [],

    socListToSave : [],

    invoiceDetailTypesArr: [],

    errorMessage : "",

    repConfMessage : "",

    latestSelectedCountry : "",

    repConfValuesExists : true,

    bootstrapValidParams : ["licensorName", "accountName", "invoiceType", "sapVendor", "periodFromInp"],

    displayCoutries : [],

    rptConfigurationPerCountry : {

      repconf : []

    },

    reportConfMap  : {},

    mapCurrentCountryReportConf : function () {

      var self = this;


      self.rptConfigurationPerCountry.repconf.splice(0,self.rptConfigurationPerCountry.repconf.length);

      var inputReportBoxes =  $("input.reportBox");

      var inputCountryBoxes = $("input.countryBox");

      var repArray = [];

      var count = 0;

      var repConfiguration = [];

      for(var i=0; i < inputReportBoxes.length ; i++ ) {

        if(inputReportBoxes[i].checked == true) {

            repArray[count++] = inputReportBoxes[i].getAttribute("actualValue");

        }

      }

      if (repArray.length <= 0) {

        repArray.push("Report configuration will be reset for selected country");

      }

      for (var i=0; i < inputCountryBoxes.length ; i++ ) {

        if(inputCountryBoxes[i].checked == true) {

          var country = inputCountryBoxes[i].getAttribute("value");

          var element = {"country" : "" , "reports" : []};

          var exists = false;

          element.country = country;

          element.reports = repArray;



          self.rptConfigurationPerCountry.repconf.push(element);

          }

        }

    },

    mapExistCountryReportConf : function() {

      var self = this;

      var data = self.reportConfMap;

      var inputReportBoxes =  $("input.reportBox");

      var inputCountryBoxes = $("input.countryBox");

      var repArray = [];

      var count = 0;

      var repConfiguration = [];


      for(var i=0; i < inputReportBoxes.length ; i++ ) {

        if(inputReportBoxes[i].checked == true) {

            repArray[count++] = inputReportBoxes[i].getAttribute("value");

        }

      }

      for (var i=0; i < inputCountryBoxes.length ; i++ ) {

        if(inputCountryBoxes[i].checked == true) {

          var country = inputCountryBoxes[i].getAttribute("value");

          var element = {};

          var exists = false;

          if(data[country] != undefined) {

              //data[country].splice(0, (data[country]).length );
              data[country].replace(repArray);

              exists = true;

          }

          if (exists == false) {

            self.reportConfMap[country] = repArray;

          }

        }

      }

      self.repConfValuesExists = true;

    },

    getExistCountryReportConf : function(country) {

      var self = this;

      var data = self.reportConfMap;

      if(data[country] != undefined) {

        return data[country];

      }
      return [];

    },

    getReportConf : function() {

      var self = this;

      if(self.submitAllReports == true) {

          return self.licDetails.data.reportTypes;

      } else {

          return self.reqReportTypes;
      }

    },

    getCountries : function() {

      var self = this;

      if(self.submitAllCountires == true) {

          return self.licDetails.data.countries;

      } else {

          return self.reqCountries;
      }

    },

    loadCountryReportconfiguration : function() {


      var self = this;

      var countryObj = self.countries[0];

      var reportBox = $("input.reportBox");

      for(var i=0; i<reportBox.length; i++) {

        if(reportBox[i].checked) {

          reportBox[i].checked = false;

        }

      }
      
      if(countryObj != undefined && countryObj != null) {

          var reportConf = self.getExistCountryReportConf(countryObj.name);

          $('input.countryBox').prop("checked", false);

          var country = $('input.countryBox');

          var reportBox = $("input.reportBox");

          var checked = false;
          

          for(var i=0; i < reportConf.length; i++) {

            for(var j=0; j<reportBox.length; j++) {

                if(reportBox[j].getAttribute("value") == reportConf[i] ) {

                  reportBox[j].checked = true;

                  checked = true;

                }

            }

          }

          if(checked) {

            for(var i=0; i<country.length; i++) {

              var obj = country[i].getAttribute("value");

              if(obj == countryObj.name) {

                country[i].checked = true;

              }

            } 
          }

      }

    },

    getSocietyContactDetails : function() {

      var elementArr = [];
      
      var j = 0;

      for(var i=0; i< this.newContactDetails.data.length; i++) {

        var valApp = this.newContactDetails.data[i].name;
        var vName = "contactName" + valApp;
        var vEmail = "contactEmail" + valApp;

        var element = {};

        var valName = this.newContactDetails.data[vName];
        var valEmail = this.newContactDetails.data[vEmail];

        if(valName != "" && valEmail !="" && valName!= undefined && valEmail!= undefined) {


          element.contactName = this.newContactDetails.data[vName];
          element.contactEmail = this.newContactDetails.data[vEmail];
          element.id="0";

          element.licensorId = "0";

          elementArr[j++] = element;

        }


      }

      for(var i=0; i< this.contactDetails.length; i++) {

        var element = {};

        element.contactName = this.contactDetails[i].contactName;
        element.contactEmail = this.contactDetails[i].contactEmail;
        element.id = this.contactDetails[i].id;

        if(this.contactDetails[i].licensorId== null || this.contactDetails[i].licensorId == undefined) {
            this.contactDetails[i].licensorId = "0";
        }
        element.licensorId = this.contactDetails[i].licensorId;

        elementArr[j++] = element;

      }

      return elementArr;

    },

    getEditableComments : function() {

      return $("textarea.multiple-comments-editable-height").val();
    },


    removeRows : function(type, value) {

      var self = this;

      if(type == "exists") {

        for(var j=0; j<self.contactDetails.length; j++) {

            if( value == self.contactDetails[j].id) {

              self.contactDetails.splice(j,1);

            }

          }


      } else {


          for(var j=0; j<self.newContactDetails.data.length; j++) {

            if( value == self.newContactDetails.data[j].name) {

                self.newContactDetails.data.splice(j,1);

                var $option  = $(".societyContacts tbody tr:nth-child("+j+")").find('[name="contactName[]"], [name="contactEmail[]"]');

                DynamicFieldValidation($option, 'removeField', $('#entityLicensorBottom'));

            }

          }



      }

    },

    disableTabs : function() {



      $('.countryModelLabel').hide();

      $('.revHistCollapser').hide();

      $('.repConfigurationTab').hide();

      $('#entityGrid').hide();

      $('.paymentTerms').hide();

      $('.uploadedFTP').hide();

      $('.RepSplit').hide();

      $('.buttonsBottom').hide();

      $('.status').hide();
      
      $(".multicomments-required").hide();


    },

    populateInvoiceTypes : function() {

      var self = this;

      var elementArr = [];

      for(var i=0; i< self.invoiceTypeList.length; i++) {

        var element = {};

        element.id = self.invoiceTypeList[i];
        element.value = self.invoiceTypeList[i];

        elementArr.push(element);

      }

      self.invoiceTypes.replace(elementArr);

    },

    populateAnalyticsPage : function(values, from) {

      var rows = [];

      var self = this;

      var commentObj = values[0].licensorDetails.commentList;

      self.clearContactDetails();


      self.editable = "";

      var countryModelObj = values[0].licensorDetails.commentList;

      rows = values[0].licensorDetails.countryModelMappings;

      self.reportConfMap = values[0].licensorDetails.reportConfMap;

      self.licDetails.attr("data", values[0].licensorDetails);

      var countries = [];

      for (var i=0; i<self.licDetails.data.countries.length; i++) {

          var countryObj = {"" : {}};

          var country = {};

          var name = self.licDetails.data.countries[i];

          country.name = self.licDetails.data.countries[i];
          //country.selected = true;

          countryObj[name] =  country;

          self.countries.push(country);

      }

      var reportType = [];

      for (var i=0; i<self.licDetails.data.reportTypes.length; i++) {

          var report = {};

          report.name = self.licDetails.data.reportTypes[i].split("@")[0];
          report.actualName = self.licDetails.data.reportTypes[i];
          //report.selected = false;

          self.reportTypes.push(report);


      }

      self.loadCountryReportconfiguration();

      self.invoiceType = values[0].licensorDetails.invoiceDetailType;

      if(self.invoiceType != null) {

        $("#invoiceType").val(self.invoiceType);

      } else {

        $("#invoiceType").val("Select");

      }

      self.attr("periodToVal",self.licDetails.data.validTo);

      self.attr("periodFromVal", self.licDetails.data.validFrom);

      if (self.periodToVal != undefined && self.periodToVal != "0" && self.periodToVal != null && self.periodToVal.toString().length >= 6) {

          self.attr("periodToVal",PeriodWidgetHelper.getDisplayPeriod(self.periodToVal.toString(), "P"));

      } else {

        self.attr("periodToVal", "");

      }

      if (self.periodFromVal != undefined && self.periodFromVal != "0" && self.periodFromVal != null && self.periodFromVal.toString().length >= 6) {

          self.attr("periodFromVal",PeriodWidgetHelper.getDisplayPeriod(self.periodFromVal.toString(), "P"));


      } else {

        self.attr("periodfromVal", "");

      }

      //$(".periodFromInput").val(self.periodFromInput);
      //$(".periodToInput").val(self.periodToInput);

      if(self.licDetails.data.status == "A") {

        self.licDetails.data.attr("status","Active");

      } else if (self.licDetails.data.status == "I") {

        self.licDetails.data.attr("status","Inactive");

      } else if (self.licDetails.data.status == "N") {

        self.licDetails.data.attr("status","Rejected");

      }


      /**  Revision History  **/
      if(self.licDetails.data.revisionHistories != null) {
        for(var i=0; i<self.licDetails.data.revisionHistories.length; i++) {

          var tempArr = {};

          if(self.licDetails.data.revisionHistories[i].countryName == null) {
            self.licDetails.data.revisionHistories[i]._data.countryName = "";
            self.licDetails.data.revisionHistories[i].countryName = "";
          }

          if(self.licDetails.data.revisionHistories[i].entity == null) {
            self.licDetails.data.revisionHistories[i]._data.entity = "";
            self.licDetails.data.revisionHistories[i].entity = "";
          }

          if(self.licDetails.data.revisionHistories[i].validFrom == null) {
            self.licDetails.data.revisionHistories[i]._data.validFrom = "";
            self.icDetails.data.revisionHistories[i].validFrom = "";
          }

          if(self.licDetails.data.revisionHistories[i].status == null) {
            self.licDetails.data.revisionHistories[i].status = "";
            self.licDetails.data.revisionHistories[i]._data.status = "";
          } else {

            if(self.licDetails.data.revisionHistories[i].status == 'A' ) {

              self.licDetails.data.revisionHistories[i].status = "Active";
              self.licDetails.data.revisionHistories[i]._data.status = "Active";
            } 
            if(self.licDetails.data.revisionHistories[i].status == 'I' ) {

              self.licDetails.data.revisionHistories[i].status = "Inctive";
              self.licDetails.data.revisionHistories[i]._data.status = "Inactive";
            } 
            if(self.licDetails.data.revisionHistories[i].status == 'N' ) {

              self.licDetails.data.revisionHistories[i].status = "";
              self.licDetails.data.revisionHistories[i]._data.status = "";
            } 

          }


          if(self.licDetails.data.revisionHistories[i].validTo == null) {
            self.licDetails.data.revisionHistories[i].validTo = "";
            self.licDetails.data.revisionHistories[i]._data.validTo = "";
          }

          if(self.licDetails.data.revisionHistories[i].commentText == null) {

            var commentListLength = self.licDetails.data.revisionHistories[i].commentList.length;

            self.licDetails.data.revisionHistories[i].commentText = commentListLength != null && commentListLength > 1  ? self.licDetails.data.revisionHistories[i].commentList[0].comments : "";
            self.licDetails.data.revisionHistories[i]._data.commentText =  commentListLength != null && commentListLength > 1  ? self.licDetails.data.revisionHistories[i].commentList[0].comments : "";
          }

        }
      }

      /**  populate data in the grids  **/

      $('#multipleComments').html(stache('<multiple-comments divid="usercommentsdiv" options="{commentObj}" divheight="100" isreadOnly="n"></multiple-comments>')({commentObj}));

      /**  Country Model Mapping  **/
      if(rows != null && rows.length > 0) {

        $('#countryModelMapping').html(stache('<rn-grid-countrymodelmapping rows="{rows}"></rn-grid-countrymodelmapping>')({rows}));

      } else {

        $('#countryModelMapping').html(stache('<rn-grid-countrymodelmapping emptyrows="{emptyrows}"></rn-grid-countrymodelmapping>')({emptyrows:true}));
      }

      if(from != undefined && from != null) {

        rows = self.revisionHistory;

      } else {

        self.revisionHistory = [];

        self.revisionHistory = self.licDetails.data.revisionHistories;

        rows = self.licDetails.data.revisionHistories;

      }

      $(".revHistCollapser").show();

      if(rows != null && rows.length > 0) {

          $('#revisionHistory').html(stache('<rn-grid-revisionhistory rows="{rows}"></rn-grid-revisionhistory>')({rows}));

        } else {

          $('#revisionHistory').html(stache('<rn-grid-revisionhistory emptyrows="{emptyrows}"></rn-grid-revisionhistory>')({emptyrows:true}));

        }

      if(self.reportTypes == null || self.countries == null) {

          $("$repConfigurationTab").hide();

      }

      //self.scope.countries.data.push(countries);

      self.licDetails.data.cs=self.countries;

      self.licDetails.data.rt=self.reportTypes;

      for(var i=0; i<self.licDetails.data.contactDetails.length; i++) {

        var contactDetails = {};

        contactDetails.contactName = self.licDetails.data.contactDetails[i].contactName;

        contactDetails.contactEmail = self.licDetails.data.contactDetails[i].contactEmail;

        contactDetails.id = self.licDetails.data.contactDetails[i].id;

        contactDetails.licensorId = self.licDetails.data.licensorId;

        self.contactDetails.push(contactDetails);

      }


      $('.societyContactsTab').show();

      $('#multipleComments').show();

      $('.countryModelLabel').show();

      $('#entityGrid').show();

      $('.repConfigurationTab').show();

      $('.societyContactsTab').show();

      $('.RepSplit').show();

      $('.buttonsBottom').show();

      $('.status').show();

      $('.uploadedFTP').show();

      $('.paymentTerms').show();

      setTimeout(function(){
        alignGridStats('revisionHistory');
        alignGridCountMap('countryModelMapping');
        $('#repConfiguration .recordsCount').remove();
        alignGridStats('repConfiguration');
        alignGridStats('societyContacts');

        var socTableWidthChild=$('#societyContacts table>thead>tr>th').outerWidth();     
        $('#societyContacts table>tbody>tr>th').css("width",socTableWidthChild);
      },100);


    },

    clearPeriods : function() {

      var self = this;
      self.attr("periodFromVal", "");
      self.attr("periodToVal", "");

    },

    clearContactDetails : function() {

      var self = this;

      if(self.contactDetails.length > 0) {

        self.contactDetails.splice(0, self.contactDetails.length);

      }

      if(self.newContactDetails.data.length > 0) {

        self.newContactDetails.data.splice(0, self.newContactDetails.data.length);

      }

    },

    clearReportDetails : function() {

        var self = this;

        self.reqReportTypes.splice(0,self.reqReportTypes.length);

        $("input.reportBox").prop('checked', false);

        self.submitAllReports = false;

    },

    clearRepConfDetails : function() {

        var self = this;

        self.reqCountries.splice(0,self.reqCountries.length);

        self.reqReportTypes.splice(0,self.reqReportTypes.length);

        self.countries.splice(0,self.countries.length);

        self.reportTypes.splice(0,self.reportTypes.length);


        $("input.countryBox").prop('checked', false);
        $("input.reportBox").prop('checked', false);
        $("input.selectAllChkBox").prop('checked', false);
        $("input.selectAllRepChkBox").prop('checked', false);

        self.submitAllCountires = false;
        self.submitAllReports = false;

    },

    addRemoveElement: function(obj, val, addRemove) {

        for(var i=0; i<obj.length; i++) {

          var objElement = obj[i];

          if(objElement == val) {

              if(addRemove == "remove")
              {
                  obj.splice(i,1);

                  return false;

              } else {

                  return true;

              }

          }

        }

        return false;

    },

    addRow : function() {
      setTimeout(function(){
        alignGridStats('societyContacts');
      },0);
      var self = this;

      var element = {"name": "",  "contactName":"", "contactEmail":""};

      element.name = self.contactCounter;

      element.canvalueName = "newContactDetails.data.contactName" + self.contactCounter;
      element.canvalueEmail = "newContactDetails.data.contactEmail" + self.contactCounter;
      element.canvalue = self.contactCounter++;

      self.newContactDetails.data.push(element);

      ($("input#name")[$("input#name").length -1]).setAttribute("name", "contactName[]");
      ($("input#email")[$("input#email").length -1]).setAttribute("name", "contactEmail[]");

      var $options = $(".societyContacts").find('[name="contactName[]"], [name="contactEmail[]"]');

      DynamicFieldValidation($options, 'addField', $('#entityLicensorBottom'));

    },

    submitAnalytics : function() {

      var self = this;

        var isValid = self.reValidateFiledsonLoad();

        $('#entityLicensorBottom').bootstrapValidator('validate');

        if($('#entityLicensorBottom').data('bootstrapValidator').isValid() == false || !isValid) {

          return;

        }

        var societyContactDetails = self.getSocietyContactDetails();

        var reportConf = {"reports":[], "countries": []};

        //var reports = self.getReportConf();

        //var countries = self.getCountries();

        //if(reports.length == 0 && countries.length != 0) {

            //self.attr("repConfMessage", "Select both Countries and Reports!");

            //$(".reportConfErr").show();

            //return;

        //} else if(countries.length == 0 && reports.length != 0) {

            //self.attr("repConfMessage", "Select both Countries and Reports!");

            //$(".reportConfErr").show();

            //return;

        //}


        var comments = self.getEditableComments();

        var invoiceType = self.invoiceType;

        //Todays changes

        var periodFrom = $(".periodFromInput").val();;

        var periodTo = $(".periodToInput").val();

        if (periodFrom != 0 || periodFrom != undefined || periodFrom!= null) {

          periodFrom = PeriodWidgetHelper.getFiscalPeriod(periodFrom.toString());

        }

        if (periodTo != 0 || periodTo != undefined || periodTo!= null) {

          periodTo = PeriodWidgetHelper.getFiscalPeriod(periodTo.toString());

        }


        if (comments == "") {

          $(".multicomments-required").show();

          return;

        }

        if($("#invoiceType").val() == "Select") {

            $(".invoiceTypeerr").show();

            return;

        }

        //for(var i=0; i<reports.length; i++) {

          //reportConf.reports[i] = reports[i].toString();

        //}

        //for(var i=0; i<countries.length; i++) {

          //reportConf.countries[i] = countries[i].toString();

       // }

        if(self.mode == 'fetch') {

          var reLicencorDetails = {};

          reLicencorDetails.id = self.licDetails.data.id;
          reLicencorDetails.licensorDetails = {};
          reLicencorDetails.licensorDetails.id = self.licDetails.data.id;
          reLicencorDetails.licensorDetails.commentId  = self.licDetails.data.commentId;
          reLicencorDetails.licensorDetails.entityTypeId  = self.licDetails.data.entityTypeId;
          reLicencorDetails.licensorDetails.paymentTerms = self.licDetails.data.paymentTerms;
          reLicencorDetails.licensorDetails.repSplit = self.licDetails.data.repSplit;
          reLicencorDetails.licensorDetails.uploadedFilesToSFTP = self.licDetails.data.uploadedFilesToSFTP;
          reLicencorDetails.licensorDetails.contactDetails = societyContactDetails;
          reLicencorDetails.licensorDetails.licensorName = self.licDetails.data.licensorName;
          reLicencorDetails.licensorDetails.licensorId = self.licDetails.data.licensorId;
          reLicencorDetails.licensorDetails.createdBy = self.licDetails.data.createdBy;
          reLicencorDetails.licensorDetails.commentTxt = comments;
          reLicencorDetails.licensorDetails.accountName = self.licDetails.data.accountName;
          reLicencorDetails.licensorDetails.invoiceDetailType = self.licDetails.data.invoiceDetailType;
          reLicencorDetails.licensorDetails.prsId = self.licDetails.data.prsId;
          reLicencorDetails.licensorDetails.invoiceDetailType = invoiceType;
          //reLicencorDetails.licensorDetails.revisionHistories = [];
          //reLicencorDetails.licensorDetails.reportConf = reportConf;

          reLicencorDetails.licensorDetails.sapVendorNo = self.licDetails.data.sapVendorNo;
          reLicencorDetails.licensorDetails.validFrom = periodFrom;
          reLicencorDetails.licensorDetails.validTo = periodTo;

          reLicencorDetails.licensorId = 0;

          var genObj = reLicencorDetails;

          Promise.all([
            Analytics.create(UserReq.formRequestDetails(genObj))
          ]).then(function(data) {
            if(data[0].status == "SUCCESS") {

                var msg = "Licensor Details saved successfully";
                self.attr("selectedEntity", sEntity);
                $("#invmessageDiv").html("<label class='successMessage'>"+msg+"</label>");
                $("#invmessageDiv").show();
                setTimeout(function(){
                  $("#invmessageDiv").hide();
                },5000);

                self.populateLicensorDetails(self.licDetails.data.licensorName);
            } else {

                var msg = "Licensor Details was not saved successfully";
                $("#invmessageDiv").html("<label class='errorMessage'>"+msg+"</label>");
                $("#invmessageDiv").show();
                setTimeout(function(){
                  $("#invmessageDiv").hide();
                },5000);
            }

          });

        } else {

          var reLicencorDetails = {};

          reLicencorDetails.id = "0";
          reLicencorDetails.licensorDetails = {};
          reLicencorDetails.licensorDetails.id = "0";
          reLicencorDetails.licensorDetails.commentId  = "0";
          reLicencorDetails.licensorDetails.entityTypeId  = "1";

          reLicencorDetails.licensorDetails.contactDetails = societyContactDetails;
          reLicencorDetails.licensorDetails.licensorName = self.licDetails.data.licensorName;
          reLicencorDetails.licensorDetails.uploadedFilesToSFTP = self.licDetails.data.uploadedFilesToSFTP;

          reLicencorDetails.licensorDetails.licensorId = "0";

          reLicencorDetails.licensorDetails.commentTxt = comments;
          reLicencorDetails.licensorDetails.accountName = self.licDetails.data.accountName;
          reLicencorDetails.licensorDetails.invoiceDetailType = invoiceType;

          reLicencorDetails.licensorDetails.sapVendorNo = self.licDetails.data.sapVendorNo;

          reLicencorDetails.licensorDetails.validFrom = periodFrom;
          reLicencorDetails.licensorDetails.validTo = periodTo;

          reLicencorDetails.licensorDetails.reportConfMap = self.reportConfMap.attr();

          reLicencorDetails.licensorId = "0";

          var genObj = reLicencorDetails;

          var sEntity = self.selectedEntity;

          Promise.all([Analytics.create(UserReq.formRequestDetails(genObj))]).then(function(data) {

            if(data[0].status == "SUCCESS") {

                var genObj = {};

                var msg = "Licensor Details added successfully";

                $("#invmessageDiv").html("<label class='successMessage'>"+msg+"</label>");
                $("#invmessageDiv").show();
                setTimeout(function(){
                  $("#invmessageDiv").hide();
                  self.attr("selectedEntity", sEntity);
                },5000);
                self.populateLicensorDetails(self.licDetails.data.licensorName);

                Promise.all([Licensor.findAll(UserReq.formRequestDetails(genObj))]).then(function(values) {

                  self.licensors.replace(values[0].entities[0]);

                  self.attr("selectedEntity", sEntity);

                  $("#licensorsFilter").val(sEntity);

                });

            } else {

                var msg = "Licensor Details was not added successfully";
                $("#invmessageDiv").html("<label class='errorMessage'>"+msg+"</label>");
                $("#invmessageDiv").show();
                setTimeout(function(){
                  $("#invmessageDiv").hide();
                },5000);

            }

          });
        }

    },

    confirmSubmit : function() {

     var self = this;

      var repConf = self.rptConfigurationPerCountry.repconf;

      var displayCountries = [];

      var displayReport = [];

      for(var i=0; i<repConf.length ; i++) {

          var element = {country : "", reports : ""};

          var dReport = [];

          dReport =repConf[i].reports;

          for(var j=0; j<dReport.length ; j++) {

               element.reports += dReport[j] + ", ";

          }
          element.reports = element.reports.substr(0, element.reports.length-2);

          element.country += repConf[i].country + ", ";

          element.country = element.country.substr(0, element.country.length-2);

          displayCountries.push(element);

      }

      //displayCountries  = displayCountries.substr(0, displayCountries.length-2)

      //displayReport  = displayReport.substr(0, displayReport.length-2)

      self.attr("displayCoutries").splice(0, self.attr("displayCoutries").length);

      self.attr("displayCoutries", displayCountries);
      //self.attr("displayReport", displayReport);

      if(displayCountries.length >0 && displayCountries[0].country != "" && displayCountries[0].reports != "")  {

        $(".confirmationReportConfig").show();
        //$("#buttonsubmit").attr("disabled", true);

        $("#entityGrid").addClass("opaqueClass");

        $("#entityDetailsTab").addClass("opaqueClass");

        return;

      }

    },

    reValidateFiledsonLoad : function() {

      var isValid = true;

      for(var i=0; i< this.bootstrapValidParams.length; i++) {

        isValid = $("#entityLicensorBottom").data("bootstrapValidator").revalidateField(this.bootstrapValidParams[i]);

        if(isValid) {

          isValid = $("#entityLicensorBottom").data("bootstrapValidator").revalidateField("sapVendor").$invalidFields.length > 0 ? false : true;

        }

      }

      if(!isValid) {

        $("#buttonsubmit").attr("disabled", true);

      } else {

        $("#buttonsubmit").attr("disabled", false);

      }

      return isValid;

    },

    populateLicensorDetails : function(val) {

      var self = this;

      var genObj = {};

      $("#loading_img").show();

      Promise.all([Licensor.findAll(UserReq.formRequestDetails(genObj))]).then(function(values) {

          self.mode = "fetch";
          
          $("#societyContacts .noRecords").remove();

          self.licensors.replace(values[0].entities[0]);

          var defaultEntity = values[0].entities[0].entities[0];

          var genObj = {"id" : "" , "licensorName":""};

          if(self.appstate.attr("licensorName") != null && self.appstate.attr("licensorName") != undefined) {

            genObj.licensorName =  self.appstate.attr("licensorName");
            self.appstate.attr("licensorName", null);

          }
          else if (val == null){

            genObj.id = defaultEntity.id;
            genObj.licensorName =  defaultEntity.value;

          } else {

              genObj.licensorName =  val;

          }

          self.attr("selectedEntity", genObj.licensorName);

          Promise.all([Analytics.findOne(UserReq.formRequestDetails(genObj))]).then(function(values) {
            $("#loading_img").hide();
            self.populateAnalyticsPage(values);
            self.reValidateFiledsonLoad()

          });

          //$("#loading_img").hide();

      });

    },

    destroyBootStrapPlugin : function() {

      $('#entityLicensorBottom').data("bootstrapValidator").destroy();
      //$('#entityLicensorBottom').data("bootstrapValidator").destroy()

    },

    loadBootStrapPlugin : function() {

      $('#entityLicensorBottom').on('init.field.bv', function(e, data) {


      })
      .bootstrapValidator({
      container: 'popover',
        feedbackIcons: {
            valid: 'valid-rnotes',
            invalid: 'alert-rnotes',
            validating: 'glyphicon glyphicon-refreshas'
        },
        fields: {
          licensorName: {
              //group:'.licensorName',
              validators: {
                  notEmpty: {
                      message: 'Licensor Name is mandatory'
                  },
                  regexp: {
                      regexp: /^[a-zA-Z0-9_\- ]*$/i,
                      message: 'Please provide valid characters'
                  }
              }
          },
          accountName: {
              //group:'.accountName',
              validators: {
                  notEmpty: {
                      message: 'Account Name is mandatory'
                  },
                  regexp: {
                      regexp: /^[a-zA-Z0-9_\- ]*$/i,
                      message: 'Please provide valid characters'
                  }
              }
          },
          invoiceName: {
              group:'.licensors',
              validators: {
                  notEmpty: {
                      message: 'Invoice Name is mandatory'
                  },
                  regexp: {
                      regexp: /^[a-zA-Z0-9_\- ]*$/i,
                      message: 'Please provide valid characters'
                  }
              }
          },
          sapVendor: {
              validators: {
                  notEmpty: {
                      message: 'Sap Vendor is mandatory'
                  },
                  regexp: {
                      regexp: /^[0-9_\- ]*$/i,
                      message: 'Please provide valid characters'
                  }
              }
          },
          paymentTerms: {
              //group:'.licensors',
              validators: {
                  notEmpty: {
                      message: 'Payment Terms is mandatory'
                  },
                  regexp: {
                      regexp: /^[a-zA-Z0-9_\- ]*$/i,
                      message: 'Please provide valid characters'
                  }
              }
          },
          invoiceType: {
              //group:'.licensors',
              validators: {
                  notEmpty: {
                      message: 'Invoice Type is mandatory'
                  },
                  regexp: {
                      regexp: /^[a-zA-Z0-9_\- ]*$/i,
                      message: 'Please provide valid characters'
                  },
                  callback: {
                      message: 'Licensor is mandatory',
                      callback: function (value, validator, $field) {
                        if(value == "Select" || value == ""){
                             return false;
                        }
                        return true;
                      }
                  }
              }
          },
          usercommentsdiv: {
              //group:'.licensors',
              validators: {
                  notEmpty: {
                      message: 'User comments is mandatory'
                  },
                  regexp: {
                      regexp: /^[a-zA-Z0-9_\- ]*$/i,
                      message: 'Please provide valid characters'
                  },
                  callback: {
                      message: 'User comments is mandatory',
                      callback: function (value, validator, $field) {
                        if(value == ""){
                             return false;
                        }
                        return true;
                      }
                  }
              }
          },

          'contactName[]': {

            validators: {
                  notEmpty: {
                      message: 'Contact Name is mandatory'
                  },
                  regexp: {
                      regexp: /^[a-zA-Z0-9_\- ]*$/i,
                      message: 'Please provide valid characters'
                  },
                  callback: {
                        message: 'Contact Name is mandatory',
                        callback: function (value, validator, $field) {
                            if(value == ""){
                              return {
                                    valid: false,
                                    message: 'Contact Name is mandatory'
                                }
                            }
                            return true;
                          }
                      }
              }

          },
          'contactEmail[]': {

            validators: {
                  notEmpty: {
                      message: 'Contact Email is mandatory'
                  },
                  regexp: {
                      regexp: /^[a-zA-Z0-9_\- ]*[.[a-zA-Z0-9_\- ]*]*@[a-zA-Z0-9_\- ]*[.[a-zA-Z0-9_\- ]*]*$/i,
                      message: 'Please provide valid characters'
                  },
                  callback: {
                        message: 'Contact Name is mandatory',
                        callback: function (value, validator, $field) {
                            if(value == ""){
                              return {
                                    valid: false,
                                    message: 'Contact Email is mandatory'
                                }
                            }
                            return true;
                          }
                      }
              }

          },
          periodFromInp: {
             validators: {
                 notEmpty: {
                     message: 'Valid from is mandatory'
                 },
                 callback: {
                    message: 'Valid From is mandatory',
                    callback: function (value, validator, $field) {
                        if(value == "" || value == "0"){
                          return {
                                valid: false,
                                message: 'Valid From is mandatory'
                            }
                        }
                        return true;
                      }
                  }
             }
         }

        }
      }).on('error.field.bv', function(e, data) {

          //$('*[data-bv-icon-for="'+data.field +'"]').popover('show');

          //setTimeout(function(){
           // $('*[data-bv-icon-for="'+data.field +'"]').popover('hide');
          //},1000);

      }).on('added.field.bv', function(e, data) {
      });

      $('#entityLicensorTop').on('init.field.bv', function(e, data) {

      })
      .bootstrapValidator({
      container: 'popover',
        feedbackIcons: {
            valid: 'valid-rnotes',
            invalid: 'alert-rnotes',
            validating: 'glyphicon glyphicon-refreshas'
        },
        fields: {
          licensorsFilter: {
              //group:'.licensors',
              validators: {
                  notEmpty: {
                      message: 'Licensor is mandatory'
                  },
                  regexp: {
                      regexp: /^[a-zA-Z0-9_\- ]*$/i,
                      message: 'Please provide valid characters'
                  },
                  callback: {
                      message: 'Licensor is mandatory',
                      callback: function (value, validator, $field) {
                        if(value == "Select"){
                             return false;
                        }
                        return true;
                      }
                  }
              }
          }
        }

      }).on('error.field.bv', function(e, data) {

            $('*[data-bv-icon-for="'+data.field +'"]').popover('show');

      });

     }


  },

  init: function(){

    var self = this;

    self.scope.appstate.attr("renderGlobalSearch", false);

  },

  helpers:  {

    getselectedEntity : function(sEntity) {

        var entity = this.attr("selectedEntity");

    },

    getselectedInvoiceType : function() {

      var entity = this.attr("invoiceType");

      $(".invoiceTypeerr").hide();

    },

    getRepConfmessage : function() {

      var entity = this.attr("repConfMessage");

      return entity;

    },

    getPeriodFromVal : function() {

      var peroidFrom = this.attr("periodFromVal");

      var peroidTo = this.attr("periodToVal");

      //return entity;

    }

  },

  events: {



    'inserted': function() {

      var self = this;

      var genObj = {};

      $('#multipleComments').hide();

      $('.countryModelLabel').hide();

      $('.revHistCollapser').hide();

      $('#entityGrid').hide();

      $('.repConfigurationTab').hide();

      $('.societyContactsTab').hide();

      $('.buttonsBottom').hide();

      $(".multicomments-required").hide();

      $(".invoiceTypeerr").hide();

      $(".reportConfErr").hide();

      $("#loading_img").hide();

      $(".confirmationReportConfig").hide();

      $("#buttonsubmit").attr("disabled", true);

      var defaultEntity = [];

      //$("#loading_img").show();
      self.scope.populateLicensorDetails(null);
      //$("#loading_img").hide();

      
      Promise.all([Analytics.getInvoiceDetails(UserReq.formRequestDetails(genObj))]).then(function(values) {
          self.scope.invoiceTypeList.replace(values[0].invoiceDetailTypes);
          self.scope.populateInvoiceTypes();        
      });

      self.scope.loadBootStrapPlugin();     


    },
    'tbody tr click': function(el, ev) {
        $(el).parent().find('tr').removeClass("selected");
        $(el).parent().find('tr').removeClass("highlight");
        $(el).addClass("selected");
      },

    '.updatePeroid focus':function(el){
       $(el).closest('.calendarcls').find('.box-modal').show().trigger( "focus" );
    },

    '{selectedperiod} change':function(val){

       var periodValue = val[0].value;

       if(val[0].which == "periodFrom"){

         $("input[name='periodFromInp']").val(periodValue);

         $("input[name='periodFromInp']").on('change', function(e) {
           // Revalidate the date when user change it
           $('#entityLicensorBottom').bootstrapValidator('revalidateField', 'periodFromInp');
         });

       }
       $('input[name=periodFromInp]').change();

       if(val[0].which == "periodTo") {
         $("input[name='periodToInp']").val(periodValue);
         $("input[name='periodToInp']").on('change', function(e) {
             // Revalidate the date when user change it
           $('#entityLicensorBottom').bootstrapValidator('revalidateField', 'periodToInp');
         });
       }
       $('input[name=periodToInp]').change();

       val[0].which=='periodFrom' ? this.scope.periodFrom.replace(val[0].value):this.scope.periodTo.replace(val[0].value);
    },


     '{periodFrom} change': function(el, ev) {
         var comp ='from';
         showErrorMsg(this.scope.attr('periodFrom')[0],this.scope.attr('periodTo')[0],comp);
     },
     '{periodTo} change': function(el, ev) {
          var comp ='to';
          showErrorMsg(this.scope.attr('periodFrom')[0],this.scope.attr('periodTo')[0],comp);

     },

     ".validateInput change" : function() {

        var self = this;

        self.scope.reValidateFiledsonLoad();

      },


    ".applyAll click" : function(el, ev){
        var self = this;

        if(self.scope.submitAllReports == false) {

          $.each($("input.reportBox"), function( i, l ){

            var name = l.getAttribute("value");

            var push = self.scope.addRemoveElement(self.scope.reqReportTypes, name, "add");

            if (push == false) {

                self.scope.reqReportTypes.push(name);

              }


          });
        }

        $(".reportConfErr").hide();

        $("input.reportBox").prop('checked', true);

        self.scope.submitAllReports = true;

    },

    ".selectAllRepChkBox click" : function(el, ev){

        var self = this;

        var id = el.closest('input');

        if (el[0].checked) {

          $("input.reportBox").prop('checked', true);

        } else {

          $("input.reportBox").prop('checked', false);

        }

    },

    ".selectAllChkBox click" : function(el, ev){

        var self = this;

        var id = el.closest('input');

        if (el[0].checked) {

          $("input.countryBox").prop('checked', true);

          $.each($("input.countryBox"), function( i, l ){

            var name = l.getAttribute("value");

            var push = self.scope.addRemoveElement(self.scope.reqCountries, name, "add");

            if (push == false) {

              self.scope.reqCountries.push(name);

            }

          });

          self.scope.submitAllCountires = true;

        } else {

          $("input.countryBox").prop('checked', false);

          self.scope.reqCountries.splice(0,self.scope.reqCountries.length);

          self.scope.submitAllCountires = false;

        }

        $(".reportConfErr").hide();

    },

    ".revHistCollapse click" : function(values) {

      var display = $("rn-grid-revisionhistory").attr("style");

       if(display != undefined) {

          var displayStr = display.split(":");

          if( displayStr[1].contains("none")) {

              $("rn-grid-revisionhistory").show();

          } else {

            $("rn-grid-revisionhistory").hide();

          }
        } else {

          $("rn-grid-revisionhistory").hide();

        }


    },

    ".remove click" : function(el, ev){

        this.scope.clearReportDetails();
        $(".reportConfErr").hide();

    },

    "#editableText change" : function() {

        $(".multicomments-required").hide();

    },

    ".countryBox click": function(el, ev){

        var self = this;

        var id = el.closest('input');

        var name = id.attr("value");

        if(!el[0].checked) {

            self.scope.addRemoveElement(self.scope.reqCountries, name, "remove");

            self.scope.submitAllCountires = false;

        } else {

            var element = {};

            element.name = id.attr("value");

            self.scope.reqCountries.push(id.attr("value"));

            id.attr("val", "true");

        }

        $(".reportConfErr").hide();

    },

    ".reportBox click": function(el, ev){

        var self = this;

        var id = el.closest('input');

        var name = id.attr("value");

        if(!el[0].checked) {

          self.scope.addRemoveElement(self.scope.reqReportTypes, name, "remove");

          self.scope.submitAllReports = false;

        } else {

          var element = {};

          element.name = id.attr("value");

          self.scope.reqReportTypes.push(id.attr("value"));
        }

        $(".reportConfErr").hide();
    },

    ".addRow click": function(event){

      var self = this;

      self.scope.addRow();

    },

    ".countryReportColumn div dblclick" : function (el, ev)  {

      var self = this;

      var reportBox = $("input.reportBox");

      for(var i=0; i<reportBox.length; i++) {

        if(reportBox[i].checked) {

          reportBox[i].checked = false;

        }

      }



      var country = el.closest('div')[0].innerHTML;
      var reportConf = self.scope.getExistCountryReportConf(country);

      if(country.contains("<")) {

        var obj = el.closest('div')[0];
        country = obj.childNodes[0].getAttribute("value");
        obj.childNodes[0].checked = true;

      } else {

        var countryBox = $('input.countryBox');

        for(var i=0; i< countryBox.length ; i++) {

          if(countryBox[i].getAttribute("value") === country) {

            countryBox[i].checked = true;

          }

        }

      }

      var reportConf = self.scope.reportConfMap[country];

      self.scope.latestSelectedCountry = country;

      var reportBox = $("input.reportBox");

      for(var i=0; i < reportConf.length; i++) {

        for(var j=0; j<reportBox.length; j++) {

            if(reportBox[j].getAttribute("value") == reportConf[i] ) {

              reportBox[j].checked = true;

            }

        }

      }

    },

    ".applyAllSelected click" : function(el, ev){
      this.scope.mapCurrentCountryReportConf();
      this.scope.confirmSubmit();
      setTimeout(function(){
          alignGridLicenPop('repConfTable');
      },100)
      
    },


    ".rn-grid-revisionhistory>tbody>tr td dblclick" : function(el, ev){

          var self = this;

          var id = el.closest('tr').data('row').row.id;
          var licensor = el.closest('tr').data('row').row.entity;

          var genObj = {"id" : "" , "licensorName":""};

          genObj.id = id;
          genObj.licensorName =  licensor;

          self.scope.reValidateFiledsonLoad();

          self.scope.clearContactDetails();

          self.scope.clearRepConfDetails();

          self.scope.disableTabs();

          Promise.all([Analytics.findById(UserReq.formRequestDetails(genObj))]).then(function(values) {

            self.scope.populateAnalyticsPage(values, "getHistroy");

          });
    },

    "#buttonreset click": function(event){

        var self = this;
        if(self.scope.licDetails.attr("data") != null) {

          self.scope.licDetails.attr("data", null);

        }

        self.scope.clearContactDetails();

        self.scope.clearRepConfDetails();

        self.scope.disableTabs();

    },

    "#analyticsFetch click": function(event){
        setTimeout(function(){
          alignGridStats('societyContacts');
          $("#societyContacts .noRecords").remove();
        },0);

        var self = this;

        self.scope.mode = "fetch";
        //clear elements

        $("#loading_img").show();

        var entityName = self.scope.attr("selectedEntity");

        $('#entityLicensorTop').bootstrapValidator('validate');

        if($('#entityLicensorTop').data('bootstrapValidator').isValid() == false) {

          $("#loading_img").hide();

          return;

        }

        if(entityName == "Select" || entityName == "") {

            return;
        }

        if(self.scope.licDetails.attr("data") != null) {

          self.scope.licDetails.attr("data", null);

        }

        self.scope.clearContactDetails();

        self.scope.clearRepConfDetails();

        self.scope.disableTabs();


        var genObj = {"licensorName" : entityName};


        Promise.all([Analytics.findOne(UserReq.formRequestDetails(genObj))]).then(function(values) {

          if(values[0].status == "SUCCESS") {
            self.scope.populateAnalyticsPage(values);

            $("#loading_img").hide();

            self.scope.reValidateFiledsonLoad();

            //$('#entityLicensorBottom').bootstrapValidator('validate');
          } else {

            var msg = "No data fetched";
                $("#invmessageDiv").html("<label class='errorMessage'>"+msg+"</label>");
                $("#invmessageDiv").show();
                setTimeout(function(){
                  $("#invmessageDiv").hide();
                },5000);

            $("#loading_img").hide();

          }

        });
    },

    "#analyticsAdd click": function(event){

      setTimeout(function(){
        alignGridStats('societyContacts');
      },100);

      var self = this;

      self.scope.clearPeriods();

      self.scope.clearContactDetails();

      self.scope.clearRepConfDetails();

      self.scope.licDetails.attr("data", {});

      self.scope.disableTabs();

      $("multiple-comments").remove();

      $('.buttonsBottom').show();

      $('#multipleComments').show();

      $('#multipleComments').html(stache('<multiple-comments divid="usercommentsdiv" options="{commentObj}" divheight="100" isreadOnly="n"></multiple-comments>'));

      $('#entityGrid').show();

      $('.societyContactsTab').show();

      $('.buttonsBottom').show();

      $(".reportConfErr").hide();

      self.scope.addRow();

      self.scope.mode = "add";

      $("#invoiceType").val("Select");

      self.scope.reValidateFiledsonLoad();

      setTimeout(function(){
        alignGridStats('societyContacts');
        var socTableWidth=$('#societyContacts table').outerWidth()-15;
        $('#societyContacts table').css("width",socTableWidth);
      },100);
    },

    '.submitButton click' : function() {

        this.scope.submitAnalytics();

    },

    '#bcsubmit click' : function() {
      //$("#buttonsubmit").attr("disabled", false);
      $(".confirmationReportConfig").hide();
      $("#entityGrid").removeClass("opaqueClass");

      $("#entityDetailsTab").removeClass("opaqueClass");

      this.scope.mapExistCountryReportConf();

      alignGridStats('repConfiguration');


    },

    '.closeConfirmBox click' : function() {

      //$("#buttonsubmit").attr("disabled", false);
      $("#entityGrid").removeClass("opaqueClass");

      $("#entityDetailsTab").removeClass("opaqueClass");
      $(".confirmationReportConfig").hide();

    },

    '#bccancel click' : function() {

      //$("#buttonsubmit").attr("disabled", false);
      $("#entityGrid").removeClass("opaqueClass");

      $("#entityDetailsTab").removeClass("opaqueClass");
      $(".confirmationReportConfig").hide();

    },

    '.deleteCheckBoxNCD click' : function(el, ev) {

      var value = el.attr("val");

      this.scope.removeRows("new", value);
      if($('#societyContacts>table>tbody>tr').length==0){
        $('#societyContacts>table').append("<tfoot><tr><td class='noRecords' style='text-align:center;border:none;' colspan="+$('#societyContacts>table>thead>tr>th').length+" width='100%'>No Records Found</td></tr></tfoot>");
      }
    },

    '.deleteCheckBoxCD click' : function(el, ev) {

      var value = el.attr("val");

      this.scope.removeRows("exists", value);

      $('#entityLicensorTop').bootstrapValidator('validate');
      if($('#societyContacts>table>tbody>tr').length==0){
        $('#societyContacts>table').append("<tfoot><tr><td class='noRecords' style='text-align:center;border:none;' colspan="+$('#societyContacts>table>thead>tr>th').length+" width='100%'>No Records Found</td></tr></tfoot>");
      }

    }



  }

});


var showErrorMsg = function(periodFrom,periodTo,whichcomp){
       var showFlg=false;
       var from = periodFrom,to =  periodTo;
       if(from!=undefined &&  to!=undefined){
            from = from.slice(-2);
            to = to.slice(-2);
           if(parseInt(periodFrom.substr(0,4)) >  parseInt(periodTo.substr(0,4)))showFlg=true;
           if(parseInt(from) > parseInt(to)) showFlg=true;
        }
        if(showFlg==true){ $('.period-invalid').show(); return false;}else {showFlg=false; $('.period-invalid').hide();}
}


var DynamicFieldValidation = function(option, type, form){
   option.each(function(index){
        form.bootstrapValidator(type, $(this));
    });
}

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
          tdWidth = 45;
        if((i==1) && divId== 'societyContacts')
          tdWidth = 100;
        if((i==3) && divId== 'societyContacts')
          tdWidth = 100;
        
        tableWidth += tdWidth;
        cellWidthArr.push(tdWidth);
      }

      if(tableWidth < divWidth){
        var moreWidth = (divWidth-tableWidth)/colLength;
        for(var j=1;j<=cellWidthArr.length;j++){
          var width = cellWidthArr[j-1]+moreWidth;

          $('#'+divId+' table>thead>tr>th:nth-child('+j+')').css("width",width);          
          $('#'+divId+' table>thead>tr>th:last-child').css("width",width+1);
          $('#'+divId+' table>tbody>tr>td:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tfoot>tr>td:nth-child('+j+')').css("width",width);
          
        }
        $('#'+divId+' table').css("width",divWidth);
      } else {
        for(var j=1;j<=cellWidthArr.length;j++){
          var width = cellWidthArr[j-1];
          $('#'+divId+' table>thead>tr>th:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>thead>tr>th:last-child').css("width",width+1);
          $('#'+divId+' table>tbody>tr>td:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tfoot>tr>td:nth-child('+j+')').css("width",width);

          $('#societyContacts table>thead>tr>th:last-child').css("width",width-1);

        }
        $('#'+divId+' table').css("width",tableWidth);
      }
  }

  if(rowLength==0 && divId=="societyContacts"){
        $('#societyContacts table>thead>tr').css('width','100%;')
        var noDataTable=$('#societyContacts table').width();
        var colLength=noDataTable/($('#societyContacts table>thead>tr>th').length); 
        $('#societyContacts table>thead>tr>th').css("width",colLength);
        $('#societyContacts table').append("<tfoot><tr><td class='noRecords' style='text-align:left;border:none;' colspan="+ $('#societyContacts table>thead>tr>th').length+" width="+noDataTable+">No Records Found</td></tr></tfoot>");
  }
  if(divId=="revisionHistory"){
    var rowCount= $('#'+divId+' table>tbody>tr').length;  
    if($('#'+divId+' table').has('tfoot')){
        $('#'+divId+' table>tfoot').append("<tr><td class='recordsCount' style='text-align:left;border:none;'>No. of Records: "+rowCount+"</td></tr>");
    }else{
      $('#'+divId+' table').append("<tfoot><tr><td class='recordsCount' style='text-align:left;border:none;'>No. of Records: "+rowCount+"</td></tr></tfoot>");
    }
  }
  if(divId=="repConfiguration"){
    var rowCountries= $('#'+divId+' table>tbody>tr>td:nth-child(1)>div').length;  
    var rowCntryRecords= $('#'+divId+' table>tbody>tr>td:nth-child(3)>div').length; 
    if($('#repConfiguration input:checked').length==0){
      $('#'+divId+' table>tfoot>tr>td').append("<span class='recordsCount' style='float:left;margin:2px 0;'>No Reports Configured</span>");
    }else{
      $('#'+divId+' table>tfoot>tr>td>span').html('');
      $('#'+divId+' table>tfoot>tr>td').append("<span class='recordsCount' style='float:left;margin:2px 0;'>No. of Countries: "+rowCountries+" | No. of Reports: "+rowCntryRecords+"</span>");
    } 
    
  }
}

function alignGridLicenPop(divId){
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
          if(divWidth > tableWidth + tbodyTdWidth) {
            tdWidth = tbodyTdWidth;
          } else {
            tdWidth = divWidth - tableWidth;
          }

        if(i==1)
          tdWidth = 45;
        
        tableWidth += tdWidth;
        cellWidthArr.push(tdWidth);
      }

      if(tableWidth < divWidth){
        var moreWidth = (divWidth-tableWidth)/colLength;
        for(var j=1;j<=cellWidthArr.length;j++){
          var width = cellWidthArr[j-1]+moreWidth;

          $('#'+divId+' table>thead>tr>th:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tbody>tr>td:nth-child('+j+')').css("min-width",width);
          $('#'+divId+' table>tfoot>tr>td:nth-child('+j+')').css("width",width);
        }
        $('#'+divId+' table').css("width",divWidth);
        $('#'+divId+' table>tbody').css("max-width",divWidth);
      } else {
        for(var j=1;j<=cellWidthArr.length;j++){
          var width = cellWidthArr[j-1];
          $('#'+divId+' table>thead>tr>th:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tbody>tr>td:nth-child('+j+')').css("min-width",width);
          $('#'+divId+' table>tfoot>tr>td:nth-child('+j+')').css("width",width);
        }
        $('#'+divId+' table').css("width",tableWidth);
        $('#'+divId+' table>tbody').css("max-width",tableWidth);
      }
  }
}

function alignGridCountMap(divId){
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
          tdWidth = theadTdWidth-1;
        else if(tfootTdWidth >= tbodyTdWidth && tfootTdWidth >= theadTdWidth)
          tdWidth = tfootTdWidth;
        else
          if(divWidth > tableWidth + tbodyTdWidth) {
            tdWidth = tbodyTdWidth;
          } else {
            tdWidth = divWidth - tableWidth;
          }

        //if(i==1)
          //tdWidth = 63;
        
        tableWidth += tdWidth;
        cellWidthArr.push(tdWidth);
      }

      if(tableWidth < divWidth){
        var moreWidth = (divWidth-tableWidth)/colLength;
        for(var j=1;j<=cellWidthArr.length;j++){
          var width = cellWidthArr[j-1]+moreWidth;

          $('#'+divId+' table>thead>tr>th:nth-child('+j+')').css("width",width,"max-width","250px");
          $('#'+divId+' table>tbody>tr>td:nth-child('+j+')').css("width",width,"max-width","250px");
          $('#'+divId+' table>tfoot>tr>td:nth-child('+j+')').css("width",width,"max-width","250px");
        }
        $('#'+divId+' table').css("width",divWidth);
        $('#'+divId+' table>tbody').css("max-width",divWidth);
      } else {
        for(var j=1;j<=cellWidthArr.length;j++){
          var width = cellWidthArr[j-1];
          $('#'+divId+' table>thead>tr>th:nth-child('+j+')').css("width",width,"max-width","250px");
          $('#'+divId+' table>tbody>tr>td:nth-child('+j+')').css("width",width,"max-width","250px");
          $('#'+divId+' table>tfoot>tr>td:nth-child('+j+')').css("width",width,"max-width","250px");
        }
        $('#'+divId+' table').css("width",tableWidth);
        $('#'+divId+' table>tbody').css("width",tableWidth);
      }
  }else{

        $('#countryModelMapping table>thead>tr').css('width','100%;')
        var noDataTable1=$('#countryModelMapping table').width();
        var colLength1=noDataTable1/($('#countryModelMapping table>thead>tr>th').length); 
        $('#countryModelMapping table>thead>tr>th').css("width",colLength1);

  }

  if(divId=="countryModelMapping"){
    var rowCount= $('#'+divId+' table>tbody>tr').length;  
    if($('#'+divId+' table').has('tfoot')){
        $('#'+divId+' table tfoot').append("<tr><td class='recordsCount' style='text-align:left;border:none;'>No. of Records: "+rowCount+"</td></tr>");
    }else{
      $('#'+divId+' table').append("<tfoot><tr><td class='recordsCount' style='text-align:left;border:none;'>No. of Records: "+rowCount+"</td></tr><tfoot>");
    }     
  }
}

export default page;
