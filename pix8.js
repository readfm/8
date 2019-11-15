$(function(){
	$('<link>').appendTo('head').attr({
		type: 'text/css', 
		rel: 'stylesheet',
		href: './pix8/carousel.css'
	});

	$.getScript('./pix8/carousel.js');
	$.getScript('./pix8/pix.js');
	$.getScript('./pix8/local.js');
	$.getScript('./pix8/run.js');
});