import {europeanCities} from "./city_list.js";


/////////////////////////////////
// Initialization of variables //
/////////////////////////////////
let map;
var randomNumber = Math.floor(Math.random() * europeanCities.length);
let currentCity = europeanCities[randomNumber];
let questionText = document.getElementById("question-text");
let nextButton = document.getElementById("next-button");
let tipButton = document.getElementById("tip-button");
let currentTip;


///////////////////////////////
// Initialization of the map //
///////////////////////////////
async function initMap() {
  
  // Requesting the necessary Google libraries
  const { Map, InfoWindow  } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement, PinElement  } = await google.maps.importLibrary("marker");


  const mapCenter = new google.maps.LatLng( 47.35953600, 8.63564520)
  
  var mapProp= {
    center: mapCenter,
    zoom:5,
    mapTypeId: 'terrain',
    mapId: 'a2042d9e1814e9c',
  };

  // The map, centered at London
  map = new Map(document.getElementById("map"), mapProp);
  map.setTilt(45);

  // Adding map styles
  /*var customStyled = [
    {
      featureType: "all",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ],
    }
  ];
  map.set('styles', customStyled);*/
  map.setOptions({draggableCursor: "url(http://127.0.0.1:5500/src/map_pin.svg) 500 670, pointer"});
 
  // Initializing event listener
  google.maps.event.addListener(map, 'click', function(event) {
    guessLocation(event.latLng);
  });

  // Adding event listener for recentering the map
  google.maps.event.addListenerOnce(map, 'drag', () => {
    const recenterDiv = document.createElement("div");
    const recenterButton = document.createElement("button");

    recenterButton.setAttribute("id","recenter-button");
    recenterButton.innerText = "Recenter the map";
    recenterButton.addEventListener("click", () => {
      // Reset the example by reloading the map iframe.
      smoothlyZoomWorkarround(5, mapCenter);
    });
    recenterDiv.appendChild(recenterButton);
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(recenterDiv);
  })

  // Adding event listener for next question
  nextButton.addEventListener("click", nextQuestion);

  // Adding event listener for tip
  tipButton.addEventListener("click", getTip);

}

initMap();


////////////////////////////////////
// Inizialization of the question //
////////////////////////////////////
function startQuestion(){
    questionText.innerText = "Where is " + currentCity.name + "?";
    nextButton.classList.add("hide");
    tipButton.classList.remove('hide');
}
startQuestion();


//////////////////////////
// Functions for events //
//////////////////////////

/* GUESS LOCATION
This function checks whether the clicked location corresponds with the searched city */

function guessLocation(click){
  // Getting current city location
  let currentCityLocation = new google.maps.LatLng(currentCity.lat, currentCity.lng);

  if (checkPlace(click, currentCityLocation) == true){
    // code executes in case of right guess
    markCorrectGuess(click, currentCityLocation);

  } else {
    // code executes in case of wrong guess
    markWrongGuess(click);
  }
}


/* CHECK PLACE
This function checks whether the clicked location corresponds with the searched city */

function checkPlace(click, currentCityLocation){    
  if (Math.abs(click.lat() - currentCityLocation.lat()) < 0.1 && Math.abs(click.lng() - currentCityLocation.lng()) < 0.1){
    return true;
  } else {
    return false;
  }
}


/* CORRECT GUESS
This function adds a circle around the city that's been found and adds an marker with an info window */

