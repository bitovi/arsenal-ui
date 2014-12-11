import Component from 'can/component/';
import template from './template.stache!';
import styles from './page-analytics.less!';
import Licensor from 'models/common/licensor/';
import UserReq from 'utils/request/';
import Analytics from 'models/analytics/';
import stache from 'can/view/stache/';
import Comments from 'components/multiple-comments/';
import countryModelTemplate from './countryModel_template.stache!';
import revisionHistoryTemplate from './revisionHistory_template.stache!';
import Grid from 'components/grid/';
import periodCalendar from 'components/period-calendar/';
import validations from 'can/map/validations/';



var lDetails = new can.Map({
  data: null,

  init : function(){
        // validates that birthday is in the future
        this.validate("data.entityType",function(entityType){
            alert('Valid');
        })
    } 
});

var newCDetails = new can.Map({
  data: []
});

var validatePage = Component.extend({

  tag: "validatePage",
  template : "",
  scope : {

    init : function() {

        $('#entityLicensor').on('init.form.bv', function(e, data) {
                  //data.bv.disableSubmitButtons(true);

              }).on('init.field.bv', function(e, data) {


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
                    group:'.licensorName',
                      validators: {
                          notEmpty: {
                              message: 'Licensor Name is mandatory'
                          },
                          stringLength: {
                              max:50,
                              message: 'Maximum 50 characters allowed',
                              utf8Bytes: true
                          },
                          regexp: {
                              regexp: /^[a-zA-Z0-9_\- ]*$/i,
                              message: 'Please provide valid characters'
                          }
                      }
                }
              }
            });
    }

  }

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
  tag: 'page-analytics',
  template: template,

  scope: {

    tabSelected :"",
    licensors : [],
    
    licDetails : lDetails,    
    
    countries : [],
    reportTypes : [],
    
    reqCountries : [],
    reqReportTypes : [],

    valPage : validatePage,

    reqc : [],
    reqr : [],

    submitAllCountires : false,
    submitAllReports : false,

    contactDetails : [],
    newContactDetails: newCDetails,
    contactCounter: 0,
    periodFrom: [],
    periodTo : [],
    periodFromVal: "",
    periodToVal : "",

    selectedperiod:[],
    selectedEntity: "",

    selectedInvoiceDetails: "",

    status: "",

    mode : "",

    societyContactsDeleteList: [],

    newSocietyContactsDeleteList : [],

    socListToSave : [],

    invoiceDetailTypesArr: [],

    loadValidation : function() {

        can.event.on.call(this.licDetails.data, "change", function() {

            alert('Here');

        });

    },

    getReportConf : function() {

      var self = this;

      if(self.submitAllCountires == true) {

          return self.licDetails.data.reportTypes;

      } else {

          return self.reqReportTypes;
      }

    },

    getCountries : function() {

      var self = this;

      if(self.submitAllReports == true) {

          return self.licDetails.data.countries;

      } else {

          return self.reqCountries;
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

        element.contactName = this.newContactDetails.data[vName];
        element.contactEmail = this.newContactDetails.data[vEmail];
        element.id="0";

        element.licensorId = "0";

        elementArr[j++] = element;

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


    },

    populateAnalyticsPage : function(values) {

      var rows = [];

      var self = this;

      //alert('analytics');

      var commentObj = values[0].licensorDetails.commentList;
      self.editable = "";

      var countryModelObj = values[0].licensorDetails.commentList;

      rows = values[0].licensorDetails.countryModelMappings;

      /**  Entire data  **/
      
      self.licDetails.attr("data", values[0].licensorDetails);

      self.invoiceDetailTypesArr = [];

      for(var i=0; i< self.licDetails.data.invoiceDetailTypes.length; i++) {

          var element = {};

          element.id = i;
          element.value = self.licDetails.data.invoiceDetailTypes[i];

          self.invoiceDetailTypesArr.push(element);

      }
      

      self.periodToVal = self.licDetails.data.validTo;

      self.periodFromVal = self.licDetails.data.validFrom;

      if(self.licDetails.data.status == "A") {

        self.licDetails.data.status =  "Active";

      } else if (self.licDetails.data.status == "I") {

        self.licDetails.data.status =  "IN Active";

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
          }

          
          if(self.licDetails.data.revisionHistories[i].validTo == null) {
            self.licDetails.data.revisionHistories[i].validTo = "-";
            self.licDetails.data.revisionHistories[i]._data.validTo = "-";
          }

          if(self.licDetails.data.revisionHistories[i].commentText == null) {
            self.licDetails.data.revisionHistories[i].commentText = "";
            self.licDetails.data.revisionHistories[i]._data.commentText = "";
          } 
          
        }
      }

      /**  populate data in the grids  **/

      $('#multipleComments').html(stache('<multiple-comments divid="usercommentsdiv" options="{commentObj}" divheight="100" isreadOnly="n"></multiple-comments>')({commentObj}));

      /**  Country Model Mapping  **/
      if(rows != null && rows.length > 0) {
      
        $('#countryModelMapping').html(stache('<rn-grid-countrymodelmapping rows="{rows}"></rn-grid-countrymodelmapping>')({rows}));
      
      } else {


      }

      rows = self.licDetails.data.revisionHistories;

      if(rows != null && rows.length > 0) {
       
        $(".revHistCollapser").show();
        $('#revisionHistory').html(stache('<rn-grid-revisionhistory rows="{rows}"></rn-grid-revisionhistory>')({rows}));
      
      } else {

        $(".revHistCollapser").hide();
        $("rn-grid-revisionhistory").remove();

      }

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

      
      //alert('analytics');

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

    addRemoveElement: function(obj, val, addRemove) {

        for(var i=0; i<obj.length; i++) {

          var objElement = obj[i];

          if(objElement == val) {

              if(addRemove == "remove")
              {
                  obj.splice(i,1);

              }

              return false;

          } 

        }

        return true;

    },

    addRow : function() {

      var self = this;

      var element = {"name": "",  "contactName":"", "contactEmail":""};

      element.name = self.contactCounter;

      element.canvalueName = "newContactDetails.data.contactName" + self.contactCounter;
      element.canvalueEmail = "newContactDetails.data.contactEmail" + self.contactCounter;
      element.canvalue = self.contactCounter++;

      self.newContactDetails.data.push(element);

    }
    

  },

  helpers:  {

    getselectedEntity : function() {

        var entity = this.attr("selectedEntity");
        //alert(entity);

    }

  },

  events: {



    'inserted': function() {

      var self = this;

      self.scope.loadValidation();

      var genObj = {};

      Promise.all([Licensor.findAll(UserReq.formRequestDetails(genObj))]).then(function(values) {

          self.scope.licensors.replace(values[0].entities[0]);
        
      });

      $('#multipleComments').hide();

      $('.countryModelLabel').hide();

      $('.revHistCollapser').hide();

      $('#entityGrid').hide();

      $('.repConfigurationTab').hide();

      $('.societyContactsTab').hide();

      $('.buttonsBottom').hide();

    },

    '.updatePeroid focus':function(el){ 
       $(el).closest('.calendarcls').find('.box-modal').show().trigger( "focus" ); 
    },
      '{selectedperiod} change':function(val){ 
        
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

    ".applyAll click" : function(el, ev){

        var self = this;

        if(self.scope.submitAllCountires == false) {

          $.each($("input.countryBox"), function( i, l ){

            self.scope.reqCountries.push(l.getAttribute("value"));

          });
        }

        if(self.scope.submitAllReports == false) {

          $.each($("input.reportBox"), function( i, l ){

              self.scope.reqReportTypes.push(l.getAttribute("value"));

          });
        }

        $("input.selectAllChkBox").prop('checked', true);
        $("input.countryBox").prop('checked', true);
        $("input.reportBox").prop('checked', true);

        self.scope.submitAllCountires = true;
        self.scope.submitAllReports = true;

    },

    ".selectAllChkBox click" : function(el, ev){

        var self = this;

        var id = el.closest('input');

        if (el[0].checked) {
        
          $("input.countryBox").prop('checked', true);
          
          $.each($("input.countryBox"), function( i, l ){

            self.scope.reqCountries.push(l.getAttribute("value"));

          });

          self.scope.submitAllCountires = true;
        
        } else {

          $("input.countryBox").prop('checked', false);

          self.scope.reqCountries.splice(0,self.scope.reqCountries.length);

          self.scope.submitAllCountires = false;

        }

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

        var self = this;

        self.scope.reqCountries.splice(0,self.scope.reqCountries.length);
        
        self.scope.reqReportTypes.splice(0,self.scope.reqReportTypes.length);
        

        $("input.countryBox").prop('checked', false);
        $("input.reportBox").prop('checked', false);
        $("input.selectAllChkBox").prop('checked', false);

        self.scope.submitAllCountires = false;
        self.scope.submitAllReports = false;

    },

    ".countryBox click": function(el, ev){

        var self = this;

        var id = el.closest('input');

        var name = id.attr("value");

        if(!el[0].checked) {

            self.scope.addRemoveElement(self.scope.reqCountries, name, "remove");

        } else {

            var element = {};

            element.name = id.attr("value");
            
            self.scope.reqCountries.push(id.attr("value"));

            id.attr("val", "true");

        }

    },

    ".reportBox click": function(el, ev){

        var self = this;

        var id = el.closest('input');

        var name = id.attr("value");

        if(!el[0].checked) {

          self.scope.addRemoveElement(self.scope.reqReportTypes, name, "remove");

        } else {

          var element = {};

          element.name = id.attr("value");

          self.scope.reqReportTypes.push(id.attr("value"));
        }
    },

    ".addRow click": function(event){

      var self = this;

      self.scope.addRow();
  
    },

    ".removeRowBackup click": function(event){

      var self = this;

      for(var i=0;i<self.scope.societyContactsDeleteList.length; i++) {

        for(var j=0; j<self.scope.contactDetails.length; j++) {

          if( self.scope.societyContactsDeleteList[i] == self.scope.contactDetails[j].contactName) {

            self.scope.contactDetails.splice(j,1);

          }

        }

      }

      for(var i=0;i<self.scope.newSocietyContactsDeleteList.length; i++) {

        for(var j=0; j<self.scope.newContactDetails.data.length; j++) {

          if( self.scope.societyContactsDeleteList[i] == self.scope.newContactDetails.data[j].name) {

              self.scope.newContactDetails.data.splice(j,1);

          }

        }

      }

    },
    
    ".rn-grid-revisionhistory>tbody>tr td dblclick" : function(el, ev){

          var self = this;

          var id = el.closest('tr').data('row').row.id;
          var licensor = el.closest('tr').data('row').row.entity;

          var genObj = {"id" : "" , "licensorName":""};

          genObj.id = id;
          genObj.licensorName =  licensor;

          self.scope.clearContactDetails();

          self.scope.disableTabs();

          Promise.all([Analytics.findById(UserReq.formRequestDetails(genObj))]).then(function(values) {

            self.scope.populateAnalyticsPage(values);
            
          });
    },

    "#analyticsFetch click": function(event){

        var self = this;

        self.scope.mode = "fetch";
        
        //clear elements

        if(self.scope.licDetails.attr("data") != null) {

          self.scope.licDetails.attr("data", null);

        }

        self.scope.clearContactDetails();

        self.scope.disableTabs();
      
        var entityName = self.scope.attr("selectedEntity");

        var genObj = {"licensorName" : entityName};

            
        Promise.all([Analytics.findOne(UserReq.formRequestDetails(genObj))]).then(function(values) {

          self.scope.populateAnalyticsPage(values);
            
        });
    },

    "#analyticsAdd click": function(event){

        var self = this;

        self.scope.clearContactDetails();

        self.scope.licDetails.attr("data", {});

        self.scope.disableTabs();

        $("multiple-comments").remove();

        $('.buttonsBottom').show();

        $('#multipleComments').show();

        $('#multipleComments').html(stache('<multiple-comments divid="usercommentsdiv" options="{commentObj}" divheight="100" isreadOnly="n"></multiple-comments>'));

        $('#entityGrid').show();
      
        $('.societyContactsTab').show();

        $('.buttonsBottom').show();

        self.scope.addRow();

        self.scope.mode = "add";

    },


    '.submitButton click' : function() {

        var self = this;

        var societyContactDetails = self.scope.getSocietyContactDetails();

        var reportConf = {"reports":[], "countries": []};

        var reports = self.scope.getReportConf();

        var countries = self.scope.getCountries();

        for(var i=0; i<reports.length; i++) {

          reportConf.reports[i] = reports[i].toString();

        }

        for(var i=0; i<countries.length; i++) {

          reportConf.countries[i] = countries[i].toString();

        }

        var periodFrom = $("#periodFrom").val();

        var periodTo = $("#periodTo").val();

        if(self.scope.mode == 'fetch') {

          var reLicencorDetails = {};

          reLicencorDetails.id = self.scope.licDetails.data.id;
          reLicencorDetails.licensorDetails = {};
          reLicencorDetails.licensorDetails.id = self.scope.licDetails.data.id;
          reLicencorDetails.licensorDetails.commentId  = self.scope.licDetails.data.commentId;
          reLicencorDetails.licensorDetails.entityTypeId  = self.scope.licDetails.data.entityTypeId;
          reLicencorDetails.licensorDetails.paymentTerms = self.scope.licDetails.data.paymentTerms;
          reLicencorDetails.licensorDetails.repSplit = self.scope.licDetails.data.repSplit;
          reLicencorDetails.licensorDetails.uploadedFilesToSFTP = self.scope.licDetails.data.uploadedFilesToSFTP;
          reLicencorDetails.licensorDetails.contactDetails = societyContactDetails;
          reLicencorDetails.licensorDetails.licensorName = self.scope.licDetails.data.licensorName;
          reLicencorDetails.licensorDetails.licensorId = self.scope.licDetails.data.licensorId;
          reLicencorDetails.licensorDetails.createdBy = self.scope.licDetails.data.createdBy;
          reLicencorDetails.licensorDetails.validFrom = self.scope.licDetails.data.validFrom;
          reLicencorDetails.licensorDetails.validTo = self.scope.licDetails.data.validTo;
          reLicencorDetails.licensorDetails.commentTxt = self.scope.getEditableComments();
          reLicencorDetails.licensorDetails.accountName = self.scope.licDetails.data.accountName;
          reLicencorDetails.licensorDetails.invoiceDetailType = self.scope.licDetails.data.invoiceDetailType;
          reLicencorDetails.licensorDetails.prsId = self.scope.licDetails.data.prsId;
          reLicencorDetails.licensorDetails.invoiceDetailType = self.scope.licDetails.data.invoiceDetailType;
          //reLicencorDetails.licensorDetails.revisionHistories = [];
          reLicencorDetails.licensorDetails.reportConf = reportConf;
            
          reLicencorDetails.licensorDetails.sapVendorNo = self.scope.licDetails.data.sapVendorNo;
          reLicencorDetails.licensorDetails.validFrom = periodFrom;
          reLicencorDetails.licensorDetails.validTo = periodTo;
          
          reLicencorDetails.licensorId = 0;

          var genObj = reLicencorDetails;

          Promise.all([Analytics.create(UserReq.formRequestDetails(genObj))]).then(function(data) {

            if(data[0].responseText == "SUCCESS") {

                //alert("SUCCESS");

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
          reLicencorDetails.licensorDetails.licensorName = self.scope.licDetails.data.entityType;
          reLicencorDetails.licensorDetails.uploadedFilesToSFTP = self.scope.licDetails.data.uploadedFilesToSFTP;

          reLicencorDetails.licensorDetails.licensorId = "0";
          
          reLicencorDetails.licensorDetails.validFrom = self.scope.licDetails.data.validFrom;
          reLicencorDetails.licensorDetails.validTo = self.scope.licDetails.data.validTo;
          reLicencorDetails.licensorDetails.commentTxt = self.scope.getEditableComments();
          reLicencorDetails.licensorDetails.accountName = self.scope.licDetails.data.accountName;
          reLicencorDetails.licensorDetails.invoiceDetailType = self.scope.licDetails.data.invoiceDetailType;
          
          reLicencorDetails.licensorDetails.sapVendorNo = self.scope.licDetails.data.sapVendorNo;

          reLicencorDetails.licensorDetails.validFrom = periodFrom;
          reLicencorDetails.licensorDetails.validTo = periodTo;

          reLicencorDetails.licensorId = "0";

          var genObj = reLicencorDetails;

          Promise.all([Analytics.create(UserReq.formRequestDetails(genObj))]).then(function(data) {

            if(data[0].responseText == "SUCCESS") {

                var genObj = {};

                Promise.all([Licensor.findAll(UserReq.formRequestDetails(genObj))]).then(function(values) {

                  self.scope.licensors.replace(values[0].entities[0]);

      
                });

            }
          
          });
        }
        
    },

    '.deleteCheckBoxNCD click' : function(el, ev) {

      var value = el.attr("val");

      this.scope.removeRows("new", value);

    },

    '.deleteCheckBoxCD click' : function(el, ev) {

      var value = el.attr("val");

      this.scope.removeRows("exists", value);

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





export default page;
