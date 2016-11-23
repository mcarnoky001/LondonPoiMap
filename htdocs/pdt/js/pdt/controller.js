'use strict';
var radius = 100;
mapboxgl.accessToken = 'pk.eyJ1IjoibWFqb2MxMjMiLCJhIjoiY2l1aGViY2V6MDA1NzJ6b2dxMmhqNzNjciJ9.0oqSP023dVB0CuoL2jQgEg';
var path = require('path');
var template = require('lodash.template');

var pathToFile = path.join(__dirname, 'listing.html');

var fs = require('fs');
var file = fs.readFileSync(__dirname + '/listing.html', 'utf8');

var listingTemplate = template(file);
 

	var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/majoc123/civu62vv1004y2krhy1jeka2o', //stylesheet location
    center: [-0.12801291382615432, 51.509375139851585], // starting position
    zoom: 15 // starting zoom
	});

var dataStyle = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/style.json'), 'utf8'));	

$( function() {
    $( "#slider-range-max" ).slider({
      range: "max",
      min: 3,
      max: 13,
      value: 3,
      slide: function( event, ui ) {
		  radiusInMeters = ui.value * 100;
		  map.setPaintProperty('circle500', 'circle-radius',{
								stops: [
								[0, 0],
								[20, metersToPixelsAtMaxZoom(radiusInMeters, latitudeOnMap)]
								],
								base: 2
							});
			sendAjaxRequest();
      }
    });

  } );

const metersToPixelsAtMaxZoom = (meters, latitude) =>
  meters / 0.075 / Math.cos(latitude * Math.PI / 180)

 var radiusInMeters = 300;
 var longitudeOnMap = -0.12801291382615432
 var latitudeOnMap =  51.509375139851585;
map.addControl(new mapboxgl.NavigationControl({
  position: 'top-right'
}));
var pois = ['poi-art', 'poi-music', 'poi-theatre', 'poi-museum'];
var $svg, lastValue = 0;
var popup = new mapboxgl.Popup({
  closeButton: false
});

// Holds mousedown state for events. if this
// flag is active, we move the point on `mousemove`.
var isDragging;
var isScrolling;
// Is the cursor over a point? if this
// flag is active, we listen for a mousedown event.
var isCursorOverPoint;
var isCursorOverCircle;

var data = [];

var canvas = map.getCanvasContainer();

//TOTO je pre modry bod
var geojson = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [-0.12801291382615432, 51.509375139851585]
        }
    }]
};
var circle_options = {
    color: '#fff',      // Stroke color
    opacity: 1,         // Stroke opacity
    weight: 10,         // Stroke weight
    fillColor: '#000',  // Fill color
    fillOpacity: 0.6    // Fill opacity
};

function dataBuilder(gj, type) {
  gj.forEach(function(feature) {
   feature[0].properties.type = type;
    data.push(feature[0]);
  });
  addData();
  buildListings(data);
}
function dataChanger(gj, type) {
	data = [];
  gj.forEach(function(feature) {
   feature[0].properties.type = type;
    data.push(feature[0]);
  });
  var source = map.getSource("points");
  var dataObj = {
            "type": "FeatureCollection",
            "features": data
        }
  source.setData(dataObj)
  buildListings(data);
}
// Layer style
//var dataStyle = JSON.parse(fs.readFileSync(path.join(__dirname, '/data/style.json'), 'utf8'));
function addData() {
   map.addSource("points", {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": data
        }
    });

    /*map.addLayer({
        "id": "points",
        "type": "symbol",
        "source": "points",
        "layout": {
            "icon-image": "{icon}-15",
            "text-field": "{title}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top"
        }
    });*/
	dataStyle.forEach(function(style) {
    map.addLayer(style);
  });
};
function buildListings(features) {
  var $listing = document.getElementById('listing');
  $listing.innerHTML = '';
  if (features.length) {
    features.forEach(function(feature) {
      var item = document.createElement('button');
      item.innerHTML = listingTemplate({ data: feature.properties });
      $listing.appendChild(item);

      item.addEventListener('click', function() {
        showPopup(feature);
      });
      item.addEventListener('mouseover', function() {
        showPopup(feature);
      });
      item.addEventListener('mouseout', function() {
        popup.remove();
      });
    });
  } else {
    var emptyState = document.createElement('div');
    emptyState.className = 'pad1 prose';
    emptyState.textContent = document.getElementById('legend').textContent;
    $listing.appendChild(emptyState);
  }
};
function showPopup(feature) {
  popup.setLngLat(feature.geometry.coordinates)
    .setHTML(feature.properties.title)
    .addTo(map);
}
function getFeatures() {
  var bbox = $svg.getBoundingClientRect();
  var center = {
     x: bbox.left + bbox.width / 2,
     y: bbox.top + bbox.height / 2
  };

  var radius = $svg.getAttribute('width') / 2;
  map.queryRenderedFeatures({x: center.x, y: center.y}, {
    radius: radius,
    includeGeometry: true,
    layer: pois
  }, function(err, features) {
   if (err || !features.length) {
      popup.remove();
      return;
    }

    buildListings(features);
  });
}


