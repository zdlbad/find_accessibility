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
    scrollZoom: false,
      center: [0, 0], // lng,lat
      maxZoom: 20,
      minZoom: 1,
  });

  map.addControl(new mapboxgl.NavigationControl());

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
    console.log(loc.locationType)
    switch (loc.locationType) {
      case 'parking': el.className = 'marker-parking';break;
      case 'toilet': el.className = 'marker-toilet';break;
      case 'trainStation': el.className = 'marker-station';break;
      default: el.className = 'marker';
    }
    console.log(el.className);

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
    maxZoom: 15,
  });
};

const searchLocations = async () => {
  console.log('searching locations... ');

  const res = await axios({
    method: 'GET',
    url: '/app/api/locations/visitedLocations',
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
  locations.forEach((loc) => {
    const div = document.createElement('div');
    div.classList.add("location-box");
    const type = document.createElement('div')
    type.innerHTML = `Type: ${loc.locationType}`;
    const name = document.createElement('div');
    name.innerHTML = `Name: ${loc.name}`;
    const ratingAvg = document.createElement('div');
    ratingAvg.innerHTML = `Rating Average: ${loc.ratingAvg}`;
    const desp = document.createElement('div');
    desp.innerHTML = `Rating Average: ${loc.location.description}`;
    const addr = document.createElement('div');
    addr.innerHTML = `Address: ${loc.location.address}`;
    div.appendChild(type);
    div.appendChild(name);
    div.appendChild(ratingAvg);
    div.appendChild(desp);
    div.appendChild(addr);
    const li = document.createElement('li');
    li.appendChild(div);
    ul.appendChild(li);
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
    url: '/app/api/reviews',
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
  ul.classList.add('horizontal-list')
  reviewsBlock.appendChild(ul);
  reviews.forEach((rev) => {
    const box = document.createElement('div');
    box.classList.add("review-box");
    box.id = "review-box"

    const user = document.createElement('div')
    user.innerHTML = `<b>User:</b> ${rev.user.name}`;

    const comment = document.createElement('div');
    comment.innerHTML = `<b>Comments:</b> ${rev.comment}`;

    const rating = document.createElement('div');
    rating.innerHTML = `<b>Rating:</b> ${rev.rating}`;
    
    box.appendChild(user);
    box.appendChild(comment);
    box.appendChild(rating);
    const li = document.createElement('li');
    li.appendChild(box);
    ul.appendChild(li);
  });
};

initMap();

document.getElementById('logout').addEventListener('click', async function () {
  if (confirm('Do you confirm to log out? ')) {
    try {
      const res = await axios({
        method: 'GET',
        url: '/app/api/auth/logout',
      });
      if (res.data.status === 'success') {
        alert('successfully logged out!');
        window.setTimeout(() => {
          location.assign('/app/');
        }, 500);
      }
    } catch (err) {
      alert('failed to log out!');
    }
  }
});
