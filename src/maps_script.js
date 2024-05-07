import {europeanCities} from "./city_list.js";
//import {} from 

/////////////////////////////////
// Initialization of variables //
/////////////////////////////////
let map;
var random_number = Math.floor(Math.random() * 101);
let current_city = europeanCities[random_number];
let question_text = document.getElementById("question-text");
let next_button = document.getElementById("next-button");
next_button.addEventListener("click", nextQuestion);

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
    guessLocation(map, event.latLng);
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
}

initMap();

////////////////////////////////////
// Inizialization of the question //
////////////////////////////////////
function startQuestion(){
    question_text.innerText = "Where is " + current_city.name + "?";
    next_button.classList.add("hide");
}
startQuestion();

//////////////////////////
// Functions for events //
//////////////////////////
function guessLocation(map, click){
  // Getting current city location
  let currentCityLocation = new google.maps.LatLng(current_city.lat, current_city.lng);

  if (checkPlace(click, currentCityLocation) == true){
    // code executes in case of right guess
    var circle_city = new google.maps.Circle({
      center: currentCityLocation,
      radius:10000,
      strokeColor:"#0000FF",
      strokeOpacity:0.4,
      strokeWeight:2,
      fillColor:"#0000FF",
      fillOpacity:0.2
    });
    circle_city.setMap(map);

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
      content: "Congratulations! You found " + current_city.name +"!"
    });
    infowindow.open(map,markerCity);

    window.setTimeout(() => {
      infowindow.close();
    }, 3000);

    next_button.classList.remove('hide');
  } else {
    //Todo animation for wrong guess
    // Creating Marker with Advanced Marker Element
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
}

function getTip (){
  //TODO circle searched city
}

function removeTips(){
  //TODO remove all tips after city is found
}

function checkPlace(click, currentCityLocation){    
    if (Math.abs(click.lat() - currentCityLocation.lat()) < 0.1 && Math.abs(click.lng() - currentCityLocation.lng()) < 0.1){
      return true;
    } else {
      return false;
    }
}

function nextQuestion(){
    var new_random_number = Math.floor(Math.random() * 101);
    if (new_random_number == random_number && new_random_number != 100){
        new_random_number += 1;
    }
    current_city = europeanCities[new_random_number];
    startQuestion();
}

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