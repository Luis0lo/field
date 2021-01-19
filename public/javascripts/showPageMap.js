mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
  center: field.geometry.coordinates, // starting position [lng, lat]
  zoom: 9, // starting zoom
});

new mapboxgl.Marker().setLngLat(field.geometry.coordinates).addTo(map);
