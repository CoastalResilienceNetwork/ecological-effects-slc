define([
	"esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/tasks/query" ,"esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", 
	"esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol","esri/symbols/SimpleMarkerSymbol", "esri/graphic", "dojo/_base/Color" 
],
function ( ArcGISDynamicMapServiceLayer, Extent, SpatialReference, Query, QueryTask, declare, FeatureLayer, 
			SimpleLineSymbol, SimpleFillSymbol, SimpleMarkerSymbol, Graphic, Color ) {
        "use strict";

        return declare(null, { 
        	eventListeners: function(t){
        		// Future PDF link
				$('#' + t.id + 'futurePDF').on('click', function(){
					window.open("http://crs-maps.coastalresilience.org/" + t.obj.crsNoSpace + "_Future_" + t.pin + ".pdf", "_blank");					
				});
				// Future toggle buttons click
				$("#" + t.id + "futureToggle input").on('change', function(c){
					$('#' + t.id + 'clear-' + t.obj.futureToggle).trigger('click');
					t.obj.futureToggle = c.target.value;
					$("#" + t.id + " .qpWrapper, #" + t.id + " .ztpWrapper").slideUp();
					$("#" + t.id + " ." +c.target.value).slideDown();
				})
				// Future zoom to selected parcel
				$('#' + t.id + 'futureZoom').on('click',function(){
					t.map.setExtent(t.pinExtent, true);
				});
				//Future zoom to parcels by pin
				$('#' + t.id + 'searchPin').on('click',function(){
					$('.accrodBg').addClass('waiting');
					var q = new Query();
					q.returnGeometry = true;
					q.outFields = ['PIN', 'OSP_fpts', 'OSP_fac', 'TAX_VALUE', 'OWNER_TYPE', 'LAND_USE', 'DEED_BK_PG', 'DEED_DATE'];
					t.obj.searchedPin = $('#' + t.id + 'pinSearch').val();
					q.where = "CRS_NAME = '" + t.obj.crsSelected + "' AND PIN = '" + t.obj.searchedPin + "'";
					t.fPinFL.selectFeatures(q,FeatureLayer.SELECTION_NEW);
				});
				//Clear future Pin search
				$('#' + t.id + 'clear-ztpWrapper').on('click', function(){
					$('#' + t.id + 'pinSearch').val('');
					t.obj.searchedPin = '';
					$('#' + t.id + 'parcelInfo, #' + t.id + 'searchPinNone, #' + t.id + "futureGraph").slideUp();
					$('#' + t.id + 'barfa').animate({left : "0%"});
					t.future.cleanFutureLayers(t);
				});
				// future chosen menu
				$("#" + t.id + "ch-FUT").chosen({width:"240px"})
					.change(function(c){
						t.obj.futObid = c.currentTarget.value;
						var query = new Query();	
						query.where = "OBJECTID = " + t.obj.futObid;
						t.fPinFL.selectFeatures(query, FeatureLayer.SELECTION_NEW);	
					})	
				// greater than less than acre init and clicks
				$.each($("#" + t.id + "facgrln input"), function(i,v){
					if (t.obj.acreGrLs == v.value){
						$("#" + v.id).prop("checked", true);
					}
				})
				$("#" + t.id + "facgrln input").on('click', function(c){
					t.obj.acreGrLs = c.target.value;
				})
				// and or query init and clicks
				$.each($("#" + t.id + "fandor input"), function(i,v){
					if (t.obj.futQuAndOr == v.value){
						$("#" + v.id).prop("checked", true);
					}
				})
				$("#" + t.id + "fandor input").on('click', function(c){
					t.obj.futQuAndOr = c.target.value;					
				})
				// greater than less than value init and clicks
				$.each($("#" + t.id + "fvagrln input"), function(i,v){
					if (t.obj.taxGrLs == v.value){
						$("#" + v.id).prop("checked", true);
					}
				})
				$("#" + t.id + "fvagrln input").on('click', function(c){
					t.obj.taxGrLs = c.target.value;	
				})
				//Future query
				$('#' + t.id + 'queryParcels').on('click', function(){	
					$('#' + t.id + 'parcelInfo').slideUp();
					t.fManyPinFL.clear();
					$('#' + t.id + 'fParSelWrapper').slideUp();
					$('#' + t.id + 'queryParMany').slideUp();
					$('#' + t.id + 'queryParNone').slideUp();	
					var fav = $('#' + t.id + 'futAcreVal').val().replace(/\,/g,'')
					if (fav == ""){
						t.obj.futAcreVal = 0;	
						$('#' + t.id + 'futAcreVal').val("0")
					}else{	
						t.obj.futAcreVal = fav;
						var rep = t.clicks.numberWithCommas(fav)
						$('#' + t.id + 'futAcreVal').val(rep)
					}
					var ftv = $('#' + t.id + 'futTaxVal').val().replace(/\,/g,'');
					ftv = ftv.replace(/\$/g,'')
					if (ftv == ""){
						t.obj.futTaxVal = 0;
						$('#' + t.id + 'futTaxVal').val("0");						
					}else{
						t.obj.futTaxVal = ftv;
						var rep = t.clicks.numberWithCommas(ftv)
						$('#' + t.id + 'futTaxVal').val(rep)
					}					
					var q = new Query();
					q.returnGeometry = true;
					q.outFields = ['PIN', 'OSP_fpts', 'OSP_fac', 'TAX_VALUE', 'OWNER_TYPE', 'LAND_USE', 'DEED_BK_PG', 'DEED_DATE'];
					q.where = "CRS_NAME = '" + t.obj.crsSelected + "' AND ( OSP_fac " + t.obj.acreGrLs + " " + t.obj.futAcreVal + " " + 
						t.obj.futQuAndOr + " TAX_VALUE " + t.obj.taxGrLs + " " + t.obj.futTaxVal + " )";
					t.futureManyQuery = q.where;
					t.fManyPinFL.selectFeatures(q,FeatureLayer.SELECTION_NEW);
					t.obj.parQueryClicked = "yes";
				});
				// clear query
				$("#" + t.id + "clear-qpWrapper").on("click", function(c){
					$("#" + t.id + " .fut-at-query input").val(0);
					$("#" + t.id + "fParSelWrapper").slideUp();
					$("#" + t.id + "parcelInfo").slideUp();
					$("#" + t.id + " .queryParNone").slideUp();
					t.future.cleanFutureLayers(t);
				})
				// show sort
				$("#" + t.id + "showFutSort").on("click", function(c){
					$("#" + t.id + "fsWrapper").slideDown();
					t.future.sortFuture(t);
				})
				$("#" + t.id + "hideFutSort").on("click", function(c){
					$("#" + t.id + "fsWrapper").slideUp();
				})
				// acending and decending sort inits and clicks
				$.each($("#" + t.id + "futSortAcVa input"),function(i,v){
					if (t.obj.futSortOn == v.value){
						$("#" + v.id).prop("checked", true);
					}
				})
				$("#" + t.id + "futSortAcVa input").on("change",function(c){
					t.obj.futSortOn = c.target.value;
					t.future.sortFuture(t);	
					t.future.futureDropdown(t);
				});
				$.each($("#" + t.id + "futSortAcDe input"),function(i,v){
					if (t.obj.futSortOrder == v.value){
						$("#" + v.id).prop("checked", true);
					}
				})
				$("#" + t.id + "futSortAcDe input").on("change",function(c){
					t.obj.futSortOrder = c.target.value;
					t.future.sortFuture(t);
					t.future.futureDropdown(t);
				});
				// download parcel table
				$('#' + t.id + 'futureTop50').on('click', function(){
					window.open("http://crs-maps.coastalresilience.org/" + t.obj.crsNoSpace + "_Future_Parcel_Table.zip", "_blank");					
				});
				// future layer checkbox clicks
				$("#" + t.id + "curElOsp").on("change",function(c){
					if (c.target.checked){
						var ind = t.obj.visibleLayers.indexOf(t[c.target.value])
						if (ind == -1){
							t.obj.visibleLayers.push(t[c.target.value]);
							t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
						}	
						t.obj.curElOsp = true;
					}else{
						var ind = t.obj.visibleLayers.indexOf(t[c.target.value])
						if (ind > -1){
							t.obj.visibleLayers.splice(ind, 1);
							t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
						}
						t.obj.curElOsp = false;
					}		
				})
				$("#" + t.id + "ImpactAd").on("change",function(c){
					if (c.target.checked){
						var ind = t.obj.visibleLayers1.indexOf(t[c.target.value])
						if (ind == -1){
							t.obj.visibleLayers1.push(t[c.target.value]);
							t.dynamicLayer1.setVisibleLayers(t.obj.visibleLayers1);
						}	
						t.obj.ImpactAd = true;
					}else{
						var ind = t.obj.visibleLayers1.indexOf(t[c.target.value])
						if (ind > -1){
							t.obj.visibleLayers1.splice(ind, 1);
							t.dynamicLayer1.setVisibleLayers(t.obj.visibleLayers1);
						}
						t.obj.ImpactAd = false;
					}		
				})
        	},
        	sortFuture: function(t){
        		var av = ""
				if (t.obj.futSortOn == "acres"){ av = "acres" }
				else{ av = "tax value" }
				var ad = ""
				if (t.obj.futSortOrder == "ascen"){ ad = "ascending" }
				else{ ad = "decending" }	
				$('#' + t.id + 'ch-FUT').attr("data-placeholder", "Sorted by " + av + " - " + ad)
				$('#' + t.id + 'ch-FUT').trigger("chosen:updated");
        	},
        	cleanFutureLayers: function(t){
        		var ind = t.obj.visibleLayers.indexOf(t.SelectedFutureOSPParcel)
				if (ind > -1){
					t.obj.visibleLayers.splice(ind, 1);
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				}
				var ind1 = t.obj.visibleLayers.indexOf(t.FutureOSPParcelsInQuery)
				if (ind1 > -1){
					t.obj.visibleLayers.splice(ind1, 1);
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				}
        	},
        	futureDropdown: function(t){
				// Create sorted objects by tax and acreage for the returned parcels
				t.aSm = _.sortBy( t.futDDoptions, 'acres' );
				t.aLr = _.sortBy( t.futDDoptions, 'acres' ).reverse();
				t.tSm = _.sortBy( t.futDDoptions, 'tax' );
				t.tLr = _.sortBy( t.futDDoptions, 'tax' ).reverse();
				// Add conditional statements to determine which array to add to select menu	
				var resultArray = [];
				if (t.obj.futSortOn == 'acres' && t.obj.futSortOrder == "ascen"){
					resultArray = t.aSm;
				}
				if (t.obj.futSortOn == 'acres' && t.obj.futSortOrder == "decen"){
					resultArray = t.aLr;
				}				
				if (t.obj.futSortOn == 'taxval' && t.obj.futSortOrder == "ascen"){
					resultArray = t.tSm;
				}
				if (t.obj.futSortOn == 'taxval' && t.obj.futSortOrder == "decen"){
					resultArray = t.tLr;
				}
				$('#' + t.id + 'ch-FUT').empty();
				$('#' + t.id + 'ch-FUT').append("<option value=''></option>");
				$.each(resultArray, function(i,v){
					var acres = Math.round(v.acres);
					acres = t.esriapi.commaSeparateNumber(acres);
					var tax = t.esriapi.commaSeparateNumber(v.tax);
					$('#' + t.id + 'ch-FUT').append("<option value='" + v.obid + "'>" + acres + " acres | $" + tax + "</option>");
				});
				$('#' + t.id + 'ch-FUT').trigger("chosen:updated");
			},
			featureLayerListeners: function(t){
				// future parcels
				t.fPinFL = new FeatureLayer(t.url + "/" + t.FutureOSPParcels, { mode: FeatureLayer.MODE_SELECTION, outFields: ["*"] });
				t.fPinFL.on('selection-complete', function(evt){
					if (evt.features.length > 0) {
						t.patts = evt.features[0].attributes;
						t.pin = t.patts.PIN;
						$('#' + t.id + 'parcelInfo .pInfoField').each(function (i,v){
							var field = v.id.split("-").pop()
							var val = t.patts[field];
							if (field == 'DEED_DATE'){
								var date = new Date(val)
								var d = t.esriapi.dateFinder(date)
								val = d;
							}else{
								if ( isNaN(t.patts[field]) == false ){
									if (field != 'PIN'){
										val = Math.round(val);
										val = t.esriapi.commaSeparateNumber(val);
										if (field == 'TAX_VALUE'){
											val = '$' + val;	
										}
									}					
								}	
							}	
							$('#' + v.id).html(val)
							$('#' + t.id + 'searchPinNone').slideUp();
							$('#' + t.id + 'parcelInfo').slideDown();
							t.pinExtent = evt.features[0].geometry.getExtent();							
						});
						// Update bar graphs values - get cur and potential points
						t.n = [t.atts.OSP_PTS_2013, t.atts.SUM_ALL_cpts, t.patts.OSP_fpts]
						// find the remaining value so bar numbers can be calculated as percentages
						var m = 2020 - (t.n[0] + t.n[1] + t.n[2])
						t.n.push(m)
						
						// Create empty array and populate it with percentages of current, potential, and remaining
						var p = [];
						$.each(t.n, function(i,v){
							var x = Math.round(v/2020*100);
							p.push(x);
						});
						$('#' + t.id + 'futureGraph').css('display', 'inline-block');
						// Update bar values with percentages array
						$('#' + t.id + 'barfa').animate({left : p[0]+p[1]-1+"%", width: p[2]+"%"});
						$('#' + t.id + 'bar2a').animate({left : p[0]+"%", width: p[1]+"%"});
						$('#' + t.id + 'bar1a').animate({left : "0%", width: p[0]+"%"});
						// Add labels to current and potential bars (round decimals and add commas as necessary)
						if (isNaN(t.atts.OSP_PTS_2013) == false){
							var curPnts = Math.round(t.atts.OSP_PTS_2013);
							curPnts = t.esriapi.commaSeparateNumber(curPnts);
							$('#' + t.id + 'bar1La').html(curPnts)
						}	
						if (isNaN(t.atts.SUM_ALL_cpts) == false){
							var potPnts = Math.round(t.atts.SUM_ALL_cpts);
							potPnts = t.esriapi.commaSeparateNumber(potPnts);
							$('#' + t.id + 'bar2La').html(potPnts);
						}
						if (isNaN(t.patts.OSP_fpts) == false){
							var futPnts = Math.round(t.patts.OSP_fpts);
							futPnts = t.esriapi.commaSeparateNumber(futPnts);
							$('#' + t.id + 'barfLa').html(futPnts);
						}
						var obid = evt.features[0].attributes.OBJECTID;
						t.layerDefs[t.SelectedFutureOSPParcel] = "OBJECTID = " + obid;
						t.dynamicLayer.setLayerDefinitions(t.layerDefs);
						var ind = t.obj.visibleLayers.indexOf(t.SelectedFutureOSPParcel)
						if (ind == -1){
							t.obj.visibleLayers.push(t.SelectedFutureOSPParcel);
							t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
						}
					}else{
						$('#' + t.id + 'parcelInfo').slideUp();
						$('#' + t.id + 'searchPinNone').slideDown();	
					}	
				});	

				// Create a feature layer of future parcels selected by PIN
				t.hiddenSym = new SimpleFillSymbol( SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_SOLID, new Color([0,0,255,0]), 0 ), new Color([255,255,255,0])
				);
				t.fManyPinFL = new FeatureLayer(t.url + "/" + t.FutureOSPParcels, { mode: FeatureLayer.MODE_SELECTION, outFields: ["*"] });
				t.fManyPinFL.setSelectionSymbol(t.hiddenSym);
				t.map.addLayer(t.fManyPinFL);
				var hoverSym = new SimpleFillSymbol( SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_SOLID, new Color([0,128,255,0]), 0 ), new Color([0,0,0,0.15])
				);
				t.fManyPinFL.on('mouse-over', function(evt){
					if ( t.open == "yes"){ 
						t.map.setMapCursor("pointer");
						var highlightGraphic = new Graphic(evt.graphic.geometry,hoverSym);
						t.map.graphics.add(highlightGraphic);
						t.obid = evt.graphic.attributes.OBJECTID
					}	
				});
				t.map.graphics.on("mouse-out", function(){
					if ( t.open == "yes"){ 
						t.map.setMapCursor("default");
						t.map.graphics.clear();
						t.obid = -1
					}	
				});
				t.map.on("click", function(event) {
					if ( t.obid > -1 && t.open == "yes"){ 
						var p = "r"
						$('#' + t.appDiv.id + 'ch-FUT').val(String(t.obid)).trigger('chosen:updated').trigger('change', p)
					}	
				});

				t.fManyPinFL.on('selection-complete', function(evt){
					if (evt.features.length > 100) {
						t.fManyPinFL.clear();
						$('#' + t.id + 'queryParMany').slideDown();
						$('#' + t.id + 'queryParNone').slideUp();
						$('#' + t.id + 'fParSelWrapper').slideUp();
					}else{
						if (evt.features.length > 0) {
							t.obj.totalFuturePoints = 0;
							t.futDDoptions = [];
							$.each(evt.features, function(i,v){
								t.obj.totalFuturePoints = t.obj.totalFuturePoints + v.attributes.OSP_fpts;
								t.futDDoptions.push({acres: v.attributes.OSP_fac, tax: v.attributes.TAX_VALUE, obid: v.attributes.OBJECTID})
							});
							// Update dropdown list of parcels by acres and tax value
							t.future.futureDropdown(t);
							
							// Update bar graphs values - get cur and potential points
							t.n = [t.atts.OSP_PTS_2013, t.atts.SUM_ALL_cpts, t.obj.totalFuturePoints]
							// find the remaining value so bar numbers can be calculated as percentages
							var m = 2020 - (t.n[0] + t.n[1] + t.n[2])
							t.n.push(m)
							
							// Create empty array and populate it with percentages of current, potential, and remaining
							var p = [];
							$.each(t.n, function(i,v){
								var x = Math.round(v/2020*100);
								p.push(x);
							});
							$('#' + t.id + 'futureGraph').css('display', 'inline-block');
							//$('#' + t.id + 'graphLegLblF').show();
							// Update bar values with percentages array
							$('#' + t.id + 'barfa').animate({left : p[0]+p[1]-1+"%", width: p[2]+"%"});
							$('#' + t.id + 'bar2a').animate({left : p[0]+"%", width: p[1]+"%"});
							$('#' + t.id + 'bar1a').animate({left : "0%", width: p[0]+"%"});
							// Add labels to current and potential bars (round decimals and add commas as necessary)
							if (isNaN(t.atts.OSP_PTS_2013) == false){
								var curPnts = Math.round(t.atts.OSP_PTS_2013);
								curPnts = t.esriapi.commaSeparateNumber(curPnts);
								$('#' + t.id + 'bar1La').html(curPnts)
							}	
							if (isNaN(t.atts.SUM_ALL_cpts) == false){
								var potPnts = Math.round(t.atts.SUM_ALL_cpts);
								potPnts = t.esriapi.commaSeparateNumber(potPnts);
								$('#' + t.id + 'bar2La').html(potPnts);
							}
							if (isNaN(t.obj.totalFuturePoints) == false){
								var futPnts = Math.round(t.obj.totalFuturePoints);
								futPnts = t.esriapi.commaSeparateNumber(futPnts);
								$('#' + t.id + 'barfLa').html(futPnts);
								$('#' + t.id + 'futurePointsSum').html(futPnts)
							}
							$('#' + t.id + 'futureParcelCount').html(evt.features.length)
							$('#' + t.id + 'queryParNone, #' + t.id + 'queryParMany').slideUp();
							$('#' + t.id + 'toggleQuery').html('Hide Query');
							$('#' + t.id + 'fParSelWrapper').slideDown();
							t.obj.queryVis = "yes";
							t.layerDefs[t.FutureOSPParcelsInQuery] = t.futureManyQuery;
							t.dynamicLayer.setLayerDefinitions(t.layerDefs);
							var ind = t.obj.visibleLayers.indexOf(t.FutureOSPParcelsInQuery)
							if (ind == -1){
								t.obj.visibleLayers.push(t.FutureOSPParcelsInQuery);
								t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
							}
						}else{
							t.fManyPinFL.clear();
							$('#' + t.id + 'fParSelWrapper').slideUp();
							$('#' + t.id + 'queryParMany').slideUp();
							$('#' + t.id + 'queryParNone').slideDown();
						}	
					}
				});
			}		
        });
    }
);	