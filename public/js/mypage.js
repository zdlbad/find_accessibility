/* eslint-disable*/

console.log('Hello from mypage.js .');

mapboxgl.accessToken = 'pk.eyJ1IjoiemRsYmFkIiwiYSI6ImNrZG40bnRhMjFleWEyenBkbXlqNGl6MzUifQ.9A8dhjvLqauqyQfdrcXZSA';
const userId = document.getElementById('userInfo').dataset.userid;
const currentMarkers = [];

let map;

const initMap = async () => {
  //create map
  map = new mapboxgl.Map({
    container: 'personalMap',
    style: 'mapbox://styles/zdlbad/ckdn5oa9v0tq51imwhzib3hyu',
    scrollZoom: true,
    center: [0, 0], // lng,lat
    maxZoom: 20,
    minZoom: 1,
  });

  //search reviews
  const reviews = await searchReviews();
  clearElement('reviews-block');
  showReviewsList(reviews);

  //search locations
  const locations = await searchLocations();
  clearElement('locations-block');
  showLocationList(locations);
  addMarkers(locations);
  displayMarkersInBounds(currentMarkers);
};

const addMarkers = (locations) => {
  if (!locations) return;
  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add popup to marker
    const popup = new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.location.coordinates)
      .setHTML(`<p> Description: ${loc.location.description} </p>`);

    // Add marker
    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    });

    marker.getElement().addEventListener('click', async (e) => {
      const reviews = await searchReviews(loc._id);
      clearElement('reviews-block');
      showReviewsList(reviews);
    });
    marker.setLngLat(loc.location.coordinates).setPopup(popup);

    currentMarkers.push(marker);
  });
};

const displayMarkersInBounds = (markers) => {
  if (markers.length === 0) return;
  const bounds = new mapboxgl.LngLatBounds();

  markers.forEach((marker) => {
    marker.addTo(map);
    bounds.extend([marker.getLngLat().lng, marker.getLngLat().lat]);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 250,
      left: 200,
      right: 100,
    },
    maxZoom: 15,
  });
};

const searchLocations = async () => {
  console.log('searching locations... ');

  const res = await axios({
    method: 'GET',
    url: '/api/locations/visitedLocations',
  });

  console.log('Results length: ', res.data.data.locations.length);
  if (res.data.data.locations.length === 0) return;
  return res.data.data.locations;
};

const showLocationList = (locations) => {
  if (!locations) return;
  const locationsBlock = document.getElementById('locations-block');
  const ul = document.createElement('ul');
  locationsBlock.appendChild(ul);
  locations.forEach((location) => {
    const li = document.createElement('li');
    ul.appendChild(li);
    li.innerHTML = `location: ${location._id}`;
  });
};

//reviews
const searchReviews = async (locationId) => {
  console.log('searching reviews...');

  const params = {};
  if (locationId) params.location = locationId;
  params.user = userId;
  const res = await axios({
    method: 'GET',
    params,
    url: '/api/reviews',
  });

  console.log('Results length: ', res.data.data.reviews.length);
  return res.data.data.reviews;
};

const clearElement = (elementId) => {
  const element = document.getElementById(elementId);
  while (element.firstChild) element.removeChild(element.firstChild);
};

const showReviewsList = (reviews) => {
  const reviewsBlock = document.getElementById('reviews-block');
  const ul = document.createElement('ul');
  reviewsBlock.appendChild(ul);
  reviews.forEach((review) => {
    const li = document.createElement('li');
    ul.appendChild(li);
    li.innerHTML = `reivew: ${review.id}`;
  });
};

initMap();

document.getElementById('logout').addEventListener('click', async function () {
  if (confirm('Do you confirm to log out? ')) {
    try {
      const res = await axios({
        method: 'GET',
        url: '/api/auth/logout',
      });
      if (res.data.status === 'success') {
        alert('successfully logged out!');
        window.setTimeout(() => {
          location.assign('/homepage');
        }, 500);
      }
    } catch (err) {
      alert('failed to log out!');
    }
  }
});
