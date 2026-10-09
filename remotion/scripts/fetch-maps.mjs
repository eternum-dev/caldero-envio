// fetch-maps.mjs — genera los mapas de Valdivia en alta resolución usando
// la Mapbox Static API. Reemplaza mapa-valdivia-origen.png y mapa-valdivia-con-ruta.png.
//
// Uso: MAPBOX_TOKEN=pk.xxx node scripts/fetch-maps.mjs
//
// Requiere Node 18+ (usa fetch nativo).

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const TOKEN = process.env.MAPBOX_TOKEN;
if (!TOKEN) {
  console.error('Error: MAPBOX_TOKEN env var required.');
  console.error('Uso: MAPBOX_TOKEN=pk.xxx node scripts/fetch-maps.mjs');
  process.exit(1);
}

// Configuración
const ORIGIN = { lng: -73.2087431, lat: -39.8290687 }; // Local del usuario
const DESTINATION_ADDRESS = 'Ruben Dario 146, Valdivia, Los Ríos, Chile';
const MAP_WIDTH = 1280;
const MAP_HEIGHT = 720;
const MAP_SCALE = 2; // @2x para alta resolución (2560×1440 final)
const STYLE = 'mapbox/dark-v11';
// Colores: orange para origen (pin de Mapbox default), blue para destino,
// gold para la ruta (matchea design system de Caldero)
const COLOR_ORIGIN = 'ff6b35';
const COLOR_DEST = '2196f3';
const COLOR_ROUTE = 'f5af46';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} fetching ${url}\n${text}`);
  }
  return res.json();
}

async function fetchBinary(url, outputPath) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} downloading ${url}\n${text}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(outputPath, buffer);
  console.log(`  ✓ Saved ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  console.log('1. Geocoding destination...');
  const geocodeUrl =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
    `${encodeURIComponent(DESTINATION_ADDRESS)}.json` +
    `?access_token=${TOKEN}&limit=1&country=cl`;
  const geocodeData = await fetchJson(geocodeUrl);
  if (!geocodeData.features || geocodeData.features.length === 0) {
    throw new Error(`No geocoding results for "${DESTINATION_ADDRESS}"`);
  }
  const destination = {
    lng: geocodeData.features[0].center[0],
    lat: geocodeData.features[0].center[1],
    name: geocodeData.features[0].place_name,
  };
  console.log(`  → ${destination.name}`);
  console.log(`  → coords: ${destination.lng}, ${destination.lat}`);

  console.log('\n2. Fetching route from Directions API...');
  const directionsUrl =
    `https://api.mapbox.com/directions/v5/mapbox/driving/` +
    `${ORIGIN.lng},${ORIGIN.lat};${destination.lng},${destination.lat}` +
    `?geometries=polyline&overview=full&access_token=${TOKEN}`;
  const directionsData = await fetchJson(directionsUrl);
  if (!directionsData.routes || directionsData.routes.length === 0) {
    throw new Error('No route found from Directions API');
  }
  const route = directionsData.routes[0];
  console.log(`  → distance: ${(route.distance / 1000).toFixed(2)} km`);
  console.log(`  → duration: ${Math.round(route.duration / 60)} min`);
  console.log(`  → polyline length: ${route.geometry.length} chars`);

  // Compute center of origin + destination for the camera (so both pins
  // and the route are visible in the same area across both maps).
  const centerLng = (ORIGIN.lng + destination.lng) / 2;
  const centerLat = (ORIGIN.lat + destination.lat) / 2;
  const zoom = 14; // mismo zoom que las screenshots existentes

  // URL fragment: center+zoom
  const camFragment = `${centerLng},${centerLat},${zoom},0,0`;

  console.log('\n3. Building Static API URLs...');

  // Origin map: solo el pin de origen, con el mismo centro/zoom que el route map
  const originOverlay = `pin-l+${COLOR_ORIGIN}(${ORIGIN.lng},${ORIGIN.lat})`;
  const originMapUrl =
    `https://api.mapbox.com/styles/v1/${STYLE}/static/` +
    `${originOverlay}/${camFragment}/${MAP_WIDTH}x${MAP_HEIGHT}@${MAP_SCALE}x` +
    `?access_token=${TOKEN}`;
  console.log(`  → origin map URL: ${originMapUrl.length} chars`);

  // Route map: pin origen + pin destino + path gold
  const routeOverlay = `pin-l+${COLOR_ORIGIN}(${ORIGIN.lng},${ORIGIN.lat}),` +
    `pin-l+${COLOR_DEST}(${destination.lng},${destination.lat}),` +
    `path-5+${COLOR_ROUTE}-0.8(${encodeURIComponent(route.geometry)})`;
  const routeMapUrl =
    `https://api.mapbox.com/styles/v1/${STYLE}/static/` +
    `${routeOverlay}/${camFragment}/${MAP_WIDTH}x${MAP_HEIGHT}@${MAP_SCALE}x` +
    `?access_token=${TOKEN}`;
  console.log(`  → route map URL: ${routeMapUrl.length} chars`);

  if (routeMapUrl.length > 8000) {
    console.warn(`  ⚠ Route map URL is ${routeMapUrl.length} chars (>8000). May hit URL limits.`);
  }

  await fs.mkdir(PUBLIC_DIR, { recursive: true });

  console.log('\n4. Downloading origin map...');
  await fetchBinary(originMapUrl, path.join(PUBLIC_DIR, 'mapa-valdivia-origen.png'));

  console.log('\n5. Downloading route map...');
  await fetchBinary(routeMapUrl, path.join(PUBLIC_DIR, 'mapa-valdivia-con-ruta.png'));

  console.log('\n✅ Done! Mapas generados en remotion/public/');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});