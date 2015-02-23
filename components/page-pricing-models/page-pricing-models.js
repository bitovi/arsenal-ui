import Component from 'can/component/';
import Map from 'can/map/';

/** for pricing model*/
import view from 'can/view/';
//import stache from 'can/view/stache/';
import _ from 'lodash';
import Grid from 'components/grid/';
import stache from 'can/view/stache/';
import validation from 'can/map/validations/';
import countrylicgrid from './countrylicgrid.stache!';
import modelsgrid from './modelsgrid.stache!';

import css_bootstrapValidator from 'bootstrapValidator.css!';
import bootstrapValidator from 'bootstrapValidator';
/** for pricing model*/

import UserReq from 'utils/request/';
import template from './template.stache!';
import styles from './page-pricing-models.less!';
import Region from 'models/common/region/';
import ContentType from 'models/common/content-type/';
import Country from 'models/common/country/';
import Licensor from 'models/common/licensor/';
import PricingModels from 'models/pricing-models/';
import PricingModelsValidation from './pricingmodels.validation';

import Comments from 'components/multiple-comments/';
import Switcher from 'components/switcher/';
import commonUtils from 'utils/commonUtils';

var mandatoryAddField = ["pricingmodeltype", "modelname", "usercommentsdiv", "contentGroup[]", "baseRate[]", "minima[]", "listenerMinima[]", "discount[]", "description[]", "from[]", "to[]", "minimatrack[]"];
var mandatoryEditField = ["version", "pricingmodeltype", "modelname", "usercommentsdiv", "contentGroup[]", "baseRate[]", "minima[]", "listenerMinima[]", "discount[]", "description[]", "from[]", "to[]", "minimatrack[]"];



Grid.extend({
  tag: 'countrylic-grid',
  template: countrylicgrid,
  scope: {
    appstate:undefined,
    columns: [
      {
        id: 'country',
        title: 'Country'
      },
      {
        id: 'licensor',
        title: 'Licensor'
      },
      {
        id: 'validfrom',
        title: 'Valid From'
      },
      {
        id: 'validto',
        title: 'Valid To'
      }
    ]
  }
});


Grid.extend({
  tag: 'models-grid',
  template: modelsgrid,
  scope: {
    appstate:undefined,
    columns: [
      {
        id: 'models',
        title: 'Models'
      },
      {
        id: 'modeltype',
        title: 'Models Type'
      }

    ]
  },
  events:{
    'thead th, tfoot th click': function(el, ev) {
      var column = el.data('column').column;

      if(this.scope.attr('sortedColumn') && this.scope.attr('sortedColumn').id === column.id) {
        this.scope.attr('sortedDirection', this.scope.attr('sortedDirection') === 'asc' ? 'desc' : 'asc');
      } else if(column.sortable) {
        can.batch.start();
        this.scope.attr('sortedColumn', column);
        this.scope.attr('sortedDirection', column.defaultSortDirection || 'asc');
        can.batch.stop();
      }
    }
  }
});


Switcher.extend({
  tag: 'rn-switcher',
  events: {
    'li click': function(el, ev) {
      //console.log(el);
      var option = el.data('option');
      this.scope.attr('selectedOption', option);
      //this is not the proper fix.
      if($(el).closest('page-pricing-models').length > 0){
        $(".toggleOption").html("");
        el.html("<div class='toggleOption'>.</div>");
      }

    }
  }

});

