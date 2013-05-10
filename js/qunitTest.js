test( "dummyFuntionforTest", function() {
  var temp = dummyFuntionforTest();
  equal( temp , 3, "Passed Dummy Testing Function!" );
});

test ("getTimeStringTest", function(){

	var timeBefore = getTimeString();
	//sleep(1000);
	var timeAfter = getTimeString();
	ok (timeBefore == timeAfter, "Passed get time string test.")

});

test ("addUnreadMsgsTest", function(){
	localStorage.removeItem("unread");
	addUnreadMsgs("senderTester");
	var unreadMsgs = localStorage.getItem("unread");
	var newCount = JSON.parse(unreadMsgs);
	equal (newCount[0]['sender'] , "senderTester", "Passed verifying sender test.");
	equal (newCount[0]['numMsgs'], 1, "Passed msg number test.");

	addUnreadMsgs("senderTester");
	var unreadMsgs = localStorage.getItem("unread");
	var newCount = JSON.parse(unreadMsgs);
	ok (newCount[0]['numMsgs'] == 2, "Passed unread msgs increment test.");
	localStorage.removeItem("unread");

});

test ("addNewChatMessageTest", function(){

	addNewChatMessage("testerKey", "testSender", "This is a message for testing.", getTimeString());
	var msg = localStorage.getItem("testerKey");
	if (!msg){
		ok (0==1, "Faild recording the msg into localStorage");
	}else{
		var msgArr = JSON.parse(msg);
		var msgSender = msgArr[0]["sender"];
		var msgContent = msgArr[0]["message"];
		ok (msgSender == "testSender", "Passed sender verification test.")
		ok (msgContent == "This is a message for testing.", "Passed content verification test.")
	}

	localStorage.removeItem("testerKey");
});

test ("getCheckedBoxesTest", function(){

	var checkedBoxesString = getCheckedBoxes("music");
	var preDefinedStr = "[4,8,11]";
	equal (checkedBoxesString, preDefinedStr, "Passed getting all checked boxes");
});


test ("addNewChatMessageTest", function(){

	var time = getTimeString();
	addNewChatMessage("testKey", "testSender", "Test adding a new Msg.", time);
	var allMsgs = localStorage.getItem("testKey");
	if (!allMsgs){
		equal(1,0, "Not msg added!");
	}
		
	else{
		equal (1, 1 , "Msg is added into localStorage");
		var msgArr = JSON.parse(allMsgs);
		equal (msgArr[0]["sender"], "testSender", "Test sender name Passed.");
		equal (msgArr[0]["message"], "Test adding a new Msg.", "Test content Matched.")
		localStorage.removeItem("testKey");
	}
});


test("displayMyMessageTest", function(){

	var time  = getTimeString();
	displayNewMessage("testSender", "Msg", time, true);
	var background = $("#displayPlace").children().css("background-color");
	equal(background,"rgb(204, 255, 51)", "My message stylesheet is applied correctly.");
});

test ("cleanUnreadHistTest", function(){

	addUnreadMsgs("testSender");
	cleanUnreadHist("testSender");
	var unreadKey = "unread";
	var unreadMsgs = localStorage.getItem(unreadKey);
	newCounts = JSON.parse(unreadMsgs);
	equal(0, newCounts[0]["numMsgs"], "Test clean unread History");
	localStorage.removeItem("unread");

});



