define([
	"dojo/_base/declare", "esri/tasks/query", "esri/layers/FeatureLayer" 
],
function ( declare, Query, FeatureLayer ) {
        "use strict";

        return declare(null, { 
        	eventListeners: function(t){
        		// choose parcels by PIN
				$("#" + t.id + "ch-PIN").chosen({width:"250px"})
					.change(function(c){
						t.pinSelected = c.target.value;
						t.obj.pinSelArray.push(t.pinSelected)
						var q = new Query();
						q.where = "CRS_NAME = '" + t.obj.crsSelected + "' AND PIN = '" + t.pinSelected + "'";
						t.pinFL.selectFeatures(q,FeatureLayer.SELECTION_NEW);
						$('#' + t.id + 'ch-PIN').attr("data-placeholder", "Select More Parcels");
						$("#" + t.id + "ch-PIN option[value='" + t.pinSelected + "']").remove();
						if ($('#' + t.id + 'ch-PIN option').size() == 1){
						 	$('#' + t.id + 'ch-PIN').attr("data-placeholder", "No More Parcels");
						 	$('#' + t.id + 'ch-PIN').prop( "disabled", true );
						}	
						$('#' + t.id + 'ch-PIN').trigger("chosen:updated");
						 t.clicks.zoomSelectedClass(t)
						$('#' + t.id + 'printAnchorDiv').append(
							"<div class='pinPDFdiv zoomSelected'>" +
								t.pinSelected + ": " + 
								"<a class='pinPDFLinks' id='" + t.id + "m-" + t.pinSelected + "'>View Map</a>" +
								" | " + 
								"<a class='pinZoomLinks' id='" + t.id + "z-" + t.pinSelected + "'>Zoom</a>" +
							"</div>"
						);
						$('.pinPDFLinks').on('click',function(e){
							t.clicks.zoomSelectedClass(t, e.currentTarget.parentElement)
							var pin = e.currentTarget.id.substring(e.currentTarget.id.indexOf('-')+1)
							window.open("http://crs-maps.coastalresilience.org/" + t.obj.crsNoSpace + "_" + pin + ".pdf", "_blank");
						});	
						$('.pinZoomLinks').on('click', function(e){
							t.pinTracker = "yes"
							var pin = e.currentTarget.id.substring(e.currentTarget.id.indexOf('-')+1);
							var q = new Query();
							q.where = "CRS_NAME = '" + t.obj.crsSelected + "' AND PIN = '" + pin + "'";
							t.pinFL.selectFeatures(q,FeatureLayer.SELECTION_NEW);	
							t.clicks.zoomSelectedClass(t, e.currentTarget.parentElement)
						});
					});
        	}
        });
    }
 ) 		