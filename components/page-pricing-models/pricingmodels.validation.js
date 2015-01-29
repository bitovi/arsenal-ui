var pricingmodelValidation = {
              container: 'popover',
              feedbackIcons: {
                  valid: 'valid-rnotes',
                  invalid: 'alert-rnotes',
                  validating: 'glyphicon glyphicon-refreshas'
              },
              fields: {
                  regions: {
                      group:'.regions',
                      validators: {
                          notEmpty: {
                              message: 'Region is mandatory'
                          }
                          
                      }
                },
                version: {
                     validators: {
                          notEmpty: {
                              message: 'Version is mandatory'
                          }
                          
                      }
                },
                country :{
                   validators: {
                        notEmpty: {
                            message: 'country is mandatory'
                        }
                        
                    }
                },
                entity :{
                    validators: {
                        notEmpty: {
                            message: 'Entity is mandatory'
                        }
                        
                    }
                },
                pricingmodeltype :{
                    validators: {
                        notEmpty: {
                            message: 'Pricing Model is mandatory'
                        }
                        
                    }
                },
                modelname :{
                    validators: {
                        notEmpty: {
                            message: 'Model name is mandatory'
                        }
                        
                    }
                },
                usercommentsdiv :{
                    group:'multiple-comments',
                    validators: {
                        notEmpty: {
                            message: 'Comment is mandatory'
                        }
                        
                    }
                },
               'contentGroup[]': {
                     group:'.contentGroup',
                     validators: {
                        callback: {
                                //message: 'Content Group is mandatory',
                                callback: function (value, validator, $field) {
                                   if(value == "" || value == "Select" || value == null){
                                       return {
                                          valid: false,
                                          message: 'Content Group is mandatory.'
                                      }

                                  } else if(value !== "Select"){
                                      
                                      if(!checkContentGroup($field)){
                                        return {
                                            valid: false,
                                            message: 'There cannot be multiple entries for the same content group.'
                                          }
                                      }
                                  }
                                  return true;
                                }
                        }
                    }
                  },
                'isDefault[]': {
                  group:'.isDefaultGroup',
                  validators: {
                      
                      callback: {
                                //message: 'Content Group is mandatory',
                          /*      callback: function (value, validator, $field) {
                                  
                                  //Validation is not popping up
                                  
                                  var isDefaultValue = checkIsDefault($field);

                                    if (isDefaultValue > 1) {
                                      return {
                                            valid: false,
                                            message: 'Only one base model parameter can be marked as default.'
                                          }
                                    }
                                 
                                  return true;
                                }
                          */
                        }
                  }
                },
                'baseRate[]': {
                      group:'.baseRate',
                      validators: {
                          notEmpty: {
                              message: 'Baserate is mandatory'
                          },
                          numeric: {
                            separator:'.',
                            message: 'Please provide numeric value for baserate'
                          }
                      }
                  },
                'minima[]': {
                      group:'.minima',
                      validators: {
                          notEmpty: {
                              message: 'Minima is mandatory'
                          },
                          numeric: {
                            separator:'.',
                            message: 'Please provide numeric value for minima'
                          }
                      }
                  },
                'listenerMinima[]': {
                      group:'.listenerMinima',
                      validators: {
                          notEmpty: {
                              message: 'Listener Hours Minima is mandatory'
                          },
                          numeric: {
                            separator:'.',
                            message: 'Please provide numeric value for Listener Hours Minima'
                          }
                      }
                  },
                  'discount[]': {
                      group:'.discount',
                      validators: {
                          notEmpty: {
                              message: 'Discount is mandatory'
                          },
                          numeric: {
                            separator:'.',
                            message: 'Please provide numeric value for Discount'
                          }
                      }
                  },
                  'description[]': {
                      group:'.description',
                      validators: {
                          notEmpty: {
                              message: 'Description is mandatory'
                          }
                          
                      }
                  },
                  'from[]': {
                      group:'.from',
                      validators: {
                          notEmpty: {
                              message: 'From is mandatory'
                          },
                          numeric: {
                            separator:'.',
                            message: 'Please provide numeric value for From'
                          },
                          callback: {
                                message: 'From value should be less than to value.',
                                callback: function (value, validator, $field) {
                                  
                                  var toID = $field.attr('id').split("from-").join("");                             
                                  var toValue = $("#to-"+toID).val();

                                  //From value is greater than to value throw message;
                                  if(parseInt(value) > parseInt(toValue)){
                                    return false;
                                  }
                                  return true;
                                }
                        }

                      }
                  },
                  'to[]': {
                      group:'.to',
                      validators: {
                          notEmpty: {
                              message: 'To is mandatory'
                          },
                          numeric: {
                            separator:'.',
                            message: 'Please provide numeric value for To'
                          },
                          callback: {
                               // message: 'To value should be greater than From value.',
                                callback: function (value, validator, $field) {
                                  
                                  var fromID = $field.attr('id').split("to-").join("");                             
                                  var fromValue = $("#from-"+fromID).val();

                                  //To value is greater than from value throw message;
                                  if(parseInt(fromValue) > parseInt(value)){
                                     return {
                                      valid: false,
                                      message: 'To value should be greater than From value.'
                                    }
                                  }
                                  
                                  //value is changed! revalidate from field to
                                  if($("#from-"+fromID).parent().hasClass('has-error')){
                                    $('#pmform').bootstrapValidator('revalidateField', $("#from-"+fromID));
                                  }
                                                                    
                                  return true;
                                }
                        }
                      }
                  },
                  'minimatrack[]': {
                      group:'.minimatrack',
                      validators: {
                          notEmpty: {
                              message: 'Minima is mandatory'
                          },
                          numeric: {
                            separator:'.',
                            message: 'Please provide numeric value for Minima'
                          }
                      }
                  }
            }
       }


      function checkContentGroup(element) {

        var currentElementID = $(element).attr("id");
      
        var _listofselect = ($("select[id^='contentGroup']:not(#" + currentElementID + ") option:selected").text()),
          selectedtext = $("#" + currentElementID + " option:selected").text();

        _listofselect = _listofselect.replace(/\s+/g, " ");
        selectedtext = selectedtext.replace(/\s+/g, "");

        if (_listofselect.indexOf(selectedtext) !== -1) {
          console.log("Available");          
          return false;
        } 
        
        return true;
      }

      function checkIsDefault(element) {

        var _checked = $('input[id^="isDefault-"]');
        
        var _selectedCheckBoxes = [];
        for (var i = 0; i < _checked.length; i++) {
          var currentID = $(_checked)[i].id;
          if ($("#" + currentID).prop("checked")) {
            _selectedCheckBoxes.push(currentID);
          }
        }
       return _selectedCheckBoxes.length;
      }

       export default pricingmodelValidation;