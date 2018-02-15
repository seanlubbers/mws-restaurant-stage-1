let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

// debugger;
// var dbPromise = idb.open('testy-db', 2, function(upgradeDB) {

//     switch(upgradeDB.oldVersion) {
//       case 0:
//         var keyValStore = upgradeDB.createObjectStore('keyval');
//         keyValStore.put('dom I have tor efresh erytime', 'suh');
//       case 1:
//         upgradeDB.createObjectStore('people', {keyPath: 'name'}); 
//     }
// }); 

// dbPromise.then(function(db) {
//   var tx = db.transaction('keyval');
//   var keyValStore = tx.objectStore('keyval');
//   return keyValStore.get('suh');
// }).then(function(val) {
//   console.log('the value of "suh" is:', val);
// });

// dbPromise.then(function(db) {
//   var tx = db.transaction('keyval', 'readwrite');
//   var keyValStore = tx.objectStore('keyval');
//   keyValStore.put('bar', 'foo');
//   return tx.complete;
// }).then(function(val) {
//   console.log('added foo bar bruh');
// });



// dbPromise.then(function(db) {
//   var tx = db.transaction('people', 'readwrite');
//   var peopleStore = tx.objectStore('people');

//   peopleStore.put({
//     name: 'Sean Lubbers',
//     age: 25,
//     favoriteAnimal: "Redtailed Hawk"
//   });

//   peopleStore.put({
//     name: 'Rockenstein',
//     age: 222,
//     favoriteAnimal: "Raccooon"
//   });  
//   return tx.complete;
// });


// dbPromise.then(function(db) {
//   var tx = db.transaction('people');
//   var peopleStore = tx.objectStore('people');

//   return peopleStore.getAll();
// }).then(function(people) {
//   console.log("People:", people);
// });




      // var tx = theDB.transaction('wittrs', 'readwrite');
      // var store = tx.objectStore('wittrs');
        
      // response.forEach(function(message) {
      //   store.put(message); 
      // });

      //   debugger;

 // var newDB = idb.open('wittr', 1, function(upgradeDB) {
 //        var store = upgradeDB.createObjectStore('wittrs', {
 //          keyPath: 'id'
 //        }); 
 //      });


/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {

  fetchNeighborhoods();
  fetchCuisines();
});


/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

var MAP;

/**
 * Initialize Google map, called from HTML.
 */

window.initMap = () => {

  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };

  var mapOptions = {
    zoom: 12,
    center: loc,
    scrollwheel: false
  }

  MAP = new google.maps.Map(document.getElementById('map'), mapOptions);


  updateRestaurants();
}



/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    // ul.append(createRestaurantHTML(restaurant));

    var new_restaurant = createRestaurantHTML(restaurant);
    ul.append(new_restaurant);



  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  // New
  // * UPDATE --> Alt text no longer exists, changed to the restuarant name attribute
  image.alt = restaurant.name + " Image";
  // End
  li.append(image);

  const name = document.createElement('h2');
  // New
  name.tabIndex = 0;
  // End
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}


