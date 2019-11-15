window.Ggame = {
	keyCodes: [
		81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 65, 83, 68, 70, 74, 75,
		76, 186, 222, 71, 72, 90, 88, 67, 86, 66, 78, 77, 188, 190, 191,
		219, 221, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57
	],

	tap: function(){
		var $active = $('#game > .mark'),
			$mark = $active.nextAll('i:not(.skip)').eq(0);

		if($mark.length)
			$mark.addClass(0?'red':'green');
		else
		if($active.length){
			$mark = $();
			Ggame.finish();
		}
		else{
			$mark = $('#game>i:not(.skip)').eq(0);
			//Ggame.start();
		}

		Ggame.tapTime = (new Date()).getTime();
		
		$('#game > i:not(.skip)').removeClass('mark green red');
		$mark.addClass('mark').siblings().removeClass('red green');
		if(!$mark.length) $('#game > i').removeClass('red green');

		return;
		if(
			!$mark.prevAll('i:not(.skip)').slice(0,3).filter('.tap').length &&
			!$mark.nextAll('i.tap').length &&
			!$mark.hasClass('tap')
		)
			Ggame.finish();
	},

	timings: [],
	start: function(){
		delete Ggame.tapTime;
		console.log('Ggame.start');
		//$('#game > .mark').removeClass('mark');
		Ggame.startTime = (new Date()).getTime();
		console.log('Ggame.start');

		if(Ggame.lastTimings.length){
			Tx.tap.play(Ggame.lastTimings, 'tap-ghost');
			Ggame.lastTimings = [];
		}
	},

	lastTimings: [],
	dontSave: false,
	finish: function(){

		if($('#textdata').is(':visible'))
			$('#play').click();

		$('#game > .tap').removeClass('tap');

		$('#tap').hide();
		$('#control').removeClass('forTap');
		Tx.resize();
		$('#ggame-switch').text('gg');

		var active = Ggame.getActive();
		if(!active) return;

		var item = {
			tid: active.id,
			duration: (new Date()).getTime() - Ggame.startTime,
			timings: Ggame.timings.slice()
		};
		Ggame.timings = [];
		Ggame.lastTimings = item.timings;

		if((item.timings.length+5) < Ggame.averages.length) return;

		item.score = Ggame.score(item.timings, Ggame.averages);
		if(item.score >= 1) return;
		$('#ggame-score').show().text(parseInt(item.score*100)+'%');
		$('#ggame-score').css('background-color', Ggame.scores.color(item.score));

		if(!Acc.user)
			item.anonymous = $('#user-title').text();
		
		if(Ggame.dontSave) return Ggame.dontSave = false;
		if(item.score < 0) return;
		ws.send({
			cmd: 'save',
			collection: 'scores',
			item: item
		}, function(r){
			if(r.item){
				console.log(r.item);
			}
		});
	},

	finishTap: function(){
		console.log('finishTap');
		console.log(Ggame.timings);
	},

	delay: 20,
	compare: function(result, average, shift){
		var timeOff = 0,
			my = 0,
			av = 0;

		if(!shift)
			shift = 0;

		for (i = 0; i < result.length; i++){
			my = result[i];
			av = average[i];

			if(av && my)
				timeOff += av?Math.abs(av-my+shift):0;
		};

		var timeLength = Math.max.apply(null, average);

		var accuracy = parseFloat((1-(timeOff/timeLength)).toFixed(2));

		return accuracy;
	},

	score: function(result, average){
		var scores = [];

		for (s = -0.5; s < 0.5; s+=0.1){
			scores.push(Ggame.compare(result, average, s));
		};

		console.log(scores);

		var max = Math.max.apply(null, scores);

		return max;
	},


	getActive: function(){
		return Tx.item;
	},

	player: {
		build: function(item){
			var $item = Ggame.$player.clone();
			$item.attr('id', 'player-'+item.owner);
			$item.data(item);
			Acc.users([item.owner], function(){
				var user = Acc.u[item.owner];

				$item.find('.player-name').text(user.title || user.fullName || user.name || usr.id);
				if(user.avatar)
					$item.find('.player-avatar').css('background-image', "url('"+Cfg.files+user.avatar+"')");
			});

			return $item;
		},


		update: function(item){
			var $item = $('#player-'+item.owner);

			if(Ggame.averages.length){
				var score = Ggame.score(item.timings || [], Ggame.averages),
					prevScore = parseFloat($item.data('score'));
				console.log(score+' >= '+prevScore);
				if(score >= prevScore || !prevScore){
					$item.find('.player-time').date(item.time);
					$item.find('.player-score').text(parseInt(score*100)+'%');
					$item.data('score', score);

					

					$item.css('background-color', color);
				}
			}
		},

		make: function(item){
			if(!item.owner) return;
			

			var $list = $('#players');

			var $player = $('#player-'+item.owner);

			if(!$player.length){
				$player = Ggame.player.build(item);
				$list.append($player);
			}

			Ggame.player.update(item);

			return $player;
		},

		sort: function(){
			$('#players > .player').sort(function(a,b){
				return $(a).data('score') < $(b).data('score');
			}).appendTo('#players');
		}
	},

	scores: {
		color: function(score){
			var color = 'black';
			if(score > 0) color = 'red';
			if(score > 0.3) color = 'orange';
			if(score > 0.6) color = 'green';

			color = 'rgba(0, 0, 0, '+score+')';

			return color;
		},

		build: function(item){
			var $item = Ggame.$score.clone();
			$item.data(item);
			
			if(item.owner)
				Acc.users([item.owner], function(){
					var user = Acc.u[item.owner];
					$item.find('.score-userName').text(user.fullName || user.name);
					if(user.avatar)
						$item.find('.user-avatar').css('background-image', "url('"+Cfg.files+user.avatar+"')");
				});
			else
			if(item.anonymous)
				$item.find('.score-userName').text(item.anonymous);

			$item.find('.score-duration').text((item.duration/1000)+'s');
			$item.find('.score-time').date(item.time);

			$item.find('.score-num').text(item.score);
			$item.find('.score-timings').text((item.timings || []).join(','));

			var score = Ggame.score(item.timings || [], Ggame.averages);
			$item.find('.score-num').text(parseInt(score*100)+'%');
			$item.find('.score-num').css('background-color', Ggame.scores.color(score));

			for(var sc = 0; sc<score && sc<=1; sc+=0.2){
				$item.find('.score-stars').append('<span>&starf;</span>');
			}

			$item.show();

			return $item;
		},

		make: function(item){			
			var $list = $('#scores-list');

			$score = Ggame.scores.build(item);
			$list.prepend($score);

			return $score;
		},


		load: function(cb){
			var active = Ggame.getActive();
			ws.send({
				cmd: 'load',
				collection: 'scores',
				filter: {
					tid: active.id
				},
				sort: {time: -1}
			}, function(r){
				var $list = $('#scores-list').empty().show();
				$list.data('tid', active.id);

				var uids = [];
				(r.items || []).forEach(function(item){
					if(item.owner)
						uids.push(item.owner);
				});

				Acc.users(uids, function(users){
					(r.items || []).forEach(function(item){
						$score = Ggame.scores.build(item);
						$list.append($score);
					});

					//Ggame.player.sort();

					if(cb) cb()
				});
			});
		},
	},

	loadAverges: function(cb){
		Ggame.averages = Tx.item.timings;
		return;
		var active = Ggame.getActive();
		if(!active) return;
		ws.send({
			cmd: 'averages', 
            field: 'timings',
			collection: 'scores',
			filter: {tid: active.id}
		}, function(r){
			Ggame.averages = r.list;
			if(r.list && cb)
				cb(r.list);
		});
	},

	playTimeouts: [],
	play: function(timings){
		Ggame.stop();

		Ggame.start();
		Ggame.dontSave = true;
		//Ggame.tap();
		$('#ggame').show();

		var $syllables = $('#ggame > i:not(.skip)'),
			l = $syllables.length;

		timings.splice(l-1);
		var time = 0;//(new Date()).getTime();
		//Ggame.tap();
		(timings || []).forEach(function(t, i){
			time += parseFloat(t);

			$syllables.eq(i).attr('data-time', time);

			var tO = setTimeout(function(){
				Ggame.tap();

				if(timings.length == i+1)
					Ggame.tap();
			}, time);
			Ggame.playTimeouts.push(tO);
		});

		console.log('playyyyyyy');
	},

	formatAverages: function(tim){
		var av = (tim || '').split(' ');
		//av.reverse();
		var averages = [],
			sum = 0;
		av.forEach(function(a){
			var num = parseFloat(a);
			if(!num) return;

			var t = num - sum;
			averages.push(t * 1000);
			sum += t;
		});

		return averages;
	},

	stop: function(){
		if(Ggif.youtube){
			Ggif.youtube.stopVideo();
		}
		Tx.stopPlaying();
	}
};