function markCorrectGuess(click, currentCityLocation){
  var circleCity = new google.maps.Circle({
    center: currentCityLocation,
    radius:10000,
    strokeColor:"#0000FF",
    strokeOpacity:0.4,
    strokeWeight:2,
    fillColor:"#0000FF",
    fillOpacity:0.2
  });
  circleCity.setMap(map);

  // Creating Marker with legacy Marker Element
  /*const pinImage_svg = "http://127.0.0.1:5500/src/map_pin_small_new.svg";

  var marker_city = new google.maps.Marker({
    map: map,
    position: click,
    animation:google.maps.Animation.DROP,
    icon: pinImage_svg,
    //anchor: new google.maps.Point(0, -670)
  });*/

  // Creating Marker with Advanced Marker Element
  const pinImage = document.createElement("img");
  pinImage.src = "http://127.0.0.1:5500/src/map_pin_even_smaller.png";

  const markerCity = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: click,
      content: pinImage,
  });
    
  markerCity.setMap(map);
  smoothlyZoomWorkarround(11, currentCityLocation);

  var infowindow = new google.maps.InfoWindow({
    content: "Congratulations! You found " + currentCity.name +"!"
  });
  infowindow.open(map,markerCity);

  window.setTimeout(() => {
    infowindow.close();
  }, 3000);

  tipButton.classList.add('hide');
  nextButton.classList.remove('hide');
  currentTip.setMap();
  currentTip = null;
}


/* WRONG GUESS
This function adds an animated marker in case of a wrong guess and */

function markWrongGuess(click){
  const failImage = document.createElement("img");
  failImage.setAttribute("class", "fail-icon");
  failImage.src = "http://127.0.0.1:5500/src/small_fail_icon.png";

  const markerFail = new google.maps.marker.AdvancedMarkerElement({
      position: click,
      content: failImage,
  });

  markerFail.setMap(map);

  setTimeout(()=>{
    markerFail.setMap();
  }, 500)
}


/* GET TIP
This function creates a circle that is centered around a random point within 0-1° latitude and longitude from the current city's location*/

function getTip(){
  if (!currentTip){
    setTip(2, 225000, 7);
    tipButton.innerText = "Get even hotter tip";
  } else {
    currentTip.setMap();
    setTip(0.5, 65000, 9)
    tipButton.classList.add('hide');
    tipButton.innerText = "Get tip";
  }
}

/* SET TIP 
This function sets the circle on the map wich serves as the tip */
function setTip(maxDist, radius, maxZoom){
  let almostLat = currentCity.lat + ranNum(maxDist);
  let almostLng = currentCity.lng + ranNum(maxDist);
  let almostCurrentCityLocation = new google.maps.LatLng(almostLat, almostLng);

  currentTip = new google.maps.Circle({
    center: almostCurrentCityLocation,
    radius:radius,
    strokeColor:"#0000FF",
    strokeOpacity:0.2,
    strokeWeight:1,
    fillColor:"#0000FF",
    fillOpacity:0.2,
    clickable: false
  });
  currentTip.setMap(map);
    
  let zoom = map.getZoom();
  if (zoom > maxZoom) {
    zoom = maxZoom;
  }    
  smoothlyZoomWorkarround(zoom, almostCurrentCityLocation);
}

function removeTips(){
  //TODO remove all tips after city is found
}


/* RANDOM NUMBER
This function returns a random number  between "maxNum" and minus "maxNum" */
function ranNum(maxNum){
  let ranNum = Math.random() * maxNum;
  let posOrNeg = Math.round(Math.random());
  if (posOrNeg === 0){
    ranNum *= -1;
  }
  return ranNum;
}


/* NEXT QUESTION
This function initiates the next question */

function nextQuestion(){
    // The city for the next question is extracted randomly from the europeanCities array
    var new_random_number = Math.floor(Math.random() * europeanCities.length);
    if (new_random_number == randomNumber && new_random_number != europeanCities.length){
        new_random_number += 1;
    }
    currentCity = europeanCities[new_random_number];
    startQuestion();
}


/* SMOOTHLY ZOOM
This function makes the map zoom smoothely to the desired location */

