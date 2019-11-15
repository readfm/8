window.Layout = {
}

$(function(){

	var newH = 0;Cookies.get('home-hApps');
	//resize(parseInt(newH) || 375);

	var $control = Site.$control = $('#control');
	var resize = false;
	$('#resize').drag("start",function(ev, dd){
		dd.done = 0;
		dd.$view = $('#view');
		Site.$cover.show();
	}, {click: true}).drag(function(ev, dd){
		var dif = dd.deltaY - dd.done;
		
		if(dif > 0)
			Site.resizeNext(dd.$view, dif);
		else
			Site.resizePrev(TextData.$, dif);

		dd.done = dd.deltaY;

		if(dif) resize = true;
	}).drag("end", function(ev, dd){
		Cookies.set('home-hApps', $('#home-apps').height());
		Site.$cover.hide();
		setTimeout(function(){
			resize = false;
		}, 300);
	}).click(function(){
		//if(!resize) Site.$data.toggle();
	});

	$('#auth-google').click(function(){
		window.open(Cfg.auth.google, '_blank', {
			height: 200,
			width: 300,
			status: false
		});
	});
});