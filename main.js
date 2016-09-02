require({    // Specify library locations.    // The calls to location.pathname.replace() below prepend the app's root path to the specified library location.    // Otherwise, since Dojo is loaded from a CDN, it will prepend the CDN server path and fail, as described in    // https://dojotoolkit.org/documentation/tutorials/1.7/cdn    packages: [        {            name: "d3",            location: "//d3js.org",            main: "d3.v3.min"        },        {            name: "underscore",            location: "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3",            main: "underscore-min"        }		,		{ 			name: "foundation", 			location: "https://cdnjs.cloudflare.com/ajax/libs/foundation/6.2.3/", 			main: "foundation" 		}//		{ //			name: "jquery-ui", //			location: "//ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/", //			main: "jquery-ui.min" //		}    ]});define([        "dojo/_base/declare",		"framework/PluginBase",		"d3",//		"jquery",//		"jquery-ui",
		"./resources/chosen.jquery",		"dojo/dnd/move",		"esri/request",		"esri/toolbars/draw",		"esri/layers/FeatureLayer",		"esri/layers/ArcGISDynamicMapServiceLayer",		"esri/layers/ArcGISTiledMapServiceLayer",		"esri/layers/ArcGISImageServiceLayer",		"esri/layers/ImageServiceParameters",		"esri/layers/MosaicRule",		"esri/layers/RasterFunction",		"esri/tasks/ImageServiceIdentifyTask",		"esri/tasks/ImageServiceIdentifyParameters",		"esri/tasks/QueryTask",		"esri/tasks/query",		"esri/graphicsUtils",		"esri/graphic",		"esri/symbols/SimpleLineSymbol",		"esri/symbols/SimpleFillSymbol",		"esri/symbols/SimpleMarkerSymbol",		"esri/geometry/Extent",		"esri/geometry/Polygon",		"esri/geometry/Point",		"esri/request",		"dijit/registry",		"dijit/form/Button",		"dijit/form/MultiSelect",		"dijit/form/DropDownButton",		"dijit/DropDownMenu",		"dijit/MenuItem",		"dijit/layout/ContentPane",		"dijit/layout/TabContainer",		"dijit/form/HorizontalSlider",		"dijit/form/CheckBox",		"dijit/form/RadioButton",		"dojo/dom",		"dojo/dom-class",		"dojo/dom-style",		"dojo/_base/window",		"dojo/dom-construct",		"dojo/dom-attr",		"dojo/dom-geometry",		"dijit/Dialog",		'dojox/layout/ResizeHandle',		"dojox/charting/Chart",		"dojox/charting/plot2d/Pie",		"dojox/charting/action2d/Highlight",        "dojox/charting/action2d/MoveSlice" ,		"dojox/charting/action2d/Tooltip",        "dojox/charting/themes/MiamiNice",		"dojox/charting/widget/Legend",		"dojox/lang/functional",		"dojo/_base/Color",		"dojo/html",		"dojo/_base/array",		"dojo/aspect",		"dojo/_base/lang",		'dojo/_base/json',		"dojo/_base/window",		"dojo/on",		"dojo/parser",		"dojo/query",		"dojo/NodeList-traverse",		"require",		"dojo/text!./config.json",		"xstyle/css!./main.css",		"xstyle/css!./resources/chosen.css"       ],       function (declare,					PluginBase,					d3,//					$,//					jqui,
					chosen,					move,					ESRIRequest,					Drawer,					FeatureLayer,					ArcGISDynamicMapServiceLayer,					ArcGISTiledMapServiceLayer,					ArcGISImageServiceLayer,					ImageServiceParameters,					MosaicRule,					RasterFunction,					ImageServiceIdentifyTask,					ImageServiceIdentifyParameters,					QueryTask,					esriQuery,					graphicsUtils,					Graphic,					SimpleLineSymbol,					SimpleFillSymbol,					SimpleMarkerSymbol,					Extent,					Polygon,					Point,					esriRequest,					registry,					Button,					MultiSelect,					DropDownButton,					DropDownMenu,					MenuItem,					ContentPane,					TabContainer,					HorizontalSlider,					CheckBox,					RadioButton,					dom,					domClass,					domStyle,					win,					domConstruct,					domAttr,					domGeom,					Dialog,					ResizeHandle,					Chart,					Pie,					Highlight,					MoveSlice,					Tooltip,					MiamiNice,					Legend,					dn,					Color,					html,					array,					aspect,					lang,					dJson,					win,					on,					parser,					dojoquery,					NodeListtraverse,					localrequire,					eeSLCconfigObject					) {							_ee_config = dojo.eval("[" + eeSLCconfigObject + "]")[0];	_infographic_ee = _ee_config.infoGraphic;	//console.log(_infographic);	if (_infographic_ee != undefined) {		_infographic_ee = localrequire.toUrl("./" + _infographic_ee);	}			if (_ee_config.pluginWidth == undefined) {		_ee_config.pluginWidth = 420;	}			if (_ee_config.pluginHeight == undefined) {		_ee_config.pluginHeight = 500;	}	        function setupViewTabs($tabHost) {            var $tabContent = $tabHost.find('.tabs-content'),                $tabs = $tabHost.find('.tabs');                        $tabHost.on("click", "dl.tabs a", function() {                var $tab = $(this);                $tabContent.find('li').removeClass('active');                $tabs.find('dd').removeClass('active');                                $tab.parent().addClass('active');                $tabContent.find('#' + $tab.data('content')).addClass('active');            });        }	_eeLocalData = localrequire.toUrl("./chartdata.csv");		return declare(PluginBase, {		toolbarName:  _ee_config.pluginName,        toolbarType: "sidebar",		showServiceLayersInLegend: true,        allowIdentifyWhenActive: false,		rendered: false,		infoGraphic: _infographic_ee,		width: _ee_config.pluginWidth,		height: _ee_config.pluginHeight,               activate: function () {				   				   if (this.mainLayer == undefined) {					this.mainLayer = new ArcGISDynamicMapServiceLayer(_ee_config.mapServer,{							useMapImage: true							}						  );				   }				   					this.mainLayer.setVisibleLayers([-1])					this.map.addLayer(this.mainLayer);				   				   if (this.rendered == false) {						   					outerBox = $('<div class="eeheader" />').appendTo($(this.container));										oMainBox = $('<div class="eecontent" id=omainBox_' + this.map.id + '/>').appendTo($(this.container));										mainBox = $('<div class="eeMain" id=eeMainBox_' + this.map.id + '/>').appendTo($(oMainBox));										footerBox = $('<div class="eefooter" id=eeFooterBox_' + this.map.id + '/>').appendTo($(this.container));										s = $('<select class="chosenDD chosen-select mainChosen" id=eeGeoSelect_' + this.map.id + ' data-placeholder="Choose a Region" />')					$('<option />', {value: "", text: ""}).appendTo(s);										selIndex = -1;										for(var reg in this.regions) {						region = this.regions[reg];						$('<option />', {value: region.name, text: region.name}).appendTo(s);						if (region.selected == true) {							selIndex = reg;						}					}										if (this.regions.length == 1) {						selIndex = 0;						this.regions.selected = true;					}										console.log(this.container);					s.appendTo(outerBox);						$(".chosenDD").chosen({disable_search_threshold: 10}).change($.proxy(function(val) {					  this.changeGeo(val);					}, this));					//parser.parse();					$(".chosen-container").css("width", "50%");										if (selIndex != -1) {						$("#eeGeoSelect_" + this.map.id).val("Kiholo").trigger('chosen:updated');						this.changeGeo();					}				   				    this.rendered =  true;					   				   } else {					this.updateDisplay();				   				   }				   				   				   				   				   				   /*				    //set up dropdown
					sel = '<select class="chosen-select" data-placeholder="Choose a Country..." tabindex="1">      <option value="United States">Kiholo</option>             <option value="United Kingdom">United Kingdom</option>             <option value="Afghanistan">Afghanistan</option>             <option value="Aland Islands">Aland Islands</option>             <option value="Albania">Albania</option>           </select>'

					selnode = domConstruct.create("div", {innerHTML: sel, style:"padding:5px"})

					this.container.appendChild(selnode);
					parser.parse();

					$(".chosen-select").chosen({disable_search_threshold: 10});

					parser.parse();

					$(".chosen-container").css("width", "50%");
					
			   				    //domClass.add(this.container, "claro");				   						this.mainNode = domConstruct.create("div", {"style": "width: 100%;padding:10px", "id": "outerZiv"});					this.container.appendChild(this.mainNode);										node2 = domConstruct.create("div", {"style": "width: 76%; ", "class": "sliderer"});										this.mainNode.appendChild(node2);				   						node3 = domConstruct.create("div", {style: "padding-top:10px", innerHTML: '<span style="float: left;">Current</span><span style="float: right; width: 25%">High</span><span style="float: right;width: 25%;">Medium</span><span style="float: right;width: 25%;">Low</span>'}); 						//node3 = domConstruct.create("div", {innerHTML: '<table style="width:100%;border:none"><tr><th style="text-align: left">Current</th><th style="text-align: center">Low</th><th style="text-align: center">Medium</th><th style="text-align: right">High</th></tr></table>'}); 										this.mainNode.appendChild(node3);										parser.parse()			
										//	  $( function() {					$( ".sliderer" ).slider({    value: 1,    min: 1,    max: 4,    step: 1});




			//	  } );*/

txt = '<div><dl class="tabs report-plugin-tabs">           <dd class="active"><a data-content="report-plugin-tab-select">Report Selection</a></dd>           <dd><a id="plugin-report-result-tab" data-content="report-plugin-tab-result">Report Results</a></dd>         </dl>          <ul class="tabs-content report-plugin-list">           <li class="active" id="report-plugin-tab-select">             <h5>Step 1: Select Report</h5>             <div>                 <select id="report-plugin-report-select"></select>             </div>             <div id="report-plugin-report-description">                 <%= firstDescription %>             </div>             <div>                 <h5>Step 2: Draw an area on the map</h5>                 <button id="report-plugin-draw" class="button radius">Draw area of interest</button>                     <h5>Step 3: Generate Report</h5>                 <button id="report-plugin-request" class="button radius" disabled="disabled">Generate</button>                 <div class="plugin-report-spinner"></div>             </div>           </li>            <li id="report-plugin-tab-result">               <span class="default"><div class="range-slider" data-slider>   <span class="range-slider-handle" role="slider" tabindex="0"></span>   <span class="range-slider-active-segment"></span>   <input type="hidden"> </div></span>           </li>         </ul></div>'		//tabsTxt = '<div><dl class="tabs report-plugin-tabs">'//$.each([ 52, 97 ], function( index, value ) {//  alert( index + ": " + value );//});//Tabitem = '<dd class="active"><a data-content="report-plugin-tab-select">Report Selection</a></dd>'       //$(txt).appendTo(mainBox);//setupViewTabs($(this.container));//node4 = domConstruct.create("div", {innerHTML: txt})

//this.mainNode.appendChild(node4);

//$('#tabs').tabs();  								   },			   			   			   changeGeo: function(geo) {				selectedGeo = $("#eeGeoSelect_" + this.map.id)[0].value;				console.log(selectedGeo);								$.each(this.regions, function( index, value ) {				  if (selectedGeo == value.name) {						selectedRegion = value;						value.selected = true;				  } else {						value.selected = false;				  }				});								mainBox = $("#omainBox_" + this.map.id).empty();								parser.parse();								mainBox = $('<div class="eeMain" id=eeMainBox_' + this.map.id + '><div id="eeTab_' + this.map.id + '"></div></div>').appendTo($(oMainBox));															this.tabpan = new TabContainer({					style: "height: 100%; width: 100%;"				});								dom.byId('eeMainBox_' + this.map.id).appendChild(this.tabpan.domNode);											array.forEach(selectedRegion.tabs, lang.hitch(this,function(tab, t){											if (tab.disabled == undefined) {tab.disabled = false}														sliderpane = new ContentPane({							  "data-pane": "ActualTabs",							  title: '<span title="' + tab.hoverText + '">' + tab.name + '</span>',							  "data-index": t,							  "disabled": tab.disabled,							  index: t							});								this.tabpan.addChild(sliderpane);														array.forEach(tab.sliders, lang.hitch(this,function(entry, i){																	if (entry.selected == undefined) { entry.selected = 0 }																				Onsliderwrapper = domConstruct.create("div", {style: "height:70px"})										sliderpane.domNode.appendChild(Onsliderwrapper);																				nsliderwrapper = domConstruct.create("div", {id: "eeSlider_" + this.map.id + "_" + i})										Onsliderwrapper.appendChild(nsliderwrapper);																				nslidernodeheader = domConstruct.create("div", {innerHTML: entry.name, class:'eeSliderHeader'})										nsliderwrapper.appendChild(nslidernodeheader);																	nslidernode = domConstruct.create("div");										nsliderwrapper.appendChild(nslidernode);																				inlabels = ""																				array.forEach(entry.values, lang.hitch(this,function(val, v){											inlabels = inlabels + '<li>' + val.name + '</li>'										}));																				labelsnode = domConstruct.create("ol", {"data-dojo-type":"dijit/form/HorizontalRuleLabels", container:"bottomDecoration", style:"", innerHTML: inlabels})										nslidernode.appendChild(labelsnode);										slider = new HorizontalSlider({											name: entry.group,											"data-mexslider": "mexSlider",											value: entry.selected,											minimum: 0,//entry.min,											maximum: entry.values.length - 1,											showButtons:false,											disabled: false,											title: entry.name,											intermediateChanges: true,											tabindex: t,											//order: itemIndex,											discreteValues: entry.values.length,											"dataIndex": i,											//onClick: lang.hitch(this,function(b){ 											//	allChecks = dojoquery("[name=ExplorerAncillaryCheck]");																							//	array.forEach(allChecks, lang.hitch(this,function(checkerBox, j){											//													//			cb = registry.byId(checkerBox.id);											//			cb.set("checked", false);											//														//	}));																						//}),											onChange: lang.hitch(this,function(sld){this.sliderChange(sld, i)}),											style: "width:90%;"										}, nslidernode);																				nsliderpad = domConstruct.create("div", {class:'eeSliderPad'})										nsliderwrapper.appendChild(nsliderpad);																				parser.parse();																				entry.sliderID = nsliderwrapper.id;														}));					chartTitle = domConstruct.create("div", {id: "d3Title_" + this.map.id + "_" + t, class:'d3Title', innerHTML: "Hover Over Chart for Values"})					sliderpane.domNode.appendChild(chartTitle);										d3Area = domConstruct.create("div", {id: "d3Area_" + this.map.id + "_" + t, class:'d3Area'})					sliderpane.domNode.appendChild(d3Area);										parser.parse()					chartFooter = domConstruct.create("div", {id: "d3Footer_" + this.map.id + "_" + t, class:'d3Title oChartText', innerHTML: '<svg width="10" height="10"><rect width="10" height="10" class="bar bar--positive" /></svg>' + " Gain &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + '<svg width="10" height="10"><rect width="10" height="10" class="bar bar--negative" /></svg>' +" Loss"})					sliderpane.domNode.appendChild(chartFooter);										//data = this.chartData.filter(function(d) { return d.Region == selectedGeo})											//console.log(data);								}));				aspect.after(this.tabpan, "selectChild", lang.hitch(this,function (e, o) {								console.log(e,o);					Tabindex = o[0].index;										selectedRegion.selectedTab = Tabindex;				/*									if (selindex != -1) {											if (this.introLayer != undefined) {							  this.map.removeLayer(this.introLayer)						}											} else {											this.introLayer = new ArcGISDynamicMapServiceLayer(geography.intro.layer.url,{								useMapImage: true								}							  );						this.introLayer.setVisibleLayers(geography.intro.layer.show)						this.map.addLayer(this.introLayer);																	}					if (selindex == geography.tabs.length) {					a = lang.hitch(this,function(){this.doCombined()})					a();										} else {										a = lang.hitch(this,function(){this.updateService()})					a();										}					this.resize();*/				}));								this.tabpan.startup();											parser.parse();								this.resize();				this.updateDisplay();								this.setExtent();									   },			   			   setExtent: function() {			   	$.each(this.regions, function( index, value ) {					  if (selectedGeo == value.name) {							selectedRegion = value;					  }					});									 extent = new Extent(selectedRegion.extent);				 				 this.map.setExtent(extent, true);				   			   },			   sliderChange: function(sld, sindex) {				   				selectedGeo = $("#eeGeoSelect_" + this.map.id)[0].value;			   	$.each(this.regions, function( index, value ) {					  if (selectedGeo == value.name) {							selectedRegion = value;					  }					});			   				console.log(sld, this.regions, sindex);				selectedRegion.tabs[selectedRegion.selectedTab].sliders[sindex].selected = sld				console.log(this.regions);									// now call handler for doing things.				this.updateDisplay();							   },			   			   			   updateDisplay: function() {												creg = 0; 								array.forEach(this.regions, lang.hitch(this,function(reg, r){												if (reg.selected == true) {creg = reg}										}));				console.log(creg);				ctab = creg.tabs[creg.selectedTab];								cSliderValues = new Array();								array.forEach(ctab.sliders, lang.hitch(this,function(sld, s){										cSliderValues.push(sld.values[sld.selected].value);									$("#" + sld.sliderID).show();												array.forEach(cSliderValues, lang.hitch(this,function(cdv, c){							if (cdv == sld.disable) {								$("#" + sld.sliderID).hide();							} 					}));									}));												data = this.chartData.filter(function(d) { return d.Region == selectedGeo && d.Tab == creg.selectedTab})				//console.log(data);								this.updateChart(data, creg.selectedTab, cSliderValues, ctab.combos);											   },			   			updateTitle: function(d,combo, t) {								normalCombo = "N_" + combo;				if (d[normalCombo] == 999) {					pChange = "Infinity"				} else {					pChange = Math.abs(parseInt(d[normalCombo])) + "%" 				}				console.log(d);								if (d[normalCombo] < 0) {					GL = "<span class='eeLoss'>Loss</span>"				} else {					GL = "<span class='eeGain'>Gain</span>"				}								$("#d3Title_" + this.map.id + "_" + t).html(GL + " of " + pChange + " or " + d[combo] + " " + d["Units"])							},											updateChart: function(data, t, cSliderValues, combos) {				console.log(data);											$("#d3Area_" + this.map.id + "_" + t).empty();								combo = (cSliderValues.join("|"));								if (cSliderValues[0] == "CURRENT") {combo = cSliderValues[0]}				if (combos[combo] == undefined) {						slayers = [-1];				} else {						slayers = combos[combo];				}								this.mainLayer.setVisibleLayers(slayers)								if (combo == "CURRENT") {									$(".oChartText").hide();					$("#d3Title_" + this.map.id + "_" + t).html(" ")									h = $("#d3Area_" + this.map.id + "_" + t).height();					w = $("#d3Area_" + this.map.id + "_" + t).width() + 30;					console.log(w,h);										var margin = {top: 10, right: 30, bottom: 45, left: 170},						width = w - margin.left - margin.right,						height = h - margin.top - margin.bottom;					var x = d3.scale.linear()						.range([0, width]);					var y = d3.scale.ordinal()						.rangeRoundBands([0, height], -0.2);					var xAxis = d3.svg.axis()						.scale(x)						.orient("bottom");					var yAxis = d3.svg.axis()						.scale(y)						.orient("left")						.tickSize(0)						.tickPadding(6);											var svg = d3.select("#d3Area_" + this.map.id + "_" + t).append("svg")						.attr("width", width + margin.left + margin.right)						.attr("height", height + margin.top + margin.bottom)						.append("g")						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");					  console.log(data);					  //console.log(d3.max(data, function(d) { return d.nvalue + d.ny2080; }));					  x.domain(d3.extent(data, function(d) { return d.N_CURRENT; })).nice();					  //x.domain([Math.max(-200,d3.min(data, function(d) { return d.ny2080; })),Math.min(200,d3.max(data, function(d) { return d.ny2080; }))]).nice();					  //x.domain([Math.max(-200,d3.min(data, function(d) { return d.ny2080; })),Math.min(200,d3.max(data, function(d) { return d.ny2080; }))]).nice();					  y.domain(data.map(function(d) { return d.Name; }));					  var g = svg.selectAll(".bar")						  .data(data)						  .enter().append("g")						  						g.append("rect")						  .attr("class", function(d) { return "bar bar--current"; })						  .attr("x", function(d) { return x(0); })						  .attr("y", function(d) { return y(d.Name) + 10; })						  .attr("width", function(d) { return Math.abs(x(d.N_CURRENT) - x(0)); })						  .attr("height", y.rangeBand() - 20)						   						   						g.append("text")						  .attr("class", "label")						  .attr("x", function(d) { return x(0) + 5; })						  .attr("y", function(d) { return y(d.Name) + 25; })								.text(function(d){									return d.CURRENT + " " + d.Units.replace("</sup>","").replace("<sup>","");								}).each(function() {							//labelWidth = Math.ceil(Math.max(labelWidth, this.getBBox().width));						});																	//  svg.append("g")					//	  .attr("class", "x axis")					//	  .attr("transform", "translate(0," + height + ")")					//	  .call(xAxis);					  svg.append("g")						  .attr("class", "y axis")						  .attr("transform", "translate(" + x(0) + ",0)")						  .call(yAxis);					} else {										$(".oChartText").show();										h = $("#d3Area_" + this.map.id + "_" + t).height();					w = $("#d3Area_" + this.map.id + "_" + t).width() + 30;					console.log(w,h);					var margin = {top: 10, right: 30, bottom: 45, left: 170},						width = w - margin.left - margin.right,						height = h - margin.top - margin.bottom;					var x = d3.scale.linear()						.range([0, width]);					var y = d3.scale.ordinal()						.rangeRoundBands([0, height], -0.2);					var xAxis = d3.svg.axis()						.scale(x)						.orient("bottom");					var yAxis = d3.svg.axis()						.scale(y)						.orient("left")						.tickSize(0)						.tickPadding(6);											var svg = d3.select("#d3Area_" + this.map.id + "_" + t).append("svg")						.attr("width", width + margin.left + margin.right)						.attr("height", height + margin.top + margin.bottom)						.append("g")						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");											normalCombo = ("N_" + combo);					if (data[0][normalCombo] == undefined) {						$("#d3Title_" + this.map.id + "_" + t).html("<span class='eeLoss'>Scenario Unavailable</span>")					} else {						$("#d3Title_" + this.map.id + "_" + t).html("Hover Over Chart for Values")					}					  //console.log([Math.min(0,d3.min(data, function(d) { return d[normalCombo];})) , Math.min(200,d3.max(data, function(d) { return d[normalCombo]; }))]);					  x.domain([Math.min(-60,d3.min(data, function(d) { return d[normalCombo];})) , Math.min(200,d3.max(data, function(d) { return d[normalCombo]; }))]).nice();					  					  y.domain(data.map(function(d) { return d.Name; }));					  var g = svg.selectAll(".bar")						  .data(data)						  .enter().append("g")						  						g.append("rect")						  .attr("class", function(d) { return "bar bar--" + (d[normalCombo] < 0 ? "negative" : "positive"); })						  .attr("x", function(d) { return x(Math.min(0,+d[normalCombo])); })						  .attr("y", function(d) { return y(d.Name) + 10; })						  .attr("width", function(d) { return Math.abs(x(d[normalCombo]) - x(0)); })						  .attr("height", y.rangeBand() - 20)						  .on("mouseover", lang.hitch(this,function(d) { this.updateTitle(d,combo, t); }))						  .on("mouseout", lang.hitch(this,function(d) { $("#d3Title_" + this.map.id + "_" + t).html("Hover Over Chart for Values") }))						  .text(function(d) {							return "2";						   });						   						   						g.append("text")						  .attr("class", "label")						  //.attr("x", function(d) { return x(Math.min(180,Math.max(0,+d[normalCombo]))) + 5; })						  .attr("x", function(d) { return x(0) + 5; })						  .attr("y", function(d) { return y(d.Name) + 32; })								.text(function(d){									return ""//d[combo];								}).each(function() {							//labelWidth = Math.ceil(Math.max(labelWidth, this.getBBox().width));						});																	  svg.append("g")						  .attr("class", "x axis")						  .attr("transform", "translate(0," + height + ")")						  .call(xAxis);						  					  svg.append("g")						  .attr("class", "y axis")						  .attr("transform", "translate(" + x(Math.min(-60,d3.min(data, function(d) { return d[normalCombo]; }))) + ",0)")						  .call(yAxis);						  					  svg.append("text")						.attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor						.attr("transform", "translate("+ (width/2) +","+(height + 32)+")")  // centre below axis						.text("Percent Change from Current");												svg.append("line")							.attr("x1", x(0))							.attr("x2", x(0))							.attr("y1", 0)							.attr("y2", h - margin.top - margin.bottom)							.style("stroke", "black")							.style("stroke-dasharray", "3");										//g.append("rect")						//  .attr("class", function(d) { return "bar bar--positive"; })						//  .attr("transform", "translate(" + -20 + ")")						//  .attr("width", 10)						//  .attr("height", 10)											}								  			},  /*												svgMargin = {top: 20, right: 30, bottom: 40, left: 150},    svgWidth = 500 - svgMargin.left - svgMargin.right,    svgHeight = 500 - svgMargin.top - svgMargin.bottom;	data = this.chartData.filter(function(d) { return d.Region == selectedGeo})var width = 420,    barHeight = 20;var x = d3.scale.linear()    .range([0, svgMargin]);	var y = d3.scale.ordinal()    .rangeRoundBands([0, svgHeight], 0.2);	var chart = d3.select(".chart")    //.attr("width", width)    //.attr("height", barHeight * data.length);var bar = chart.selectAll("g")    .data(data)    .enter().append("g")//    .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });	bar.append("rect")    .attr("x", function(d) { return x(0); })     // .attr("y", function(d) { return y(d.Name) + 10; })    .attr("width", function(d) { return x(d.N_CURRENT); })    .attr("height", barHeight - 1);bar.append("text")    .attr("x", function(d) { return x(d) - 3; })    .attr("y", barHeight / 2)    .attr("dy", ".35em")    .text(function(d) { return d; });		*/		   			               deactivate: function () {			   },               hibernate: function () {				if (this.mainLayer != undefined) {					  this.map.removeLayer(this.mainLayer)				}			   },			   				initialize: function (frameworkParameters) {					declare.safeMixin(this, frameworkParameters);				    domClass.add(this.container, "claro");									    domClass.add(this.container, "plugin-eeslc");										//function type(d) {					//  console.log(d);					//  d.ncurrent = +d.CURRENT;					//  d.avalue = +d.avalue;					//  d.nvalue = d.value == 0 ? 0 : 100					//  d.lab = d.y2080;					//  d.y2080 = d.y2080 - d.value;					//  d.ny2080 = d.value == 0 ? 100 : (d.y2080 / d.value) * 100					//  console.log(d)					//  return d;					//}						this.regions = lang.clone(_ee_config.regions);					d3.csv(_eeLocalData, lang.hitch(this,function(error, data) {					  //console.log(data);					  array.forEach(data, lang.hitch(this,function(dm, d){						dm.CURRENT = +dm.CURRENT						//dm.N_LOW_2025 = dm.LOW_2025 / dm.CURRENT												keys = Object.keys(dm)						//console.log(keys);						array.forEach(keys, lang.hitch(this,function(key, k){							dm["N_" + key] = ((dm[key] - dm.CURRENT) / dm.CURRENT) * 100							if (dm["N_" + key] == Number.POSITIVE_INFINITY) {dm["N_" + key] = 999};							dm.N_CURRENT = dm.CURRENT / Math.pow(10,(("" + dm.CURRENT).length - 1));						}));						console.log(dm, d)					  }));					  //data2 = data.filter(function(d) { return d.Region == "Kiholo" });					  //console.log(data2);					  this.chartData = data;					  console.log(this.chartData);					}));										console.log("$$$");					console.log(this.regions);					  				},			     resize: function(w, h) {					    this.tabpan.resize();												position1 = $(".d3Area").position();						position2 = $("#eeFooterBox_" + this.map.id).position();												nheight = ((position2.top - position1.top) - 130);												$(".d3Area").height( nheight );												this.updateDisplay();				 				 },				//render: function() {				//					//	this.rendered = true;				//},			   showHelp: function () {			   },               getState: function () {				},               setState: function (state) {				},            subregionActivated: function(subregion) {                console.debug('now using subregion ' + subregion.display);            },            subregionDeactivated: function(subregion) {                console.debug('now leaving subregion ' + subregion.display);            }        });    });