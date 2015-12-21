
                    var styleCache_bcorrect={}
                    var style_bcorrect = function(feature, resolution){
                        var value = ""
                        var style = [ new ol.style.Style({
                            stroke: new ol.style.Stroke({color: "rgba(0,0,0,1.0)", lineDash: null, width: 0}),
                        fill: new ol.style.Fill({color: "rgba(182,157,236,1.0)"})
                        })
                        ];
                        var labelText = "";
                        var key = value + "_" + labelText

                        if (!styleCache_bcorrect[key]){
                            var text = new ol.style.Text({
                                  font: 'Nonepx Calibri,sans-serif',
                                  text: labelText,
                                  fill: new ol.style.Fill({
                                    color: "rgba(None, None, None, 255)"
                                  }),
                                });
                            styleCache_bcorrect[key] = new ol.style.Style({"text": text});
                        }
                        var allStyles = [styleCache_bcorrect[key]];
                        allStyles.push.apply(allStyles, style);
                        return allStyles;
                    };