var page = Component.extend({
  tag: 'page-pricing-models',
  template: template,
  scope: {
    baseModelParamList:new can.List(),
    appstate:undefined,
    regionStore:[],
    contentType:[],
    countryStore:[],
    licensorStore:[],
    regions:"",
    version:"",
    pricingModelList:[],
    basemodelContainer:[],
    pmVersion:[],

    trackCountMinimaList:new can.List(),
    trackContainer:[],
    modelname:"",
    pricingmodeltypeStore:[],
    pricingmodeltype:"",

    modelId:"",
    country:"",
    entity:"",
    editstate:true,
    selectedPriceModel:"",
    multipleComments : [],
    usercommentsStore:"",
    addEditUIProperty:{},
    showbottomSection:false,
    isCommentData:false,
    filterSwitchOption:"licensor",
    maxVersion:0,
    selectedModelId:"",
    modelSumRowIndex:"",
    isError:false,
    mode: "FETCH"


  },
  init:function(){
      var self = this;
      this.scope.appstate.attr("renderGlobalSearch",false);
      var genObj = {};
      var modelObj = {reqType:'modeltype'};
      Promise.all([
          Region.findAll(UserReq.formRequestDetails(genObj)),
          ContentType.findAll(UserReq.formRequestDetails(genObj)),
          Country.findAll(UserReq.formRequestDetails(genObj)),
          Licensor.findAll(UserReq.formRequestDetails(genObj)),
          PricingModels.findOne(UserReq.formRequestDetails(modelObj))
        ]).then(function(values) {
            self.scope.regionStore.replace(values[0]);
            self.scope.contentType.replace(values[1].contentTypes);
            self.scope.countryStore.replace(values[2]);
            self.scope.licensorStore.replace(values[3]["entities"][0]);
            self.scope.pricingmodeltypeStore.replace(values[4].modelTypes);


      });


  },
  events:{
  	"inserted":function(){
  		var self = this;
          $('#pmform').bootstrapValidator(PricingModelsValidation).on('error.field.bv', function(e, data) {
              $('[data-bv-icon-for="'+data.field +'"]').popover('show');
               $("#save").attr("disabled", true);
          }).on('success.field.bv', function(e, data) {
            var requireField = (self.scope.attr("editstate") == false)? mandatoryAddField:mandatoryEditField;
               $("#save").attr("disabled", false);
              for(var i= 0; i < requireField.length; i++){

                      if(!data.bv.isValidField(requireField[i])){
                      //  console.log(requireField[i]);
                       // data.bv.validateField(requireField[i]);
                         $("#save").attr("disabled", true);

                         break;
                      }
                  }
            });

            if(commonUtils.isReadOnly()=='true' || commonUtils.isReadOnlyScreen()=='R'){

              $('#bottomsection').find('input, textarea,button, select').attr('disabled','disabled');
              $("button#add").attr("disabled", true);

              }

          var options = [{
            text: '<div class="toggleOption">.</div>',
            value: 'licensor'
          },{
            text: '<div class="toggleOption"></div>',
            value: 'accural'
          }];

          var state = new can.Map({
            options: options,
            selectedThing: options[0]
          });

        $('#switcher-cont').html(stache('<rn-switcher options="{options}" selected-option="{selectedThing}"></rn-switcher>')(state));

        $("#save").attr("disabled", true);


    },
    "#fetch click":function(){
      var self = this;
       clearOldEditData(self);


       self.scope.attr("mode", "ADD")
      self.scope.addEditUIProperty.attr("country", true);
      self.scope.addEditUIProperty.attr("entity", true);

      self.scope.attr("filterSwitchOption", $(".switcher .selected").attr("data-value"));
      var filterOption = self.scope.attr("filterSwitchOption");
      var genObj = {region:self.scope.attr("regions"), filterOption:filterOption, reqType:'summary'};

        self.scope.pricingModelList.replace([]);
        self.scope.attr("editstate", true);
        PricingModels.findOne(UserReq.formRequestDetails(genObj),function(data){
                  var pricingmodels = data.pricingModels;

                   var gridData = [];
                   for(var i =0; i < pricingmodels.length; i++){

                      var tempObj = {};

                      tempObj.models = pricingmodels[i].modelDescription;
                      tempObj.modeltype = pricingmodels[i].modelName;


                      gridData.push(tempObj);
                    }

                     var rows = new can.List(gridData);
                      if(rows.length>0){
                        $('#modelsummary').html(stache('<models-grid rows="{rows}"></models-grid>')({rows}));
                      }else{
                        $('#modelsummary').html(stache('<models-grid emptyrows="{emptyrows}"></models-grid>')({emptyrows:true}));
                      }




                },function(xhr){
                /*Error condition*/
              }).then(function(){
                self.scope.attr("showbottomSection", true);
                $("models-grid table tbody tr:eq(0)").click();
                  setTimeout(function(){
                        var maxversion = $("#version option:last-child").val();
                        $("#version").val(maxversion);
                        if($.isNumeric(maxversion)){
                          $("#version").trigger('change');
                        }
                    },1500);

                setTimeout(function(){
                  addFooter('modelsummary');
                  alignGridStats('modelsummary');
                },100);

             //   handleMsg("show", "Please click on pricing model row to view/edit.");
                $('#pmform').bootstrapValidator('addField', 'version');
                $('#pmform').bootstrapValidator('addField', 'pricingmodeltype');
                $('#pmform').bootstrapValidator('addField', 'modelname');


              //  self.scope.attr('isCommentData',true);
             //   $('#multipleComments').html('<textarea class="form-control new-comments" maxlength="1024" name="usercommentsdiv" id="usercommentsdiv" style="height:100px; margin-bottom:10px; min-height:100px; max-height:100px;"></textarea>');
                //$('#pricingmodelGrid tbody tr:nth-child(1)').trigger('click').addClass("selected");
              });



            $("#pmform").data('bootstrapValidator').resetForm();
             $("#save").attr("disabled", true);
            return false;
    },
     "models-grid table tbody tr click":function(el){
        var self = this;

        $(".popover").hide();


        var colModelDesc = el.closest('tr').find('td');
        if(self.scope.attr("modelSumRowIndex") != el.closest('tr')[0].rowIndex){
          handleMsg("hide");
          clearOldEditData(self);
           setTimeout(function(){
              var maxversion = $("#version option:last-child").val();
              $("#version").val(maxversion);
              if($.isNumeric(maxversion)){
                $("#version").trigger('change');
              }

          },1500);
        }

       self.scope.attr("modelSumRowIndex", el.closest('tr')[0].rowIndex);



        var modelDescription = $(colModelDesc[0]).html();

        var modelType = $(colModelDesc[1]).html();

        self.scope.attr("modelname", modelDescription);
        self.scope.attr("pricingmodeltype", modelType);

        var filterOption = self.scope.attr("filterSwitchOption");

        var genObj = {modelDescription:modelDescription, filterOption:filterOption, reqType:'pmVersion'};

        PricingModels.findOne(UserReq.formRequestDetails(genObj),function(data){
            var pmVersionList = data.pricingModels;
             self.scope.pmVersion.replace(pmVersionList);
          var versionCollection =  _.max(pmVersionList, function(pricingmodel) { return pricingmodel.version; });
          self.scope.attr("maxVersion", versionCollection.version);

                },function(xhr){
                /*Error condition*/
          });


        self.scope.attr("selectedPriceModel", el.closest('tr')[0].rowIndex);
        var selrow = el.closest('tr').attr("version");
        var selmodelid = el.closest('tr').attr("modelid");
        el.addClass("selected").siblings().removeClass("selected");
        self.scope.attr("version", selrow);
        var genObj = {modelId:selmodelid,reqType:'details'};

        },
        /*"#usercomments change":function(){

          var pmvalid = $("#pmform").data('bootstrapValidator').isValid();

          if(!pmvalid){

            $("#save").attr("disabled", true);
          }
          else{
            $("#save").attr("disabled", false);
          }
        },*/

        "#version change":function(el){
            var self = this;

            var selectedVersion = $("#version option:selected").text();
            var maxVersion = self.scope.attr("maxVersion");

            if(selectedVersion == "Select"){
               return;
            }

            if(selectedVersion == maxVersion){
              $("#save").attr("disabled", false);
              handleMsg("hide");
            }
            else
            {
              $("#save").attr("disabled", true);
               handleMsg("show", "Only Maximum version is allowed to edit.");
            }

            var filterOption = self.scope.attr("filterSwitchOption");
            var genObj = {filterOption:filterOption, reqType:'details', modelId:self.scope.selectedModelId};

           PricingModels.findOne(UserReq.formRequestDetails(genObj),function(data){


            var tempcommentObj = "";


              var tempcommentObj = data.pricingModelDetails.comments;
              self.scope.attr("multipleComments", tempcommentObj);
             // $('#multiple-comments').html(stache('<multiple-comments divid="usercommentsdiv" options="{multipleComments}" divheight="100" isreadOnly="n"></multiple-comments>')({tempcommentObj}));
              self.scope.attr('isCommentData',true);





              /*Country Licensor Grid code to be put here*/

              var gridData = [];



              for(var i = 0; i < data.pricingModelDetails.pricingModelLicensors.length; i++){

                var tempObj = {};

                tempObj.country = data.pricingModelDetails.pricingModelLicensors[i].country;
                tempObj.licensor = data.pricingModelDetails.pricingModelLicensors[i].licensor;
                tempObj.validfrom = data.pricingModelDetails.pricingModelLicensors[i].validFrom;
                tempObj.validto = data.pricingModelDetails.pricingModelLicensors[i].validTo;

                gridData.push(tempObj);

              }

               var rows = new can.List(gridData);
                if(rows.length>0){
                  $('#country-lic-grid').html(stache('<countrylic-grid rows="{rows}"></countrylic-grid>')({rows}));
                }else{
                  $('#country-lic-grid').html(stache('<countrylic-grid emptyrows="{emptyrows}"></countrylic-grid>')({emptyrows:true}));
                }

              self.scope.attr("baseModelParamList").replace([]); /*cleaning table row to load new data on click*/
              self.scope.attr("basemodelContainer").replace(data.pricingModelDetails.baseModelParameters);


              var basemodelCount = self.scope.basemodelContainer.attr().length;
              var basemodelData = self.scope.basemodelContainer.attr();




              for(var i=0; i < basemodelCount; i++){

                  self.scope.attr("modelId", basemodelData[i].modelId);
                  self.scope.baseModelParamList.push({contentGroup:basemodelData[i].contentGroup, baseRate:basemodelData[i].baseRate,
                                                      minima:basemodelData[i].minima, listenerMinima:basemodelData[i].listenerMinima,
                                                      discount:basemodelData[i].discount, isDefault:basemodelData[i].isDefault.toString(),
                                                      baseId:basemodelData[i].baseId, modelId:basemodelData[i].modelId
                                                    });

                  var $option   = $("#baseModelTable").find('[name="contentGroup[]"], [name="baseRate[]"], [name="minima[]"], [name="listenerMinima[]"], [name="discount[]"], [name="isDefault[]"]');
                  DynamicFieldValidation($option, 'addField');

                 }

                /** Track count minima Grid*/


              self.scope.attr("trackCountMinimaList").replace([]); /*cleaning table row to load new data on click*/
               self.scope.attr("trackContainer").replace(data.pricingModelDetails.trackCounts);


                  var trackCount = self.scope.trackContainer.attr().length;
                  var trackData = self.scope.trackContainer.attr();

                  for(var i=0; i < trackCount; i++){
                        self.scope.attr("trackCountMinimaList").push({description:trackData[i].description, from:trackData[i].from,
                                                                      to:trackData[i].to, modelId:trackData[i].modelId,
                                                                      minima:trackData[i].minima, tierId:trackData[i].tierId,
                                                                      paramId:trackData[i].paramId});


                        var $option = $("#trackCount").find('[name="description[]"], [name="from[]"], [name="to[]"], [name="minimatrack[]"]');
                        DynamicFieldValidation($option, 'addField');

                        }
                    },function(xhr){
                /*Error condition*/
                }).then(function(){
                  addFooter('country-lic-grid');
                  alignGridStats('country-lic-grid');
                  //addFooter('baseModelParam');
                  //addFooter('trackCountDiv');

                  console.log(self.scope.baseModelParamList);


                  self.scope.attr("isCommentData", true);
                  $('#pmform').bootstrapValidator('addField', 'usercommentsdiv');



                 if(selectedVersion == maxVersion){

                    setTimeout(function(){ $("#pmform").data('bootstrapValidator').validate();
                     $(".popover").hide();


                    }, 1000);


                    var pmvalid = $("#pmform").data('bootstrapValidator').isValid();

                    if(!pmvalid){

                      $("#save").attr("disabled", true);
                    }
                    else{
                      $("#save").attr("disabled", false);
                    }
                  }else{
                    $("#pmform").data('bootstrapValidator').resetForm();
                  }



               });
                setTimeout(function(){
                  alignGridStats('baseModelParam');
                },100);



          },




          'shown.bs.popover':function(){
           $('.popover .arrow').removeAttr("style");

          },

        "#addbasemodel click":function(){
        var self = this;
        self.scope.baseModelParamList.push({contentGroup:"", baseRate:"",
                                                      minima:"", listenerMinima:"",
                                                      discount:"", isDefault:"",
                                                      modelId:self.scope.attr("modelId")
                                                    });

        var $option   = $("#baseModelTable").find('[name="contentGroup[]"], [name="baseRate[]"], [name="minima[]"], [name="listenerMinima[]"], [name="discount[]"], [name="isDefault[]"]');
        DynamicFieldValidation($option, 'addField');
        $("#pmform").data('bootstrapValidator').validate();
        $(".popover").hide();

      },
    "#basemodeldel click":function(el){
        var self = this;
        var selrow = el.closest('tr')[0].rowIndex;

        var $option   = $("#baseModelTable tbody tr:nth-child("+selrow+")").find('[name="contentGroup[]"], [name="baseRate[]"], [name="minima[]"], [name="listenerMinima[]"], [name="discount[]"], [name="isDefault[]"]');
        DynamicFieldValidation($option, 'removeField');
        self.scope.attr("baseModelParamList").removeAttr(selrow-1);
        $(".popover").hide();
        $("#pmform").data('bootstrapValidator').validate();
    },
    "#addtrack click":function(){
        var self = this;
        self.scope.attr("trackCountMinimaList").push({description:"", from:"",
                                                      to:"", minima:"",
                                                      modelId:self.scope.attr("modelId")});

         var $option = $("#trackCount").find('[name="description[]"], [name="from[]"], [name="to[]"], [name="minimatrack[]"]');
         DynamicFieldValidation($option, 'addField');
         $("#pmform").data('bootstrapValidator').validate();
        $(".popover").hide();

    },
    "#trackdel click":function(el){
        var self = this;
        var selrow = el.closest('tr')[0].rowIndex;
        var $option = $("#trackCount tbody tr:nth-child("+selrow+")").find('[name="description[]"], [name="from[]"], [name="to[]"], [name="minimatrack[]"]');
        DynamicFieldValidation($option, 'removeField');
        self.scope.attr("trackCountMinimaList").removeAttr(selrow-1);
        $(".popover").hide();
        $("#pmform").data('bootstrapValidator').validate();
    },
    "#regions change":function(el){

      if(el[0].value != ""){
        $("button#fetch").attr("disabled", false);

        if(commonUtils.isReadOnly()!='true' && commonUtils.isReadOnlyScreen()!='R'){
            $("button#add").attr("disabled", false);
          }

      }else{
        $("button#fetch").attr("disabled", true);
        $("button#add").attr("disabled", true);
      }
    },

    "{scope.regionStore} change":function(){
      var self = this;

      setTimeout(function(){
          $("#regions").val("Europe");
          $("button#fetch").attr("disabled", false);

          if(commonUtils.isReadOnly()!='true' && commonUtils.isReadOnlyScreen()!='R'){
          $("button#add").attr("disabled", false);
          }
          self.scope.attr("regions", "Europe");
          $("button#fetch").click();
      }, 200);
    },
    ".isdefaultClass click":function(el){

      checkIsDefault();
    },



   "#add click":function(){
        var self = this;

        self.scope.attr("mode", "ADD");
        self.scope.attr("showbottomSection", true);
        self.scope.attr("editstate", false);
       self.scope.addEditUIProperty.attr("country", false);
       self.scope.addEditUIProperty.attr("entity", false);
       self.scope.attr("entity", "");
       self.scope.attr("country", "");
       self.scope.attr("trackCountMinimaList").replace([]);
       self.scope.attr("baseModelParamList").replace([]);
       self.scope.attr("modelname", "");
       self.scope.attr("pricingmodeltype", "");
        $("#addbasemodel").trigger("click");
        $("#addtrack").trigger("click");
        $('#pricingmodelGrid tbody tr').removeClass("selected");

        $(".old-comments").remove();
        $('#pmform').bootstrapValidator('addField', 'usercommentsdiv');
       $("#pmform").data('bootstrapValidator').resetForm();
       $("#save").attr("disabled", true);
       return false;

    },
    "#addCancel click":function(){
      this.scope.attr("showbottomSection", false);
      $("#fetch").trigger("click");
    },
    "#editCancel click":function(){
       var self = this;
       clearOldEditData(self);
       $("models-grid table tbody tr").removeClass("selected");
       self.scope.pmVersion.replace([]);
    },

    "#save click":function(){
      var self = this;

      if(checkIsDefault()){
        $("#save").attr("disabled", true);
        return;
      }else{
        $("#savxe").attr("disabled", false);
      }

      if(checkTrackValue()){
        $("#save").attr("disabled", true);
        return;
      }else{
        $("#savxe").attr("disabled", false);
      }

      var usercomments = (self.scope.editstate === true)?$("#editableText").val():$("#usercomments").val();

      var saveRecord = {

        "filterOption":self.scope.attr("filterSwitchOption"),
        "details":{
         // "country":self.scope.attr("country"),
          "region":self.scope.attr("regions"),
         // "entityId":self.scope.attr("entity"),
          "trackCounts":self.scope.trackCountMinimaList.attr(),
          "createdBy":UserReq.formRequestDetails().prsId,
          "userComments":usercomments,
          "baseModelParameters":self.scope.baseModelParamList.attr(),
          "pricingModel":{
             "region":self.scope.attr("regions"),
             "modelId":(self.scope.editstate === true)?self.scope.attr("selectedModelId"):null,
            // "commentId":9685,
             "comments":null,
             "createdBy":UserReq.formRequestDetails().prsId,
             "modelDescription":self.scope.attr("modelname"),
             "modelName":self.scope.attr("pricingmodeltype"),
             "version": (self.scope.editstate === true)?$("#version option:selected").text():1
          }

        }
      }

      console.log(JSON.stringify(saveRecord));

      if( self.scope.attr("mode") == "ADD") {

          PricingModels.add(UserReq.formRequestDetails(saveRecord), function(data){
                  if(data["status"]=="SUCCESS"){
                              var msg = data["responseText"];
                              // $("#pbmessageDiv").html("<label class='successMessage'>"+msg+"</label>")
                              // $("#pbmessageDiv").css("display", "block");

                              //    setTimeout(function(){
                              //       $("#pbmessageDiv").hide();
                              //    },5000);
                                commonUtils.displayUIMessage(data["status"], msg);

                                 var selModel = self.scope.attr("modelSumRowIndex");
                                $("models-grid table tbody tr").eq(selModel-1).click();

                                setTimeout(function(){
                                    $("#version option:last-child").attr('selected', 'selected');
                                 },1000);

                                  if(self.scope.editstate == false){
                                    clearOldEditData(self);
                                  }

                                  if(!self.scope.editstate){
                                    $("#addbasemodel").trigger("click");
                                    $("#addtrack").trigger("click");
                                  }

                              }
                            else
                            {
                                var msg = data["responseText"];
                                // $("#pbmessageDiv").html("<label class='errorMessage'>"+msg+"</label>");
                                // $("#pbmessageDiv").show();
                                // setTimeout(function(){
                                //     $("#pbmessageDiv").hide();
                                //  },5000);
                                commonUtils.displayUIMessage(data["status"], msg);
                            }
                },function(xhr){
                /*Error condition*/
              });

      } else {

        PricingModels.create(UserReq.formRequestDetails(saveRecord), function(data){
                  if(data["status"]=="SUCCESS"){
                              var msg = data["responseText"];
                              // $("#pbmessageDiv").html("<label class='successMessage'>"+msg+"</label>")
                              // $("#pbmessageDiv").css("display", "block");

                              //    setTimeout(function(){
                              //       $("#pbmessageDiv").hide();
                              //    },5000);
                                commonUtils.displayUIMessage(data["status"], msg);

                                 var selModel = self.scope.attr("modelSumRowIndex");
                                $("models-grid table tbody tr").eq(selModel-1).click();

                                setTimeout(function(){
                                    $("#version option:last-child").attr('selected', 'selected');
                                 },1000);

                                  if(self.scope.editstate == false){
                                    clearOldEditData(self);
                                  }

                                  if(!self.scope.editstate){
                                    $("#addbasemodel").trigger("click");
                                    $("#addtrack").trigger("click");
                                  }

                              }
                            else
                            {
                                var msg = data["responseText"];
                                // $("#pbmessageDiv").html("<label class='errorMessage'>"+msg+"</label>");
                                // $("#pbmessageDiv").show();
                                // setTimeout(function(){
                                //     $("#pbmessageDiv").hide();
                                //  },5000);
                                commonUtils.displayUIMessage(data["status"], msg);
                            }
                },function(xhr){
                /*Error condition*/
              });
            }
          }
    },
    helpers:{
              setHeight: function(){
                      var vph = $(window).height();
                      return 'Style="height:'+vph+'px"';
                  }
  }

});


