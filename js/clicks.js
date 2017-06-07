define([
	"dojo/_base/declare", 
	"esri/tasks/query", 
	"esri/tasks/QueryTask", 
	"esri/layers/FeatureLayer",
	"esri/layers/ArcGISDynamicMapServiceLayer",
	"dojo/_base/array",
	"d3",
	"../js/AgsDrawPolygon"	
],
function ( 
	declare, 
	Query, 
	QueryTask, 
	FeatureLayer,
	ArcGISDynamicMapServiceLayer,
	array,
	d3,
	AgsDrawPolygon		   
		   ) {
        "use strict";

        return declare(null, { 
			appSetup: function(t){

					t.agsDrawPolygon = new AgsDrawPolygon({
						map: t.map
					});

					t.agsDrawPolygon.initialize();
					
					t.infoid = ""
					t.agsDrawPolygon.on("drawend", function(geo) {t.clicks.modifyFilter(geo,t)});
					
			},
			eventListeners: function(t){
				
				//select proper items based on obj
				if (t.obj.showFlood == true) {$("#" + t.id + "showFlood").trigger('click')};
				$("#" + t.id + t.obj.flooding).trigger('click');
				$("#" + t.id + t.obj.year).trigger('click');
				$("#" + t.id + t.obj.pools).trigger('click');
				
				$("#" + t.id + "Risk").val(t.obj.risk);
				$("#" + t.id + "Risk").trigger("chosen:updated");
				
				$("#" + t.id + "Solution").val(t.obj.solution);
				$("#" + t.id + "Solution").trigger("chosen:updated");
				
				$("#" + t.id + t.obj.box).removeClass( "eeChooserBoxUnSelect" );
				$("#" + t.id + t.obj.box).addClass( "eeChooserBox" );
				
				// setup sounds      
				var audio1 = new Audio("http://media.coastalresilience.org/HI/EESLC_Narration/Audio_Icon_1/1.mp3");
				var audio2 = new Audio("http://media.coastalresilience.org/HI/EESLC_Narration/Audio_Icon_1/2.mp3");
				var audio3 = new Audio("http://media.coastalresilience.org/HI/EESLC_Narration/Audio_Icon_1/3.mp3");
				
				var audio4 = new Audio("http://media.coastalresilience.org/HI/EESLC_Narration/Audio_Icon_2/4.mp3");
				var audio5 = new Audio("http://media.coastalresilience.org/HI/EESLC_Narration/Audio_Icon_2/5.mp3");
				var audio6 = new Audio("http://media.coastalresilience.org/HI/EESLC_Narration/Audio_Icon_2/6.mp3");
				var audio7 = new Audio("http://media.coastalresilience.org/HI/EESLC_Narration/Audio_Icon_2/7.mp3");
				
				var audio8 = new Audio("http://media.coastalresilience.org/HI/EESLC_Narration/Audio_Icon_3/8.mp3");
				var audio9 = new Audio("http://media.coastalresilience.org/HI/EESLC_Narration/Audio_Icon_3/9.mp3");
				var audio10 = new Audio("http://media.coastalresilience.org/HI/EESLC_Narration/Audio_Icon_3/10.mp3");
				var audio11 = new Audio("http://media.coastalresilience.org/HI/EESLC_Narration/Audio_Icon_3/11.mp3");
				var audio12 = new Audio("http://media.coastalresilience.org/HI/EESLC_Narration/Audio_Icon_3/12.mp3");
				var audio13 = new Audio("http://media.coastalresilience.org/HI/EESLC_Narration/Audio_Icon_3/13.mp3");
				
				t.audios = new Array(audio1,audio2,audio3,audio4,audio5,audio6,audio7,audio8,audio9,audio10,audio11,audio12,audio13);
				
				t.audios[0].addEventListener("ended", function() {t.audios[1].play()});
				t.audios[1].addEventListener("ended", function() {t.audios[2].play()});
				t.audios[2].addEventListener("ended", function() {t.clicks.resetAudios(t)});
				
				t.audios[4].addEventListener("ended", function() {t.audios[3].play()});
				t.audios[3].addEventListener("ended", function() {t.audios[5].play()});
				t.audios[5].addEventListener("ended", function() {t.audios[6].play()});
				t.audios[6].addEventListener("ended", function() {t.clicks.resetAudios(t)});
				
				t.audios[10].addEventListener("ended", function() {t.audios[11].play()});
				t.audios[11].addEventListener("ended", function() {t.audios[12].play()});
				t.audios[12].addEventListener("ended", function() {t.clicks.resetAudios(t)});
				
				t.audios[8].addEventListener("ended", function() {t.audios[9].play()});
				t.audios[9].addEventListener("ended", function() {t.clicks.resetAudios(t)});
				
				var resetAudios = function() {
					$.each(t.audios, function(i,v) {var temps = v.src;v.pause();v.currentTime = 0; v.src = "temp";v.src = temps });
				}
				
				//Infographic Popup
				$("#" + t.id + "viewInfoGraphic").on('click',function(c){
					TINY.box.show({
						animate: true, url: 'plugins/ecological-effects-slc/html/info-graphic.html',
						fixed: true, width: 660, height: 570
					});		
				})
				// Sound section clicks
				$('.eeslr-volume').on('click',function(c){
					var tid = c.target.id.replace(t.id,"");
					//console.log($(c.target.id));
					if (tid == "sound1") {if (t.audios[0].duration > 0 && !t.audios[0].paused) {t.clicks.resetAudios(t)} else {t.clicks.resetAudios(t); t.audios[0].play(); $(c.target).removeClass("fa-volume-off");$(c.target).addClass("fa-volume-up");}};
					if (tid == "sound2") {if (t.audios[0].duration > 0 && !t.audios[4].paused) {t.clicks.resetAudios(t)} else {t.clicks.resetAudios(t); t.audios[4].play(); $(c.target).removeClass("fa-volume-off");$(c.target).addClass("fa-volume-up");}};
					if (tid == "sound3") {if (t.audios[0].duration > 0 && !t.audios[10].paused) {t.clicks.resetAudios(t)} else {t.clicks.resetAudios(t); t.audios[10].play(); $(c.target).removeClass("fa-volume-off");$(c.target).addClass("fa-volume-up");}};
					if (tid == "sound4") {if (t.audios[0].duration > 0 && !t.audios[8].paused) {t.clicks.resetAudios(t)} else {t.clicks.resetAudios(t); t.audios[8].play(); $(c.target).removeClass("fa-volume-off");$(c.target).addClass("fa-volume-up");}};
					t.lastAudio = tid;
				});
				// Infographic section clicks
				$('.eeslr-infobuttonhandle').on('click',function(c){
					t.infoid = c.target.id.split("-").pop();
					$("#" + t.id + "dfe4").trigger('click');
				});
				// tab button listener
				$( "#" + t.id + "tabBtns input").on('click',function(c){
					t.obj.active = c.target.value;
					$.each($("#" + t.id + " .eeslr-sections"),function(i,v){
						if (v.id != t.id + t.obj.active){
							$("#"+ v.id).slideUp();
						} else {
						   $("#" + t.id + t.obj.active).slideDown(400)
						}
					});
					if (t.obj.active == "showInfo"){
						$("#" + t.id + t.obj.active).slideDown(400, function(){
							if (t.infoid.length != 0){
								document.getElementById(t.id + t.infoid).scrollIntoView(false)
								$("." + t.infoid).animate({backgroundColor:"#f3f315"}, 1250, function(){
									$("." + t.infoid).animate({backgroundColor:"#ffffff"}, 1250, function(){
										t.infoid = "";
									});
								});
							}
						});						
					}else{
						//if (t.obj.crsSelected.length > 0){
						//	t.clicks[t.obj.active](t);
						//}
					}
				})
				// slider and pill clicks
				$( '.toggle-btn input' ).click(function(c){
					t.obj[c.target.name] = c.target.value;
					t.clicks.updateTodas(t);
				});
				
				$('.eechooser').on('change', function(c, params) {
					var tid = c.target.id.replace(t.id,"").toLowerCase();
					t.obj[tid] = c.target.value;
					t.clicks.updateTodas(t);
				 });
				
				$('.eeChoosers').click(function(c){
					if ( c.target.id == "") {activeBox = ($(c.target).parent().parent().parent().parent()[0].id)} else {
						var activeBox = c.target.id;
					}
				
					var tid = activeBox.replace(t.id,"");
					
					if (tid != "") {
					
						t.obj.box = tid;
						
						if (tid == "RiskBox") {
							var inactiveBox = activeBox.replace("Risk","Solution");
						} else {
							var inactiveBox = activeBox.replace("Solution","Risk");
						}
						
						$("#" + activeBox).animate({backgroundColor:"#0096d6",color:"#fff"}, 400, function(){
							$( "#" + activeBox ).removeClass( "eeChooserBoxUnSelect" );
							$( "#" + activeBox ).addClass( "eeChooserBox" );							
						});

						$("#" + inactiveBox).animate({backgroundColor:"#ccc",color:"#888"}, 400, function(){
							$( "#" + inactiveBox ).removeClass( "eeChooserBox" );
							$( "#" + inactiveBox ).addClass( "eeChooserBoxUnSelect" );	
						});					
				
						t.clicks.updateTodas(t);
					}

				});
				
				//Create a custom area but clicking button
				$('#' + t.id + 'customAreaButton').on('click', function(c, params) {

					$('#' + t.id + 'customAreaButton').hide();
					$('#' + t.id + 'clearcustomAreaButton').show();
					t.agsDrawPolygon.deactivate();
					t.agsDrawPolygon.activate();
					
				 });
				
				//clear the custom area				
				$('#' + t.id + 'clearcustomAreaButton').on('click', function(c, params) {
				
					t.obj.clip = ""
					
					t.agsDrawPolygon.deactivate();
					t.agsDrawPolygon.reset();
					
					//t.chartData = dojo.clone(this.chartDataOrg);
					//this.updateDisplay();
				
					$('#' + t.id + 'customAreaButton').show();
					$('#' + t.id + 'clearcustomAreaButton').hide();
					
					t.clicks.updateTodas(t);
					
				 });
				
				//select the proper tab on startup
				$("#" + t.id + t.obj.active).trigger('click');
				
				$('#' + t.id + 'caveat').hide();
				t.map.on("zoom-end", function() {if (t.map.getScale() < 10000) {$('#' + t.id + 'caveat').show();} else {$('#' + t.id + 'caveat').hide();};if(t.open == "yes") {t.clicks.updateTodas(t)}});

				$("#" + t.id + "showFlood").change(function() {
					if(this.checked) {
						t.obj.showFlood = true;
					} else {
						t.obj.showFlood = false;
					}
					t.clicks.updateTodas(t);
				});
				
	
				$("#" + t.id + "transSlider").slider({ min: 0, max: 100, value: t.obj.trans,  change: function(e, ui) {t.obj.trans = ui.value; t.clicks.doTrans(t);}})
			
				$("#" + t.id + "methods").on('click', function(c, params) {
					window.open('http://media.coastalresilience.org/HI/EESLC_Methods.pdf','_newtab');
				});
			},

			doTrans: function(t) {
				
				if (t.poolsLayer != undefined) {t.poolsLayer.setOpacity(t.obj.trans / 100.0)};					
				
			},
			
			resetAudios: function(t) {
				$.each(t.audios, function(i,v) {var temps = v.src;v.pause();v.currentTime = 0; v.src = "temp";v.src = temps });
				$('.volumneicons').removeClass("fa-volume-up").addClass("fa-volume-off");
			},
			
			updateTodas: function(t) {
				console.log(t.obj);
				console.log(t.combos.url);

				if (t.featureLayerPoints != undefined) {t.map.removeLayer(t.featureLayerPoints)};
				if (t.featureLayerPolygons != undefined) {t.map.removeLayer(t.featureLayerPolygons)};
				
				var fname = t.obj[t.obj.box.replace("Box","").toLowerCase()] ;
				console.log(fname);
				
				var featuresCombo = t.obj.year + "|" + fname;
				var featureNumbers = t.combos[featuresCombo];

				var query = new Query();
				if (t.obj.pools == "All") {
					query.where = "EXISTING > -1"
				} else if (t.obj.pools == "Existing") {
					query.where = "EXISTING = 1"
				} else {
					query.where = "EXISTING = 0"
				}

				if (t.obj.clip != "") {
					query.geometry = t.obj.clip;
				}
				
				/*
				var infoTemplate = new esri.InfoTemplate("${FINAL}", "${FINAL}");
				t.featureLayerPoints = new FeatureLayer(t.combos.url + "//" + featureNumbers[0], {
						infoTemplate: infoTemplate,
						mode: FeatureLayer.MODE_SELECTION,
						outFields: ["*"]
					});
				
				t.featureLayerPoints.setDefinitionExpression(equery.where);
				t.map.addLayer(t.featureLayerPoints);
				
				t.featureLayerPoints.selectFeatures(equery, FeatureLayer.SELECTION_NEW, function(e) {t.clicks.updateChart(e,t,fname);});
				
				var infoTemplate = new esri.InfoTemplate("${FINAL}", "${FINAL}");
				t.featureLayerPolygons = new FeatureLayer(t.combos.url + "//" + featureNumbers[1], {
						infoTemplate: infoTemplate,
						mode: FeatureLayer.MODE_SELECTION,
						outFields: ["*"]
					});
				
				t.featureLayerPolygons.setDefinitionExpression(equery.where);
				t.map.addLayer(t.featureLayerPolygons);
				
				t.featureLayerPolygons.selectFeatures(equery, FeatureLayer.SELECTION_NEW, function(e) {});
				*/

				if (t.poolsLayer == undefined) {
					t.poolsLayer = new ArcGISDynamicMapServiceLayer(t.combos.url,{
						useMapImage: true
						}
					  );
				  t.poolsLayer.setVisibleLayers(featureNumbers)
				  t.map.addLayer(t.poolsLayer);	
				}
				
				t.poolsLayer.setVisibleLayers(featureNumbers)
				
				if (t.obj.year == "Recent") {var oidf = "OBJECTID"} else {var oidf = "OBJECTID_1"}				
				var queryTask = new QueryTask(t.combos.url + "//" + featureNumbers[0]);
				//var query = new Query();
				query.outFields = [oidf + "," + fname];
				query.returnGeometry = false;
				queryTask.on("complete", function(d) {t.clicks.updateChart(d,t,fname, query.where, featureNumbers)});
				//queryTask.on("error", queryTaskErrorHandler);
				queryTask.execute(query);				


				if (t.floodLayer == undefined) {
					t.floodLayer = new ArcGISDynamicMapServiceLayer(t.combos.url,{
						useMapImage: true
						}
					  );
				t.floodLayer.setVisibleLayers([-1])
				t.map.addLayer(t.floodLayer);	
				}

				if (t.obj.showFlood == true) {
					var layersCombo = t.obj.year + "|" + t.obj.flooding;
					var layerNumbers = t.combos[layersCombo];
					
					t.floodLayer.setVisibleLayers(layerNumbers)
					t.floodLayer.show()
					t.legendContainer.innerHTML = "Likelihood of flooding<br><svg width='25' height='17'><rect width='25' height='17' style='fill:rgb(51, 77, 92);stroke-width:3;stroke:rgb(51, 77, 92)' /></svg> Higher<br><svg width='25' height='17'><rect width='25' height='17' style='fill:rgb(69, 178, 157);stroke-width:3;stroke:rgb(69, 178, 157)' /></svg> Lower"
				} else {
					t.floodLayer.hide()
					t.legendContainer.innerHTML = ""
				}
			
				t.clicks.doTrans(t);
				
			},
	
			modifyFilter: function(geo, t) {
			   
				t.obj.clip = geo.shape;
				t.clicks.updateTodas(t);			

			},
			
			
			queryTaskExecuteCompleteHandler: function(data) {
				console.log(data);
			},
			
			
			
			updateChart: function(d, t, cField, owhere, featureNumbers) {
				if (t.obj.year == "Recent") {var oidf = "OBJECTID"} else {var oidf = "OBJECTID_1"}
				var indata = d.featureSet.features
				console.log(indata)
				$('#' + t.id + 'd3Area').empty();
				
				//alert(cField);
				console.log(indata.length);
				
				//LMH = {"Low":0,"Medium":0,"High":0} 
				
				if (t.obj.box == "RiskBox") {
					var LMH = [{letter: "Low", frequency: 0, color:"yellow"},{letter: "Medium", frequency: 0, color: "orange"},{letter: "High", frequency: 0, color:"red"},{letter: "Unknown", frequency: 0, color:"#999"}]
				} else {
					var LMH = [{letter: "Low", frequency: 0, color:"yellow"},{letter: "Medium", frequency: 0, color: "#b8ca7a"},{letter: "High", frequency: 0, color:"#667e53"},{letter: "Unknown", frequency: 0, color:"#999"}]
				}
				
				var dataN = indata.length
				var other = 0;
				
				var allids = new Array()
				array.forEach(indata, function(feat, f){
					allids.push(feat.attributes[oidf])
					var fValue = feat.attributes[cField];
					if (cField == "FINAL") {
						if (fValue <= 20) {
							console.log("Low");
							LMH[0].frequency = LMH[0].frequency + 1;
						} else if (fValue <= 60) {
							console.log("Medium");
							LMH[1].frequency = LMH[1].frequency + 1;
						} else {
							console.log("High");
							LMH[2].frequency = LMH[2].frequency + 1;
						}
					} else {
						if (fValue == 0) {
							console.log("Low");
							LMH[0].frequency = LMH[0].frequency + 1;
						} else if (fValue == 20) {
							console.log("Medium");
							LMH[1].frequency = LMH[1].frequency + 1;
						} else if (fValue == 40) {
							console.log("High");
							LMH[2].frequency = LMH[2].frequency + 1;
						} else {
							LMH[3].frequency = LMH[3].frequency + 1;
							other = other + 1;
						}
					}
				});
				
				//console.log(allids);
				var layerDefinitions = [];
				
				if (t.obj.pools == "All") {
					var polyQ = "EXISTING = 0"
				} else if (t.obj.pools == "Existing") {
					var polyQ = "EXISTING < 0"
				} else {
					var polyQ = "EXISTING = 0"
				}
					
				if (t.obj.clip == "") {

					layerDefinitions[featureNumbers[0]] = owhere;
					layerDefinitions[featureNumbers[1]] = polyQ;
					t.poolsLayer.setLayerDefinitions(layerDefinitions);
				
				} else {
					
					var allid = allids.join(" OR " + oidf + " = ");
					var outq = "(" + owhere + ") AND (" + oidf + " = " + allid + ")"
					var PolyQoutq = "(" + polyQ + ") AND (" + oidf + " = " + allid + ")"
					//console.log(outq);
					layerDefinitions[featureNumbers[0]] = outq;
					layerDefinitions[featureNumbers[1]] = PolyQoutq;
					t.poolsLayer.setLayerDefinitions(layerDefinitions);					
				}
				
				t.poolsLayer.setVisibleLayers(featureNumbers);
		
				$('#' + t.id + 'd3Title').hide();
				
				var h = $('#' + t.id + 'd3Area').height();
				var w = $('#' + t.id + 'd3Area').width();
				console.log(w,h);

				$('#' + t.id + 'd3Area').empty();

				var margin = {top: 20, right: 20, bottom: 50, left: 50}
				
				t.chart = d3.select('#' + t.id + 'd3Area').append("svg")
					
					t.chart.style("width", w)
					t.chart.style("height", h);
					
					var width = w - margin.left - margin.right,
					height = h - margin.top - margin.bottom;

				var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
					y = d3.scaleLinear().rangeRound([height, 0]);

				var g = t.chart.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				  var data = LMH;

				  console.log(data);
				  x.domain(data.map(function(d) { return d.letter; }));
				  y.domain([0, dataN]);

				  g.append("g")
					  .attr("class", "axis axis--x")
					  .attr("transform", "translate(0," + height + ")")
					  .call(d3.axisBottom(x));

				  t.chart.select(".y.axis").remove();

				  g.append("g")
					  .attr("class", "axis axis--y")
					  .call(d3.axisLeft(y).ticks(10))
					.append("text")
					  .attr("transform", "rotate(-90)")
					  .attr("y", 6)
					  .attr("dy", "0.71em")
					  .attr("text-anchor", "end")
					  .text("Frequency");

				  g.selectAll(".bar")
					.data(data)
					.enter().append("rect")
					  .attr("class", "bar")
					  .attr("fill", function(d) {
						return d.color;
					  })
					  .attr("x", function(d) { return x(d.letter); })
					  .attr("y", function(d) { return y(d.frequency); })
					  .attr("width", x.bandwidth())
					  .attr("height", function(d) { return height - y(d.frequency); });
					  
				  g.selectAll("text.bar")
					  .data(data)
					  .enter().append("text")
					  .attr("class", "bar")
					  .attr("text-anchor", "middle")
					  .attr("x", function(d) { return x(d.letter) + 48; })
					  .attr("y", function(d) { return y(d.frequency) - 10; })
					  .text(function(d) { return d.frequency; });

				  g.append("text")
					.attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
					.attr("transform", "translate("+ (width/2) +","+(height-10+(margin.bottom))+")")  // centre below axis
					.text(t.obj.box.replace("Box", "") + " Potential");

				  g.append("text")
					.attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
					.attr("transform", "translate("+ (15 - margin.left) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
					.text("Number of Pools");
/*
				if (other > 0) {
					  g.append("text")
						.attr("text-anchor", "left")  // this makes it easy to centre the text as the transform is applied to the anchor
						.attr("transform", "translate("+ (35) +","+(height-10+(margin.bottom))+")")  // centre below axis
						.text(other + " Pools with Unknown Value");	

					  g.append("svg:rect").
						attr("fill", "#ddd").
						attr("x", 0).
						attr("y", (height-22+(margin.bottom))).
						attr("height", 15).
						attr("width", 25);	
				}
*/					
			},
			
			showInfo: function(t){
				
			},
			
			numberWithCommas: function(x){
				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			}
        });
    }
);
