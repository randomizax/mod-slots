// ==UserScript==
// @id             iitc-plugin-mod-slots@randomizax
// @name           IITC plugin: Portal Mod Status on Map
// @category       Layer
// @version        0.4.0.@@DATETIMEVERSION@@
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

window.plugin.portalModSlots.MOD_COLOR = {
  VERY_RARE: '#ff5cf4', RARE: '#683480', COMMON: '#44a065', NONE: '#fff',
  "SoftBank Ultra Link": '#d09d00',
  "ITOEN Transmuter Plus": '#38389b',
  "ITOEN Transmuter Minus": '#38389b'
};
window.plugin.portalModSlots.MOD_DISPLAY = {
  "Portal Shield":  'PS',
  "Aegis Shield":     'AX',
  "Multi-hack":     'MH',
  "Heat Sink":      'HS',
  "Force Amp":      'FA',
  "Turret":         'TU',
  "Link Amp":       'LA',
  "SoftBank Ultra Link":       'SB',
  "ITOEN Transmuter Plus":     'PL',
  "ITOEN Transmuter Minus":    'MI',
  OCCUPIED:         'UK',
  NONE:             '__'
};

window.plugin.portalModSlots.slotLayers = {};
window.plugin.portalModSlots.slotLayerGroup = null;
window.plugin.portalModSlots.modLayers = {};
window.plugin.portalModSlots.modLayerGroup = null;

window.plugin.portalModSlots.setupCSS = function() {
  $("<style>")
    .prop("type", "text/css")
    .html("@font-face {\
              font-family: \'ingressmods\';\
              src:    url(\'@@RESOURCEURLBASE@@/fonts/ingressmods.eot?914szp\');\
              src:    url(\'@@RESOURCEURLBASE@@/fonts/ingressmods.eot?914szp#iefix\') format(\'embedded-opentype\'),\
                  url(\'@@RESOURCEURLBASE@@/fonts/ingressmods.ttf?914szp\') format(\'truetype\'),\
                  url(\'@@RESOURCEURLBASE@@/fonts/ingressmods.woff?914szp\') format(\'woff\'),\
                  url(\'@@RESOURCEURLBASE@@/fonts/ingressmods.svg?914szp#ingressmods\') format(\'svg\');\
              font-weight: normal;\
              font-style: normal;\
          }\
          .plugin-mod-slots {\
            font-size: " + (L.Browser.mobile ? "10" : "7") + "pt;\
            color: #660066;\
            font-family: \'ingressmods\'!important;\
            text-align: center;\
            text-wrap: none;\
            text-shadow: 0 0 0.5em lightyellow, 0 0 0.5em lightyellow, 0 0 0.5em lightyellow;\
            pointer-events: none;\
            line-height: 1;\
            letter-spacing: 0;\
            -webkit-text-size-adjust:none;\
            -webkit-font-feature-settings: \"liga\";\
            -moz-font-feature-settings: \"liga=1\";\
            -moz-font-feature-settings: \"liga\";\
            -ms-font-feature-settings: \"liga\" 1;\
            -o-font-feature-settings: \"liga\";\
            font-feature-settings: \"liga\";\
            -webkit-font-smoothing: antialiased;\
            -moz-osx-font-smoothing: grayscale;\
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
      var color = mc[mod.name] || (mod.rarity ? mc[mod.rarity] : mc.NONE);
      var disp = md[mod.name] || md.OCCUPIED;
      console.log(mod.name + ": " + color + ": " + disp);
      modStr += '<span style="color: ' + color + '">' + disp + "</span>";
    }
  }
  var slots = L.marker(latLng, {
    icon: L.divIcon({
      className: 'plugin-mod-slots',
      iconSize: [50,40],
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
      iconSize: [50,40],
      iconAnchor: [27, L.Browser.mobile ? 27 : 22],
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
  window.addLayerGroup('Portal Mod Slots', window.plugin.portalModSlots.slotLayerGroup, false);
  window.addLayerGroup('Portal Mods', window.plugin.portalModSlots.modLayerGroup, true);

  window.addHook('requestFinished', function() { setTimeout(function(){window.plugin.portalModSlots.delayedUpdatePortalLabels(3.0);},1); });
  window.addHook('mapDataRefreshEnd', function() { window.plugin.portalModSlots.delayedUpdatePortalLabels(0.5); });
  window.map.on('overlayadd overlayremove', function() { setTimeout(function(){window.plugin.portalModSlots.delayedUpdatePortalLabels(1.0);},1); });
  window.addHook('portalDetailsUpdated', function(ev) { window.plugin.portalModSlots.addLabel(ev.guid); });

}

// PLUGIN END //////////////////////////////////////////////////////////

@@PLUGINEND@@
