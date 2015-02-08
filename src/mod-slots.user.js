// ==UserScript==
// @id             iitc-plugin-mod-slots@randomizax
// @name           IITC plugin: Portal Mod Status on Map
// @category       Layer
// @version        0.2.0.@@DATETIMEVERSION@@
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      @@UPDATEURL@@
// @downloadURL    @@DOWNLOADURL@@
// @description    [@@BUILDNAME@@-@@BUILDDATE@@] Show mod slots on map.
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
window.plugin.portalModSlots.MOD_COLOR = {
  VERY_RARE: '#683480', RARE: '#3a64bf', COMMON: '#44a065', NONE: '#fff'
};
window.plugin.portalModSlots.MOD_DISPLAY = {
  "Portal Shield":  '▼',
  "AXA Shield":     '◆',
  "Multi-hack":     '●',
  "Heat Sink":      '★',
  "Force Amp":      '×',
  "Turret":         '＊',
  "Link Amplifier": '▲',
  OCCUPIED:         '■',
  NONE:             '□'
};

window.plugin.portalModSlots.slotLayers = {};
window.plugin.portalModSlots.slotLayerGroup = null;
window.plugin.portalModSlots.modLayers = {};
window.plugin.portalModSlots.modLayerGroup = null;

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
  var previousLayer = window.plugin.portalModSlots.slotLayers[guid];
  if(previousLayer) {
    window.plugin.portalModSlots.slotLayerGroup.removeLayer(previousLayer);
    delete plugin.portalModSlots.slotLayers[guid];
  }
  previousLayer = window.plugin.portalModSlots.modLayers[guid];
  if(previousLayer) {
    window.plugin.portalModSlots.modLayerGroup.removeLayer(previousLayer);
    delete plugin.portalModSlots.modLayers[guid];
  }
}

window.plugin.portalModSlots.addLabel = function(guid) {
  if (!map.hasLayer(window.plugin.portalModSlots.slotLayerGroup) &&
      !map.hasLayer(window.plugin.portalModSlots.modLayerGroup)) {
    return;
  }

  // remove old layer before updating
  window.plugin.portalModSlots.removeLabel(guid);

  // add portal hack details to layers
  var d = window.portalDetail.get(guid);
  var latLng = window.portals[guid].getLatLng();
  var mc = window.plugin.portalModSlots.MOD_COLOR;
  var md = window.plugin.portalModSlots.MOD_DISPLAY;
  if (!d) return;
  var modSlotsStr = '';
  var modStr = '';
  for (var i=0; i<4; i++) {
    var mod = d.mods[i];
    if (mod === null) {
      modSlotsStr += md.NONE;
      modStr += md.NONE;
    } else {
      modSlotsStr += md.OCCUPIED;
      var color = mod.rarity ? mc[mod.rarity] : mc.NONE;
      var disp = md[mod.name] || md.OCCUPIED;
      modStr += '<span style="color: ' + color + '">' + disp + "</span>";
    }
  }
  var slots = L.marker(latLng, {
    icon: L.divIcon({
      className: 'plugin-mod-slots',
      iconSize: [12,12],
      iconAnchor: [22,22],
      html: modSlotsStr
      }),
    guid: guid
  });
  plugin.portalModSlots.slotLayers[guid] = slots;
  slots.addTo(plugin.portalModSlots.slotLayerGroup);
  var mods = L.marker(latLng, {
    icon: L.divIcon({
      className: 'plugin-mod-slots',
      iconSize: [12,32],
      iconAnchor: [22,22],
      html: modStr
      }),
    guid: guid
  });
  plugin.portalModSlots.modLayers[guid] = mods;
  mods.addTo(plugin.portalModSlots.modLayerGroup);
}

window.plugin.portalModSlots.updatePortalLabels = function() {
  // as this is called every time layers are toggled, there's no point in doing it when the layer is off
  if (!map.hasLayer(window.plugin.portalModSlots.slotLayerGroup) &&
      !map.hasLayer(window.plugin.portalModSlots.modLayerGroup)) {
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

  window.plugin.portalModSlots.slotLayerGroup = new L.LayerGroup();
  window.plugin.portalModSlots.modLayerGroup = new L.LayerGroup();
  window.addLayerGroup('Portal Mod Slots', window.plugin.portalModSlots.slotLayerGroup, true);
  window.addLayerGroup('Portal Mods', window.plugin.portalModSlots.modLayerGroup, false);

  window.addHook('requestFinished', function() { setTimeout(function(){window.plugin.portalModSlots.delayedUpdatePortalLabels(3.0);},1); });
  window.addHook('mapDataRefreshEnd', function() { window.plugin.portalModSlots.delayedUpdatePortalLabels(0.5); });
  window.map.on('overlayadd overlayremove', function() { setTimeout(function(){window.plugin.portalModSlots.delayedUpdatePortalLabels(1.0);},1); });
  window.addHook('portalDetailsUpdated', function(ev) { window.plugin.portalModSlots.addLabel(ev.guid); });

}

// PLUGIN END //////////////////////////////////////////////////////////

@@PLUGINEND@@
