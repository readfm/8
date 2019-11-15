window.TextData = {
	buildLink: function(item){
		var $item = $('<div>', {title: item.yid, id: 'twext_'+item.id});


		if(!item.segments)
			item.segments = Tx.readWatson(item.watson);

		$item.data(item);

		var $a = $('<a>').appendTo($item);
		var link = '/'+item.yid;
		if(item.startTime || item.duration) link += '&t=' + (item.startTime || 0);
		if(item.duration) link += ';' + item.duration;
		$a.attr('href', link);

		$a.text(item.segments.replace(/\-/g, ''));

		if(item.yid){
			var $thumb = $("<div>", {class: 'thumb'});
			$thumb.css('background-image', 'url(http://img.youtube.com/vi/'+item.yid+'/0.jpg)');
			$item.append($thumb);
		}


		if(typeof item.pref != 'object') item.pref = {};

		if(item.pref.forGame)
			$item.addClass('forGame');

		if(item.pref.forGameHome)
			$item.addClass('forGameHome');


		return $item;
	},

	filter: function(str){
		if(!str) str = $('#textdata-search').val().replace(/[\r\n\s]+/g," ").trim();
		var sort = {
			time: -1,
			created: -1
		};

		if($('#textdata-hot').hasClass('active'))
			sort = {updated: -1};

		TextData.find(str?{segments: {'$regex': str}}:{}, sort).then(function(){

		});
		console.log(str);
	},

	find: function(filter, sort){
		filter = $.extend({
			yid: { $exists: true}
		}, filter);

		var promise = new Promise(function(resolve, reject){
			ws.send({
				cmd: 'load',
				collection: Cfg.collection,
				filter: filter,
				sort: sort,
				limit: Cfg.textdata.limit
			}, function(r){
				var $area = $('#textdata-links').empty();

				(r.items || []).forEach(function(item){
					if(!item.yid || (!item.segments && !item.watson)) return;
					if(item.watson && !item.watson.length) return;

					var $item = TextData.buildLink(item);

					$item.appendTo($area);
				});
				resolve(r.items);

			});
		});

		return promise;
	}
}

$(function(){
	TextData.$ = $('#textdata');

	$('#textdata-switch').click(function(){
		console.log($('#textdata, #score'));
		$('#textdata').hide();
		$('#score').show();
	});

	$('#textdata-new, #textdata-hot').click(function(){
		$(this).toggleClass('active').siblings().removeClass('active');
		TextData.filter();
	});

	$('#textdata-search').change(function(){
		TextData.filter();
	});

	/*
	$('#textdata-resize').drag("start",function(ev, dd){
		dd.done = 0;
	}).drag(function(ev, dd){
		var dif = dd.deltaY - dd.done;
		Site.resizePrev(TextData.$, dif);
		dd.done = dd.deltaY;
	});
	*/
});



Tx.onHash.push(function(h){
	if(TextData.loaded) return;
	
	var filter = {};
	if(!h[1] && h[0]) filter.yid = h[0];
	TextData.find(filter).then(function(){
		if(typeof filter.yid == 'string')
			$('#textdata-area').children().eq(0).click();
	});

	TextData.loaded = true;
});

Site.ready.push(function(){
	var toDelete = false,
		toHide = false,
		forMain = false,
		forGame = false;

	$(document).bind("keydown keyup", function(ev){
		toDelete = (ev.ctrlKey && ev.shiftKey &&  ev.keyCode == 68);
		forGame = (ev.ctrlKey && ev.shiftKey &&  ev.keyCode == 65);
		forMain = (ev.ctrlKey && ev.shiftKey &&  ev.keyCode == 90);

		if(toDelete || forGame || forMain){
			ev.preventDefault();
			return false;
		}
	});

	$('#textdata-links').on('click', 'a', function(ev){
		var $a = $(this),
			$item = $(this).parent(),
			item = $item.data();

		if(!item.pref){
			item.pref = {};
			$item.data('pref', {});
		}

		if(forMain){
			ws.send({
				cmd: 'update',
				set: {
					'pref.forGameHome': false
				},
				collection: Cfg.collection,
				filter: {
					'pref.forGameHome': true
				}
			}, function(r){
				ws.send({
					cmd: 'update',
					set: {
						'pref.forGameHome': true
					},
					collection: Cfg.collection,
					id: item.id
				});
				$item.addClass('forGameHome').siblings().removeClass('forGameHome');
			});
		}
		else
		if(forGame){
			ws.send({
				cmd: 'update',
				set: {
					'pref.forGame': !item.pref.forGame
				},
				collection: Cfg.collection,
				id: item.id
			});
			item.pref.forGame = !item.pref.forGame;
			$item.toggleClass('forGame');
		}
		else
		if(toDelete){
			ws.send({
				cmd: 'remove',
				collection: Cfg.collection,
				id: item.id
			});
			$item.remove();
		}
		else{
			history.pushState({}, this.yid,  $a.attr('href'));

			Tx.checkHash($a.attr('href'));
			carousel.loadView('');
		
			$('#play').click();
		}

		ev.preventDefault();
		return false;
	});


	Site.onSave.push(function(m){
		if(m.collection != Cfg.collection || !m.item || !m.item.yid || (!m.item.segments && !m.item.watson))
			return;

		var $item = TextData.buildLink(m.item),
			$prev = $('#twext_'+m.item.id);

		if($prev.length)
			$prev.replaceWith($item);
		else
			$item.prependTo('#textdata-links');
	});

	ws.send({
		cmd: 'onSave',
		collection: Cfg.collection,
		filter: {

		}
	});

	/*
	ws.send({
		cmd: 'load',
		collection: 'files',
		filter: {
			yid: { $exists: true}
		},
		sort: {
			time: -1
		},
		limit: 500
	}, function(r){
		var $textarea = $('#textdata-area').val('');

		var text = '';
		(r.items || []).forEach(function(item){
			if(!item.yid) return;
			text += 'http://'+document.domain+'/'+item.yid
			if(item.startTime || item.duration) text += '&t=' + (item.startTime || 0);
			if(item.duration) text += ';' + item.duration;

			if(item.segments)
				 text += '  ' + item.segments;

			text += '\n';
		});

		$textarea.val(text);
	});
	*/
});