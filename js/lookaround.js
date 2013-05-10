var allInterests = {"movies": moviesArr, "musics" : musicsArr, "sports": sportsArr, "games":gamesArr}

$(document).ready(
	function(){
		function getCommonInterests(personInfo, cateName){
			cateArr = personInfo[cateName];
			if (cateArr.length == 0)
				return "No common " + cateName;
			var interest = allInterests[cateName];
			comInt = interest[cateArr[0]];			
			
			for(var j = 1 ; j < cateArr.length; j++)
			{
				var intIndex = cateArr[j];
				var genre = interest[intIndex];
				comInt += "," + genre;
			}

			comInt+= " " +cateName;
			return comInt;
		}

		var nickname = document.getElementById("nickName").textContent;

		$.ajax({
	        type: 'GET',	
	        url: "/findpeople?nickname="+ nickname,
	        xhrFields: {
	        withCredentials: false 
	        },
	        success: function(result)
	        {
	            var resArr = JSON.parse(result);
	            var retString = "";
	            for(i = 0; i< resArr.length;i++)
	            {
	            	person = resArr [i];
	            	var name = person['nickname'];
	            	var imgUrl = "<img style = 'float:left' src ='img/photo.jpg'/><div style='clear:both'></div>";
	            	var totCom = getCommonInterests(person, "movies") + "<br>"+
	            	getCommonInterests(person, "sports")+ "<br>"+
	            	getCommonInterests(person, "games")+ "<br>"+
	            	getCommonInterests(person, "musics")+ "<br>";

	            	var chatUrl = '/chat?nickname='+nickname+'&other='+name;
	            	var buttonsString = "<a href = '/viewUser?nickname="+name+"' value = '"+ name +"' class= 'btn btn-info btn-mini'>View Profile</a>"
	            						+"<a href='"+chatUrl+"' value = '"+ name +"' class= 'btn btn-warning btn-mini'>Chat With</a>"

	            	retString = retString + "<pre class='prettyprint'> <div style = 'float:left'>nickname: "+name +"</div><div clear:both></div>"+ imgUrl+"<br>"+totCom+ buttonsString+"<div id='newMsg'"+name+"></div></pre>"
	            }
	            $(".pageContainer").append(retString);	            
	        }
	        }); // callback
	}
);

