<script setup>
import { onMounted, onUnmounted } from 'vue';
import { MapPin } from '@lucide/vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const props = defineProps({
  // Coordenadas del marcador
  latitude: { type: [Number, String], required: true },
  longitude: { type: [Number, String], required: true },
  // Contenido del popup
  label: { type: String, default: '' },
  address: { type: String, default: '' },
  // Opciones del mapa
  zoom: { type: Number, default: 14 },
  height: { type: String, default: 'h-48' },
  // ID único del contenedor (necesario si hay varios mapas en la misma página)
  mapId: { type: String, default: 'leaflet-map' }
});

let mapInstance = null;

onMounted(() => {
  const lat = parseFloat(props.latitude);
  const lng = parseFloat(props.longitude);

  mapInstance = L.map(props.mapId).setView([lat, lng], props.zoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mapInstance);

  L.marker([lat, lng])
    .addTo(mapInstance)
    .bindPopup(`<b>${props.label}</b>${props.address ? `<br>${props.address}` : ''}`)
    .openPopup();
});

onUnmounted(() => mapInstance?.remove());
</script>

<template>
  <div :id="mapId" :class="['w-full', height]" />
</template>
