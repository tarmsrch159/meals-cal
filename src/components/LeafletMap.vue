<template>
  <div class="map-card-wrapper">
    <div class="map-top-bar">
      <div class="gps-status-indicator">
        <span class="pulse-radar"></span>
        <span class="status-title">{{ t('gpsStatusSafe') }}</span>
      </div>
      <div class="eta-pill">
        <Navigation :size="12" />
        <span>ETA: 10 นาที (1.4 กม.)</span>
      </div>
    </div>

    <!-- Map container -->
    <div ref="mapContainer" class="leaflet-map-container"></div>

    <!-- Map bottom info -->
    <div class="map-footer">
      <div class="location-item">
        <div class="loc-icon start-icon">
          <MapPin :size="14" />
        </div>
        <div class="loc-text">
          <span class="loc-label">พิกัดผู้ดูแล/คนขับ</span>
          <span class="loc-val">ถนนพหลโยธิน (กำลังมุ่งหน้ามา)</span>
        </div>
      </div>
      <div class="route-line-decor"></div>
      <div class="location-item">
        <div class="loc-icon dest-icon">
          <Home :size="14" />
        </div>
        <div class="loc-text">
          <span class="loc-label">จุดหมายปลายทาง</span>
          <span class="loc-val">บ้านพญาไท ซอย 7</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { store } from '../stores/useAppStore.js';
import { Navigation, MapPin, Home } from 'lucide-vue-next';
import L from 'leaflet';

const { t } = store;
const mapContainer = ref(null);
let map = null;

onMounted(() => {
  if (!mapContainer.value) return;

  // Center on Bangkok Phaya Thai
  const caregiverPos = [13.7700, 100.5350];
  const homePos = [13.7600, 100.5380];

  map = L.map(mapContainer.value, {
    zoomControl: false,
    attributionControl: false
  }).setView([13.7650, 100.5365], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  // Custom icons using DivIcon for beautiful styling
  const caregiverIcon = L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="background: linear-gradient(135deg, #00B4D8, #0077B6); width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2.5px solid white; box-shadow: 0 4px 12px rgba(0,180,216,0.5);">
        🚗
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  const homeIcon = L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="background: linear-gradient(135deg, #10B981, #059669); width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2.5px solid white; box-shadow: 0 4px 12px rgba(16,185,129,0.5);">
        🏠
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  // Markers
  L.marker(caregiverPos, { icon: caregiverIcon }).addTo(map).bindPopup('<b>🚗 ผู้ดูแล/คนขับ</b><br>กำลังเดินทางมา');
  L.marker(homePos, { icon: homeIcon }).addTo(map).bindPopup('<b>🏠 บ้านผู้รับบริการ</b>');

  // Route Polyline
  const routePoints = [
    caregiverPos,
    [13.7660, 100.5360],
    [13.7630, 100.5370],
    homePos
  ];
  L.polyline(routePoints, {
    color: '#00B4D8',
    weight: 4,
    opacity: 0.8,
    dashArray: '6, 8'
  }).addTo(map);

  // Safe Zone Circle
  L.circle(homePos, {
    radius: 400,
    color: '#10B981',
    fillColor: '#10B981',
    fillOpacity: 0.12,
    weight: 1.5
  }).addTo(map);

  setTimeout(() => {
    map.invalidateSize();
  }, 200);
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
.map-card-wrapper {
  background: #FFFFFF;
  border-radius: var(--radius-md);
  border: 1px solid var(--primary-200);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.map-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #F0F9FF;
  border-bottom: 1px solid var(--primary-100);
}

.gps-status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pulse-radar {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
  animation: radarPulse 1.8s infinite;
}

@keyframes radarPulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
  70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.status-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: #047857;
}

.eta-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--primary-100);
  color: var(--primary-800);
  padding: 3px 8px;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 700;
}

.leaflet-map-container {
  height: 190px;
  width: 100%;
  z-index: 1;
}

.map-footer {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #FFFFFF;
}

.location-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.loc-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.start-icon {
  background: var(--primary-100);
  color: var(--primary-700);
}

.dest-icon {
  background: #DCFCE7;
  color: #15803D;
}

.loc-text {
  display: flex;
  flex-direction: column;
}

.loc-label {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-weight: 500;
}

.loc-val {
  font-size: 0.78rem;
  color: var(--text-main);
  font-weight: 600;
}

.route-line-decor {
  width: 2px;
  height: 12px;
  background: #CBD5E1;
  margin-left: 12px;
}
</style>
