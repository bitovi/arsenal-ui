import Component from 'can/component/';

import AllInvoices from 'models/allInvoices/';

import datatables from 'datatables';
import css_datatables from 'datatables.css!';
import treetables from 'treetables';
import css_treetables from 'treetables.css!';
import css_treetables_theme from 'treetables_theme.css!';

import moment from 'moment';


import template from './template.stache!';
import styles from './data-tables.less!';

var dataTableObj;
var dataTables = Component.extend({
    tag: 'data-grid',
    template: template,
    scope: {
     name: "@",
     type: "@",
     columnText: "@",
     next: [],
     invoicesMap:[],
     searchFlag: [],
     tokenInput: [],
     refreshTokenInput: function(val, type){
     	//console.log("val is "+JSON.stringify(val));
     	var self = this;
     	var prev = self.attr('refreshCount');
      	
      	if(type=="Add")
      		self.attr('tokenInput').push(val);
      	else if(type=="Delete"){
      		this.attr('tokenInput').each(function(value, key) {
      			if(val.id == value.id)
      				self.attr('tokenInput').splice(value,1);
      		});
      	}
      	//console.log(type+"&&"+JSON.stringify(this.attr('tokenInput')));
     }
    },
    init: function() {
    	var self = this;   

    	if(self.scope.type=="getAllInvoices"){
	    	Promise.all([
		     	//AllInvoices.findAll({region: 2})
		     	AllInvoices.findAll()
		    ]).then(function(values) {
		    	//console.log(JSON.stringify(values[0][1]));
		    	if(values[0][0]["responseHeader"]["errorCode"]=="0000")
		     		self.scope.invoicesMap.replace(values[0][1]);
		    });
		}
	},
    events: {
        "inserted": function(){
           
        },
        "{tokenInput} change": function(){
        	var self= this;
        	Promise.all([
        			/* While search,  Token parameter has to be sent with page data */
	        		/* tokenInput holds that search token info */
			     	//AllInvoices.findAll({searchParam: tokenInput}) 
			     	AllInvoices.findAll()
		    ]).then(function(values) {
		    	if(values[0][0]["responseHeader"]["errorCode"]=="0000"){
		    		self.scope.searchFlag.replace("Yes");
		     		self.scope.invoicesMap.replace(values[0][1]);
		     	}
		     	
		    });
        },
        "{invoicesMap} change": function() {
        	//console.log("Grid Columns are "+JSON.stringify(this.scope.attr().columnText));
        	//console.log("invoices data is "+JSON.stringify(this.scope.attr().invoicesMap));
        	var gridData={"data":[],"coulmnText":"","columnDef":""};
        	
        	var invoiceData = this.scope.attr().invoicesMap[0].invoice;
        	gridData["coulmnText"] = [
							            { "sTitle": "", "mData": "id" },
							            { "sTitle": "Entity", "mData": "entity" },
							            { "sTitle": "Invoice Type", "mData": "invoiceType" },
							            { "sTitle": "Content Type", "mData": "contentType" },
							            { "sTitle": "Country", "mData": "country" },
							            { "sTitle": "Invoice No", "mData": "invoiceNum"},
							            { "sTitle": "Invoice Amount", "mData": "invoiceAmt"},
							            { "sTitle": "Due date", "mData": "dueDate"},
							            { "sTitle": "Currency",  "mData": "currency"},
							            { "sTitle": "Status",  "mData": "status"},
							            { "sTitle": "Payment Bundle Name",  "mData": "bundleName"},
							            { "sTitle": "User comments",  "mData": "comments"}
							          ];
			gridData["columnDef"] = [
					                  { "sClass": "align-right", "aTargets": [ 5 ] },
					                  { "sClass": "align-right", "aTargets": [ 6 ] }
					         		];

        	
        	for(var i=0;i<invoiceData.length;i++){
        		var invTemp = {};
        		invTemp["id"] = invoiceData[i]["id"];
        		invTemp["parentId"] = "";
        		invTemp["entity"] = invoiceData[i]["entityName"];
        		invTemp["invoiceType"] = invoiceData[i]["invoiceTypeName"];
        		invTemp["contentType"] = "";
        		invTemp["country"] = "";
        		invTemp["invoiceNum"] = invoiceData[i]["invoiceNumber"];
        		invTemp["invoiceAmt"] = invoiceData[i]["invoiceAmount"];
        		invTemp["dueDate"] = invoiceData[i]["invoiceDueDate"];
        		invTemp["currency"] = invoiceData[i]["invoiceCcy"];
        		invTemp["status"] = invoiceData[i]["status"];
        		invTemp["bundleName"] = invoiceData[i]["bundleName"];
        		invTemp["comments"] = invoiceData[i]["comments"][0]["comments"];
        		gridData.data.push(invTemp);
        		var insertedId = gridData.data.length-1;

        		var invoiceLineItems = invoiceData[i]["invoiceLines"];
        		var contentTypeArr = [], countryArr = [];
        		if(invoiceLineItems.length > 0){
        			for(var j=0;j<invoiceLineItems.length;j++){
        				var invLITemp={};
        				invLITemp["id"] = invTemp["id"]+"LI"+j;
		        		invLITemp["parentId"] = invTemp["id"];
		        		invLITemp["entity"] = "";
		        		invLITemp["invoiceType"] = "";
		        		invLITemp["contentType"] = invoiceLineItems[j]["contentType"];
		        		invLITemp["country"] = invoiceLineItems[j]["countryName"];
		        		invLITemp["invoiceNum"] = "";
		        		invLITemp["invoiceAmt"] = invoiceLineItems[j]["lineAmount"];
		        		invLITemp["dueDate"] = "";
		        		invLITemp["currency"] = invoiceLineItems[j]["invoiceCcy"];
		        		invLITemp["status"] = "";
		        		invLITemp["bundleName"] = "";
		        		invLITemp["comments"] = "";
		        		contentTypeArr.push(invLITemp["contentType"]);
		        		countryArr.push(invLITemp["country"]);
        				gridData.data.push(invLITemp);
        			}

        		}

        		/*Below function is to remove the duplicate content type and find the count */
        		contentTypeArr = contentTypeArr.filter( function( item, index, inputArray ) {
			           return inputArray.indexOf(item) == index;
			    });
        		if(contentTypeArr.length>1){
        			gridData.data[insertedId]["contentType"] = contentTypeArr.length+" types of Content";
        		}
        		else if(contentTypeArr.length==1)
        			gridData.data[insertedId]["contentType"] = contentTypeArr[0];

        		/*Below function is to remove the duplicate country and find the count */
        		countryArr = countryArr.filter( function( item, index, inputArray ) {
				    return inputArray.indexOf(item) == index;
				});
        		if(countryArr.length>1){
        			gridData.data[insertedId]["country"] = countryArr.length+ " Countries";
        		}
        		else if(countryArr.length==1)
        			gridData.data[insertedId]["country"] = countryArr[0];

        	}
        	//console.log("invoices data is "+JSON.stringify(gridData));

        	var datasrc = gridData.data;
        	var columnDef = gridData.columnDef;
            var columnNames = gridData.coulmnText;
            var tableId = this.scope.attr().name;

            if(this.scope.attr().next == "" && this.scope.attr().searchFlag==""){
	        	dataTableObj = $('#'+tableId).dataTable({
	                data: datasrc,
	                searching: false,
	                paging: false,
	                scrollY: "300px",
	                scrollCollapse: true,
	                sort: false,
	                bInfo: false,
	                aoColumnDefs: columnDef,
	                aoColumns: columnNames,
	                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
	                                        
	                    if(aData.parentId!=""){
	                        $(nRow).attr('data-tt-id',aData.id);
	                        $(nRow).attr('data-tt-parent-id',aData.parentId);
	                       
	                    }else {
	                        $(nRow).attr('data-tt-id',aData.id);
	                        $(nRow).addClass("country");
	                       
	                    }
	                },
	                "fnCreatedRow": function( nRow, aData, iDataIndex ) {
	                	if(aData.parentId=="")
	                	 	$('td:eq(0)', nRow).html( '<input type="checkbox" id="check'+aData.id+'" value="'+aData.id+'" class="css-checkbox"/><label for="check'+aData.id+'" class="css-label css-label_blue"></label>' );
						else 
							$('td:eq(0)', nRow).html("");
	                },
	                fnFooterCallback: function (nRow, aData, iStart, iEnd, iDisplay ) {
                        /*console.log("row: "+nRow);
                        console.log("Start: "+iStart);
                        console.log("end: "+iEnd);*/
                        //console.log("All rec: "+JSON.stringify(aData));
                        //console.log("All rec1: "+aData.length);

                        
                        var api = this.api(),data, total=0;
                        var intVal = function ( i ) {
                                return typeof i === 'string' ?
                                    i.replace(/[\$,]/g, '')*1 :
                                    typeof i === 'number' ?
                                        i : 0;
                            };
                        if(aData.length!=0){
                            var aDataLen = aData.length;
                            for(var i=0;i<aDataLen;i++){
                                var rec = aData[i];
                                if(aData[i].parentId==""){
                                    total += intVal(aData[i].invoiceAmt);
                                }
                            }   
                 
                            // Update footer
                            $( api.column( 6 ).footer() ).html(
                                total
                            );
                        }
                    }
	            });

	            $("#"+tableId).treetable({ 
	                 expandable: true,
	                 column: 1
	             });
        	} else if(this.scope.attr().searchFlag=="Yes"){
        		//console.log("New invoices are "+JSON.stringify(gridData));
        		dataTableObj.fnClearTable();
        		dataTableObj.fnAddData(datasrc);
        		$("#"+tableId).treetable("destroy");
        		$("#"+tableId).treetable({ 
	                 expandable: true,
	                 column: 1
	             });
        	} else {
        		//console.log("New invoices are "+JSON.stringify(gridData));
        		dataTableObj.fnClearTable();
        		dataTableObj.fnAddData(datasrc);
        		$("#"+tableId).treetable("destroy");
        		$("#"+tableId).treetable({ 
	                 expandable: true,
	                 column: 1
	             });
        	}
        },
        ".dataTables_scrollBody scroll": function(){
        	//alert(JSON.stringify(this.scope.attr().next));
        	
        	var self = this;
        	var nextVal;
        	var oScrollBody = $(".dataTables_scrollBody");      
	        var scrollTop = oScrollBody.scrollTop();
	        var innerHeight = oScrollBody.innerHeight();
	        var scrollHeight = oScrollBody[0].scrollHeight;
	        var divHeight = oScrollBody.height();

	        var gridTableElemObj = $(".dataTables_scrollBody table");
	        var tableHeight =gridTableElemObj.height();
	        
	        //console.log(scrollTop+","+innerHeight+","+scrollHeight+","+divHeight+","+tableHeight);
        	if(((scrollTop + innerHeight)>=scrollHeight) && (tableHeight >= scrollHeight)){
	        	if(self.scope.attr().next == "")
	        		nextVal = 1;
	        	else 
	        		nextVal = parseInt(self.scope.attr().next)+1;

	        	Promise.all([
	        		/* while scroll, request parameter has to be sent with page info */
	        		/* nextVal holds that page info */
			     	//AllInvoices.findAll({next: nextVal}) 
			     	AllInvoices.findAll()
			    ]).then(function(values) {
			    	if(values[0][0]["responseHeader"]["errorCode"]=="0000"){
			    		//$("#"+self.scope.attr().name).remove();
			     		self.scope.invoicesMap.replace(values[0][1]);
			     		self.scope.searchFlag.replace("No");
			     	}
			     	
			    });
			    self.scope.next.replace(nextVal);
			}
        }
    }
});

export default dataTables;
