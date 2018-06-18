// Pull in your favorite version of jquery 
require({ 
	packages: [{ name: "jquery", location: "http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/", main: "jquery.min" }] 
});

// Bring in dojo and javascript api classes as well as varObject.json, js files, and content.html
define([
	"dojo/_base/declare", "framework/PluginBase", "dijit/layout/ContentPane", "dojo/dom", "dojo/dom-style", 
	"dojo/dom-geometry", "dojo/text!./obj.json", "dojo/text!./html/content.html", './js/clicks', 
	'dojo/_base/lang'	
],
function ( 	
	declare, PluginBase, ContentPane, dom, domStyle, 
	domGeom, obj, content, clicks, 
	lang ) {
	return declare(PluginBase, {
		// The height and width are set here when an infographic is defined. When the user click Continue it rebuilds the app window with whatever you put in.
		toolbarName:"Ecosystem Effects of Sea Level Change", allowIdentifyWhenActive:false, hasCustomPrint:true, usePrintModal:true, printModalSize:[600,100], 
		rendered:false, resizable:false, size:'small', hasHelp:false, showServiceLayersInLegend:true, 
		// First function called when the user clicks the pluging icon. 
		initialize: function (frameworkParameters) {
			// Access framework parameters
			declare.safeMixin(this, frameworkParameters);
			// Define object to access global variables from JSON object. Only add variables to varObject.json that are needed by Save and Share. 
			this.obj = dojo.eval("[" + obj + "]")[0];
			this.render(frameworkParameters);	
			// Remove save and share control
			$(".i18n").each(function(i,v){
				if ($(v).html() == "Save &amp; Share"){
					$(v).parent().hide()
				}
			})		
		},
		// Called after initialize at plugin startup (why the tests for undefined). Also called after deactivate when user closes app by clicking X. 
		hibernate: function () {
			//this.map.__proto__._params.maxZoom = 23;
			this.open = "no";
			if (this.agsDrawPolygon != undefined) {this.agsDrawPolygon.deactivate();this.agsDrawPolygon.reset();}
			//if (this.featureLayerPoints != undefined) {this.map.removeLayer(this.featureLayerPoints)};
			//if (this.featureLayerPolygons != undefined) {this.map.removeLayer(this.featureLayerPolygons)};
			if (this.floodLayer != undefined) {this.map.removeLayer(this.floodLayer); this.floodLayer = undefined}
			if (this.poolsLayer != undefined) {this.map.removeLayer(this.poolsLayer); this.poolsLayer = undefined}	
		},
		// Called after hibernate at app startup. Calls the render function which builds the plugins elements and functions.   
		activate: function (showHelpOnStart) {
			this.open = "yes";
		},
		showHelp: function(h){

		},
		// Called when user hits the minimize '_' icon on the pluging. Also called before hibernate when users closes app by clicking 'X'.
		deactivate: function () {
			this.open = "no";	
		},	
		// Called when user hits 'Save and Share' button. This creates the url that builds the app at a given state using JSON. 
		// Write anything to you varObject.json file you have tracked during user activity.		
		getState: function () {
			// remove this conditional statement when minimize is added
			if ( $('#' + this.id ).is(":visible") ){
				//extent
				this.obj.extent = this.map.geographicExtent;
				this.obj.stateSet = "yes";	
				var state = new Object();
				state = this.obj;
				return state;	
			}
		},
		// Called before activate only when plugin is started from a getState url. 
		//It's overwrites the default JSON definfed in initialize with the saved stae JSON.
		setState: function (state) {
			this.obj = state;
		},
		// Called when the user hits the print icon
		prePrintModal: function(preModalDeferred, $printSandbox, $modalSandbox, mapObject) {
			$.get('plugins/ecological-effects-slc/html/print-form.html', function(html) {
			    $modalSandbox.append(html);
			})
			$.get('plugins/ecological-effects-slc/html/print-page.html', function(html) {
			    $printSandbox.append(html);
			}).then(preModalDeferred.resolve());
		},	
		postPrintModal: function(postModalDeferred, $printSandbox, $modalSandbox, mapObject) {
			// get title
			var ttl = $("#getSlcPrintTitle").val();
			if (ttl.length == 0){
				ttl = "Ecosystem Effects of Sea Level Change"
			}	
			$("#slcPrintTitle").html( ttl );
			//show risk variables or solutions
			$(".prw").css("display","none");
			if (this.selOptGroup == "Risk Variables"){
				$(".risVarPrintWrap").show();
			}else{
				$(".selSolPrintWrap").show();
			}
			$(".print-selTop").html(this.selTop + "<br>" + this.obj.pools + " Pools - " + this.obj.year);
			// show flood layers if on
			if (this.obj.floodLayersOn == "yes"){
				var fldType = "";
				$(".flooding input[name=flooding]:checked").each(function(i,v){
					fldType = $(v).next().html();
				})
				$(".print-lf-title").html("Likelyhood of Flooding<br>" + fldType + " Flooding - " + this.obj.year);
				$(".likeFloodPrintWrap").show();
			}	
			// build legend
			var legAr = this.legendArray;
			// Loop through checked reference layer inputs to make legend			 	
		 	$("#" + this.id + "reference-wrap input[name=ref-lyrs]:checked").each(function(i,v){
		 		if (i == 0){
		 			$("#riskAndFloodLayerLegends").append("<div style='font-weight:bold; text-decoration:underline; margin-right:5mm; margin-top:5mm;'>Reference Layers</div>")
		 		}
		 		$.each(legAr,function(i1,v1){
		 			// Does the checked value match a layer name?
		 			if (v.value == v1.layerName){
		 				// is it a single item legend
		 				if (v1.legend.length == 1){
		 					var leg = v1.legend[0];
		 					var mt = "3mm"
		 					if (i1 == 0){
		 						mt = "0mm"
		 					}
		 					$("#riskAndFloodLayerLegends").append("<div style='margin-top:" + mt + "; margin-right:5mm;'><img style='vertical-align:top' src='data:image/png;base64," + leg.imageData + "'> " + v1.layerName + "<div>")					
		 				}
		 				// is it a multiple item legend
		 				if (v1.legend.length > 1){
		 					$("#riskAndFloodLayerLegends").append("<div style='margin-top:3mm; margin-right:5mm;' id='lyr" + v1.layerId + "'>" + v1.layerName + "</div>")	
		 					$.each(v1.legend,function(i2,v2){
		 						$("#riskAndFloodLayerLegends").append("<div style='margin-right:5mm;'><img style='vertical-align:top' src='data:image/png;base64," + v2.imageData + "'> " + v2.label + "<div>");
		 					})
		 				}		
		 			}
		 		})
		 	})


			window.setTimeout(function() {
			    if (mapObject.updating) {
			        var delayedPrint = mapObject.on('update-end', function() {
			        	delayedPrint.remove();
			            postModalDeferred.resolve();
			        });
			    } else {
			        postModalDeferred.resolve();
			    }
			}, 500);
		},
		// Called by activate and builds the plugins elements and functions
		render: function(frameworkParameters) {
			//this.oid = -1;
			//$('.basemap-selector').trigger('change', 3);
			this.mapScale  = this.map.getScale();
			// BRING IN OTHER JS FILES
			this.clicks = new clicks();
			// ADD HTML TO APP
			// Define Content Pane as HTML parent		
			this.appDiv = new ContentPane({style:'padding:8px; flex:1; display:flex; flex-direction:column;}'});
			this.id = this.appDiv.id
			dom.byId(this.container).appendChild(this.appDiv.domNode);	
			$('#' + this.id).parent().addClass('flexColumn')
			if (this.obj.stateSet == "no"){
				$('#' + this.id).parent().parent().css('display', 'flex')
			}			
			// Get html from content.html, prepend appDiv.id to html element id's, and add to appDiv
			var idUpdate0 = content.replace(/for="/g, 'for="' + this.id);	
			var idUpdate = idUpdate0.replace(/id="/g, 'id="' + this.id);
			$('#' + this.id).html(idUpdate);
			
			// Add div on map for existing pools at scale message
			this.exPoolDiv = new ContentPane({style:'display:none; background:rgba(255,255,255,0.5); padding:3px; color:#000; width:232px; z-index:1000; position:absolute; top:7px; left:40px; text-align:center; border-radius:3px; box-shadow:0 1px 2px rgba(0,0,0,0.5); }'});
			this.exPoolID = this.exPoolDiv.id;
			dom.byId('map-0').appendChild(this.exPoolDiv.domNode);
			//
			$('#' + this.exPoolID).html('<div>Existing pools are not visible at this scale, please zoom out to view or contact <a href="mailto:cwiggins@tnc.org?Subject=Data%20Access">cwiggins@tnc.org</a> to request data access.</div>');

			// Set up app and listeners
			this.clicks.appSetup(this);
			
			this.rendered = true;	
		},
	});
});
