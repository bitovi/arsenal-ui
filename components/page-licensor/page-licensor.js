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

    bootstrapValidParams : ["licensorName", "accountName", "invoiceType", "sapVendor"],

    
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
      
      self.editable = "";

      var countryModelObj = values[0].licensorDetails.commentList;

      rows = values[0].licensorDetails.countryModelMappings;

      /**  Entire data  **/
      
      self.licDetails.attr("data", values[0].licensorDetails);



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
          }

          
          if(self.licDetails.data.revisionHistories[i].validTo == null) {
            self.licDetails.data.revisionHistories[i].validTo = "";
            self.licDetails.data.revisionHistories[i]._data.validTo = "";
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

      $('.status').show();

      $('.uploadedFTP').show();

      $('.paymentTerms').show();


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

    reValidateFiledsonLoad : function() {

      for(var i=0; i< this.bootstrapValidParams.length; i++) {

        $("#entityLicensorBottom").data("bootstrapValidator").revalidateField(this.bootstrapValidParams[i]);

      }

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
                      regexp: /^[a-zA-Z0-9_\- ]*@[a-zA-Z0-9_\- ]*.[a-zA-Z0-9_\- ]*$/i,
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
        
          $('*[data-bv-icon-for="'+data.field +'"]').popover('show');

          setTimeout(function(){
            $('*[data-bv-icon-for="'+data.field +'"]').popover('hide');
          },1000);

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
                      message: 'Entity is mandatory'
                  },
                  regexp: {
                      regexp: /^[a-zA-Z0-9_\- ]*$/i,
                      message: 'Please provide valid characters'
                  },
                  callback: {
                      message: 'Entity is mandatory',
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

      var defaultEntity = [];

      Promise.all([Licensor.findAll(UserReq.formRequestDetails(genObj))]).then(function(values) {

          self.scope.licensors.replace(values[0].entities[0]);

          defaultEntity = values[0].entities[0].entities[0];

          var genObj = {"id" : "" , "licensorName":""};

          genObj.id = defaultEntity.id;
          genObj.licensorName =  defaultEntity.value;

          self.scope.attr("selectedEntity", genObj.licensorName);

          Promise.all([Analytics.findOne(UserReq.formRequestDetails(genObj))]).then(function(values) {

            self.scope.populateAnalyticsPage(values, "");
            
          });

      });

 
      Promise.all([Analytics.getInvoiceDetails(UserReq.formRequestDetails(genObj))]).then(function(values) {

          self.scope.invoiceTypeList.replace(values[0].invoiceDetailTypes);
          self.scope.populateInvoiceTypes();
          
      });
     
      self.scope.loadBootStrapPlugin();


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

    
    ".rn-grid-revisionhistory>tbody>tr td dblclick" : function(el, ev){

          var self = this;

          var id = el.closest('tr').data('row').row.id;
          var licensor = el.closest('tr').data('row').row.entity;

          var genObj = {"id" : "" , "licensorName":""};

          genObj.id = id;
          genObj.licensorName =  licensor;

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

        var self = this;

        self.scope.mode = "fetch";
        
        //clear elements

        $("#loading_img").show();

        var entityName = self.scope.attr("selectedEntity");

        $('#entityLicensorTop').bootstrapValidator('validate');

        if($('#entityLicensorTop').data('bootstrapValidator').isValid() == false) {

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

          self.scope.populateAnalyticsPage(values);

          $("#loading_img").hide();

          self.scope.reValidateFiledsonLoad();

          //$('#entityLicensorBottom').bootstrapValidator('validate');
            
        });
    },

    "#analyticsAdd click": function(event){

        var self = this;

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

        self.scope.addRow();

        self.scope.mode = "add";

        $("#invoiceType").val("Select");

        self.scope.reValidateFiledsonLoad();
    },


    '.submitButton click' : function() {

        var self = this;

        $('#entityLicensorBottom').bootstrapValidator('validate');

        if($('#entityLicensorBottom').data('bootstrapValidator').isValid() == false) {

          return;

        }

        var societyContactDetails = self.scope.getSocietyContactDetails();

        var reportConf = {"reports":[], "countries": []};

        var reports = self.scope.getReportConf();

        var countries = self.scope.getCountries();


        if(reports.length == 0 && countries.length != 0) {

            self.scope.attr("repConfMessage", "Select both Countries and Reports!");

            $(".reportConfErr").show();

            return;

        } else if(countries.length == 0 && reports.length != 0) {

            self.scope.attr("repConfMessage", "Select both Countries and Reports!");

            $(".reportConfErr").show();

            return;

        }
      

        var comments = self.scope.getEditableComments();

        var invoiceType = self.scope.invoiceType;

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

        for(var i=0; i<reports.length; i++) {

          reportConf.reports[i] = reports[i].toString();

        }

        for(var i=0; i<countries.length; i++) {

          reportConf.countries[i] = countries[i].toString();

        }

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
          reLicencorDetails.licensorDetails.commentTxt = comments;
          reLicencorDetails.licensorDetails.accountName = self.scope.licDetails.data.accountName;
          reLicencorDetails.licensorDetails.invoiceDetailType = self.scope.licDetails.data.invoiceDetailType;
          reLicencorDetails.licensorDetails.prsId = self.scope.licDetails.data.prsId;
          reLicencorDetails.licensorDetails.invoiceDetailType = invoiceType;
          //reLicencorDetails.licensorDetails.revisionHistories = [];
          reLicencorDetails.licensorDetails.reportConf = reportConf;
            
          reLicencorDetails.licensorDetails.sapVendorNo = self.scope.licDetails.data.sapVendorNo;
          reLicencorDetails.licensorDetails.validFrom = periodFrom;
          reLicencorDetails.licensorDetails.validTo = periodTo;
          
          reLicencorDetails.licensorId = 0;

          var genObj = reLicencorDetails;

          Promise.all([Analytics.create(UserReq.formRequestDetails(genObj))]).then(function(data) {



            if(data[0].responseText == "SUCCESS") {

                var msg = "Entity Detials saved successfully";

                $("#invmessageDiv").html("<label class='successMessage'>"+msg+"</label>");
                $("#invmessageDiv").show();
                setTimeout(function(){
                  $("#invmessageDiv").hide();
                },5000);
            } else {

                var msg = "Entity Detials was not saved successfully";
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
          reLicencorDetails.licensorDetails.licensorName = self.scope.licDetails.data.licensorName;
          reLicencorDetails.licensorDetails.uploadedFilesToSFTP = self.scope.licDetails.data.uploadedFilesToSFTP;

          reLicencorDetails.licensorDetails.licensorId = "0";
          
          reLicencorDetails.licensorDetails.commentTxt = comments;
          reLicencorDetails.licensorDetails.accountName = self.scope.licDetails.data.accountName;
          reLicencorDetails.licensorDetails.invoiceDetailType = invoiceType;
          
          reLicencorDetails.licensorDetails.sapVendorNo = self.scope.licDetails.data.sapVendorNo;

          reLicencorDetails.licensorDetails.validFrom = periodFrom;
          reLicencorDetails.licensorDetails.validTo = periodTo;

          reLicencorDetails.licensorId = "0";

          var genObj = reLicencorDetails;

          Promise.all([Analytics.create(UserReq.formRequestDetails(genObj))]).then(function(data) {

            if(data[0].responseText == "SUCCESS") {

                var genObj = {};

                var msg = "Entity Detials added successfully";

                $("#invmessageDiv").html("<label class='successMessage'>"+msg+"</label>");
                $("#invmessageDiv").show();
                setTimeout(function(){
                  $("#invmessageDiv").hide();
                },5000);

                Promise.all([Licensor.findAll(UserReq.formRequestDetails(genObj))]).then(function(values) {

                  self.scope.licensors.replace(values[0].entities[0]);

      
                });

            } else {

                var msg = "Entity Detials was not added successfully";
                $("#invmessageDiv").html("<label class='errorMessage'>"+msg+"</label>");
                $("#invmessageDiv").show();
                setTimeout(function(){
                  $("#invmessageDiv").hide();
                },5000);

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

      $('#entityLicensorTop').bootstrapValidator('validate');

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


export default page;
