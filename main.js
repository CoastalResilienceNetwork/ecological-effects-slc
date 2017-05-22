// Pull in your favorite version of jquery 
require({ 
	packages: [{ name: "jquery", location: "http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/", main: "jquery.min" },
			   { name: "d3", location: "//d3js.org", main: "d3.v4.min"}] 
});

// Bring in dojo and javascript api classes as well as varObject.json, js files, and content.html
define([
	"dojo/_base/declare", 
	"framework/PluginBase", 
	"dijit/layout/ContentPane", 
	"dojo/dom", "dojo/dom-style", 
	"dojo/dom-geometry", 
	"esri/layers/FeatureLayer",
	"dojo/text!./obj.json", 
	"dojo/text!./combos.json", 
	"dojo/text!./html/content.html", 
	'./js/jquery-ui-1.11.2/jquery-ui', 
	'./js/clicks', 
	'dojo/_base/lang'	
],
function ( 	
	declare, 
	PluginBase, 
	ContentPane,
	dom, 
	domStyle, 
	domGeom, 
	FeatureLayer,
	obj, 
	combos,
	content, 
	ui,  
	clicks, 
	lang ) {
	return declare(PluginBase, {
		// The height and width are set here when an infographic is defined. When the user click Continue it rebuilds the app window with whatever you put in.
		toolbarName: "Ecosystem Effects of Sea Level Change", showServiceLayersInLegend: true, allowIdentifyWhenActive: false, rendered: false, resizable: false,
		hasCustomPrint: false, size:'custom', width:500, hasHelp:false,
		showServiceLayersInLegend: false,
		// First function called when the user clicks the pluging icon. 
		initialize: function (frameworkParameters) {
			// Access framework parameters
			declare.safeMixin(this, frameworkParameters);
			// Define object to access global variables from JSON object. Only add variables to varObject.json that are needed by Save and Share. 
			this.obj = dojo.eval("[" + obj + "]")[0];
			this.combos = dojo.eval("[" + combos + "]")[0];	

			function queryTaskExecuteCompleteHandler(queryResults){
			  console.log("complete", queryResults);
			}

			function queryTaskErrorHandler(queryError){
			  console.log("error", queryError.error.details);
			}

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
			$('.sidebar-nav .nav-title').css("margin-left", "25px");
			//this.map.__proto__._params.maxZoom = 19;
			if (this.rendered == false) {	
				this.rendered = true;							
				this.render();
				$(this.printButton).hide();
			}else{
				this.clicks.updateTodas(this);
			}
			this.open = "yes";
		},
		showHelp: function(h){

		},
		// Called when user hits the minimize '_' icon on the pluging. Also called before hibernate when users closes app by clicking 'X'.
		deactivate: function () {
			this.open = "no";	
			$('.sidebar-nav .nav-title').css("margin-left", "0px");
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
		beforePrint: function(printDeferred, $printArea, mapObject) {
			printDeferred.resolve();
		},	
		// Called by activate and builds the plugins elements and functions
		render: function() {
			//this.oid = -1;
			//$('.basemap-selector').trigger('change', 3);
			this.mapScale  = this.map.getScale();
			// BRING IN OTHER JS FILES
			this.clicks = new clicks();
			// ADD HTML TO APP
			$(this.container).parent().append('<button id="viewCrsInfoGraphicIcon" class="button button-default ig-icon"><img src="plugins/ecological-effects-slc/images/InfographicIcon_v1_23x23.png" alt="show overview graphic"></button>')
			$(this.container).parent().find("#viewCrsInfoGraphicIcon").on('click',function(c){
				TINY.box.show({
					animate: true,
					url: 'plugins/ecological-effects-slc/html/info-graphic.html',
					fixed: true,
					width: 800,
					height: 300
				});
			})
			// Define Content Pane as HTML parent		
			this.appDiv = new ContentPane({style:'padding:0; flex:1; display:flex; flex-direction:column;}'});
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
			// Set up app and listeners
			this.clicks.appSetup(this);
			this.clicks.eventListeners(this);
			this.rendered = true;	
			
			// setup chosen boxes
			$(".eechooser").chosen({disable_search: true, allow_single_deselect:false, width:"430px"})
				.change(function(c){
					var v = c.target.value;
					// check for a deselect
					if (v.length == 0){
						v = "none";
					}
					//$('#' + c.target.id ).parent().next().find("span").html(v)
				});
	
		},
	});
});
