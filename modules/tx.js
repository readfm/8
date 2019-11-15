window.Tx = {
	monoW: {
		8: 5,
		9: 5,
		10: 6,
		11: 7,
		12: 7,
		13: 8,
		14: 8,
		15: 9
	},

	// play syllables on game area
	play: function(startOn, speed){
		Tx.stopPlaying();

		var $play = $('#play');
		if($play.hasClass('status-edit')) return;


		if(!startOn)
			startOn = 0;

		startOn = parseInt(startOn);

		if(!speed)
			speed = 1;

		Ggame.start();
		//$('#game').show();

		//$('*:focus').blur();

		if(!$play.hasClass('status-tap'))
			Tx.changeStatus('play');

		console.log('play');
		$('#game > i:not(.skip)').each(function(){
			var time = parseFloat($(this).data('time'));
			if(!time || startOn > time) return;

			if(startOn && !$('#game > .mark').length){
				$(this).prevAll('i:not(.skip)').eq(0).addClass('mark');
			}

			var tm = parseInt((time - startOn) * 1000 / speed);
			
			var tO = setTimeout(function(){
				if($play.hasClass('status-tap')){

				}
				else
					Ggame.tap();

				//console.log(time+' - '+startOn);
			}, tm);
			Tx.playTimeouts.push(tO);
		});
	},

	// wait untill it ends.
	watchEnd: function(){
		if(Tx.intEnd) clearInterval(Tx.intEnd);
		Tx.intEnd = setInterval(function(){
			if(Tx.readyYT){
				var duration = Tx.youtube.getDuration(),
					time = Tx.youtube.getCurrentTime();

				if(time>duration) return;

				var startTime = Tx.timeStart(),
					lengthTime = parseFloat(document.getElementById('gif-youtube_length').value);

				var $loop = $('#game > .loop:not(.skip)');
				if($loop.length)
					lengthTime = $loop.last().data('time') + 0.4;

				if(startTime && lengthTime && time > (startTime+lengthTime)){

					clearInterval(Tx.intEnd);

					if(Ggame.timings.length > 4 && $('#tap').is(':visible'))
						Ggame.finish();

					if($('#play').hasClass('status-tap'))
						Tx.changeStatus('play');

					Tx.restart();
					//Tx.stopPlaying();
					//Tx.youtube.pauseVideo();
				}
			}
		}, 100);
	},

	// stop waiting for taps
	finishTap: function(){
		console.trace('Tx.finish');
		var $taps = $('#game > .tap');
		if(!$taps.length) return;
		$taps.removeClass('tap');
		//Tx.update(true);
	},

	// restart text area
	restart: function(){
		if(!Tx.readyYT || !Tx.youtube) return;
		Tx.youtube.pauseVideo();

		console.log('restart');
		$('#game > .mark').removeClass('mark');

		var startTime = Tx.timeStart(),
			skip = 0;
		
		var $first = $('#game > .loop:not(.skip)').first();
		if($first.length) startTime += $first.data('time');

		var $taps = $('#game > .tap');
		if($taps.length){
			Tx.finishTap();
		}

		if($('#youtube').is(':visible')){
			Tx.changeStatus('play');
			Tx.youtube.seekTo(startTime);
			Tx.youtube.playVideo();
		}
		else
			Ggif.play();
		
		/*
		if(!$('#play').hasClass('status-edit'))
			Tx.play();
		*/
	},

	// change status of action
	changeStatus: function(status){
		var $play = $('#play');
		$play.removeClass('status-play status-score status-tap status-edit status-record status-filter');
		$('#edit, #twext').hide();

		if($play.hasClass('edit') && status == 'play'){
			console.log('statusPlay');
			$('#game *').removeAttr('style');
			Tx.saveWatson();
		}

		if(status) $play.addClass('status-'+status);
		
		if(status == 'edit'){
			$('#game > mark').removeClass('mark');
			Tx.stopPlaying();
			Tx.youtube.pauseVideo();
			//$('#game').attr('contenteditable', 'true').focus();
		}
		else
			$('#game').attr('contenteditable', 'false');

		if(status == 'filter'){
			Tx.stopPlaying();
			Tx.youtube.pauseVideo();
			$('#game').hide();
			$('#edit').show().empty().focus();
		}
	},

	holdPlay: false,
	holdTap: false,
	timings: false,
	hold: function(){
		C.log('hold');
		Tx.restart();
		//Ggame.start();

		$('#edit').hide();
		Tx.changeStatus('play');

		Tx.timings = [];

		Tx.holdPlay = true;
		Tx.holdTap = false;
	},

	// release taping
	unhold: function(){
		$('#game').show();
		$('#edit').hide();
		if($('#twext, #timings').is(':visible')){
			Tx.compile();
			$('#twext, #timings').hide();

			Tx.restart();
		}
		else
		if(Tx.holdPlay && Tx.holdTap)
			Tx.setTimings(timings);
		else{
			if(!$('#game > i').length){
				Tx.syllabify($('#game').text());
			}

			Tx.saveWatson();
			Tx.restart();
		}

		Tx.changeStatus('play');

		Tx.holdPlay = Tx.holdTap = false;
	},


	update: function(skipSeg){
		if(!Tx.fid) return;
		var timings = [];
		$('#game > i:not(.skip)').each(function(){
			timings.push(parseFloat($(this).data('time')));
		});

		var req = {
			cmd: 's2t.update', 
			fid: Tx.fid,
			timings: timings
		};

		//if(!skipSeg)
			req.segments = Tx.getText();
			req.text = $('#game').text();

		ws.send(req);
	},

	// get time where youtube video should start from
	timeStart: function(){
		return parseFloat(document.getElementById('gif-youtube_start').value) || 0;
	},

	// get duration for how long thios youtube gap should play
	duration: function(){
		return parseFloat(document.getElementById('gif-youtube_length').value) || 0;
	},

	playTimeouts: [],
	stopPlaying: function(){
		//if(Tx.readyYT) Tx.youtube.pauseVideo();
		if(Tx.intEnd) clearInterval(Tx.intEnd);

		$('#game > i:not(.skip)').removeClass('mark green red');
		Tx.clearTimeouts();
	},

	clearTimeouts: function(){
		Tx.playTimeouts.forEach(function(tO){
			clearTimeout(tO);
		});
		Tx.playTimeouts = [];
	},

	// give segments and prepare them to use in html game area
	syllabify: function(seg, timings){
		var lines = seg.split(/\n/g);

		var tims = Tx.findTimings(lines);

		var txt = lines.join(' ').replace(/\s/g, "</i><i class='skip'>&nbsp;</i><i>").replace(/\-/g, "</i><i>");
		txt = txt.replace(/\n/g, '<br/>');
		$('#game').html('<i>'+txt+'</i>');

		var $lastI = $('#game > i').last();
		if($lastI.text() == '') $lastI.remove();

		console.log('syllabify');

		Tx.setTimings(tims.length?tims:timings);

		Tx.resize();
		Site.resize();

		$('#save').show();
	},

	//resize game area according to other bars size
	resize: function(){
		$('#control').height(Math.max($('#game').outerHeight(), parseInt($('#control').css('min-height'))));
	},

	// split words into html
	splitWords: function(){
		$('#game > i:not(.skip)').each(function(){
			var $i = $(this),
				text = $i.text();

			if(text.indexOf(' ')+1){
				var words = text.split(' '),
					time = $i.data('time');

				var $words = $('<div></div>');
				words.forEach(function(word, i){
					if(i) $words.append("<i class='skip'>&nbsp;</i>");
					$('<i>'+word+'</i>').appendTo($words).data('time', time);
					time += 0.8;
				});
				C.log($words);
				$i.replaceWith($words.children());
			}
		});
	},

	//set timings onto syllables in game area
	setTimings: function(timings){
		var $syllables = $('#game > i:not(.skip)'),
			prev = 0;

		if(typeof timings == 'string') timings = timings.split(/[ ,]+/);
		(timings || []).forEach(function(t, i){
			var time = parseFloat(t);

			$syllables.eq(i).data({
				time: time,
				gap: time - prev,
				prev: prev,
				next: timings[i+1] || 0
			});
			prev = time;
		});
	},
	
	//get text from game area
	getText: function(){
		var text = '';
		$('#game > i').each(function(){
			if($(this).hasClass('skip'))
				text += ' ';
			else{
				var z = text.slice(-1);
				if(z && z != ' ') text += '-';
				text += $(this).text();
			}
		});
		return text;
	},

	startSymbol: '&RightTriangleBar;',
	loadTwext: function(){
		//var text = Tx.getText();
		var prevTime = 0;

		document.getElementById('twext').scrollLeft = 0
		var $twext = $('#twext').empty().show();

		var pad = parseInt($twext.css('padding-left')),
			mw = 5.5;

		var $text = $('#game').clone(true, true),
			$timings = $("<div class='timings'></div>");
		$twext.append($text).append($timings);

		var isDur = $twext.hasClass('durations');
		if(isDur) $text.prepend("<i>&gt;</i><i class='skip'>&nbsp;</i>");

		$text.show().removeAttr('id contenteditable').addClass('segments');

		var timings = '',
			$is = $text.children('i:not(.skip)');

		if(isDur) for(var i = 0; i < $is.length; i++){
			var nextTime = $is.eq(i+1).data('time');
			$is.eq(i).data('time', nextTime);
		};

		$is.each(function(){
			var $i = $(this);

			if($i.prev().length && !$i.prev().hasClass('skip'))
				$i.before('-');


			var t = $i.data('time');
			if(!t) return;

			var time;
			if(isDur){
				time = Math.round((t-prevTime) * 100);
				prevTime = t;
			}
			else
				time = (Math.round(t * 100) / 100).toFixed(2);

			while($i.offset().left > (pad + timings.length * mw)){
				timings += ' ';
			};

			timings += time+' ';
		});
		$timings.html(timings.trim().replace(/\s/g, '&nbsp;'));
	},

	// make html code from syllables
	format: function(h){
		h = h.replace('>', '').trim();
		h = h.replace(/\s/g, "</i><i class='skip'>&nbsp;</i><i>").replace(/\-/g, "</i><i>");
		h = h.replace(/\n/g, '<br/>');
		h = '<i>'+h+'</i>';

		return h;
	},

	//save timings and segments on server from game area
	compile: function(){
		var lines = [];
		$('#twext > div').each(function(){
			lines.push($(this).text());
		});

		var timings = Tx.findTimings(lines);

		var h = "";
		lines.forEach(function(line, i){
			h += Tx.format(line) + ' ';
		});

		$('#game').html(h);
		
		ws.send({
			cmd: 'update', 
			collection: Cfg.collection,
			id: Tx.id,
			set: {
				timings: timings,
				segments: lines.join(' ').replace('>', '').trim()
			}
		});

		Tx.setTimings(timings);
	},

	findSegments: function(){

	},

	// read timings from game area
	findTimings: function(lines){
		if(!lines || !lines.length) return [];

		var dur = $('#twext').hasClass('durations'),
			tim = 0;

		var timings = [];
		lines.some(function(line, i){
			var ts = line.split(/\s+/g);
			if(!ts.length) return;

			var tims = [];
			if(!ts.some(function(t){
				if(isNaN(t)) return true;

				if(dur)
					tims.push(parseFloat((tim+=t/100).toFixed(2)));
				else
					tims.push(parseFloat((parseFloat(t)).toFixed(2)));
			}) && tims.length){
				Array.prototype.push.apply(timings, tims);
				lines.splice(i, 1);
			}
		});
		
		return timings;
	},

	// find separate syllables from word
	syllabifyWord: function($w){
		var text = $w.text();
		if(!text) return;

		return;
		Syllabifier.syllabifyText(text, function(word){
			var n = (word || '').split('-').length;
			if(n>1){
				var time = $w.data('time');
				var $m = $('<i>'+word.replace(/\-/g, '</i><i>')+'</i>');
				$w.replaceWith($m);

				$m.each(function(){
					$(this).data('time', time);
					time += 0.1;
				});
			}
		});

	},

	ready: [],

	// load segments and timings from server
	checkWatson: function(cb){
		var filter = {
			yid: Tx.yid()
		};

		var startTime = Tx.timeStart(),
			lengthTime = parseFloat(document.getElementById('gif-youtube_length').value);

		if(startTime) filter.startTime = startTime;
		if(lengthTime) filter.duration = lengthTime;

		ws.send({
			cmd: 'get', 
			collection: Cfg.collection,
			filter: filter
		}, function(m){
			if(!m.item) return $('#game').addClass('game-transcribe');
			
			Tx.item = m.item;
			Tx.id = m.item.id;

			if(m.item.timings && m.item.segments){
				Tx.syllabify(m.item.segments, m.item.timings);
			}
			else
			if(m.item.watson)
				Tx.compileWatson(m.item.watson);

			Tx.restart();

			$('title').text($('#game').text());
			
			//Ggame.syllabify();

			Tx.ready.forEach(function(f){
				f();
			});

			if(cb) cb();
		});
	},

	// from object provided by watson get timings and segments
	compileWatson: function(w){
		var seg = '',
			tim = [];

		(w || []).forEach(function(result){
			(result.alternatives || []).forEach(function(alternative){
				(alternative.timestamps || []).forEach(function(stamp){
					var word = stamp[0];
					tim.push(parseFloat(stamp[1]));
					seg += word + ' ';
				});
			});
		});
		
		Tx.syllabify(seg, tim);

		$('#game > i:not(.skip)').each(function(){
			Tx.syllabifyWord($(this));
		});
	},

	// save stuff that came from watson
	saveWatson: function(skipSeg){
		var set = {timings: []};

		if(!skipSeg){
			set.segments = Tx.getText();
			set.text = $('#game').text();
		}

		$('#game > i:not(.skip)').each(function(){
			set.timings.push(parseFloat($(this).data('time')));
		});

		if(Tx.id){
			ws.send({
				cmd: 'update', 
				collection: Cfg.collection,
				id: Tx.id,
				set: set
			});
		}
		else{
			$.extend(set, {
				yid: Tx.yid(),
				owner: User.id,
				type: 'twext',
				startTime: Tx.timeStart(),
				duration: parseFloat(document.getElementById('gif-youtube_length').value)
			});

			var req = {
				cmd: 'save', 
				collection: Cfg.collection,
				item: set
			};

			ws.send(req, function(r){
				if(!r.item) return;
				Tx.id = r.item.id;
			});
		}
	},

	readWatson: function(w){
		var seg = '';

		(w || []).forEach(function(result){
			(result.alternatives || []).forEach(function(alternative){
				(alternative.timestamps || []).forEach(function(stamp){
					var word = stamp[0];
					seg += word + ' ';
				});
			});
		});
		
		return seg;
	},

	cfgWatson: {
		'content-type': 'audio/ogg;codecs=opus',
	},

	transcribe: function(){
		$('#game').removeClass('game-transcribe');

		Tx.getAudio(function(res){
			$('#resize').addClass('loading-watson');

		    Mic.start(Tx.cfgWatson, Tx.onWatson);

			var i = 0,
				size = 128000;

			do{
				blob = new Blob(
					[res.slice(i, i+size)],
					{type: "audio/ogg;codecs=opus"}
				);
				Mic.wson.send(blob);
				i+=size;
			}
			while(i < res.byteLength);

			Mic.wson.json({"action": "stop"});
		});
	},

	// fetch audio from youtube video using server's help
	getAudio: function(cb){
		var startTime = Tx.timeStart(),
			lengthTime = parseFloat(document.getElementById('gif-youtube_length').value);

		var srcAudio = 'http://'+Cfg.server+'/youtube/'+Tx.yid()+'/opus';
		if(startTime) srcAudio += '/'+(startTime);
		if(lengthTime) srcAudio += '/'+lengthTime;

		var request = new XMLHttpRequest();
		request.open('GET', srcAudio, true);
		request.responseType = 'arraybuffer';

		$('#resize').addClass('loading-youtube');
		request.onload = function(){
			$('#resize').removeClass('loading-youtube');

			Tx.audio = request.response;
			cb(request.response);
		}
		request.send();
	},

	// react on watson result
	onWatson: function(results){
		$('#resize').removeClass('loading-watson');

		if($('#youtube').is(':visible')){
			Tx.compileWatson(results);
			Tx.saveWatson();
		}
	},

	// make gif image from all the stuff we have
	makeGif: function(){
		var req = {
		   cmd: 's2t.dlYoutube', 
		   yid: Tx.yid()
		};

		var startTime, lengthTime;
		if(startTime = Tx.timeStart())
			req.startTime = startTime;
		if(lengthTime = document.getElementById('gif-youtube_length').value)
			req.duration = lengthTime;

		$('#resize').addClass('loading-gif');
		ws.send(req, function(r){

		});
	},

	parseURL: function(url){
		if(!url) return {};

	 	function getParm(url, base){
		var re = new RegExp("(\\?|&)" + base + "\\=([^&]*)(&|$)");
		var matches = url.match(re);
		
		if(matches)
			return(matches[2]);
		else
			return("");
		}

		var retVal = {};
		var matches;
		var success = false;

		if(url.match('http(s)?://(www.)?youtube|youtu\.be')){
			if(url.match('embed'))
				retVal.id = url.split(/embed\//)[1].split('"')[0];
			else
				retVal.id = (url.split(/v\/|v=|youtu\.be\//)[1] || '').split(/[?&]/)[0];

			retVal.provider = "youtube";
			var videoUrl = 'https://www.youtube.com/embed/' + retVal.id + '?rel=0';
			success = true;
		} else if (matches = url.match(/vimeo.com\/(\d+)/)){
			retVal.provider = "vimeo";
			retVal.id = matches[1];
			var videoUrl = 'http://player.vimeo.com/video/' + retVal.id;
			success = true;
		}

		return retVal;
	},

	// start playing youtube and syllables synchronized together
	playSync: function(){
		var time = Tx.youtube.getCurrentTime(),
			startTime = Tx.timeStart();

		Tx.play(time-startTime, Tx.youtube.getPlaybackRate());
		Tx.watchEnd();
	},

	//get exact time where youtube is playing
	getTime: function(){
		var elapsed = ((new Date()).getTime() - Tx.startTime)/1000;

		if(Tx.youtube.getPlayerState() == YT.PlayerState.PLAYING)
			return Tx.startYTime + elapsed * Tx.youtube.getPlaybackRate() - Tx.timeStart();

		return Tx.youtube.getCurrentTime() - Tx.timeStart();
	},

	//update stuff that helps to find exact youtube time 
	updateTimer: function(){
		Tx.startTime = (new Date()).getTime();
		Tx.startYTime = Tx.youtube.getCurrentTime();
	},

	readyYT: false,
	// add youtbe iframe with every event we need to use here
	addYoutube: function(id, cb){
		$('#youtube').show();
		$('#gg').hide();

		if(typeof YT == 'undefined') return cb();
		var player = Tx.youtube = new YT.Player('youtube', {
			videoId: id,
			autoplay: 0,
			events: {
           		onReady: function(){
           			Tx.readyYT = true;
           			//Tx.restart();
					//Tx.changeStatus('play');
					console.log('youtube play');

           			if(cb) cb();
           		},

           		onStateChange: function(ev){
           			C.log(ev.data);
           			if(ev.data == YT.PlayerState.PLAYING){
           				Tx.updateTimer();
						Tx.playSync();
					}
           			else
           			if(ev.data == YT.PlayerState.PAUSED)
           				Tx.stopPlaying();


           			$('#tap-play')[(ev.data == YT.PlayerState.PLAYING)?'hide':'show']();
           			$('#tap-pause')[(ev.data == YT.PlayerState.PAUSED)?'hide':'show']();
           		},

           		onPlaybackRateChange: function(ev){
           			Tx.updateTimer();

           			setTimeout(function(){
	           			var rate = Tx.youtube.getPlaybackRate();
	           			
	           			$('#tap-slow')[(rate == 0.5)?'hide':'show']();
	           			$('#tap-normal')[(rate == 1)?'hide':'show']();
	           		}, 600);


           			if(player.getPlayerState() == YT.PlayerState.PLAYING)
           				Tx.playSync();
           		}
			}
		});

		$('#gif-youtube_ctrl').css('display', 'inline-block');
	},

	//get id of loaded youtube
	yid: function(){
		if(!Tx.youtube) return;
		return Tx.parseURL(Tx.youtube.getVideoUrl()).id;
	},

	formLink: function(item){
		var link = '/'+item.yid;
		if(item.startTime || item.duration) link += '&t=' + (item.startTime || 0);
		if(item.duration) link += ';' + item.duration;
		return link;
	},

	// do all the stuff on hash change / load 
	checkHash: function(hash){
		var path = (hash || '').replace(/^\/|\/$/g, '') || Site.hash() || location.pathname.replace(/^\/|\/$/g, '') || Cfg.defaultYoutube;
			h = path.split('&'),
			name = h[0],
			q = parseQuery(h[1]);

		if(!name) return;

		$('#youtube').show();
		Ggif.close();

		$('#game').show().removeClass('game-transcribe');
		//$('#game > mark').removeClass('mark');

		$('#gif-youtube_start, #gif-youtube_length').val('');
		if(typeof q == 'object'){
			if(q.t){
				var t = q.t.split(';');
				$('#gif-youtube_start').val(t[0]);
				$('#gif-youtube_length').val(t[1] || '');
			}
		}

		$('#edit').hide();

		Tx.onHash.forEach(function(fn){
			fn(h);
		});

		if(Tx.youtube && name && name == Tx.yid())
			Tx.restart();
		else
		if(Tx.youtube)
			Tx.youtube.loadVideoById(name, Tx.timeStart());
		else return Tx.addYoutube(name, function(){
				//Tx.restart();
				Tx.checkWatson(function(){
					//Tx.replay();
				});
			});

		Tx.checkWatson(function(){
			//Tx.replay();
		});
	},
	onHash: [],

	// create gif from all the stuff we need
	makeGgif: function(){
		if($('#resize').hasClass('loading-ggif')) return;

		if($('#gg').is(':visible'))
			return Ggif.make();

		var startTime = Tx.timeStart(),
			lengthTime = parseFloat(document.getElementById('gif-youtube_length').value);

		var src = '/youtube/'+Tx.yid()+'/gif';
		if(startTime) src += '/'+(startTime);
		if(lengthTime) src += '/'+lengthTime;

		$('#resize').addClass('loading-ggif');
		console.info('makeGif: '+src);
		Ggif.loadBuf(src, function(buf){
			console.info('loadBuf');
			delete Ggif.seg;
			delete Ggif.tim;
			Ggif.read(buf);
			console.info('read gif');
			Ggif.loadFrames();
		});
	},


	tap: {
		timeouts: [],
		play: function(timings, cl){
			var speed = Tx.youtube.getPlaybackRate();

			$('#game>i:not(.skip)').removeClass(cl);

			Tx.tap.timeouts.forEach(function(tO){
				clearTimeout(tO);
			});
			Tx.tap.timeouts = [];

			timings.forEach(function(time){
				var time = parseFloat(time);

				var tm = parseInt(time * 1000 / speed);
				
				var tO = setTimeout(function(){
					var $active = $('#game > .'+cl);
					$('#game > .'+cl).removeClass(cl);

					if(!$active.length)
						$('#game>i:not(.skip)').eq(0).addClass(cl);
					else
						$active.nextAll('i:not(.skip)').eq(0).addClass(cl);
				}, tm);
				Tx.tap.timeouts.push(tO);
			});
		}
	}
}

$(function(){
	$('#game').click(function(){
		if($('#game').hasClass('game-transcribe'))
			Tx.transcribe();
	});


	function cancel(e){
		if (e.preventDefault) e.preventDefault(); // required by FF + Safari
		e.dataTransfer.dropEffect = 'copy'; // tells the browser what drop effect is allowed here
		return false; // required by IE
	};

	document.body.addEventListener('dragover', cancel);
	document.body.addEventListener('dragenter', cancel);
	document.body.addEventListener('drop', function(ev){
		return;
		if(ev.dataTransfer.files.length)
			return Ggif.upload(ev);
		
		delete Ggif.hash;

		var txt = ev.dataTransfer.getData('Text') || '';

		var isHttp = txt.indexOf('http://') == 0 || txt.indexOf('https://') == 0,
			isGgif = txt.indexOf('ggif.co')+1 || txt.indexOf('ggif.lh')+1;

		var url = txt.split('#').shift(),
			ext = url.split('.').pop();
			
		if(!isHttp)
			url = 'http://'+url;

		var v = Tx.parseURL(url);

		if(v && v.provider == 'youtube' && v.id){
			Tx.addYoutube(v.id);
		}
		else
		if(ext == 'gif'){
			var img = new Image();

			img.onerror = function(){
				alert('Unable to load image');
			};

			img.onload = function(){
				Ggif.prepare(img.src);
			};
			img.src = url;

			delete Ggif.hash;
		}
		else
		if(isGgif){
			Ggif.parseHtml(url);
		}
		else
		if(!isNaN(parseFloat(txt))){
			Ggif.tim = txt;
			Ggif.tickBuild();
		}
		else
		if(txt){
			Ggif.seg = txt;
			Ggif.tickBuild();
		}

		ev.preventDefault();
		return false
	}, false);

	$('#ggame-inputTime').change(function(){
		$('#ggame > .fcs').data('time', parseFloat(this.value));
	});

	//$('#play').mousedown(hold);
	//$(document).bind("keydown", "f2", hold);
	
	var tapTime;
	$('#play').mousedown(function(){
		tapTime = (new Date).getTime();

		setTimeout(function(){
			if(!tapTime) return;
			//((new Date).getTime() - tapTime) > 1000

			Mic.listen();

			Tx.changeStatus('record');
			//$('#voice').show();
		}, 400);
	}).click(function(){
		tapTime = false;

		if($(this).hasClass('status-edit'))
			return Tx.unhold();

		$('#textdata, #score').toggle();
		if($('#textdata').is(':visible'))
			$('#play').addClass('status-play');
		
		if($('#score').is(':visible'))
			$('#play').addClass('status-score');

		return;
		//if($('#voice').is(':visible')){
		if($(this).hasClass('status-play')){
			//$('#voice').empty().hide();
			//Mic.stop();
			Tx.changeStatus('game');
		}
		if($(this).hasClass('status-record')){
			//$('#voice').empty().hide();
			Mic.stop();
			Tx.changeStatus('play');
		}
		else
		if($(this).hasClass('status-edit'))
			Tx.unhold();
		else
		if($(this).hasClass('status-filter'))
			Score.filter();
		else
			Tx.changeStatus('edit');
	}).mouseleave(function(){
		//$('#voice').hide();

		if(!$('#play').hasClass('status-record')) return;

		Mic.stop();
		Tx.changeStatus('play');
	});

	$('#edit').change(function(ev){
		var str = $(this).text();

		Score.filter();
		return false;
	});

	//$(document).bind("keyup", "f2", unhold);



	$(document).bind("keydown", function(ev){
		if((ev.keyCode == 37 || ev.keyCode == 39) && ev.ctrlKey){
			sel = window.getSelection();
	        if(!sel.getRangeAt || !sel.rangeCount) return;
	        
	        var range = sel.getRangeAt(0),
	        	start = range.startOffset,
	        	end = range.endOffset;

			var tag = Wy.tagSelection();
			if(!tag.textContent.length) return;

			var inc = ($('#twext').hasClass('durations')?3:0.03) * ((ev.keyCode == 37)?(-1):1);
			var nStr = Wy.increase(tag.textContent, inc);

			var tm = tag.parentNode;
			tag.textContent = nStr;
			tm.textContent = tm.textContent;

			sel.removeAllRanges();
			var range2 = document.createRange();
			range2.setStart(tm.firstChild, start);
			range2.setEnd(tm.firstChild, end);
			sel.addRange(range2);
			
			ev.preventDefault();
		}
		else
		if(ev.keyCode == 71 && ev.ctrlKey){
			Tx.makeGgif();
			
			ev.preventDefault();
			return false;
		}
		if(ev.keyCode == 70 && ev.ctrlKey){
			Tx.changeStatus('filter');
			
			ev.preventDefault();
			return false;
		}

		if(ev.keyCode == 69 /*e*/ && ev.ctrlKey){
			var data = carousel.exportJSON();
			ipfs.add(Buffer.from(data)).then(function(r){
				if(!r || !r.length) return;
				
				var id = r[0].path;

				window.open(ipfs.url(id), '_blank');
			});
			
			ev.preventDefault();
			return false;
		}

		if(ev.keyCode == 73 /*i*/ && ev.ctrlKey){
			var id = window.prompt('ipfs id');

			ipfs.cat(id).then(function(stream){
				var chunks = [],
					length = 0;

				stream.on('data', function(chunk){
					chunks.push(chunk);
					length += chunk.length;
				});

				stream.on('end', function(ev){
					var data = new Uint8Array(length),
						cur = 0;
					for(i = 0; i < chunks.length; i++){ 
						data.set(chunks[i], cur);
						cur += chunks[i].length;
					}

					var str = String.fromCharCode.apply(null, data);

					var items = eval(str);

					var ids = [];
					items.forEach(function(item){
						Pix.items[item.id] = item;
						ids.push(item.id);
					});

					var view = {
						ipfs: id,
						items: ids
					};
					carousel.setView(view);
				});
			});
		}

		if((ev.keyCode == 32 && ev.altKey) || ev.keyCode == 113){
			if($('#twext').is(':visible')){
				Tx.compile();
				$('#twext, #timings').hide();
				$('#game').show();
				Tx.restart();
				return;
			}

			if($('#game').is(':focus'))
				Tx.unhold();
			else
				Tx.changeStatus('edit');

			ev.preventDefault();
		}
		else
		if(ev.keyCode == 32){
			if($('#play').hasClass('status-filter')) return;

			if($('#play').hasClass('status-edit')){
				if($('#game').is(':hidden')) return;
				var $node = Wy.space();
				ev.preventDefault();
				Wy.placeCaret($node[0], 0);
			}
			else{
				if(Tx.youtube.getPlayerState() == 1){
					var $t = $('#game > .mark');
					Tx.stopPlaying();
					Tx.youtube.pauseVideo();
					$t.addClass('mark');
				}
				else{
					var time = $('#game > .mark').data('time');
					if(false && time){
						Tx.play(time);
						Tx.youtube.seekTo(time);
						Tx.youtube.playVideo();
					}
					else
						Tx.restart();
				}
			}
		}
		else
		if(ev.keyCode == 27){
			if($('#play').hasClass('status-tap')){
				Tx.changeStatus('play');
				Tx.playSync();
			}
		}
		else
		if(ev.keyCode == 45){
			Wy.split();
			ev.preventDefault();
		}
		else
		if(ev.keyCode == 121){
			if($('#twext').is(':hidden')) return;
			Tx.compile();
			$('#twext').toggleClass('durations');
			Tx.loadTwext();
			ev.preventDefault();
		}
		else
		if(ev.keyCode == 115){
			if($('#game').is(':visible')){
				Tx.youtube.pauseVideo();
				Tx.changeStatus('edit');
				Tx.loadTwext();
				$('#game').hide();
			}
			else{
				Tx.compile();
				$('#twext, #timings').hide();
				$('#game').show();
				Tx.changeStatus('edit');
				//Tx.restart();
			}
		}
		else
		if(ev.keyCode == 13){
			if(!$('#game').is(':focus')) return;
			Wy.paste('<br/>');
			ev.preventDefault();
		}
	});

	/*
	$('#game').focus(function(){
		Tx.changeStatus('edit');
	}).blur(function(){
		Tx.splitWords();
		Tx.changeStatus();
	});
	*/


	$('#game').mousedown(function(){
		Tx.changeStatus('edit');
	});

	$('#game').mouseup(function(){
		if($('#play').hasClass('status-edit')) return;

		var $selected = Wy.getSelection();
		if($selected && $selected.length){
			$('#game > .loop').removeClass('loop');
			$selected.filter('#game > i').addClass('loop');

			window.getSelection().removeAllRanges();

			if($('#game > .loop').length == $('#game > i').length)
				$('#game > .loop').removeClass('loop');
		}
	});
});

window.onhashchange = function(){
	Tx.checkHash();
};

Site.ready.push(function(){
	if(!Site.hash() && !location.pathname.replace(/^\/|\/$/g, '')){
		ws.send({
			cmd: 'get', 
			collection: Cfg.collection,
			filter: {
				'pref.forGameHome': true
			}
		}, function(m){
			if(!m.item) return Tx.checkHash();
			Tx.checkHash(Tx.formLink(m.item));
		});
	}
	else
		Tx.checkHash();
});