define([
	"dojo/_base/declare", "esri/tasks/query", "esri/tasks/QueryTask", "esri/layers/FeatureLayer",
	"esri/layers/ArcGISDynamicMapServiceLayer"
],
function ( declare, Query, QueryTask, FeatureLayer, ArcGISDynamicMapServiceLayer) {
	"use strict";

	return declare(null, { 
		appSetup: function(t){
			t.url = "http://services.coastalresilience.org/arcgis/rest/services/Hawaii/EESLR/MapServer"
			t.dynamicLayer = new ArcGISDynamicMapServiceLayer(t.url);
			t.map.addLayer(t.dynamicLayer);
			t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
			t.dynamicLayer.on("load", function () {
				t.layersArray = t.dynamicLayer.layerInfos;
				$("#" + t.id + t.obj.flooding).prop('checked',true);
				$("#" + t.id + t.obj.year).prop('checked',true);
				$("#" + t.id + t.obj.pools).prop('checked',true);
				// create and add ref layers
				t.refLayer = new ArcGISDynamicMapServiceLayer(t.url, {opacity:0.6});
				t.map.addLayer(t.refLayer);
				t.refLayer.setVisibleLayers([-1]);
				t.refLayer.on("update",function() {
					if ( t.obj.refLayers.length == 0 ){
						setTimeout(function () { $("#legend-container-0").hide() }, 250);
					}
				})
				t.refLayer.on("load",function() {
					t.clicks.eventListeners(t);
					// Save and Share Handler					
					if (t.obj.stateSet == "yes"){
						$("#" + t.id + "topSelect").val(t.obj.topVal).trigger("chosen:updated").trigger("change");
						// pools visible
						if (!t.obj.poolsToggle){
							$("#" + t.id + "poolsToggle").trigger("click")
						}
						if ( t.obj.floodLayersOn == "yes" ){
							$("#" + t.id + "flooding-cb").trigger("click");
						}
						if ( t.obj.refNames.length > 0 ){
							$("#" + t.id + "reference-cb").trigger("click");
							t.obj.refLayers = [];
							$.each(t.obj.refNames,function(i,v){
								$("#" + t.id + "reference-wrap input[value='" + v +"']").trigger("click");
							})
						}
						//extent
						var extent = new Extent(t.obj.extent.xmin, t.obj.extent.ymin, t.obj.extent.xmax, t.obj.extent.ymax, new SpatialReference({ wkid:4326 }))
						t.map.setExtent(extent, true);
						t.obj.stateSet = "no";
					}else{
						$("#show-single-plugin-mode-help").trigger("click")
					}
				});		
			});	
			// hide legend if reference layers are not on
			t.dynamicLayer.on("update",function() {
				if (t.obj.refLayers.length == 0){
					setTimeout(function () { $("#legend-container-0").hide() }, 250);
				}
			})
			// Grab reference layer legend for print
			var url = t.url + "/legend";  
			var requestHandle = esri.request({  
				"url": url,  
			    "content": {  
			    	"f": "json"  
				},  
			  	"callbackParamName": "callback"  
			 });  
			 requestHandle.then(function(legendArray){
			 	t.legendArray = legendArray.layers;
			 }, function(x){console.log("legend query failed")});			
		},
		eventListeners: function(t){
			// top chosen menu
			$("#" + t.id + "topSelect").chosen({disable_search: true, allow_single_deselect:false, width:"90%"})
				.change(function(c){
					// create and add flood layer
					t.floodLayer = new ArcGISDynamicMapServiceLayer(t.url, {opacity:0.6});
					t.map.addLayer(t.floodLayer);
					t.floodLayer.setVisibleLayers(t.obj.floodLayers);
					var v = c.target.value;
					t.selTop =  $("#" + t.id + "topSelect option:selected").text() 
					t.selOptGroup = $(c.currentTarget.options[c.currentTarget.selectedIndex]).closest('optgroup').prop('label');
					$(".vs-wrap").slideDown();
					$(".box-wrap").show();
					t.clicks.getValues(t);
					t.map.on("extent-change",function(){
						t.clicks.getValues(t);
						var scale = t.map.getScale();
						if ( scale < 17000 ){
							$("#" + t.exPoolID).show();
						}else{
							$("#" + t.exPoolID).hide();
						}
					})
				});
			// Show Pools
			$("#" + t.id + "poolsToggle").click(function(c){
				if (c.currentTarget.checked){
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					t.obj.poolsToggle = true;
				}else{
					t.dynamicLayer.setVisibleLayers([-1]);
					t.obj.poolsToggle = false;
				}
			})
			// Bar chart
			// symbolize x-axis
			var l = $('.vertAndLines').find('.dashedLines');  
			$.each(l, function(i,v){
				if (i == l.length - 1){
					$(v).css({'opacity': '1', 'border-top': '2px solid #3d3d3d'})
				}
			})
			// calculate width of bars
			var bars = $('.barHolder').find('.sumBarsWrap');
			var lw = $('.dashedLines').css('width').slice(0,-2)
			var sLw = lw/bars.length;
			var bWw = sLw - 4;
			$('.smallLabels').css('width', sLw + 'px')
			$('.sumBarsWrap').css('width', bWw + 'px')
			$('.sumBars').css('width', bWw-20 + 'px')	
			
			// info clicks	
			$(".h3InfoIcon").click(function(c){
				$(c.currentTarget).hide();
				$(c.currentTarget).parent().find(".hideH3InfoIcon").css("display","inline-block")
				$(c.currentTarget).parent().next().slideDown();
			});	
			$(".hideH3InfoIcon").click(function(c){
				$(c.currentTarget).hide();
				$(c.currentTarget).parent().find(".h3InfoIcon").css("display","inline-block")
				$(c.currentTarget).parent().next().slideUp();
			});				

			// Toggle button clicks
			$(".vs-wrap .toggle-btn input").click(function(c){
				t.clicks.getValues(t);
			})

			// Show Flooding Layer Checkbox
			$("#" + t.id + "flooding-cb").click(function(c){
				if ( c.currentTarget.checked ){
					$("#" + t.id + "flooding-wrap").slideDown();
					$("#" + t.id + "legend-wrap").show();
					$("#" + t.id + "controls-both").css("display","inline");
					t.obj.floodLayersOn = "yes";
					t.clicks.getValues(t);
				}else{
					$("#" + t.id + "flooding-wrap").slideUp();
					$("#" + t.id + "legend-wrap").hide();
					$("#" + t.id + "controls-both").hide();
					t.obj.floodLayersOn = "no";
					t.obj.floodLayers = [];
					t.floodLayer.setVisibleLayers(t.obj.floodLayers);
				}
			})

			// summary and methods buttons
			$("#" + t.id + "summary").click(function(){
				window.open("http://media.coastalresilience.org/HI/EESLC_Summary.pdf")
			})
			$("#" + t.id + "methods").click(function(){
				window.open("http://media.coastalresilience.org/HI/EESLC_Methods.pdf")
			})	

			// Set up audio portion
			t.clicks.startAudio(t);

			// show/hide reference layers
			$("#" + t.id + "reference-cb").click(function(c){
				if ( c.currentTarget.checked ){
					$("#" + t.id + "reference-wrap").slideDown();
				}else{
					$("#" + t.id + "reference-wrap").slideUp();
					$("#" + t.id + "reference-wrap input").each(function(i,v){
						if ( $("#" + v.id).is(":checked") ){
							$("#" + v.id).trigger("click")
						}
					})
				}
			})
			$("#" + t.id + "reference-wrap input").click(function(c){
				var lid = -1;
				$.each(t.layersArray,function(i,v){
					if ( v.name == c.currentTarget.value){
						lid = v.id;
					}
				})
				var i1 = t.obj.refNames.indexOf(c.currentTarget.value)
				if ( c.currentTarget.checked ){
					t.obj.refLayers.push(lid)
					if (i1 == -1){
						t.obj.refNames.push(c.currentTarget.value)
					}
				}else{
					var index = t.obj.refLayers.indexOf(lid)
					if ( index > -1 ){
						t.obj.refLayers.splice(index,1)
					}
					if (i1 > -1){
						t.obj.refNames.splice(i1,1)
					}
				}
				t.refLayer.setVisibleLayers(t.obj.refLayers);
			})
		},
		getValues: function(t){
			// get chosen menu value
			t.obj.topVal = $("#" + t.id + "topSelect").chosen().val()
			// find selected radio in each toggle button group - the array is of class names of each tb wrapper div
			var tb = ["flooding", "year", "pools"]
			$.each(tb,function(x,y){
				$(".vs-wrap ." + y + " input").each(function(i,v){
					$(v).prop("disabled", false);
					if ( $(v).is(':checked') ) {
						t.obj[y] = v.value;
					}
				})
			})
			if (t.obj.pools == "Future"){
				$("#" + t.id + "Current").prop("disabled", true);
			}
			if (t.obj.year == "Current"){
				$("#" + t.id + "Future").prop("disabled", true);
			}
			// use value to determine which pool and flood layers to show
			t.obj.visibleLayers = [];
			t.obj.floodLayers = [];
			var lyrNm = "_" + t.obj.year + "_" + t.obj.topVal;
			var fldNm = "_" + t.obj.year + "_" + t.obj.flooding;
			$.each(t.layersArray,function(i,v){
				if ( v.name.startsWith(lyrNm) ){
					t.obj.visibleLayers.push(v.id)
				}
				if ( v.name.startsWith(fldNm) ){
					t.obj.floodLayers.push(v.id)
				}
			})
			$.each(t.layersArray,function(i,v){
				if ( v.name == "Data Removed by Landowner Request"){
					t.obj.visibleLayers.push(v.id)
				}
			})
			// set where clause for layer definition and query for graph
			var w = "EXISTING > -1";
			if ( t.obj.pools == "Existing" ){
				w = "EXISTING = 1";
			}
			if ( t.obj.pools == "Future" ){
				w = "EXISTING = 0"
			}
			t.layerDefs = [];
			t.layerDefs[t.obj.visibleLayers[0]] = w;
			t.layerDefs[t.obj.visibleLayers[1]] = w;
			t.dynamicLayer.setLayerDefinitions(t.layerDefs);
			// handle poolsToggle checkbox status
			if (t.obj.poolsToggle){
				t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
			}else{
				t.dynamicLayer.setVisibleLayers([-1])
			}
			if (t.obj.floodLayersOn == "no"){
				t.obj.floodLayers = [];
			}
			t.floodLayer.setVisibleLayers(t.obj.floodLayers);
			// run query to update graph
			var q = new Query();
			var qt = new QueryTask(t.url + "/" + t.obj.visibleLayers[0]);
			q.where = w;
			q.geometry = t.map.extent;
			q.returnGeometry = false;
			q.outFields = ["*"];
			// field name and bar graph colors if Restore or Protect is selected
			var field = t.obj.topVal
			var colors = ['#fff74c','#b7ca79','#677e52','#b2b2b2']
			$("#" + t.id + "xLabel").html("Solution Potential")
			// field name and bar graph colors if Risk Variables are selected
			if (t.obj.topVal.indexOf("_") > -1){
				field = t.obj.topVal.split(/_(.+)/)[1]
				colors = ['#fff74c','#ed9a50','#e74949','#b2b2b2']
				$("#" + t.id + "xLabel").html("Risk Potential")
			} 
			qt.execute(q, function(e){
				// get graph values
				var low = 0;
				var med = 0;
				var hig = 0;
				var und = 0;
				$.each(e.features, function(i,v){
					if ( v.attributes[field] == 0 ){
						low = low + 1;
					}
					if ( v.attributes[field] == 20 ){
						med = med + 1;
					}
					if ( v.attributes[field] == 40 ){
						hig = hig + 1;
					}
					if ( v.attributes[field] == 255 ){
						und = und + 1;
					}
				})
				var a = [low, med, hig, und]
				// update bar graph
				$('.barHolder').find('.sumBars').each(function(i,v){
					$(v).css("background-color", colors[i]);
					var h = Math.round(a[i]/1200*100)
					$(v).animate({ height: h + '%'});
					$(v).find(".barLabel").html( t.clicks.numberWithCommas(a[i]) )
				});	
			});
		},
		startAudio: function(t){
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
			
			t.audios[4].addEventListener("ended", function() {t.audios[3].play();});
			t.audios[3].addEventListener("ended", function() {t.audios[5].play();});
			t.audios[5].addEventListener("ended", function() {t.audios[6].play();});
			t.audios[6].addEventListener("ended", function() {t.audios[10].play();});
			
			t.audios[10].addEventListener("ended", function() {t.audios[11].play();});
			t.audios[11].addEventListener("ended", function() {t.audios[12].play();});
			t.audios[12].addEventListener("ended", function() {t.clicks.resetAudios(t);});
			
			t.audios[8].addEventListener("ended", function() {t.audios[9].play()});
			t.audios[9].addEventListener("ended", function() {t.clicks.resetAudios(t)});
			
			var resetAudios = function() {
				$.each(t.audios, function(i,v) {var temps = v.src;v.pause();v.currentTime = 0; v.src = "temp";v.src = temps });
			}
			// Sound section clicks
			$('.eeslr-volume').on('click',function(c){
				var tid = c.target.id.replace(t.id,"");
				if (tid == "sound1") {if (t.audios[0].duration > 0 && !t.audios[0].paused) {t.clicks.resetAudios(t)} else {t.clicks.resetAudios(t); t.audios[0].play(); $(c.target).removeClass("fa-volume-off");$(c.target).addClass("fa-volume-up");}}
				if (tid == "sound2") { if (t.audios[0].duration > 0 && !t.audios[4].paused) { t.clicks.resetAudios(t) }else { t.clicks.resetAudios(t); t.audios[4].play(); $(c.target).removeClass("fa-volume-off"); $(c.target).addClass("fa-volume-up");}}
				if (tid == "sound4") {if (t.audios[0].duration > 0 && !t.audios[8].paused) {t.clicks.resetAudios(t)} else {t.clicks.resetAudios(t); t.audios[8].play(); $(c.target).removeClass("fa-volume-off");$(c.target).addClass("fa-volume-up");}}
				t.lastAudio = tid;
			});
		},
		resetAudios: function(t) {
			$.each(t.audios, function(i,v) {var temps = v.src;v.pause();v.currentTime = 0; v.src = "temp";v.src = temps });
			$('.volumneicons').removeClass("fa-volume-up").addClass("fa-volume-off");
		},
		numberWithCommas: function(x){
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}
    });
});
