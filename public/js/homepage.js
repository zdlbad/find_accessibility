/* eslint-disable*/

console.log('Hello from the mapbox.js .');

mapboxgl.accessToken = 'pk.eyJ1IjoiemRsYmFkIiwiYSI6ImNrZG40bnRhMjFleWEyenBkbXlqNGl6MzUifQ.9A8dhjvLqauqyQfdrcXZSA';

const locationForm = document.getElementById('locationForm');
const typeToilet = document.getElementById('locationType1');
const parking = document.getElementById('locationType2');
const trainStation = document.getElementById('locationType3');
const centerLat = document.getElementById('centerLat');
const centerLng = document.getElementById('centerLng');
const searchRadius = document.getElementById('searchRadius');
const searchRadiusLabel = document.getElementById('searchRadiusLabel');
const dragableMarker = new mapboxgl.Marker({ draggable: true });
const currentMarkers = [];
let map;

const initPage = () => {
  initMap();

  updateCenterLabel();

  locationForm.addEventListener('submit', async (e) => {
    //search locations
    const locations = await searchLocations(e);

    //display in map
    cleanMarkers(currentMarkers);
    addMarkers(locations);
    displayMarkersInBounds(currentMarkers);

    //show in list
    clearElement('reviews-block');
    clearElement('locations-block');
    showLocationList(locations);
  });

  searchRadius.onchange = () => {
    searchRadiusLabel.innerHTML = searchRadius.value;
  };
};

const initMap = () => {
  if ('geolocation' in navigator) {
    //create map
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/zdlbad/ckdn5oa9v0tq51imwhzib3hyu',
      scrollZoom: false,
      center: [0, 0], // lng,lat
      zoom: 12,
      maxZoom: 15,
      minZoom: 1,
    });

    map.addControl(new mapboxgl.NavigationControl());

    //add move to current location control button
    map.addControl(
      new mapboxgl.GeolocateControl({
        showAccuracyCircle: false,
        trackUserLocation: true,
      })
    );

    // make draggable appear on a click
    map.on('click', (e) => {
      dragableMarker.setLngLat(e.lngLat);
      updateCenterLabel();
    });

    // get current location then add dragable marker and move camera
    navigator.geolocation.getCurrentPosition((position) => {
      const { longitude, latitude } = position.coords;

      //add dragable marker and popup
      dragableMarker.setLngLat([longitude, latitude]).on('dragend', updateCenterLabel).addTo(map);

      //move camera to current location
      map.flyTo({
        center: [longitude, latitude],
        essential: true,
      });
    });
  } else {
    /* geolocation IS NOT available, handle it */
  }
};

// locations
const updateCenterLabel = () => {
  if (dragableMarker.getLngLat()) {
    centerLng.innerHTML = dragableMarker.getLngLat().lng;
    centerLat.innerHTML = dragableMarker.getLngLat().lat;
  }
};

const cleanMarkers = (markers) => {
  markers.forEach((marker) => {
    marker.remove();
  });
  markers.length = 0;
};

const addMarkers = (locations) => {
  if (!locations) return;
  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    console.log(loc.locationType);
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
      .setHTML(`<p> ${loc.locationType}: ${loc.name}</p> <p> Description: ${loc.location.description} </p>`);

    // Add marker
    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    });

    marker.getElement().addEventListener('click', async (e) => {
      e.stopPropagation();
      const reviews = await searchReviews(loc.id);
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
    maxZoom: 20,
  });
};

const getParams = () => {
  const params = {};
  const typeSelected = [];

  // get center
  params.center = [dragableMarker.getLngLat().lng, dragableMarker.getLngLat().lat].join(',');

  // get radius (km)
  params.within = searchRadius.value;

  //get toilet search filters
  if (typeToilet.checked) {
    typeSelected.push('toilet');
    const toiletGender = document.getElementsByName('toiletGender');
    toiletGender.forEach((el) => {
      if (el.checked) params[el.value] = true;
    });
    const toiletWheelchair = document.getElementsByName('toiletWheelChairAccessibility');
    toiletWheelchair.forEach((el) => {
      if (el.checked) if (el.value) params[el.value] = true;
    });
  }

  //get toilet search filters
  if (parking.checked) typeSelected.push('parking');

  //get toilet search filters
  if (trainStation.checked) {
    typeSelected.push('trainStation');
    //trainStationHasLift
    const trainStationHasLift = document.getElementsByName('trainStationHasLift');
    trainStationHasLift.forEach((el) => {
      if (el.checked) if (el.value) params[el.value] = true;
    });
  }

  params.locationType = { in: typeSelected.join(',') };

  console.log(params);
  return params;
};

const searchLocations = async (e) => {
  console.log('searching locations... ');

  e.preventDefault();

  const params = getParams();

  const res = await axios({
    method: 'POST',
    params,
    url: '/app/api/locations',
  });

  console.log('Results length: ', res.data.data.locations.length);
  if (res.data.data.locations.length == 0) return;
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
    const desp = document.createElement('div');
    desp.innerHTML = `Decription: ${loc.location.description}`;
    const addr = document.createElement('div');
    addr.innerHTML = `Address: ${loc.location.address}`;
    div.appendChild(type);
    div.appendChild(name);
    div.appendChild(desp);
    div.appendChild(addr);
    const li = document.createElement('li');
    li.appendChild(div);
    ul.appendChild(li);
  });
};

//reviews
const searchReviews = async (locationId) => {
  console.log('searching reviews on location: ', locationId);

  const params = {};
  params.location = locationId;

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

initPage();