function DynamicFieldValidation($option, type){
     $option.each(function(index){
            $('#pmform').bootstrapValidator(type, $(this));
            //console.log($(this));
      });
}

function handleMsg(state, msg){
    if(state == "show")
    {
       var msg = msg;
       // $("#pbmessageDiv").html("<label class='errorMessage'>"+msg+"</label>");
       // $("#pbmessageDiv").show();
       //  setTimeout(function(){
       //    $("#pbmessageDiv").hide();
       // },3000);
       commonUtils.displayUIMessage("ERROR", msg);
    }
    else
    {
      $("#pbmessageDiv").hide();
    }
}

function clearOldEditData(componentstate){
     var self = componentstate;
     self.scope.attr("trackCountMinimaList").replace([]);
     self.scope.attr("baseModelParamList").replace([]);
     self.scope.attr("modelname", "");
     self.scope.attr("pricingmodeltype", "");
     self.scope.pmVersion.replace([]);
     $('#country-lic-grid').html(stache('<countrylic-grid emptyrows="{emptyrows}"></countrylic-grid>')({}));

    self.scope.attr("isCommentData", false);
    $("#usercomments").val("");
    $("#save").attr("disabled", true);
}

function checkIsDefault() {

//var self= scopeState;
var isError = false;

  var _checked = $('input[id^="isDefault-"]');
  //var _checkedlength = _checked.length; console.log(_checkedlength);

  var _selectedCheckBoxes = [];
  for (var i = 0; i < _checked.length; i++) {
    var currentID = $(_checked)[i].id;
    if($("#" + currentID).prop("checked")){
      _selectedCheckBoxes.push(currentID);
    }
  }

  if(_selectedCheckBoxes.length > 1){
    //$("#save").attr("disabled", true);
    isError=true;
    handleMsg("show", "Only one base model parameter can be marked as default.");
  }else if(_selectedCheckBoxes.length == 0){
    //$("#save").attr("disabled", true);
    isError=true;
    handleMsg("show","There is no default base model parameter checked.");
  }else{
    //$("#save").attr("disabled", false);
    isError=false;
    handleMsg("hide");
  }

  return isError;

}

