var geocoder;
var map;
var infowindow = new google.maps.InfoWindow();
var marker;
var latlng;
var geocoder;


 $(document).ready(function() {
      
        
  });
   


window.onload = function(){
	getLocation();
 // testUserCreateHandler();
}



 function testUserCreateHandler(lo, la){

      var nickname = document.getElementById("nickName").textContent;
      var mydata = '{"nickname":"'+nickname+'", "longitude":'+lo+', "latitude":'+la+'}';

      $.ajax({
          type: 'POST',
          data: mydata,
          url: "/createuser",
          xhrFields: {
          withCredentials: false 
          },
          success: function(result){
           //   alert('UserCreateHandler success!');
          } // callback
      });
}



function getLocation()
{
  if (navigator.geolocation)
  {
    	navigator.geolocation.getCurrentPosition(showPosition,showError);
  }
  else{x.innerHTML="Geolocation is not supported by this browser.";}
}

function showPosition(position)
{
  var latlon=position.coords.latitude+","+position.coords.longitude;
  initialize(position.coords.latitude, position.coords.longitude);

  document.getElementById("coordinateholder").innerHTML = latlon;

  
  codeLatLng();
  testUserCreateHandler(position.coords.longitude, position.coords.latitude)
}

function showError(error)
  {
  switch(error.code) 
    {
    case error.PERMISSION_DENIED:
      x.innerHTML="User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
      x.innerHTML="Location information is unavailable."
      break;
    case error.TIMEOUT:
      x.innerHTML="The request to get user location timed out."
      break;
    case error.UNKNOWN_ERROR:
      x.innerHTML="An unknown error occurred."
      break;
    }
  }

 function initialize(lati, longt) {
 		 geocoder = new google.maps.Geocoder();
 		latlng = new google.maps.LatLng(lati, longt);
        var mapOptions = {
          center: latlng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("mapholder"),
            mapOptions);
      }
     

function codeLatLng() {
  geocoder.geocode({'latLng': latlng}, function(results, status) {
  	 
    if (status == google.maps.GeocoderStatus.OK) {
      if (results[1]) {
        map.setZoom(16);
        marker = new google.maps.Marker({
            position: latlng,
            map: map
        });
        var address = results[0].formatted_address;
        document.getElementById("locationholder").innerHTML = address;
      } else {
        //alert('No results found');
      }
    } else {
      //alert('Geocoder failed due to: ' + status);
    }
  });
}