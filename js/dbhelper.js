/**
 * Common database helper functions.
 */

var dbPromise;
var dbExists;

var data;

class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   * UPDATE --> change baseof the server to get data from 1337
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   * UPDATE --> Switched XHR request with Fetch
   * UPDATE --> Able to store JSON responses in IndexedDB, not sure if it's the right place though
   */
  static fetchRestaurants(callback) {
    if (DBHelper.data == undefined) {
        fetch(DBHelper.DATABASE_URL).then(function(response) {
        var response = response.json();
        return response;
      }).then(addTest).catch(function(data) {
        callback(null, []);
      });
    } else {
        const restaurants = DBHelper.data;
        callback(null, restaurants);
        dbExists = true;
    }

    function addTest(data) {
      const restaurants = data;
      callback(null, restaurants);
      dbExists = true;
    }
  }


static createAndUpdateDB(val) { 
  'use strict';

  //check for support 
  if (!('indexedDB' in window)) { 
    console.log('This browser doesn\'t support IndexedDB'); 
  return; }

  var dbPromise = idb.open('restaurant-reviews', 1, function(upgradeDb){ 
    if (!upgradeDb.objectStoreNames.contains('restaurants')) { 
      upgradeDb.createObjectStore('restaurants', {keyPath: 'id'}); 
    } 
  });
  return dbPromise;
}


  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants

        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants

    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   * * UPDATE --> Server doesn't have photgraph data for Casa Enqrique, added manually.
   */ 
  static imageUrlForRestaurant(restaurant) {
    if (restaurant.name == "Casa Enrique") {
        return (`/img/10.jpg`); 
    }
    return (`/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
      const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

    static openDb(callback) { 

        var dbRequest = idb.open('sean-db', 1, function(upgradeDB) {
            if (!upgradeDB.objectStoreNames.contains('keyval')) {
                var keyValStore = upgradeDB.createObjectStore('keyval');
                keyValStore.put(callback, 'ayo');
            } 
        });

        dbRequest.onupgradeneeded = function (event) {

            db = event.target.result;
            var store = dbRequest.result.createObjectStore('restaurants', {
                keyPath: 'id'
            });
            store.createIndex('neighborhoods', 'neighborhood');
            store.createIndex('cuisines', 'cuisine_type');
        };

        dbRequest.onsuccess = function (event) {
            db = event.target.result;
            callback(true);
        };

        dbRequest.onerror = function (event) {
            console.error("db error");
            callback(false);
        }
    }  

}