Site.ready.push(function(){
	Site.onSave.push(function(m){
		var $list = $('#scores-list');
		if(m.item && m.item.duration && $list.data('tid') == m.item.tid){
			var $score = Ggame.scores.make(m.item);
			$score.hide().show('fast', function(){
				$list.scrollTop(0)

				if(
					$score.find('.score-userName').text() == $('#user-title').text() || 
					(Acc.user && m.item.owner == Acc.user.id)
				)
					$score.blink('grey')
			});

		}

		//Ggame.player.sort();
	});

	ws.send({
		cmd: 'onSave',
		collection: 'scores',
		filter: {}
	});
});


$(function(){
	Ggame.$ = $('#ggame');
	Ggame.$score = $('#scores-list > .score').clone().remove();
	Ggame.$player = $('#players > .player').clone();


	$('#ggif').bind('ready', function(e){
		var syl = tickertape.syllabify(Ggif.seg);
		$('#ggame').html(syl);
	});

	$('#ggame').focus(function(){
		Ggame.stop();
	});

	$('#scores-open').click(function(){
		
	});

	var $tap = $('#tap');
	$('#ggame-switch').click(function(){

		var onTap = $tap.is(':hidden');
		if(onTap){
			$tap.show();
			$('#control').addClass('forTap');
			Tx.resize();

			$tap.css({
				top: $('#control').height()+'px',
				bottom: $(this).height()+'px'
			});

			Tx.restart();
			$(this).text('score');
		}
		else
			Ggame.finish();

	});


	$('#score-switch').click(function(){
		$('#textdata').show();
		$('#score').hide();
	});

	/*
	$('#ggame').click(function(){
		var active = Ggame.getActive();
		if(active){
			Ggame.loadAverges(function(averages){
				Ggame.play(averages);
			});
		}
		else{
			Ggame.averages = Ggame.formatAverages(Ggif.tim);
			Ggame.play(Ggame.averages);
		}
	});
	*/

	$('#scores-list').on('click', '.score', function(){
		var item = $(this).data();

		Ggame.play(item.timings);
	});
});

