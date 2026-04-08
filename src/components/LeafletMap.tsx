import React, { useRef, useEffect, useCallback } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

// ─── Types ───────────────────────────────────────────────
export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface MapPolyline {
  id: string;
  coordinates: LatLng[];
  color?: string;
  width?: number;
  dashed?: boolean;
}

export interface MapMarker {
  id: string;
  coordinate: LatLng;
  emoji?: string;
  opacity?: number;
}

interface Props {
  tileUrl: string;
  center?: LatLng;
  zoom?: number;
  polylines?: MapPolyline[];
  markers?: MapMarker[];
  showUserLocation?: boolean;
  userLocation?: LatLng;
  userDotColor?: string;
  fitBounds?: { north: number; south: number; east: number; west: number };
  style?: ViewStyle;
}

// ─── HTML Template ───────────────────────────────────────
function buildHtml(tileUrl: string) {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>
  *{margin:0;padding:0;}
  html,body,#map{width:100%;height:100%;background:#0F172A;}
  .emoji-marker{font-size:24px;line-height:1;text-align:center;}
  .user-dot{width:14px;height:14px;background:#3B82F6;border:3px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(59,130,246,0.6);}
</style>
</head>
<body>
<div id="map"></div>
<script>
var map = L.map('map',{zoomControl:false,attributionControl:false}).setView([48.8566,2.3522],13);
var tileLayer = L.tileLayer('${tileUrl}',{maxZoom:19,tileSize:256}).addTo(map);

var polylines = {};
var markers = {};
var userMarker = null;

function handleMessage(data) {
  try {
    var msg = JSON.parse(data);
    switch(msg.type) {
      case 'setCenter':
        map.setView([msg.lat, msg.lng], msg.zoom || map.getZoom(), {animate:true});
        break;
      case 'fitBounds':
        if (msg.south != null && msg.north != null) {
          map.fitBounds([[msg.south,msg.west],[msg.north,msg.east]],{padding:[30,30],animate:true});
        }
        break;
      case 'setPolylines':
        var lineIds = {};
        (msg.lines||[]).forEach(function(l){lineIds[l.id]=true;});
        Object.keys(polylines).forEach(function(k) {
          if (!lineIds[k]) { map.removeLayer(polylines[k]); delete polylines[k]; }
        });
        (msg.lines||[]).forEach(function(line) {
          var coords = line.coordinates.map(function(c){return [c.latitude,c.longitude];});
          if (coords.length < 2) return;
          var opts = {color:line.color||'#3B82F6',weight:line.width||4,dashArray:line.dashed?'10,6':null,lineCap:'round',lineJoin:'round'};
          if (polylines[line.id]) {
            polylines[line.id].setLatLngs(coords);
            polylines[line.id].setStyle(opts);
          } else {
            polylines[line.id] = L.polyline(coords,opts).addTo(map);
          }
        });
        break;
      case 'setMarkers':
        var mIds = {};
        (msg.items||[]).forEach(function(m){mIds[m.id]=true;});
        Object.keys(markers).forEach(function(k) {
          if (!mIds[k]) { map.removeLayer(markers[k]); delete markers[k]; }
        });
        (msg.items||[]).forEach(function(item) {
          var icon = L.divIcon({className:'',html:'<div class="emoji-marker" style="opacity:'+(item.opacity!=null?item.opacity:1)+'">'+(item.emoji||'\\u{1F4CD}')+'<\\/div>',iconSize:[28,28],iconAnchor:[14,14]});
          if (markers[item.id]) {
            markers[item.id].setLatLng([item.coordinate.latitude,item.coordinate.longitude]);
            markers[item.id].setIcon(icon);
          } else {
            markers[item.id] = L.marker([item.coordinate.latitude,item.coordinate.longitude],{icon:icon}).addTo(map);
          }
        });
        break;
      case 'setUserLocation':
        if (msg.lat != null && msg.lng != null) {
          var c = msg.color || '#3B82F6';
          var dotHtml = '<div style="width:14px;height:14px;background:'+c+';border:3px solid #fff;border-radius:50%;box-shadow:0 0 8px '+c+';"><\\/div>';
          if (!userMarker) {
            var dot = L.divIcon({className:'',html:dotHtml,iconSize:[20,20],iconAnchor:[10,10]});
            userMarker = L.marker([msg.lat,msg.lng],{icon:dot,zIndexOffset:1000}).addTo(map);
          } else {
            userMarker.setLatLng([msg.lat,msg.lng]);
            userMarker.setIcon(L.divIcon({className:'',html:dotHtml,iconSize:[20,20],iconAnchor:[10,10]}));
          }
        }
        break;
      case 'removeUserLocation':
        if (userMarker) { map.removeLayer(userMarker); userMarker = null; }
        break;
      case 'changeTiles':
        if (tileLayer) map.removeLayer(tileLayer);
        tileLayer = L.tileLayer(msg.url,{maxZoom:19,tileSize:256}).addTo(map);
        break;
    }
  } catch(e) {}
}

document.addEventListener('message', function(e){handleMessage(e.data);});
window.addEventListener('message', function(e){handleMessage(e.data);});
<\/script>
</body>
</html>`;
}

// ─── Component ───────────────────────────────────────────
export default function LeafletMap({
  tileUrl,
  center,
  zoom,
  polylines: polylineProp,
  markers: markerProp,
  showUserLocation,
  userLocation,
  userDotColor,
  fitBounds: fitBoundsProp,
  style,
}: Props) {
  const webRef = useRef<WebView>(null);
  const ready = useRef(false);
  const lastTileUrl = useRef(tileUrl);
  const queue = useRef<object[]>([]);

  const send = useCallback((msg: object) => {
    if (!ready.current) {
      queue.current.push(msg);
      return;
    }
    webRef.current?.postMessage(JSON.stringify(msg));
  }, []);

  const flush = useCallback(() => {
    ready.current = true;
    queue.current.forEach((m) => webRef.current?.postMessage(JSON.stringify(m)));
    queue.current = [];
  }, []);

  // Center
  useEffect(() => {
    if (center) {
      send({ type: 'setCenter', lat: center.latitude, lng: center.longitude, zoom: zoom ?? 15 });
    }
  }, [center?.latitude, center?.longitude, zoom]);

  // Fit bounds
  useEffect(() => {
    if (fitBoundsProp) {
      send({ type: 'fitBounds', ...fitBoundsProp });
    }
  }, [fitBoundsProp?.north, fitBoundsProp?.south, fitBoundsProp?.east, fitBoundsProp?.west]);

  // Polylines
  useEffect(() => {
    send({ type: 'setPolylines', lines: polylineProp ?? [] });
  }, [polylineProp]);

  // Markers
  useEffect(() => {
    send({ type: 'setMarkers', items: markerProp ?? [] });
  }, [markerProp]);

  // User location dot
  useEffect(() => {
    const loc = userLocation ?? center;
    if (showUserLocation && loc) {
      send({ type: 'setUserLocation', lat: loc.latitude, lng: loc.longitude, color: userDotColor ?? '#3B82F6' });
    } else {
      send({ type: 'removeUserLocation' });
    }
  }, [showUserLocation, userLocation?.latitude, userLocation?.longitude, center?.latitude, center?.longitude, userDotColor]);

  // Tile change
  useEffect(() => {
    if (tileUrl !== lastTileUrl.current) {
      lastTileUrl.current = tileUrl;
      send({ type: 'changeTiles', url: tileUrl });
    }
  }, [tileUrl]);

  return (
    <WebView
      ref={webRef}
      source={{ html: buildHtml(tileUrl) }}
      style={[styles.map, style]}
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      javaScriptEnabled
      domStorageEnabled
      originWhitelist={['*']}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      onLoadEnd={flush}
    />
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
