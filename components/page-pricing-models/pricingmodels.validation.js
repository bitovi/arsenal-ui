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


       export default pricingmodelValidation;