Tx.ready.push(function(){
	console.log('Lets load scores');
	Ggame.loadAverges(function(averages){});
	Ggame.scores.load(function(){
		//UI.side('#scores');
	});
});


$(function(){
	var tapKeys = [113,119,101,114,116,121,117,105,111,112,81,87,69,82,84,89,85,73,79,80];

	var tap = function(){
		var $active = $('#game > .tap'),
			$mark = $active.nextAll('i:not(.skip)').eq(0);

		if($mark.length){}
		else
		if($active.length)
			$mark = $();
		else
			$mark = $('#game>i:not(.skip)').eq(0);
		
		$('#game > i:not(.skip)').removeClass('tap');
		return $mark.addClass('tap');
	};

	var doTap = function(){
		var $play = $('#play');

		if($play.hasClass('status-edit')) return;

		if(
			Tx.youtube.getPlayerState() != YT.PlayerState.PLAYING ||
			(
				!$('#game > .tap').length &&
				Tx.youtube.getPlayerState() == YT.PlayerState.PLAYING &&
				Tx.getTime() > Cfg.game.startLimit
			)
		){
			$('#game > .tap').removeClass('tap');
			Ggame.timings = [];
			Tx.restart(0);
			return// 
		}


		var $tap = $('#game > .tap');

		var time = parseFloat((Tx.getTime() - 0.1).toFixed(3));
		Ggame.timings.push(time);
		tap();


		var $nTap = $('#game > .tap');

		if($tap.length && (!$nTap.length || ($nTap.is(':last-child') && $nTap.text().length == 1))){
			Ggame.finish();
		}
	}

	var timeout;
	$(document).keypress(function(ev){
		if(tapKeys.indexOf(ev.keyCode)+1)
			doTap();
		else
		if(ev.keyCode == 103 || ev.keyCode == 71)
			Tx.youtube.setPlaybackRate(0.5);
		else
		if(ev.keyCode == 104 || ev.keyCode == 72)
			Tx.youtube.setPlaybackRate(1);
	});

	$('#tap-slow').click(function(){
		Tx.youtube.setPlaybackRate(0.5);
	});

	$('#tap-normal').click(function(){
		Tx.youtube.setPlaybackRate(1);
	});

	$('#tap-pause').click(function(){
		Tx.youtube.pauseVideo();
		Tx.stopPlaying();
	});

	$('#tap-play').click(function(){
		Tx.restart();
	});

	$('#tap-first, #tap-second').mousedown(function(){
		doTap();
		$(this).blink('black', 100)
	});

	$(document).bind("keydown", function(ev){
		if(ev.keyCode == 27){
			Tx.youtube.pauseVideo();
		}
	});

	$('#resize').click(function(){
		Tx.youtube.pauseVideo();
	});
});