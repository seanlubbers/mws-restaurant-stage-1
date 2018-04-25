let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  // New
  name.tabIndex = restaurant.tabIndex;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  // New
  address.tabIndex = 0;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  // !!! Update --> Adding alt text to the reviews page image
  image.alt = restaurant.name + " restaurant image";

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }

  // Filling the checkbox
  fillFavorite();

  // fill reviews
  fillReviewsHTML();

}


// Takes care of filling the checkbox state
fillFavorite = () => {
  const label = document.getElementById('swatch');
  const check = document.createElement('input');
  check.setAttribute("type", "checkbox");
  check.setAttribute("id", "checkerati");
  label.appendChild(check);

  const page_url = window.location.href;
  // Use included function to get restaurant's ID
  const no_flockin = getParameterByName('id', page_url);
  // Create DB address that points to restaurant's reviews
  const new_url = 'http://localhost:1337/restaurants/' + no_flockin + '/?is_favorite'

  fetch(new_url).then(function(response) {
    var response = response.json();
    return response;
  }).then(function(rep) {
      const new_shit = rep.is_favorite;
      if (new_shit == "true") {
        check.setAttribute("checked", true);
        const onoroff = document.getElementById('swatch');
        onoroff.setAttribute("class", "favon");
      } else {
        const onoroff = document.getElementById('swatch');
        onoroff.setAttribute("class", "favoff");
      }
    });

  check.addEventListener("change", myScript2);
}


myScript2 = () => {
  const element = document.getElementById('checkerati');
  if (element.value == "on") {
    // Get current URL (with ID)
    const page_url = window.location.href;
    // Use included function to get restaurant's ID
    const no_flockin = getParameterByName('id', page_url);
    // Create DB address that points to restaurant's reviews
    const new_url = 'http://localhost:1337/restaurants/' + no_flockin + '/?is_favorite'

    fetch(new_url).then(function(response) {
      var response = response.json();
      return response;
    }).then(function(rep) {
        const new_shit = rep.is_favorite
        return new_shit;
    }).then(function(tf) {
        var newest_url;
        if (tf == "true") {
          newest_url = new_url + "=" + false;
        } else {
          newest_url = new_url + "=" + true;
        }
        return newest_url;
    }).then(function(newest_url) {
          fetch(newest_url, {
          method: 'post',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({"is_favorite": false})
          }).then(function(res) {
            console.log('res is: ', res);
          });
    });
}
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');
    // New
    row.tabIndex = 0;
    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  // Get current URL (with ID)
  const page_url = window.location.href;
  // Use included function to get restaurant's ID
  const no_flockin = getParameterByName('id', page_url);
  // Create DB address that points to restaurant's reviews
  const final_addy = 'http://localhost:1337/reviews/?restaurant_id=' + no_flockin;
  // Create the reviews and add them to the page
  fetch(final_addy).then(function(response) {
      var response = response.json();
      return response;
  }).then(function(rep) {
      const container = document.getElementById('reviews-container');
      const title = document.createElement('h2');
      title.innerHTML = 'Reviews';
      container.appendChild(title);

      if (!rep) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
      }
      const ul = document.getElementById('reviews-list');
      rep.forEach(review => {
        ul.appendChild(createReviewHTML(review));
      });
      container.appendChild(ul);

      // // Create the reviews form
      container.appendChild(createReviewFormTitle());
      const formula = createReviewForm();
      container.appendChild(formula);
  });
  }

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.createdAt;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}


/**
 * Creates a form title and adds it to the page
 */
createReviewFormTitle = () => {
  const title2 = document.createElement('h2');
  title2.innerHTML = 'Leave a Review';
  return title2;
}


myScript = (form) => {
  const what_it_do1 = document.getElementById("unique_form").name.value;
  const what_it_do2 = document.getElementById("unique_form").restaurant_id.value;
  const what_it_do3 = document.getElementById("unique_form").rating.value;
  const what_it_do4 = document.getElementById("unique_form").comments.value;

  fetch('http://localhost:1337/reviews/', {
  method: 'post',
  headers: {
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({"restaurant_id": what_it_do2, "name": what_it_do1, "rating": what_it_do3, "comments": what_it_do4})
  }).then(res=>res.json())
  .then(res => console.log(res));
}

/**
 * Creates a review form adds it to the page
 */
createReviewForm = () => {
  const form1 = document.createElement('form');
  form1.id = "unique_form";
  form1.addEventListener("submit", myScript);

  const input5 = document.createElement('input');
  input5.type = "text";
  input5.name = "restaurant_id";

  const label5 = document.createElement('label');
  label5.innerHTML = "Restaurant ID: "
  form1.appendChild(label5);
  form1.appendChild(input5);
  const br5 = document.createElement('br');
  form1.appendChild(br5);

  const input1 = document.createElement('input');
  input1.type = "text";
  input1.name = "name"

  const label1 = document.createElement('label');
  label1.innerHTML = "Name: "
  form1.appendChild(label1);
  form1.appendChild(input1);
  const br = document.createElement('br');
  form1.appendChild(br);

  const input2 = document.createElement('input');
  input2.type = "text";
  input2.name = "rating";

  const label2 = document.createElement('label');
  label2.innerHTML = "Rating: "
  form1.appendChild(label2);
  form1.appendChild(input2);
  const br2 = document.createElement('br');
  form1.appendChild(br2);


  const input3 = document.createElement('textarea');
  input3.name = "comments";

  const label3 = document.createElement('label');
  input3.rows = "6";
  label3.innerHTML = "Comments: "
  form1.appendChild(label3);
  const br3 = document.createElement('br');
  form1.appendChild(br3);
  form1.appendChild(input3);

  const br4 = document.createElement('br');
  form1.appendChild(br4);
  const input4 = document.createElement('input');
  input4.type = "submit";
  form1.appendChild(input4);

  return form1;
}


/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
