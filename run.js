var $ab = $("<div id='ab' contentEditable></div>").prependTo('body');

//Pix8.check();

//Pix.leaveGap($pic.height());


if(Cfg.fixed){
	$ab.css('top', 0);
}


$(document).bind("keydown", function(ev){
	/*
	if(!carousel.$t.children('.focus').length){
		carousel.$t.children().eq(0).addClass('focus');
		return;
	}
	*/

	if(ev.keyCode == 37){
		carousel.motion(-25);
		//carousel.$t.children('.focus').prev().addClass('focus').siblings().removeClass('focus');
	}
	else
	if(ev.keyCode == 39){
		carousel.motion(25);
		//carousel.$t.children('.focus').next().addClass('focus').siblings().removeClass('focus');
	}
	else
	if(ev.keyCode == 13){
		//carousel.$t.children('.focus').click();
	}
});

chrome.runtime.onMessage.addListener(function(d, sender, sendResponse){
		console.log(d);
  	if(d.cmd == 'carousel'){
  		if(d.do) $ab[d.do]();
  		sendResponse({
  			visible: $ab.is(':visible'),
  			height: $ab.height()
  		});

  		if($ab.is(':visible'))
  			Pix.leaveGap($ab.height());
  		else
  			Pix.restoreGap();
  	}
  	else
  	if(d.cmd == 'transformed'){
  		onScroll();
  	}
  	else
  	if(d.cmd == 'carousel.update'){
		if(carousel.getPath() == d.path)
			carousel.$tag.change();
  	}
  	else
  	if(d.cmd == 'auth'){
  		Pix.user = d.user;
  	}
  	if(d.cmd == 'files'){
  		carousel.files = d.files;
  	}
  	else
  	if(d.cmd == 'shot' || d.cmd == 'push'){
			var file = d.src.split('/').pop();
			var carousel = $('#mainCarousel')[0].carousel;

			if(d.skip){

				Pix.send({
					cmd: 'update',
					id: carousel.view.id,
					set: {
						image: file
					},
					collection: Cfg.collection
				});
			}
			else{
  			var $thumbOn = carousel.$t.children().eq(0);
  			carousel.include(Pix.parseURL(d.src), $thumbOn);
			}
  	}
  	else
  	if(d.cmd == 'hideCarousel'){
  		$ab.hide();
  		sendResponse({visible: $ab.is(':visible')});
  		//sendResponse({pong: true});
  	}
  	else
  	if(d.cmd == 'checkCarousel'){
  		sendResponse({visible: $ab.is(':visible')});
  	}
  /* Content script action */
});
