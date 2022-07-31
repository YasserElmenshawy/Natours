/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken = 
'pk.eyJ1IjoieWFzc2VyMTgiLCJhIjoiY2w1enQzNGJpMWdhcTNibnEyZXdyOXZ6NiJ9.7AGzYldfdaa-094Zui6Vww';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/yasser18/cl5zuhj69000r14o89ddbx5rp'
});