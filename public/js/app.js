var socket;
var currentAppIndex;
var homeAppIndex = 0;

window.onload = function() {
	var host = window.location.host + ":" + 4416;
	connect(host);
	setupWebSpeechAPI();
	$("#message_box").bind("enterKey", function(e) {
		addFemaleMessage(document.getElementById("message_box").value);
		socket.emit("message", document.getElementById("message_box").value);
		document.getElementById("message_box").value = "";
	});
	$("#message_box").keyup(function(e) {
		if (e.keyCode == 13) {
			$(this).trigger("enterKey");
		}
	});
};

function connect(host) {
	localStorage.host = host;
	socket = io(host);

	socket.on("connect", function() {
		console.log("Connected!");
	});

	socket.on("result", function(message) {
		readOutLoud(message);
		addMaleMessage(message);
	});
}

addMaleMessage = function(message) {
	var _holder = document.getElementById("message_holder");
	var _div1 = document.createElement("div");
	var _div2 = document.createElement("div");
	var _div3 = document.createElement("div");
	var _msg = document.createTextNode(message);
	_div1.className += "message message--user1";
	_div2.className += "message__user";
	_div3.className += "message__speechbubble";
	_holder.appendChild(_div1);
	_div1.appendChild(_div2);
	_div1.appendChild(_div3);
	_div3.appendChild(_msg);
	$("html, body").animate(
		{
			scrollTop: $(_div1).offset().top
		},
		2000
	);
};

addFemaleMessage = function(message) {
	var _holder = document.getElementById("message_holder");
	var _div1 = document.createElement("div");
	var _div2 = document.createElement("div");
	var _div3 = document.createElement("div");
	var _msg = document.createTextNode(message);
	_div1.className += "message message--user2";
	_div2.className += "message__user";
	_div3.className += "message__speechbubble";
	_holder.appendChild(_div1);
	_div1.appendChild(_div2);
	_div1.appendChild(_div3);
	_div3.appendChild(_msg);
	$("html, body").animate(
		{
			scrollTop: $(_div1).offset().top
		},
		2000
	);
};

var supportsSpeechApi =
	"webkitSpeechRecognition" in window || "SpeechRecognition" in window;

function setupWebSpeechAPI() {
	if (!supportsSpeechApi) {
		console.log("Speech recognition not supported");
	} else {
		console.log("Speech recognition supported!");
	}
}

function readOutLoud(message) {
	var speech = new SpeechSynthesisUtterance();

	// Set the text and voice attributes.
	speech.text = message;
	speech.volume = 1;
	speech.rate = 1;
	speech.pitch = 1;

	window.speechSynthesis.speak(speech);
}

function startDictation() {
	if (supportsSpeechApi) {
		var recognition = new webkitSpeechRecognition();
		console.log("listening...");
		recognition.continuous = false;
		recognition.interimResults = false;

		recognition.lang = "en-US";
		recognition.start();

		recognition.onresult = function(e) {
			console.log("we are now stoped.");
			const transcript =
				e &&
				e.results &&
				e.results[0] &&
				e.results[0][0] &&
				e.results[0][0].transcript;
			console.log("This is the transcript: " + transcript);
			// if e.results, results[0], or e.results[0][0] are "undefined",
			// all of these invocations will throw an exception, resulting in a stack drop before executing stop()
			socket.emit("message", transcript);

			// An exception in this method would also drop the stack before executing stop()
			//sendToAsher(transcript)

			console.log(transcript);
			recognition.stop();
		};

		recognition.onerror = function(e) {
			console.log("there was an error");
			recognition.stop();
		};
	}
}