function hasDuplicates(a) {
  return _.uniq(a, 'value').length !== a.length; 
}

function checkTrackValue(){

  var isError = false;

  var _listofFrom = $("input[id^='from-']").not(':hidden');

  var _listofTo = $("input[id^='to-']").not(':hidden');

  var multipleNull = 0; 

  var duplicateToValue = [];

  var duplicateFromValue = 0;

  if(_listofFrom.length > 1 && _listofTo.length > 1){

    handleMsg("hide");

    if(hasDuplicates(_listofFrom)){
        isError=true;
        handleMsg("show", "Multiple From Fields cannot have the same value or null value");
        return isError;
    }

    if(hasDuplicates(_listofTo)){
        isError=true;
        handleMsg("show", "Multiple To Fields cannot have the same value or null value");
        return isError;
    }

    for(var i = 1; i < _listofFrom.length; i++){

      if( parseInt($(_listofFrom[i]).val()) === (parseInt($(_listofTo[i-1]).val()) + 1) ){
        isError = false;        
      }else{
        isError = true;
        handleMsg("show", "Partition does not continue after previous one/ Not all Tiers contains edge values");
        return isError;
      }

    }
  }
  return isError;
}

function addFooter(divId){
    var rowCount= $('#'+divId+' table>tbody>tr').length;
    var colspanFoot=$('#'+divId+' table>thead>tr>th').length;
    if($('#'+divId+' table tfoot').length==1){
      if(rowCount==0){
        $('#'+divId+' table tfoot').append("<tr><td style='text-align:center;background:#fff;color:#000;border-radius:0px;' colspan="+colspanFoot+">No Records Found</td></tr><tr><td class='recordsCount' style='text-align:left;border:none;' colspan="+colspanFoot+">Number of records: "+rowCount+"</td></tr>");
      }else /*if($('#'+divId+' table>tbody>tr>td').hasClass("noDataFoot")==false)*/{
        $('#'+divId+' table tfoot').append("<tr><td class='recordsCount' style='text-align:left;border:none;' colspan="+colspanFoot+">Number of records: "+rowCount+"</td></tr>");
      }
    }else{
      if(rowCount==0){
        $('#'+divId+' table').append("<tfoot><tr><td style='text-align:center;background:#fff;color:#000;border-radius:0px;' colspan="+colspanFoot+">No Records Found</td></tr><tr><td class='recordsCount' style='text-align:left;border:none;' colspan="+colspanFoot+">Number of records: "+rowCount+"</td></tr><tfoot>");
      }else /*if($('#'+divId+' table>tbody>tr>td').hasClass("noDataFoot")==false)*/{
        $('#'+divId+' table').append("<tfoot><tr><td class='recordsCount' style='text-align:left;border:none;' colspan="+colspanFoot+">Number of records: "+rowCount+"</td></tr><tfoot>");
      }
    }
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
        else if(tfootTdWidth >= tbodyTdWidth && tfootTdWidth >= theadTdWidth && divId != "modelsummary" && divId != "country-lic-grid")
          tdWidth = tfootTdWidth;
        else
          tdWidth = tbodyTdWidth;

        if(i==1 && divId== 'baseModelParam')
          tdWidth = 100;
        if((i==2 || i==3 || i==4 || i==5) && divId== 'baseModelParam')
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

    if(rowLength == 0 && (divId == 'modelsummary' || divId == 'country-lic-grid')){
      $('#'+divId+' table>thead>tr').css('width','100%;')
        var noDataTable1=$('#'+divId+' table').width();
        var colLength1=noDataTable1/($('#'+divId+' table>thead>tr>th').length);
        $('#'+divId+' table>thead>tr>th').css("width",colLength1);
    }
  }






export default page;
