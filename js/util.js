var moviesArr = new Array("Action","Adult","Adventure","Animation","Biography","Comedy",
						"Crime","Drama","Document","Fantacy","History","Horror","Musical",
						"Mystery","Romance","Science");


var musicsArr = new Array("African", "Blues", "Caribbean", "Classical",
	"Country", "Eletronic", "Jazz", "Latin", "R&B", "Rap", "HipHop", "Rock");

var sportsArr = new Array("Badminton", "BaseBall", "Bowling", "Football",
	"Golf", "Racing", "Soccer", "Racing", "Skiing", "Swimming", "Tennis",
	"Volleyball");


var gamesArr =  new Array("Puzzle", "Hidden", "Time", "Adventure", "Match Three",
	"Strategy", "Marble", "Arcade", "Action", "Mahjong", "Card", "Board", "Brain",
	"Family");


function dummyFuntionforTest(){
	return 3;
}

function addNewChatMessage(key, sender, message, postTime){
	//var storage = window.localStorage;
	var allMsgs = localStorage.getItem(key);
	if (!allMsgs){
		var jsonMsg = [{"sender":sender, "message":message, "time":postTime}];
		localStorage.setItem(key, JSON.stringify(jsonMsg));
	}else{
		var msgArr = JSON.parse(allMsgs);
		console.log(msgArr);
		msgArr.push({"sender":sender, "message":message, "time":postTime});
		localStorage.setItem(key, JSON.stringify(msgArr));
	}

}



function addUnreadMsgs(sender){
	var unreadKey = "unread";
	var unreadMsgs = localStorage.getItem(unreadKey);
	var newUnread = [{"sender": sender, "numMsgs" : 1}];
	var number = 1;
	if (!unreadMsgs){
		localStorage.setItem(unreadKey, JSON.stringify(newUnread));
	}else{
		newCounts = JSON.parse(unreadMsgs);
		var foundSender = false;
		for (var i = 0; i < newCounts.length; i++){
			 if(newCounts[i]["sender"] == sender){
			 	var count = newCounts[i]["numMsgs"];
			 	count++;
			 	newCounts[i]["numMsgs"] = count;
			 	number = count;
			 	foundSender = true
			 }
		}
		if(!foundSender){
			newCounts.append({"sender": sender, "numMsgs" : 1})
		}
		localStorage.setItem(unreadKey, JSON.stringify(newCounts));
	}

	$(document).ready(
		function(){
			var nickname = document.getElementById("nickName").textContent;
			var str =  "<a href='/chat?nickname="+nickname+"&other="+sender+"'>"+sender + " sent you " + number + " new messages.</a><br>";
			
		
			$("#unreadMsg").html(str);
		}
	);

}


function getTimeString(){
	var currentdate = new Date();
	var datetime = "" + currentdate.getDate() + "/"
	+ (parseInt(currentdate.getMonth()) + 1) 
	+ "/" + currentdate.getFullYear() + "  " 
	+ currentdate.getHours() + ":" 
	+ currentdate.getMinutes() + ":" + currentdate.getSeconds();
	return datetime;
}

function onMessage (message){
	var currUrl = document.URL;
	if (currUrl.indexOf("/chat") == -1){
		
		var msgTxt = message.data;
		var msgJson = JSON.parse(msgTxt);
		var time = getTimeString();
		var sender = msgJson["sender"];
		var msg = msgJson["message"];
		addUnreadMsgs(sender);
		addNewChatMessage(sender, sender, msg, time);
	}
	
}

function sleep(delay) {
        var start = new Date().getTime();
        while (new Date().getTime() < start + delay);
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
  //document.getElementById(id_name).textContent = str;

  return str;
}

