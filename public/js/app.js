
var REMOTE_ACTION_TYPE_INPUT = "input";
var REMOTE_ACTION_TYPE_BUTTON = "button";
var MEDIA_HEADER_LAYOUT_FULL = 799;
var MEDIA_HEADER_LAYOUT_PLAY_PAUSE = 800;

var socket;
var currentAppIndex;
var homeAppIndex=0;


window.onload=function(){
	var host = window.location.host + ":" + 4416;
	//var host = window.location.host;
	//host = "localhost"
	console.log(host);
	connect(host);
	setupWebSpeechAPI();
	$("#Mobilecompliment").click(function(){
		socket.emit('change-view', 'compliment')
	});
	$("#asher").click(function(){
		//startDictation();
		socket.emit('message', 'How are you?');
	});
	$("#MobileAsher").click(function(){
		//startDictation();
		socket.emit('message', 'I am good thankyou');
	});
}

function connect(host){
	localStorage.host = host;
	socket = io(host);

	socket.on('connect', function (){
		console.log("Connected!");
	});

	socket.on('whats-running', function (data){
		var [time,date,weather,rain,news,compliment] = data.split('/')
		howToDisplay(time,date,weather,rain,news,compliment);
	});
	socket.on('result', function(message) {
		readOutLoud(message);
	})
	socket.on('whats-updated', function(item, value){
		if (String(item) === 'time') {
			changeTime(value);
		} else if (String(item) === 'date') {
			changeDate(value);
		} else if (String(item) === 'news') {
			changeNews(value);
		} else if (String(item) === 'temp') {
			changeWeather(value);
		} else if (String(item) === 'rain') {
			changeRain(value);
		} else if (String(item) === 'compliment'){
			changeCompliment(value);
		}
	})

	socket.on('current-app', function (appIndex){
		launchApp(appIndex);
	});

	socket.on('all-done', function(){
		(function () {
        location.reload();
    }, 2000);
	})

	socket.on('media-header-setup', function (mediaHeader){
		var appIndex = mediaHeader.appIndex;
		if(appIndex == currentAppIndex){
			$("#appMediaHeader").css("background-image","url('"+mediaHeader.uri+"')");
			$("#headerTitle").show().text(mediaHeader.title);
		}
	});

	socket.on('add-action', function (action){
		var appIndex = action.appIndex;
		if(appIndex == currentAppIndex){
			var actionTitle = action.title;
			var actionId = action.id;
			var actionType = action.type;
			$("#appView").css("background-color","white");
			var actionEl = $("<button class='actionButton'>"+actionTitle+"</button>");
			actionEl.click(function(){
				if(actionType == REMOTE_ACTION_TYPE_BUTTON){
					triggerAction(actionId);
				}else{
					var val = prompt(actionTitle);
					if(val){
						triggerAction(actionId,val);
					}
				}
			});
			actionEl.hide().appendTo("#appActions").fadeIn(500);
		}
	});

	socket.on('disconnect', function (){
		$("#remoteActions").empty();
		$("#remoteMediaHeader").empty();
		$("#appGrid").empty();
	});
}

function changeCompliment(value){
	if (String(value) === 'true'){
		$("#complimentImg").attr('src', '/img/Compliment_On.png');
		$("#MobilecomplimentImg").attr('src', '/img/Compliment_On.png');
	}else if (String(value) === 'false'){
		$("#complimentImg").attr('src', '/img/Compliment_Off.png');
		$("#MobilecomplimentImg").attr('src', '/img/Compliment_Off.png');
	}
	(function () {
		document.getElementById("compliment").innerHTML.reload
		document.getElementById("Mobilecompliment").innerHTML.reload
	}, 2000);
}

var supportsSpeechApi = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);

function setupWebSpeechAPI(){
	if (!supportsSpeechApi) {
	  console.log("Speech recognition not supported");
		$("#asherImg").attr('src', '/img/Asher_Off.png');
		$("#MobileasherImg").attr('src', '/img/Asher_Off.png');
	} else {
	  console.log("Speech recognition supported!");
		$("#asherImg").attr('src', '/img/speak.png');
		$("#MobileasherImg").attr('src', '/img/speak.png');
	}
}

function changeIcon(mode){
	if (mode === 1){
		$("#asherImg").attr('src', '/img/listening.png');
		$("#MobileasherImg").attr('src', '/img/listening.png');
	} else {
		$("#asherImg").attr('src', '/img/speak.png');
		$("#MobileasherImg").attr('src', '/img/speak.png');
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
			//changeIcon(1);
      var recognition = new webkitSpeechRecognition();
			console.log("listening...")
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.lang = "en-US";
      recognition.start();

			recognition.onresult = function(e) {
			  console.log("we are now stoped.")
			  const transcript = e && e.results && e.results[0] && e.results[0][0] && e.results[0][0].transcript;
				console.log("This is the transcript: " + transcript)
			  // if e.results, results[0], or e.results[0][0] are `undefined`,
			  // all of these invocations will throw an exception, resulting in a stack drop before executing stop()
			  socket.emit('message', transcript);

			  // An exception in this method would also drop the stack before executing stop()
			  //sendToAsher(transcript)

			  console.log(transcript)
			  recognition.stop();
			};

      recognition.onerror = function(e) {
				console.log("there was an error")
        recognition.stop();
      }
			/*var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		  var recognition = new SpeechRecognition();
			recognition.start();
			recognition.onstart = function() {
			  console.log('Voice recognition activated. Try speaking into the microphone.');
			}
			recognition.onresult = function(event) {

			  // event is a SpeechRecognitionEvent object.
			  // It holds all the lines we have captured so far.
			  // We only need the current one.
			  var current = event.resultIndex;

			  // Get a transcript of what was said.
			  var transcript = event.results[current][0].transcript;

			  // Add the current transcript to the contents of our Note.
			  console.log(transcript)
			}
    }*/
	}
		//changeIcon(0);
  }
