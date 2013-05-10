
function addNewChatMessage(key, sender, message, postTime){
	//var storage = window.localStorage;
	var allMsgs = localStorage.getItem(key);
	if (!allMsgs){
		var jsonMsg = [{"sender":sender, "message":message, "time":postTime}];
		localStorage.setItem(key, JSON.stringify(jsonMsg));
	}else{
		var msgArr = JSON.parse(allMsgs);
		msgArr.push({"sender":sender, "message":message, "time":postTime});
		localStorage.setItem(key, JSON.stringify(msgArr));
	}

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


function displayNewMessage(sender, msg, time, isMe){

	var cssClassType = (isMe == true)?"myMsgBox":"respBox";

	var retString = "<pre class ='prettyprint "+cssClassType+"'>" + sender+ " at "+time +" said: "+" <br>";
	retString += msg+ "  " +"</pre><br>";

	$("#displayPlace").append(retString);
	updateScroll();
}

function displayAllMessages(){
	var chatwith = document.getElementById("chatwith").textContent;
	var chatHist = JSON.parse(localStorage.getItem(chatwith));
	if (chatHist == null || chatwith == undefined) return;
	for(i = 0; i < chatHist.length; i++){
		var msg = chatHist[i];
		if(msg["sender"] == chatwith){
			displayNewMessage(msg["sender"], msg["message"], msg["time"], false);
		}else{
			displayNewMessage(msg["sender"], msg["message"], msg["time"], true);
		}
	}
}

function onOpen (){
}

function onMessage (message){
	var msgTxt = message.data;
	var msgJson = JSON.parse(msgTxt);
	var time = getTimeString();
	var sender = msgJson["sender"];
	var msg = msgJson["message"];
	addNewChatMessage(sender, sender, msg, time);
	var chatwith = document.getElementById("chatwith").textContent;
	if(chatwith === sender){
		displayNewMessage(sender, msg, time, false);
	}
}

function updateScroll(){
	var messageBox = document.getElementById("displayPlace");
	messageBox.scrollTop = messageBox.scrollHeight;
}



function cleanUnreadHist(sender){
	var unreadKey = "unread";
	var unreadMsgs = localStorage.getItem(unreadKey);
	if (unreadMsgs){
		
		newCounts = JSON.parse(unreadMsgs);
		var foundSender = false;
		for (var i = 0; i < newCounts.length; i++){
			if(newCounts[i]["sender"] == sender){
				newCounts[i]["numMsgs"] = 0;
			}
		}
		localStorage.setItem(unreadKey, JSON.stringify(newCounts));
	}
}

$(document).ready(

	function(){

		updateScroll();
		displayAllMessages();
		var chatwith = document.getElementById("chatwith").textContent;
		cleanUnreadHist(chatwith);


		$("#sendButton").click(

			function(){
				
				var myname = document.getElementById("nicknameinchat").textContent;
				var chatwith = document.getElementById("chatwith").textContent;
				var msg = document.getElementById("message").value;
				var time = getTimeString();
				//add my msg to storage
				addNewChatMessage(chatwith, myname, msg, time);

				var retString = "<pre class = 'prettyprint myMsgBox'>" + myname + " at "+time+" said: "+" <br>";
				retString += msg+ "  " +"</pre><br>";

				$("#displayPlace").append(retString);
				updateScroll();
				var mydata = '{"nickname":"'+ myname +'", "other":"'+chatwith+'", "message":"'+msg + '"}';
				$.ajax({
					type: 'POST',
					data: mydata,
					url: "/chat",
					xhrFields: {
						withCredentials: false 
					},
					success: function(result){

					} 
				});

			});




	}




	);