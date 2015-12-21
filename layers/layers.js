var baseLayer = new ol.layer.Group({'title': 'Base maps',layers: []});
var format_bcorrect = new ol.format.GeoJSON();
var features_bcorrect = format_bcorrect.readFeatures(geojson_bcorrect);
var jsonSource_bcorrect = new ol.source.Vector();
jsonSource_bcorrect.addFeatures(features_bcorrect);
var lyr_bcorrect = new ol.layer.Vector({
                source: jsonSource_bcorrect, 
                style: style_bcorrect,
                title: "bcorrect"
            });


var layersList = [baseLayer,lyr_bcorrect];
