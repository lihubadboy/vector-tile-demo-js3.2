require([
  "esri/map",
  "esri/layers/VectorTileLayer",
  "esri/layers/ArcGISTiledMapServiceLayer", 
  "esri/geometry/Point",
  "esri/SpatialReference",
  "dojo/_base/lang",
  "dojo/query",
  "dojo/window",
  "dojo/dom-class",
  "dijit/form/Select",
  "dojo/store/Memory",
  "dojo/data/ObjectStore",
  "esri/geometry/Extent",
  "dojo/domReady!",
], function(Map, VectorTileLayer,ArcGISTiledMapServiceLayer, Point, SpatialReference,lang, query, win,domClass,FilteringSelect, Memory,ObjectStore,Extent) {

  var checkViewPort = function () {

  }
  window.onresize = checkViewPort;
  checkViewPort();

  var map = new Map("map", {
    
    extent: new Extent({
      xmin: 3944141.104885455,
      ymin: 463237.0552936733,
      xmax: 18972272.361973394,
      ymax: 7654432.676361144,
      "spatialReference": 102100
    }),
    logo:false,
    slider:false
  });
  var tiled = new ArcGISTiledMapServiceLayer("http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer");
  map.addLayer(tiled);
  
  var vtileLayer = new VectorTileLayer("./vectorStyle.json");
  map.addLayer(vtileLayer);

  window.tileLayer = vtileLayer;
  window.map = map;
   
  var airportStore = new Memory({
    data: [
      { name: "All Airports", id: "ALL_AIRPORTS" },
      { name: "ATLANTA GA, US (ATL)", id: "ATL" },
      { name: "BEIJING, CN (PEK)", id: "PEK" },
      { name: "DUBAI, AE (DXB)", id: "DXB" },
      { name: "CHICAGO IL, US (ORD)", id: "ORD" },
      { name: "TOKYO, JP (HND)", id: "HND" },
      { name: "LONDON, GB (LHR)", id: "LHR" },
      { name: "LOS ANGELES CA, US (LAX)", id: "LAX" },
      { name: "HONG KONG, HK (HKG)", id: "HKG" },
      { name: "PARIS, FR (CDG)", id: "CDG" },
      { name: "DALLAS/FORT WORTH TX, US (DFW)", id: "DFW" },
      { name: "ISTANBUL, TR (IST)", id: "IST" },
      { name: "FRANKFURT, DE (FRA)", id: "FRA" },
      { name: "SHANGHAI, CN (PVG)", id: "PVG" },
      { name: "AMSTERDAM, NL (AMS)", id: "AMS" },
      { name: "NEW YORK NY, US (JFK)", id: "JFK" },
      { name: "WASHINGTON D.C. (DCA)", id: "DCA" },
      { name: "SINGAPORE, SG (SIN)", id: "SIN" },
      { name: "GUANGZHOU, CN (CAN)", id: "CAN" },
      { name: "JAKARTA, ID (CGK)", id: "CGK" },
      { name: "DENVER CO, US (DEN)", id: "DEN" },
      { name: "BANGKOK, TH (BKK)", id: "BKK" },
      { name: "SAN FRANCISCO CA, US (SFO)", id: "SFO" },
      { name: "INCHEON, KR (ICN)", id: "ICN" },
      { name: "KUALA LUMPUR, MY (KUL)", id: "KUL" },
      { name: "MADRID, ES (MAD)", id: "MAD" },
      { name: "NEW DELHI, IN (DEL)", id: "DEL" },
      { name: "LAS VEGAS NV, US (LAS)", id: "LAS" },
      { name: "CHARLOTTE NC, US (CLT)", id: "CLT" },
      { name: "MIAMI FL, US (MIA)", id: "MIA" },
      { name: "PHOENIX AZ, US (PHX)", id: "PHX" },
      { name: "DETROIT MI, US (DTW)", id: "DTW" }
    ]
  });
  
  var colorMap = {
"red": "rgba(175,18,18,0.05)",
"orange": "rgba(243,174,24,0.05)",
"green": "rgba(108,236,62,0.05)",
"blue": "rgba(96,205,255,0.05)",
"pink": "rgba(255,127,255,0.05)",
"white": "rgba(240,240,240,0.05)"
};

var airportSelector = new FilteringSelect({
  store: new ObjectStore({ objectStore: airportStore }),
  labelAttr: "name",
  value: "ALL_AIRPORTS",
}, "airportSelector");

airportSelector.startup();

airportSelector.on("change", function (value) {
  setFilter(vtileLayer, value);
});

function ShowcolorSelector()
{
var pdisplaystr = document.getElementById("colorSelector").style.display;
if(pdisplaystr=="")
  document.getElementById("colorSelector").style.display="block";
  else
  {document.getElementById("colorSelector").style.display="";}
}


var colorSelector = new ColorPicker({
appendTo: document.getElementById("colorSelector"),
color: colorMap.red,
renderCallback: function (color, action) {

  console.debug("ACTION", action);
  var rgb = color.rgb;

  //var colorStr = "rgba(" + (rgb.r * 255) + "," + (rgb.g * 255) + "," + (rgb.b * 255) + "," + color.alpha + ")";
  var colorStr = "rgba(" + (rgb.r * 255) + "," + (rgb.g * 255) + "," + (rgb.b * 255) +","+ "1"+")";
  if (setVectorColor) {
    setVectorColor(vtileLayer, colorStr);

  }
}
});

query(".flight-style-btn").on("click", function (evt) {
var node = evt.target;
if (domClass.contains(node, "active")) {
  return;
}

query(".flight-style-btn").removeClass("active");
for (var color in colorMap) {
  if (domClass.contains(node, color)) {
    colorSelector.color.setColor(colorMap[color], undefined, undefined, true);
    query(".cp-bres")[0].click();
    domClass.add(node, "active");
    break;
  }
}

});

var setVectorColor = function (tileLayer, colorStr) {

var tileStyle = lang.clone(tileLayer.currentStyleInfo.style);
if (tileStyle !== undefined) {
  for (var i = 0, len = tileStyle.layers.length; i < len; i++) {
    var tileLayerStyle = tileStyle.layers[i];
    if (tileStyle.layers[i].type == "line") {
      var pColorstr = tileLayerStyle.paint["line-color"];
      if (pColorstr.indexOf("#")>-1) {
        tileLayerStyle.paint["line-color"] = colorStr;
        tileStyle.layers[i] = tileLayerStyle;
      } 
      else
      {
        var num1 = pColorstr.lastIndexOf(",")+1;
        var num2 =pColorstr.indexOf(")");
        var alpha = pColorstr.substring(num1,num2);
        var colorStrline = colorStr.substring(0,colorStr.lastIndexOf(",")+1)+alpha+")";
        tileLayerStyle.paint["line-color"] = colorStrline;
        tileStyle.layers[i] = tileLayerStyle;
      }
    }
  }
  tileLayer.loadStyle(tileStyle);
}
};

});