//TOTO je pre modry bod
function mouseDown() {
    if (!isCursorOverPoint) return;

    isDragging = true;

    // Set a cursor indicator
    canvas.style.cursor = 'grab';

    // Mouse events
    map.on('mousemove', onMove);
    map.on('mouseup', onUp);
}
//TOTO je pre modry bod POHYB
function onMove(e) {
    if (!isDragging) return;
    var coords = e.lngLat;

    // Set a UI indicator for dragging.
    canvas.style.cursor = 'grabbing';

    // Update the Point feature in `geojson` coordinates
    // and call setData to the source layer `point` on it.
    geojson.features[0].geometry.coordinates = [coords.lng, coords.lat];
	longitudeOnMap = coords.lng;
	latitudeOnMap = coords.lat;
    map.getSource('point').setData(geojson);
	map.getSource('source_circle_500').setData(geojson);
}
//TOTO je pre modry bod
function onUp(e) {
    if (!isDragging) return;
    var coords = e.lngLat;
	sendAjaxRequest();
    // Print the coordinates of where the point had
    // finished being dragged to on the map.
	// TODO tu zavolat query na hladane veci
	console.log('Longitude: ' + coords.lng + '<br />Latitude: ' + coords.lat);
    canvas.style.cursor = '';
    isDragging = false;
}
$(document).ready(function(e) {
        $.ajax({
        type: "POST",
        url: "http://pdt.localhost:8082/cgi-bin/controll.py",
		data: { longitude: longitudeOnMap, latitude : latitudeOnMap, radius:radiusInMeters},
        success: callbackFunc
    });
	function callbackFunc(response) {
    // do something with the response
	dataBuilder(JSON.parse(response), 'art');
	}	
        
});
function sendAjaxRequest(){
	$.ajax({
        type: "POST",
        url: "http://pdt.localhost:8082/cgi-bin/controll.py",
		data: { longitude: longitudeOnMap, latitude : latitudeOnMap, radius:radiusInMeters},
        success: callbackFunc
    });
	function callbackFunc(response) {
    // do something with the response
	dataChanger(JSON.parse(response), 'art');
	}
}
function showAll(){
	console.log("shown");
	$.ajax({
        type: "POST",
        url: "http://pdt.localhost:8082/cgi-bin/controll.py",
        success: callbackFunc
    });
	function callbackFunc(response) {
    // do something with the responsef
    console.log(response);
	}	
};
map.on('click', onMapClick);
map.on('contextmenu', onRightMapClick)

function onMapClick(e){
	  var features = map.queryRenderedFeatures(e.point,{ layers: ['points'],radius: 100});

    if (!features.length) {
        return;
    }

    var feature = features[0];

    // Populate the popup and set its coordinates
    // based on the feature found.
    var popup = new mapboxgl.Popup()
        .setLngLat(feature.geometry.coordinates)
        .setHTML(feature.properties.title)
        .addTo(map);
};
function onRightMapClick(){
	
};
//TOTO je pre modry bod
map.on('load', function () {
	// Add a single point to the map
    map.addSource('point', {
        "type": "geojson",
        "data": geojson
    });

    map.addLayer({
        "id": "point",
        "type": "circle",
        "source": "point",
        "paint": {
            "circle-radius": 10,
            "circle-color": "#3887be"
        }
    });
	
	map.addSource("source_circle_500", {
    "type": "geojson",
    "data": {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-0.12801291382615432, 51.509375139851585]
            }
        }]
    }
	});

	map.addLayer({
		"id": "circle500",
		"type": "circle",
		"source": "source_circle_500",
		"paint": {
			"circle-radius": {
								stops: [
								[0, 0],
								[20, metersToPixelsAtMaxZoom(radiusInMeters, latitudeOnMap)]
								],
								base: 2
							},
			"circle-color": "#5b94c6",
			"circle-opacity": 0.3
		}
	});

	//TOTO je pre modry bod
	
    // If a feature is found on map movement,
    // set a flag to permit a mousedown events.
    map.on('mousemove', function(e) {
        var features = map.queryRenderedFeatures(e.point, { layers: ['point'] });
        // Change point and cursor style as a UI indicator
        // and set a flag to enable other mouse events.
        if (features.length) {
            map.setPaintProperty('point', 'circle-color', '#3bb2d0');
            canvas.style.cursor = 'move';
            isCursorOverPoint = true;
            map.dragPan.disable();
        } else {
            map.setPaintProperty('point', 'circle-color', '#3887be');
            canvas.style.cursor = '';
            isCursorOverPoint = false;
            map.dragPan.enable();
        }
    });

    // Set `true` to dispatch the event before other functions call it. This
    // is necessary for disabling the default map dragging behaviour.
    map.on('mousedown', mouseDown, true);
});

//#######################################################################################################################################


map.once('source.change', function(ev) {
  if (ev.source.id !== 'geojson') return;

  window.setTimeout(getFeatures, 500);

  document.getElementById('filter-categories').addEventListener('change', function(e) {
    var id = 'poi-' + e.target.id;
    var display = (e.target.checked) ? 'visible' : 'none';
    map.setLayoutProperty(id, 'visibility', display);
    window.setTimeout(getFeatures, 500);
  });

  document.body.classList.remove('loading');
});
map.on('click', function(e) {
  map.queryRenderedFeatures(e.point, {
    radius: 7.5,
    includeGeometry: true,
    layer: pois
  }, function(err, features) {
    if (err || !features.length) {
      popup.remove();
      return;
    }

    showPopup(features[0]);
  });
});

map.on('mousemove', function(e) {
  map.queryRenderedFeatures(e.point, {
    radius: 100,
    includeGeometry: true,
    layer: ['points']
  }, function(err, features) {
    map.getCanvas().style.cursor = (!err && features.length) ? 'pointer' : '';

    if (err || !features.length) {
      popup.remove();
      return;
    }
	var feature = features[0];

    // Populate the popup and set its coordinates
    // based on the feature found.
    var popup = new mapboxgl.Popup()
        .setLngLat(feature.geometry.coordinates)
        .setHTML(feature.properties.title)
        .addTo(map);
  });
});