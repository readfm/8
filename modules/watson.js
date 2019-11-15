navigator.getUserMedia = (
	navigator.getUserMedia ||
	navigator.webkitGetUserMedia ||
	navigator.mozGetUserMedia ||
	navigator.msGetUserMedia
);

var Mic = window.Mic = {
	watsonCfg: {
		action: 'start',
		'content-type': 'audio/ogg;codecs=opus',
	//	'content-type': 'audio/wav',
	//	'content-type': 'audio/flac',
	//	'content-type': 'audio/l16; rate=44100',
		continuous: true,
		inactivity_timeout: -1,
		timestamps: true,
		//max_alternatives: 4
	},

	connect: function(cb){
		Mic.connecting = true;
		ws.send({
			cmd: 'watson.token'
		}, function(r){
			var host = 'stream.watsonplatform.net/speech-to-text/api/v1/recognize',
				url = "wss://"+host+"?watson-token="+r.token+"&model=en-US_BroadbandModel";

			var wson = Mic.wson = new WebSocket(url);
			wson.json = function(m){
				this.send(JSON.stringify(m));
			};

			wson.binaryType = "blob";
			wson.onopen = function(evt){
				//wson.json(Mic.watsonCfg);

				if(cb) cb(wson);

				setInterval(function(){
					//if(!Mic.on) wson.json({"action":"no-op"});
				}, 28000);

				//Mic.listen();
			};
			wson.onclose = function(evt){
				console.log('Watson connection closed.');
			};


			wson.onmessage = function(evt){
				m = JSON.parse(evt.data);
				if(!wson.started && m.state == 'listening'){
					//if(cb) cb(wson);
					wson.started = true;
				}
				else
				if(m.results)
					Mic.onWatson(m.results);


				if(m.results)
					console.log(m.results);
			};
			wson.onerror = function(evt){
				console.error(evt);
			};
		});
	},

	start: function(cfg, cb){
		Mic.onWatson = cb;
		Mic.wson.json($.extend({action: 'start'}, Mic.watsonCfg, cfg));

		//if(Mic.stream) Mic.stream.getAudioTracks()[0].start();
	},

	stop: function(){
		if(!Mic.on) return;
		console.log('stopRecorder');
		//if(Mic.stream) Mic.stream.getAudioTracks()[0].stop();

		Mic.on = false;
		Mic.wson.json({"action": "stop"});
	},

	onWatson: function(results){
		console.log(results);
	},

	listen: function(cfg, cb){
		if(Mic.recorder)
			return false;

		var session = {
		  audio: true,
		  video: false
		};
		var recordRTC = null;
		navigator.getUserMedia(session, Mic.initializeRecorder, Mic.onError);
	},

	audio: new Audio,
	initialize: function(stream){
	    var recorder = Mic.recorder = new MediaRecorder(stream);
	    var chunks = [];
	    recorder.onstop = function(e) {
			console.log("data available after MediaRecorder.stop() called.");

			var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
			chunks = [];
			var audioURL = window.URL.createObjectURL(blob);
			//window.location.href = audioURL;
			Mic.audio.src = audioURL;
			Mic.audio.play();

			console.log(blob);
			if(Mic.wson && Mic.wson.readyState == 1)
				Mic.wson.send(blob);

			Mic.wson.send(JSON.stringify({"action": "stop"}));
		}

		recorder.ondataavailable = function(ev){
			console.log(ev.data.size);
			chunks.push(ev.data);
			return;
			var blob = new Blob([ev.data], {type: 'audio/ogg; codecs=opus'});

			if(Mic.wson && Mic.wson.readyState == 1)
				Mic.wson.send(ev.data);
		}
		console.log('listenRecorder');
	},

	initializeRecorder: function(stream){
		Mic.stream = stream;
		var audioContext = window.AudioContext;
		var context = new audioContext();
		var audioInput = context.createMediaStreamSource(stream);
		var bufferSize = 2048;
		// create a javascript node
		var recorder = Mic.recorder = context.createScriptProcessor(bufferSize, 1, 1);
		// specify the processing function
		recorder.onaudioprocess = Mic.recorderProcess;
		// connect stream to our recorder
		audioInput.connect(recorder);
		// connect our recorder to the previous destination
		recorder.connect(context.destination);
	},

	convertFloat32ToInt16: function(buffer){
		l = buffer.length;
		buf = new Int16Array(l);
		while (l--){
			buf[l] = Math.min(1, buffer[l])*0x7FFF;
		}
		return buf.buffer;
	},

	recorderProcess: function(e){
		if(!Mic.on) return;
		var left = e.inputBuffer.getChannelData(0);
		//left = Mic.convertFloat32ToInt16(left);

		var view = new DataView(Mic.convertFloat32ToInt16(left));

		var blob = new Blob([view], { type: "audio/l16; rate=44100" });

		//console.log('bam');

		if(Mic.wson && Mic.wson.readyState == 1)
			Mic.wson.send(blob);
		//console.log(left);
	},

	onError: function(event){
		console.error(event);
	},

	tasks: [],
	buffers: [],
	bufLength: 5000,

	upload: function(buffer, cb, info){
		var ws = this;
		this.tasks.push(function(){
			var stream = ws.stream = $.extend({
				pumped: 0
			}, info);

			if(typeof cb == 'function')
				stream.callback = cb;

			if(typeof buffer == 'string')
				buffer = new Blob([buffer], { type: "text/plain" });

			if(buffer instanceof Blob){
  				var fileReader = new FileReader();
 				fileReader.onload = function(){
					stream.buffer = this.result;
					ws.pump();
 				}
 				fileReader.readAsArrayBuffer(buffer);
			}
			else{
				stream.buffer = buffer;
				ws.pump();
			}
		});
		
		if(!ws.buffer && ws.tasks.length == 1)
			ws.tasks.shift()();
	},

	pump: function(){
		var ws = this;

		var buf = ws.stream.buffer.slice(ws.stream.pumped, ws.stream.pumped + ws.bufLength);
		Mic.wson.send(buf);
	},
};


site.ready.push(function(){
	Mic.connect();
	//Mic.listen();
});