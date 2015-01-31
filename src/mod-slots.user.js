// ==UserScript==
// @id             iitc-plugin-mod-slots@randomizax
// @name           IITC plugin: Portal Mod Slots Availability
// @category       Layer
// @version        0.1.6.@@DATETIMEVERSION@@
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      @@UPDATEURL@@
// @downloadURL    @@DOWNLOADURL@@
// @description    [@@BUILDNAME@@-@@BUILDDATE@@] Show mod slots vacancy.
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==

@@PLUGINSTART@@

// PLUGIN START ////////////////////////////////////////////////////////

// use own namespace for plugin
window.plugin.portalModSlots = function() {
};

window.plugin.portalModSlots.ICON_SIZE = 12;
window.plugin.portalModSlots.MOBILE_SCALE = 1.5;

window.plugin.portalModSlots.levelLayers = {};
window.plugin.portalModSlots.levelLayerGroup = null;

window.plugin.portalModSlots.setupCSS = function() {
  $("<style>")
    .prop("type", "text/css")
    .html(".plugin-mod-slots {\
            font-size: 7px;\
            color: #660066;\
            font-family: sans-serif;\
            text-align: center;\
            text-shadow: 0 0 0.5em lightyellow, 0 0 0.5em lightyellow, 0 0 0.5em lightyellow;\
            pointer-events: none;\
            -webkit-text-size-adjust:none;\
          }")
  .appendTo("head");
}

window.plugin.portalModSlots.removeLabel = function(guid) {
  var previousLayer = window.plugin.portalModSlots.levelLayers[guid];
  if(previousLayer) {
    window.plugin.portalModSlots.levelLayerGroup.removeLayer(previousLayer);
    delete plugin.portalModSlots.levelLayers[guid];
  }
}

window.plugin.portalModSlots.addLabel = function(guid) {
  if (!map.hasLayer(window.plugin.portalModSlots.levelLayerGroup)) {
    return;
  }

  // remove old layer before updating
  window.plugin.portalModSlots.removeLabel(guid);

  // add portal hack details to layers
  var d = window.portalDetail.get(guid);
  var latLng = window.portals[guid].getLatLng();
  if (!d) return;
  var modSlotsStr = '';
  for (var i=0; i<4; i++) {
    if (d.mods[i] === null) {
      modSlotsStr += '□';
    } else {
      modSlotsStr += '■';
    }
  }
  var level = L.marker(latLng, {
    icon: L.divIcon({
      className: 'plugin-mod-slots',
      iconSize: [12,12],
      iconAnchor: [22,22],
      html: modSlotsStr
      }),
    guid: guid
  });
  plugin.portalModSlots.levelLayers[guid] = level;
  level.addTo(plugin.portalModSlots.levelLayerGroup);
}

window.plugin.portalModSlots.updatePortalLabels = function() {
  // as this is called every time layers are toggled, there's no point in doing it when the layer is off
  if (!map.hasLayer(window.plugin.portalModSlots.levelLayerGroup)) {
    return;
  }
  var portalPoints = {};
  var count = 0;

  var displayBounds = map.getBounds();

  for (var guid in window.portals) {
    var p = window.portals[guid];
    if (p._map && displayBounds.contains(p.getLatLng())) {
      var point = map.project(p.getLatLng());
      portalPoints[guid] = point;
      count += 1;
    }
  }

  // and add those we do
  for (var guid in portalPoints) {
    window.plugin.portalModSlots.addLabel(guid);
  }
}

// as calculating portal marker visibility can take some time when there's lots of portals shown, we'll do it on
// a short timer. this way it doesn't get repeated so much
window.plugin.portalModSlots.delayedUpdatePortalLabels = function(wait) {

  if (window.plugin.portalModSlots.timer === undefined) {
    window.plugin.portalModSlots.timer = setTimeout ( function() {
      window.plugin.portalModSlots.timer = undefined;
      window.plugin.portalModSlots.updatePortalLabels();
    }, wait*1000);

  }
}

var setup = function() {

  window.plugin.portalModSlots.setupCSS();

  window.plugin.portalModSlots.levelLayerGroup = new L.LayerGroup();
  window.addLayerGroup('Portal Mod Slots', window.plugin.portalModSlots.levelLayerGroup, true);

  window.addHook('requestFinished', function() { setTimeout(function(){window.plugin.portalModSlots.delayedUpdatePortalLabels(3.0);},1); });
  window.addHook('mapDataRefreshEnd', function() { window.plugin.portalModSlots.delayedUpdatePortalLabels(0.5); });
  window.map.on('overlayadd overlayremove', function() { setTimeout(function(){window.plugin.portalModSlots.delayedUpdatePortalLabels(1.0);},1); });
  window.addHook('portalDetailsUpdated', function(ev) { window.plugin.portalModSlots.addLabel(ev.guid); });

}

// PLUGIN END //////////////////////////////////////////////////////////

@@PLUGINEND@@
