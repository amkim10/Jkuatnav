// create the layer where the route will be drawn
var route_layer = new OpenLayers.Layer.Vector("route");
//create the layer where the start and final points will be drawn
var points_layer = new OpenLayers.Layer.Vector("points");
// add the layers to the map
map.addLayers([points_layer, route_layer]);