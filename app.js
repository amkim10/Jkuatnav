var pointerDown = false;
var currentMarker = null;
var changed = false;
var routeLayer;
var routeSource;

// create a point with a colour and change handler
function createMarker(point, colour) {
  var marker = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.transform(point, 'EPSG:4326', 'EPSG:4326'))
  });

  marker.setStyle(
    [new ol.style.Style({
      image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({
          color: 'rgba(' + colour.join(',') + ', 1)'
        })
      })
    })]
  );
  marker.on('change', changeHandler);

  return marker;
}

var sourceMarker = createMarker([37.014731,-1.095659], [0, 255, 0]);
var targetMarker = createMarker([37.014722,-1.095666], [255, 0, 0]);

// create overlay to display the markers
var markerOverlay = new ol.FeatureOverlay({
  features: [sourceMarker, targetMarker],
});

function changeHandler(e) {
  if (pointerDown) {
    changed = true;
    currentMarker = e.target;
  }
}
var moveMarker = new ol.interaction.Modify({
  features: markerOverlay.getFeatures(),
  tolerance: 20
});
// style routes differently when clicked
var selectSegment = new ol.interaction.Select({
  condition: ol.events.condition.click,
  style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'rgba(255, 0, 128, 1)',
        width: 8
    })
  })
});

// record start of click
map.on('pointerdown', function(evt) {
  pointerDown = true;
  popup.style.display = 'none';
});

// record end of click
map.on('pointerup', function(evt) {
  pointerDown = false;

  // if we were dragging a marker, recalculate the route
  if (currentMarker) {
    getVertex(currentMarker);
    getRoute();
    currentMarker = null;
 }
});
// timer to update the route when dragging
window.setInterval(function(){
  if (currentMarker && changed) {
    getVertex(currentMarker);
    getRoute();
    changed = false;
  }
}, 250);

// WFS to get the closest vertex to a point on the map
function getVertex(marker) {
  var coordinates = marker.getGeometry().getCoordinates();
  var url = "http://localhost/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=Jkuat:nearest_vertex&outputformat=application/json&viewparams=x:coordinates[0];y:coordinates[1]";

  $.ajax({
     url: url,
     async: false,
     dataType: 'json',
     success: function(json) {
       loadVertex(json, marker == sourceMarker);
     }
  });
}
// load the response to the nearest_vertex layer
function loadVertex(response, isSource) {
  var geojson = new ol.format.GeoJSON();
  var features = geojson.readFeatures(response);
  if (isSource) {
    if (features.length == 0) {
      map.removeLayer(routeLayer);
      source = null;
      return;
    }
    source = features[0];
  } else {
    if (features.length == 0) {
      map.removeLayer(routeLayer);
      target = null;
      return;
    }
    target = features[0];
  }
}

function getRoute() {
  // set up the source and target vertex numbers to pass as parameters
  var viewParams = [
    'source:' + source.getId().split('.')[1],
    'target:' + target.getId().split('.')[1],
    'cost:length'
  ];

  var url = "http://localhost/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=Jkuat:pgrouting&outputformat=application/json&&viewparams=viewParams.join(';')";

  // create a new source for our layer
  routeSource = new ol.source.ServerVector({
    format: new ol.format.GeoJSON(),
    strategy: ol.loadingstrategy.all,
    loader: function(extent, resolution) {
      $.ajax({
        url: url,
        dataType: 'json',
        success: loadRoute,
        async: false
      });
    },
  });

  // remove the previous layer and create a new one
  map.removeLayer(routeLayer);
  routeLayer = new ol.layer.Vector({
    source: routeSource,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 255, 0.5)',
        width: 8
      })
    })
  });

  // add the new layer to the map
  map.addLayer(routeLayer);
}

// handle the response to shortest_path
var loadRoute = function(response) {
  selectSegment.getFeatures().clear();
  routeSource.clear();
  var features = routeSource.readFeatures(response)
  if (features.length == 0) {
    info.innerHTML = '';
    return;
  }

  routeSource.addFeatures(features);
  var dist = 0;
   features.forEach(function(feature) {
    dist += feature.get('length');
  });
  if (!pointerDown) {
      // snap the markers to the exact route source/target
    markerOverlay.getFeatures().clear();
    sourceMarker.setGeometry(source.getGeometry());
    targetMarker.setGeometry(target.getGeometry());
    markerOverlay.getFeatures().push(sourceMarker);
    markerOverlay.getFeatures().push(targetMarker);
  }
}

getVertex(sourceMarker);
getVertex(targetMarker);
getRoute();