function smoothlyZoomWorkarround(desiredZoom, desiredLocation) {
  var initialZoom = map.getZoom();
  var initialCenter = map.getCenter();

  map.panTo(desiredLocation);

  const smoothZoom = (zoomValue) => {
    if (zoomValue < desiredZoom){
      window.setTimeout(() => {
        zoomValue += 1;
        map.setZoom(zoomValue);
        /*var halfway = () => {
          var latitude = desiredLocation.lat() + ((Math.abs(initialCenter.lat() - desiredLocation.lat())) / 2);
          var longitude = desiredLocation.lng() + ((Math.abs(initialCenter.lng() - desiredLocation.lng())) / 2);
          return new google.maps.LatLng(latitude, longitude);
        };
        map.panTo(halfway);*/
        smoothZoom(zoomValue);
      }, 400);
    } else if (zoomValue > desiredZoom) {
      window.setTimeout(() => {
        zoomValue -= 1;
        map.setZoom(zoomValue);
        /*var halfway = () => {
          var latitude = desiredLocation.lat() + ((Math.abs(initialCenter.lat() - desiredLocation.lat())) / 2);
          var longitude = desiredLocation.lng() + ((Math.abs(initialCenter.lng() - desiredLocation.lng())) / 2);
          return new google.maps.LatLng(latitude, longitude);
        };
        map.panTo(halfway);*/
        smoothZoom(zoomValue);
      }, 400);
    } else {
      return;
    }
  }

  smoothZoom(initialZoom);
}


/* USEFUL STUFF
Other functions that might proof useful
*/
function useful_stuff() {  
    // How to add a marker
    /*var marker = new google.maps.Marker({
      position: { lat: 51.508742, lng: -0.120850 },
      animation:google.maps.Animation.DROP
    });
    marker.setMap(map);*/
  
    //////////////////////////////////////////////////
  
    // How to add a polyline
    /*var myTrip = [{ lat: 51.508742, lng: -0.120850 }, { lat: 52.37403000, lng: 4.88969000}];
    var flightPath = new google.maps.Polyline({
      path:myTrip,
      strokeColor:"#000FFF",
      strokeOpacity:0.5,
      strokeWeight:2
    });
    flightPath.setMap(map);*/
  
    //////////////////////////////////////////////////
  
    // How to add a polygon
    /*var myTrip = [{ lat: 52.52000660, lng: 13.40495400}, { lat: 48.85341, lng: 2.3488}, { lat: 41.89193, lng: 12.51133}, {lat: 48.13743, lng: 11.57549}];
    var area = new google.maps.Polygon({
      path:myTrip,
      strokeColor:"#0000FF",
      strokeOpacity:0.1,
      strokeWeight:1,
      fillColor:"#0000FF",
      fillOpacity:0.3
    });
    area.setMap(map);*/
  
    //////////////////////////////////////////////////
  
    // How to circle a city
    /*var myCity = new google.maps.Circle({
      center:new google.maps.LatLng(40.4165, -3.70256),
      radius:200000,
      strokeColor:"#0000FF",
      strokeOpacity:0.8,
      strokeWeight:2,
      fillColor:"#0000FF",
      fillOpacity:0.4
    });
    myCity.setMap(map);*/
  
    // How to add an info window
    /*var infowindow = new google.maps.InfoWindow({
      content:"Hello World!"
    });
  
    google.maps.event.addListener(marker,'click',function() {
      var pos = map.getZoom();
      map.setZoom(9);
      map.setCenter(marker.getPosition());
      infowindow.open(map,marker);
      window.setTimeout(function() {map.setZoom(pos); infowindow.close(map,marker);},3000);
    });*/
  
    // How to add a marker with info window
    /*google.maps.event.addListener(map, 'click', function(event) {
      placeMarker(map, event.latLng);
    });
  
    new_markers = [];
  
    function placeMarker(map, location) {
      var new_marker = new google.maps.Marker({
        position: location,
        map: map
      });
      new_markers.push(new_marker);
  
      var new_infowindow = new google.maps.InfoWindow({
        content: 'Latitude: ' + location.lat() +
        '<br>Longitude: ' + location.lng()
      });
      new_infowindow.open(map,new_marker);
    }*/
  
}