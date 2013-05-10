$(document).ready(

	function(){
			var nickname = document.getElementById('myDiv').textContent;
			$.ajax({
	        type: 'GET',
	  		
	        url: "/user?nickname="+nickname,
	        xhrFields: {
	         withCredentials: false 
	        },
	        success: function(result){
	            var obj = JSON.parse(result);
	            var moviesArr = obj['movies'];
	            var sportsArr = obj['sports'];
	            var musicsArr = obj['musics'];
	            var gamesArr = obj['games'];
	           

	           	checkExisitngBoxes('movie');
	           	checkExisitngBoxes('game');
	           	checkExisitngBoxes('sport');
	           	checkExisitngBoxes('music');

	            function checkExisitngBoxes(idName)
	            {
	            	var keyName = idName +"s";
	            	var arrName = obj[keyName];
	             	var checkboxes = document.getElementsByName(idName);
	             	for (var j = 0; j < arrName.length;j++)
		            {
		             	checkboxes[arrName[j]].checked = true;
		            }

	            }


	        }
	        }); // callback



});
function getAllChecked()
{
	var musics = getCheckedBoxes("music");
	var movies = getCheckedBoxes("movie");
	var sports = getCheckedBoxes("sport");
	var games = getCheckedBoxes("game");
	var nickname = document.getElementById('myDiv').textContent;
	var mydata = '{"nickname":"'+ nickname +'", "musics":'+musics+', "movies":'+movies+', "games":'+games+', "sports":'+sports+'}';
	$.ajax({
    type: 'POST',
    data: mydata,
    url: "/user",
    xhrFields: {
     withCredentials: false 
    },
    success: function(result){
    	 alert("Save Successfully!");
         window.location = "/";
    } // callback
});


}


function getCheckedBoxes(name) {
  var checkboxes = document.getElementsByName(name);
  var checkboxesChecked = [];
  // loop over them all
  for (var i=0; i<checkboxes.length; i++) {
     // And stick the checked ones onto an array...
     if (checkboxes[i].checked) {
        checkboxesChecked.push(i);
     }
  }
  // Return the array if it is non-empty, or null
  var id_name = "hidden_"+name;
  var str = JSON.stringify(checkboxesChecked);
  return str;
}
	