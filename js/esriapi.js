define([
	"esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/tasks/query" ,"esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", 
	"esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol","esri/symbols/SimpleMarkerSymbol", "esri/graphic", "dojo/_base/Color"
],
function ( 	ArcGISDynamicMapServiceLayer, Extent, SpatialReference, Query, QueryTask, declare, FeatureLayer, 
			SimpleLineSymbol, SimpleFillSymbol, SimpleMarkerSymbol, Graphic, Color ) {
        "use strict";

        return declare(null, {
			esriApiFunctions: function(t){	
				// Copy of dynamic layer for transparency slider
				t.dynamicLayer1 = new ArcGISDynamicMapServiceLayer(t.url, {opacity: 1 - t.obj.sliderVal/10});
				t.map.addLayer(t.dynamicLayer1);
				t.dynamicLayer1.setVisibleLayers(t.obj.visibleLayers1);
				t.dynamicLayer1.on("load", function () {
					//load second dynamic map service
					t.dynamicLayer = new ArcGISDynamicMapServiceLayer(t.url, {opacity:0.8});
					t.map.addLayer(t.dynamicLayer);
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					t.spid = t.obj.visibleLayers[0];
					t.dynamicLayer.on("load", function () { 			
						t.layersArray = t.dynamicLayer.layerInfos;
						// Click tab based on active attribute from json obj
						$.each($("#" + t.id + "tabBtns input"),function(i,v){
							if (v.value == t.obj.active){
								$("#" + v.id).trigger('click');
								if (t.obj.crsSelected.length > 0){
									$("#" + t.id + "chooseComDl").val(t.obj.crsSelected).trigger("chosen:updated");
									$('#' + t.id + "chooseComDl").trigger('change');
								}
							}
						})	
						if (t.obj.stateSet == "no"){
							t.map.setExtent(t.dynamicLayer.fullExtent.expand(1), true)
						}
						// Save and Share Handler					
						if (t.obj.stateSet == "yes"){
							//extent
							var extent = new Extent(t.obj.extent.xmin, t.obj.extent.ymin, t.obj.extent.xmax, t.obj.extent.ymax, new SpatialReference({ wkid:4326 }))
							t.map.setExtent(extent, true);	
							t.obj.stateSet = "no";
						}	
						t.map.setMapCursor("pointer");
					});	
				});	
				// Create a QueryTask to populate Dropdown menus
				var cq = new Query();
				var cqt = new QueryTask(t.url + "/" + t.CommunityBoundary);
				cq.where = "OBJECTID > 0";
				cq.returnGeometry = false;
				cq.outFields = ["CRS_NAME"];
				var ca = [];
				cqt.execute(cq, function(e){
					$.each(e.features, function(i,v){
						ca.push(v.attributes.CRS_NAME)
					})
					t.allCom = ca.sort();
					var allCom1 = [];
					$.each(t.allCom, function(j,w){
						allCom1.push(w)
					})
					// remove community with no Future OSP parcels
					var index = allCom1.indexOf("Hyde County NC");
					if (index > -1) {
						allCom1.splice(index, 1);
					}
					t.futureCom = allCom1;
					t.clicks.updateDD(t.allCom, "chooseComDl", t);
					t.clicks.updateDD(t.allCom, "chooseComPin", t);
					t.clicks.updateDD(t.futureCom, "chooseComFut", t);
				});	
				// Create a QueryTask for PIN search
				t.pinQt = new QueryTask(t.url + "/" + t.OSPEligibleParcelsLandUse);
				// Create a QueryTask for Future PIN search
				t.fPinQt = new QueryTask(t.url + "/" + t.FutureOSPParcels);				
			},
			featureLayerListeners: function(t){
				t.crsFL = new FeatureLayer(t.url + "/" + t.CommunityBoundary, { mode: FeatureLayer.MODE_SELECTION, outFields: ["*"] });
				t.crsFL.on('selection-complete', function(evt){
					var crsExtent = evt.features[0].geometry.getExtent();
					t.map.setExtent(crsExtent, true); 
					t.atts = evt.features[0].attributes;
					// Loop through all elements with class s2Atts in the step1 div and use their IDs to show selected features attributes
					$('#' + t.id + 'elementsWrapper .s2Atts').each(function (i,v){
						var field = v.id.split("-").pop()
						var val = t.atts[field]
						if ( isNaN(t.atts[field]) == false ){
							val = Math.round(val);
							val = t.esriapi.commaSeparateNumber(val);
						}	
						$('#' + v.id).html(val)
					});
					// Update bar graphs values - get cur and potential points
					t.n = [t.atts.OSP_PTS_2013, t.atts.SUM_ALL_cpts]
					// find the remaining value so bar numbers can be calculated as percentages
					var m = 2020 - (t.n[0] + t.n[1])
					t.n.push(m)
					// Create empty array and populate it with percentages of current, potential, and remaining
					var p = [];
					$.each(t.n, function(i,v){
						var x = Math.round(v/2020*100);
						p.push(x);
					});
					// Update bar values with percentages array
					$('#' + t.id + 'bar2').animate({left : p[0]+"%", width: p[1]+"%"});
					$('#' + t.id + 'bar1').animate({left : "0%", width: p[0]+"%"});
					$('#' + t.id + 'barfa').animate({left : "0%", width: "0%"});
					$('#' + t.id + 'bar2a').animate({left : p[0]+"%", width: p[1]+"%"});
					$('#' + t.id + 'bar1a').animate({left : "0%", width: p[0]+"%"});
					// Add labels to current and potential bars (round decimals and add commas as necessary)
					if (isNaN(t.atts.OSP_PTS_2013) == false){
						var curPnts = Math.round(t.atts.OSP_PTS_2013);
						curPnts = t.esriapi.commaSeparateNumber(curPnts);
						$('#' + t.id + 'bar1L').html(curPnts)
						$('#' + t.id + 'bar1La').html(curPnts)
					}	
					if (isNaN(t.atts.SUM_ALL_cpts) == false){
						var potPnts = Math.round(t.atts.SUM_ALL_cpts);
						potPnts = t.esriapi.commaSeparateNumber(potPnts);
						$('#' + t.id + 'bar2L').html(potPnts);
						$('#' + t.id + 'bar2La').html(potPnts);
					}
				});
				// OSP eligible by pin
				t.pinFL = new FeatureLayer(t.url + "/" + t.SelectedOSPEligibleParcel, { mode: FeatureLayer.MODE_SELECTION, outFields: ["*"] });
				t.pinFL.on('selection-complete', function(evt){
					if (t.pinTracker == "yes"){
						t.pinTracker = "zcheck"
						var pinExtent = evt.features[0].geometry.getExtent();
						t.map.setExtent(pinExtent, true);
						var obid = evt.features[0].attributes.OBJECTID;
						t.layerDefs[t.SelectedOSPEligibleParcel] = "OBJECTID = " + obid;
						t.dynamicLayer.setLayerDefinitions(t.layerDefs);
						var ind = t.obj.visibleLayers.indexOf(t.SelectedOSPEligibleParcel)
						if (ind == -1){
							t.obj.visibleLayers.push(t.SelectedOSPEligibleParcel);
							t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
						}
					}
				});	
			},
			commaSeparateNumber: function(val){
				while (/(\d+)(\d{3})/.test(val.toString())){
					val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
				}
				return val;
			},
			dateFinder: function(date){
				var month = date.getMonth() + 1;
				var day = date.getDate();
				var year = date.getFullYear();
				var d = month + "/" + day + "/" + year;
				return d;
			}
		});
    }
);